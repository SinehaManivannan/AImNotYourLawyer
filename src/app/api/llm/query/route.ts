"use server";
import { ChatOpenAI } from "@langchain/openai";
import admin from "firebase-admin";
import { apiErrorResponse } from "@/utils/utils";
import { CONDENSE_QUESTION_PROMPT, OJ_PROMPT } from "@/lib/LLM/prompts";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { formatChatHistory, formatDocumentsAsString } from "@/lib/LLM/utils";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { LangchainDocType } from "@/models/schema";
import { PineconeIndexes } from "@/app/(private)/chat/enum/enums";
import { NextRequest } from "next/server";
import { getRetriever } from "@/lib/LLM/getRetriever";
import { Conversation, ConversationalRetrievalQAChainInput } from "@/types/chat";
import { createDocumentPrompt } from "@/app/(private)/chat/utils/pdfs/pdf_utils";


/**
 * Converts the LLM response to a streamed response for the client 
 * https://developer.mozilla.org/docs/Web/API/ReadableStream#convert_async_iterator_to_stream
 * @param iterator
 * @returns
 */
function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();

      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

async function* makeIterator({
  token,
  query,
  namespace = "",
  indexName = PineconeIndexes.staticDocuments,
  fullConversation = [],
  includedDocuments,
}: {
  token: string;
  query: string;
  namespace: string;
  indexName: string;
  fullConversation: Conversation[];
  includedDocuments: string[]
}) {
  try {

    
    //TODO: Check if i need to implement firebase initialize app
    admin.auth().verifyIdToken(token as string);

    // ********************************* LLM INITIALIZATION ********************************* //
    const llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-3.5-turbo-0125",
      temperature: 0,
      streaming: true,
    });

    // ********************************* INITIALIZING THE OPENAI AGENT ********************************* //

    // The prompt has a question and chat_history parameter and we pass arguments to this chain which populates that data in the prompt
    // The parser is what the output of the LLM produces
    // This chain is used to generate a basic question based on the past conversation history
    const standaloneQuestionChain = RunnableSequence.from([
      {
        question: (input: ConversationalRetrievalQAChainInput) =>
          input.question,
        chat_history: (input: ConversationalRetrievalQAChainInput) =>
          formatChatHistory(input.chat_history),
      },
      CONDENSE_QUESTION_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    // Langchain document retriever which does semantic search for documents
    const { retriever } = await getRetriever(indexName, namespace, 3);

    // When the sequence reaches the context step, it passes the refined question to the retriever, which automatically performs a semantic search.
    // This chain is used to generate the answer from the LLM using the past conversation information
    const answerChain = RunnableSequence.from([
      {
        // 'context' is a variable in our prompt, the callback function value is what is passed into the prompt
        context: async (input) => {
          // Retrieve documents from Pinecone and format the documents as a string for the prompt
          const semanticDocsResponse = retriever.invoke(input);
          const uploadedDocResponse = createDocumentPrompt(includedDocuments);
          const [semanticDocs, uploadedDocs] = await Promise.all([semanticDocsResponse, uploadedDocResponse])

          // Combines both the semantic searched docs with the uploaded document content
          const docData = formatDocumentsAsString(semanticDocs as LangchainDocType[]) + "\n\n" + uploadedDocs;
          return docData;
        },
        question: new RunnablePassthrough(),
      },
      OJ_PROMPT,
      llm,
    ]);

    // Consolidate the standalone question chain and answer chain into one
    const conversationalRetrievalQAChain =
      standaloneQuestionChain.pipe(answerChain);

    const encoder = new TextEncoder();

    for await (let chunk of await conversationalRetrievalQAChain.stream({
      question: query,
      chat_history: fullConversation,
    })) {
      yield encoder.encode(`${chunk.content}`);
    }
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}

export async function POST(req: NextRequest, res: NextRequest) {
  const iterator = makeIterator(await req.json());
  const stream = iteratorToStream(iterator);

  return new Response(stream);
}
