import { auth, db } from "@/firebase";
import { UserI, userConverterOld } from "@/util/User";
import { FirebaseError } from "firebase/app";
import { getDoc, doc } from "firebase/firestore";

export async function getAuthenticatedUser(): Promise<UserI | null> {
  const userDataPromise = async () => {
    console.log("Authenticating user info...");
    // console.log(auth.currentUser);
    if (!auth.currentUser) {
      console.log("User not signed in");
      throw new FirebaseError("400", "User is not signed in");
    } else {
      const docRef = doc(db, "users", auth.currentUser.uid).withConverter(
        userConverterOld
      );
      const docSnap = await getDoc(docRef);
      console.log("getDoc passed, " + docSnap.data())

      if (docSnap.exists()) {
        if (docSnap.data().verified) {
          return docSnap.data();
        } else {
          console.log("User not verified");
          return null;
        }
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
        return null;
      }
    }
  };

  var i = 0;
  var max = 5;
  while (i < max) {
    try {
      return await userDataPromise();
    } catch (e) {
      i += 1;
      // Wait one second before next attempt
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error("Could not load the user after " + max + " tries");
}
