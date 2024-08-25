const { getFirestore } = require("firebase-admin/firestore");
const {
  initBackendFirebaseApp,
} = require("../../src/util/api/middleware/initBackendFirebaseApp");

import { apiErrorResponse } from "@/utils/utils";
import admin from "firebase-admin";

//   const { authenticateApiUser } = require("@/lib/api/middleware/authenticateApiUser");

exports.handler = async (event: any, context: any) => {
  const { uid, fullConversation, includedDocuments, title } = JSON.parse(
    event.body
  );

  // Authenticate the user
  // const { earlyResponse, decodedToken } = await authenticateApiUser();
  // if (earlyResponse) return earlyResponse;

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT!)
      ),
      databaseURL: "https://legal-gpt-default-rtdb.firebaseio.com",
    });
  }

  initBackendFirebaseApp();

  try {
    const convoRef = getFirestore().collection("conversations").doc(uid);

    if (!convoRef) {
      return {
        statusCode: 404,
        body: JSON.stringify(
          apiErrorResponse(new Error("No matching conversation found"))
        ),
      };
    }

    await convoRef.update({
      conversation: fullConversation,
      documents: includedDocuments,
      title: title,
    });

    console.log("conversation: ", fullConversation);
    console.log("documents: ", includedDocuments);
    console.log("title: ", title);
    console.log("uid: ", uid);
    console.log("=================updateConversation===================");

    return {
      statusCode: 200,
      body: JSON.stringify({ uid }),
    };
  } catch (error: any) {
    console.error("conversation uid: ", uid, error.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
