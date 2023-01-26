import { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function useFirebaseUser(props) {
  const [authUser, setAuthUser] = useState(null);
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
    authDomain: "login.thecaf.me", // login.thecaf.me
    projectId: "thecaf-dotme",
    storageBucket: "thecaf-dotme.appspot.com",
    appId: "1:545159752910:web:bd66c8c0e7e0b2d0d6f49f",
  };
  firebase.initializeApp(firebaseConfig);
  const auth = getAuth();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        if (user.displayName.includes("(student)")) {
          user.displayName = user.displayName.replace(" (student)", "");
        }
        setAuthUser(user);
      } else {
        setAuthUser(false);
      }
    });
  });
  return authUser;
}

export default useFirebaseUser;
