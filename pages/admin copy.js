import Head from "next/head";
import s from "../styles/Home.module.css";
import a from "../styles/Admin.module.css";
import { useState } from "react";

export default function Admin() {
  const [memo_title, setMemoTitle] = useState("");
  const [memo_text, setMemoText] = useState("");
  const [expiresAt, setExpiresAt] = useState("2023-01-01T00:00");
  const [password, setPassword] = useState("");
  const submitMemo = () => {
    fetch("/api/memo", {
      method: "POST",
      headers: {
        "x-password": password,
      },
      body: JSON.stringify({
        memo_title,
        memo_text,
        expiresAt: new Date(expiresAt),
      }),
    });
  };
  return (
    <div className={s.container}>
      <Head>
        <title>Admin | The Caf at MC</title>
        <meta
          name="description"
          content="Admin page to submit alerts to TheCaf.me"
        />
        <link rel="icon" href="/icons/icon.png" />
      </Head>
      <main className={s.main}>
        <header className={s.header}>
          <h1>Admin Panel</h1>
        </header>
        <div className={s.content}>
          <div className={a.form}>
            <h2>Create a memo</h2>
            <input
              name="memo_title"
              type="text"
              placeholder="Title"
              onChange={(e) => setMemoTitle(e.target.value)}
              value={memo_title}
            />
            <textarea
              name="memo_text"
              placeholder="Description"
              rows="4"
              onChange={(e) => setMemoText(e.target.value)}
              value={memo_text}
            ></textarea>
            <input
              name="expiresAt"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <br />
            <button className={a.button} onClick={submitMemo}>
              Publish
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
