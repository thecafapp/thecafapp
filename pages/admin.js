import Head from "next/head";
import s from "../styles/Home.module.css";
import a from "../styles/Admin.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const appTitle = process.env.NEXT_PUBLIC_APP_TITLE || "The Caf App";

export default function Admin() {
  const router = useRouter();
  const [memo_title, setMemoTitle] = useState("");
  const [memo_text, setMemoText] = useState("");
  const [badge_name, setBadgeText] = useState("");
  const [badge_icon, setBadgeIcon] = useState("");
  const [badge_color, setBadgeColor] = useState("#ff3a3a");
  const [badge_id, setBadgeId] = useState();
  const [expiresAt, setExpiresAt] = useState("2023-01-01T00:00");
  const [dismissable, setDismissable] = useState(false);
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState([]);
  const [badges, setBadges] = useState([]);
  const [badgeSetId, setBadgeSetId] = useState("");
  const [badgeSetUser, setBadgeSetUser] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    logIn(null, localStorage.getItem("admin-pass"));
    fetch("/api/badges?all=true&vercel-no-cache=1", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((json) => {
        setBadges(json);
        setBadgeSetId(json[0]);
      });
  }, []);
  useEffect(() => {
    setBadgeSetUser(users[0]?.uid);
  }, [users]);
  const logIn = (e, optionalOverride) => {
    fetch(`/api/account?password=${optionalOverride || password}`, {
      method: "PUT",
    }).then((res) => {
      if (res.ok) {
        setIsLoggedIn(true);
        setPassword(optionalOverride || password);
        localStorage.setItem("admin-pass", optionalOverride || password);
      }
    });
  };
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
        dismissable,
      }),
    }).then((res) => {
      if (res.ok) {
        router.push("/");
      } else {
        alert("Error, try again");
      }
    });
  };
  const searchUsers = (e) => {
    if (e.key === "Enter") {
      fetch(`/api/leaderboard?q=${e.target.value}`, {
        headers: {
          "x-password": password,
        },
      })
        .then((res) => res.json())
        .then((json) => {
          setUsers(json);
        });
    }
  };
  const addBadgeToUser = () => {
    fetch(`/api/badges?badge=${badgeSetId}&user=${badgeSetUser}`, {
      method: "POST",
      headers: {
        "x-password": password,
      },
    }).then((res) => {
      if (res.ok) alert("Badge added");
    });
  };
  const createBadge = () => {
    fetch("/api/badges", {
      method: "PUT",
      headers: {
        "x-password": password,
      },
      body: JSON.stringify({
        color: badge_color,
        name: badge_name,
        id: Number(badge_id),
        icon: badge_icon,
      }),
    });
  };
  return (
    <div className={s.container}>
      <Head>
        <title>Admin | {appTitle}</title>
        <meta
          name="description"
          content="Admin page to submit alerts to The Caf App"
        />
        <link rel="icon" href="/icons/icon.png" />
      </Head>
      <main className={s.main}>
        <header className={s.header}>
          <h1>Admin Panel</h1>
        </header>
        <div className={s.content}>
          {!isLoggedIn ? (
            <div className={a.form}>
              <input
                name="password"
                type="password"
                placeholder="Admin password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
              <button className={a.button} onClick={logIn}>
                Log In
              </button>
            </div>
          ) : (
            <>
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
                <div className={a.formInputContainer}>
                  <label for="dismissable">Dismissable?</label>
                  <input
                    type="checkbox"
                    name="dismissable"
                    value={dismissable}
                    onChange={(e) => setDismissable(e.target.value)}
                  />
                </div>
                <br />
                <button className={a.button} onClick={submitMemo}>
                  Publish
                </button>
              </div>
              <div className={a.form}>
                <h2>Create a badge</h2>
                <input
                  name="badge_name"
                  type="text"
                  placeholder="Name"
                  onChange={(e) => setBadgeText(e.target.value)}
                  value={badge_name}
                />
                <div className={a.formInputContainer}>
                  <input
                    name="badge_icon"
                    type="text"
                    placeholder="Material Icon"
                    onChange={(e) => setBadgeIcon(e.target.value)}
                    value={badge_icon}
                  />
                  <span className="material-symbols-outlined">
                    {badge_icon}
                  </span>
                </div>
                <div className={a.formInputContainer}>
                  <p>Badge Color</p>
                  <input
                    type="color"
                    name="badge_color"
                    value={badge_color}
                    onChange={(e) => setBadgeColor(e.target.value)}
                  ></input>
                </div>
                <input
                  name="badge_id"
                  type="number"
                  placeholder="ID"
                  onChange={(e) => setBadgeId(e.target.value)}
                  value={badge_id}
                />
                <br />
                <button className={a.button} onClick={createBadge}>
                  Create
                </button>
              </div>
              <div className={a.form}>
                <h2>Add badge to user</h2>
                <select
                  name="Badges"
                  value={badgeSetId}
                  onChange={(e) => setBadgeSetId(e.target.value)}
                >
                  {badges.map((badge) => (
                    <option value={badge.id} key={badge.id}>
                      {badge.name} (#{badge.id})
                    </option>
                  ))}
                </select>
                <input
                  name="badge_name"
                  type="text"
                  placeholder="Search for user"
                  onKeyUp={searchUsers}
                />
                {
                  <select
                    name="Users"
                    value={badgeSetUser}
                    onChange={(e) => setBadgeSetUser(e.target.value)}
                  >
                    {users.map((user) => (
                      <option value={user.uid} key={user.uid}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                }
                <br />
                <button
                  className={a.button}
                  onClick={addBadgeToUser}
                  disabled={users.length === 0}
                >
                  Add
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
