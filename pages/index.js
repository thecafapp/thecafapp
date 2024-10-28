import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import s from "../styles/Home.module.css";
import getUID from "crypto-random-string";
import InstallPrompt from "../components/InstallPrompt";
import useFirebaseUser from "../hooks/useFirebaseUser";
import RenderBlocks from "../components/RenderBlocks";
// import AlterLayout from "../components/AlterLayout";
const AlterLayout = dynamic(
  () => import("../components/AlterLayout"),
  {
    ssr: false,
  }
);

const SHIM_API = false;

export default function Home() {
  const [cafData, setCafData] = useState(null);
  const [memo, setMemo] = useState({});
  const [renderLayout, setRenderLayout] = useState(null);
  const [alterLayout, setAlterLayout] = useState(false);
  const [showMemo, setShowMemo] = useState(false);
  const [menuError, setMenuError] = useState(false);

  const user = useFirebaseUser();
  useEffect(() => {
    if (!window.localStorage.getItem("iden")) {
      window.localStorage.setItem("iden", getUID({ length: 20 }));
    }

    if (localStorage.getItem("layout") != null) {
      try {
        const localLayout = JSON.parse(localStorage.getItem("layout"));
        if (!localLayout[0]?.name) {
          fetch("/layout.json")
            .then((res) => res.json())
            .then((json) => {
              setRenderLayout(json);
              localStorage.setItem("layout", JSON.stringify(json));
            });
        }
        setRenderLayout(localLayout);
      } catch {
        fetch("/layout.json")
          .then((res) => res.json())
          .then((json) => {
            setRenderLayout(json);
            localStorage.setItem("layout", JSON.stringify(json));
          });
      }
    } else {
      fetch("/layout.json")
        .then((res) => res.json())
        .then((json) => {
          setRenderLayout(json);
          localStorage.setItem("layout", JSON.stringify(json));
        });
    }

    fetch(`/api/menu${SHIM_API ? "?shim=true" : ""}`)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          setMenuError(true);
          return false;
        }
      })
      .then((info) => {
        if (info) {
          setCafData(info);
        }
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

  const layoutMode = () => {
    if (alterLayout) {
      setRenderLayout(JSON.parse(localStorage.getItem("layout")));
    }
    setAlterLayout(!alterLayout);
  }

  return (
    <div className={s.container}>
      {/*<div className={s.broken}>
        <p>
          <b>The Caf App is currently under maintenence.</b><br/><br/>We&qt;re working hard to get it ready for the upcoming semester!  Keep an eye out for updates on our <a href="https://instagram.com/the.caf.app" target="_blank" rel="noreferrer">Instagram page</a>.
        </p>
      </div>*/}
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
        {!cafData && !menuError && (
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
        {(cafData || menuError) && (
          <div className={s.content}>
            {renderLayout && !alterLayout && (
              <RenderBlocks
                renderLayout={renderLayout}
                cafData={cafData}
                shimData={SHIM_API}
                memo={memo}
                closeMemo={closeMemo}
                showMemo={showMemo}
                menuError={menuError}
              />
            )}
            {alterLayout && <AlterLayout />}
            <p className={s.disclaimer}>
              <button type="button" className={s.editButton} onClick={layoutMode}>{alterLayout ? "Save" : "Edit"} Layout</button>
              <br />
              Meal data comes from the{" "}
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
              <a
                href="https://instagram.com/the.caf.app"
                target="_blank"
                rel="noreferrer"
              >
                Contact
              </a>
              {" - "}
              <a
                href="https://github.com/micahlt/thecafapp/wiki/API-Documentation"
                target="_blank"
                rel="noreferrer"
              >
                API Docs
              </a>
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
