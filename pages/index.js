import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import Meal from "../components/Meal";
import Restaurant from "../components/Restaurant";
import Timer from "../components/Timer";
import Vote from "../components/Vote";
import s from "../styles/Home.module.css";
import getUID from "crypto-random-string";
import InstallPrompt from "../components/InstallPrompt";
import Memo from "../components/Memo";
import Leaderboard from "../components/Leaderboard";
import useFirebaseUser from "../hooks/useFirebaseUser";
import TransitionWarning from "../components/TransitionWarning";

const SHIM_API = true;

export default function Home() {
  const [data, setData] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [memo, setMemo] = useState({});
  const [showMemo, setShowMemo] = useState(false);
  const [menuError, setMenuError] = useState(false);
  const [needsTransition, setNeedsTransition] = useState(false);
  const user = useFirebaseUser();
  useEffect(() => {
    if (!window.localStorage.getItem("iden")) {
      window.localStorage.setItem("iden", getUID({ length: 20 }));
    }
    if (window.location.href.includes("?redir")) {
      setNeedsTransition(true);
    }
    fetch(`/api/caf${SHIM_API ? "?shim=true" : ""}`)
      .then((res) => res.json())
      .then((info) => {
        if (info.error) {
          setMenuError(true);
        } else {
          setData(info);
        }
      });
    fetch("/api/restaurants")
      .then((res) => res.json())
      .then((info) => {
        setRestaurants(info.restaurants);
      });
    fetch("/api/memo")
      .then((res) => res.json())
      .then((info) => {
        setMemo(info);
        if (info.memo_id <= Number(localStorage.getItem("lm"))) {
          setShowMemo(false);
        } else {
          setShowMemo(true);
        }
      });
  }, []);
  const closeMemo = () => {
    localStorage.setItem("lm", memo.memo_id);
    setShowMemo(false);
  };
  return (
    <div className={s.container}>
      <Head>
        <title>The Caf at MC</title>
        <meta
          name="description"
          content="Access hours and menus from the cafeteria at Mississippi College."
        />
        <link rel="icon" href="/icons/icon.png" />
      </Head>
      <main className={s.main}>
        <header className={s.header}>
          <img src="/caf.svg" />
          <h1>The Caf at MC</h1>
          <Link href="/login" role="button">
            <img
              src={user ? user.photoURL : "/account.svg"}
              className={s.authImage}
            />
          </Link>
        </header>
        {!data && !menuError && (
          <div className={s.loading}>
            <svg className={s.spinner} viewBox="0 0 50 50">
              <circle
                className="path"
                cx="25"
                cy="25"
                r="20"
                fill="none"
                strokeWidth="5"
              ></circle>
            </svg>
          </div>
        )}
        {(data || menuError) && (
          <div className={s.content}>
            {needsTransition && (
              <>
                <TransitionWarning />
                <div className={s.divider}></div>
              </>
            )}
            {!menuError ? (
              <>
                {<Timer meal={data.meals[0]} />}
                {data.meals.map((meal, i) => (
                  <details key={i} open={i == 0}>
                    <summary className={s.mealTitle}>{meal.name}</summary>
                    <Meal meal={meal} />
                  </details>
                ))}
                <div className={s.divider}></div>
                <Vote currentMealtime={data.meals[0]} shimData={SHIM_API} />
                <div className={s.divider}></div>
              </>
            ) : (
              <>
                <Timer error={true} />
                <div className={s.divider}></div>
              </>
            )}
            {memo && showMemo && (
              <>
                <Memo memo={memo} closeMemo={closeMemo} />
                <div className={s.divider}></div>
              </>
            )}
            <h3 className={s.mealTitle} style={{ marginBottom: "0.5em" }}>
              Other Dining
            </h3>
            <div className={s.restWrapper}>
              <div className={s.restaurants}>
                {restaurants
                  .sort((a) => {
                    if (a.hours.current == true) {
                      return -1;
                    } else {
                      return 1;
                    }
                  })
                  .map((rr, i) => (
                    <Restaurant restaurant={rr} key={i} />
                  ))}
              </div>
            </div>
            <p className={s.notice}>
              <b>Notice:</b> this section may vary on breaks and holidays
            </p>
            <div className={s.divider}></div>
            <Leaderboard />
            <div className={s.divider}></div>
            <p className={s.disclaimer}>
              Meal and hour data comes from the{" "}
              <a
                href="https://www.mc.edu/offices/food/"
                target="_blank"
                rel="noreferrer"
              >
                official MC website
              </a>
              .<br />
              This app was created by{" "}
              <a
                href="https://micahlindley.com"
                target="_blank"
                rel="noreferrer"
              >
                Micah Lindley
              </a>
              .
              <br />
              <Link href="/privacy">Privacy Policy</Link>
              {" - "}
              <Link href="https://instagram.com/the.caf.app">Contact</Link>
              {" - "}
              <Link href="/docs">API Docs</Link>
              {process.env.NODE_ENV === "development" && (
                <>
                  {" - "}
                  <Link href="/admin">Admin</Link>
                </>
              )}
            </p>
          </div>
        )}
        <InstallPrompt />
      </main>
    </div>
  );
}
