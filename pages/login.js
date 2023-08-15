import Head from "next/head";
import s from "../styles/Home.module.css";
import a from "../styles/Admin.module.css";
import Link from "next/link";
import dynamic from "next/dynamic";
import classNames from "classnames";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebaseui/dist/firebaseui.css";
import { useEffect, useState } from "react";
import useFirebaseUser from "../hooks/useFirebaseUser";
import { useRouter } from "next/router";
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
  authDomain: "login.thecaf.app",
  projectId: "thecaf-dotme",
  storageBucket: "thecaf-dotme.appspot.com",
  appId: "1:545159752910:web:bd66c8c0e7e0b2d0d6f49f",
};
firebase.initializeApp(firebaseConfig);

function Login() {
  const user = useFirebaseUser();
  const router = useRouter();
  const [points, setPoints] = useState();
  useEffect(() => {
    let ui = null;
    if (user == false) {
      import("firebaseui").then((firebaseui) => {
        ui = new firebaseui.auth.AuthUI(firebase.auth());
        ui.start("#firebaseui-auth-container", {
          signInOptions: [
            {
              provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
              customParameters: {
                hd: "mc.edu",
              },
            },
          ],
          signInSuccessUrl: "/",
          signInFlow: "popup",
        });
      });
    } else if (user) {
      fetch(`/api/leaderboard?id=${user.uid}`)
        .then((res) => res.json())
        .then((json) => {
          setPoints(json.points);
        });
    }
    return () => {
      if (ui) ui.delete();
    };
  }, [user]);
  const signOutUser = () => {
    firebase.auth().signOut();
  };
  const deleteUser = () => {
    const shouldDelete = confirm(
      "Are you sure?  This will permanently remove all your points and you'll have to start from nothing if you sign up again."
    );
    if (shouldDelete) {
      fetch(`/api/account?id=${user.uid}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(() => {
          signOutUser();
        });
    }
  };
  return (
    <div className={s.container}>
      <Head>
        <title>Account | The Caf at MC</title>
        <meta
          name="description"
          content="Sign in with your MC email to become a rating partner"
        />
        <link rel="icon" href="/icons/icon.png" />
      </Head>
      <main className={s.main}>
        <header className={s.header}>
          <Link href="/">
            <img src="/back.svg" />
          </Link>
          <h1>{user ? "Account" : "Login"}</h1>
        </header>
        {user != false && user != null ? (
          <div className={s.content}>
            <div className={a.form}>
              <h2 className={a.displayName}>{user.displayName}</h2>
              <p>{points || "--"} points</p>
              <p className={a.disclaimer}>
                {user.email}
                <br />
                partner since{" "}
                {new Date(Number(user.metadata.createdAt)).toLocaleDateString(
                  "en-US"
                )}
                <br />
                <br />
                Each meal rating nets you ten points, and rating individual meal
                items gets extra. Rate more meals and move up the leaderboard!
              </p>
              <button
                className={a.button}
                onClick={router.push(`/user/${user.uid}`)}
              >
                Visit your profile
              </button>
              <div className={a.buttons}>
                <button className={a.button} onClick={signOutUser}>
                  Sign Out
                </button>
                <button className={a.button} onClick={deleteUser}>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={s.content}>
            <div className={classNames(a.form, a.login)}>
              <h2>Login to The Caf App</h2>
              <div
                id="firebaseui-auth-container"
                data-shape="rectangular"
              ></div>
              <p>
                Become a partner, start rating your meals, and get on the
                leaderboard!
              </p>
              <p className={a.disclaimer}>
                you must sign in with an mc.edu account
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default dynamic(() => Promise.resolve(Login), {
  ssr: false,
});
