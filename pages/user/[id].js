import Head from "next/head";
import s from "../../styles/Home.module.css";
import a from "../../styles/Admin.module.css";
import u from "../../styles/User.module.css";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function User() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [badges, setBadges] = useState([]);
  useEffect(() => {
    fetch(`/api/leaderboard?id=${router.query.id}`)
      .then((res) => res.json())
      .then((json) => {
        setUser(json);
        if (json.badges) {
          let badgeString = "";
          json.badges.forEach((badge) => {
            badgeString += `${badge},`;
          });
          fetch(`/api/badges?ids=${badgeString}`)
            .then((res) => res.json())
            .then((json) => {
              setBadges(json);
            });
        }
      });
  }, [router.query]);
  return (
    <div className={s.container}>
      <Head>
        <title>User | The Caf at MC</title>
        <meta name="description" content="Privacy policy for The Caf App" />
        <link rel="icon" href="/icons/icon.png" />
      </Head>
      <main className={s.main}>
        <header className={s.header}>
          <Link href="/">
            <img src="/back.svg" />
          </Link>
          <h1>{user ? user.name : "loading..."}</h1>
        </header>
        <div className={s.content}>
          {user && (
            <div className={a.form}>
              <h2>
                Collected <span className={u.points}>{user.points}</span> points
              </h2>
              <p className={u.subheading}>
                {badges.length === 0 && "No "}Badges
              </p>
              <div className={u.badges}>
                {badges.map((badge) => (
                  <div
                    className={u.badge}
                    style={{ backgroundColor: badge.color }}
                    key={badge.id}
                  >
                    <div className={u.badgeIcon}>
                      <span>{badge.icon}</span>
                    </div>
                    <div className={u.badgeText}>{badge.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
