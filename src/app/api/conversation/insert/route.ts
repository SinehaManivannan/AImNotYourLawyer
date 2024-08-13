/**
 * @file: /api/conversation/insert/route.ts - Insert a new conversation document
 *
 * @author Kevin Yu <yu.kevin2002@gmail.com>
 * @date Jul 2024
 */


import { NextResponse } from "next/server";
import { authenticateApiUser } from "@/util/api/middleware/authenticateApiUser";

import { initBackendFirebaseApp } from "@/util/api/middleware/initBackendFirebaseApp";
import { authenticateUser } from "../conversationTitle/utils/validation";
import { createDoc } from "@/lib/firebase/crud_utils";
import { Timestamp } from "firebase-admin/firestore";

/**
 * Remember that PUT methods are idempotent meaning the same request should have the same effect as a single request.
 * Therefore PUT methods are typically for updating
 * 
 * @param req 
 * @returns 
 */
export async function POST(req: Request) {
  const { earlyResponse, decodedToken } = await authenticateApiUser();
  
  // Authenticates user
  const decodedTokenResp = authenticateUser(earlyResponse, decodedToken);
  
  if (decodedTokenResp instanceof NextResponse) 
    return decodedTokenResp;

  const { conversation, includedDocuments, title } = await req.json();

  initBackendFirebaseApp();

  try {
    const docInfo = await createDoc("conversations", {
      userUid: decodedToken?.uid,
      conversation,
      includedDocuments,
      title,
      timestamp: Timestamp.now(),
    });

    if(!docInfo.success)
      throw("Couldn't create document")
    
    return NextResponse.json({ uid: decodedToken?.uid }, { status: 200 });
  } catch (error: any) {
    console.error("conversation uid: ", decodedToken?.uid, error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
