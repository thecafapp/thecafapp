import { useEffect, useState } from "react";
import useFirebaseUser from "../hooks/useFirebaseUser";
import Link from "next/link";
import styles from "../styles/Leaderboard.module.css";

export default function Leaderboard({ memo, closeMemo }) {
  const user = useFirebaseUser();
  const [leaderboard, setLeaderboard] = useState([]);
  useEffect(() => {
    if (!user) return;
    fetch(`/api/leaderboard`)
      .then((res) => res.json())
      .then((json) => {
        setLeaderboard(json.leaderboard);
      });
  }, [user]);

  return (
    <div className={styles.leaderboard}>
      <h4>Top Reviewers Leaderboard</h4>
      <ol>
        {leaderboard &&
          leaderboard.map((u) => (
            <li key={u.name + 1010}>
              <span>{u.name}</span>
              <span className={styles.line}></span>
              <span className={styles.points}>{u.points} pts</span>
            </li>
          ))}
      </ol>
      <p className={styles.join}>
        {user ? (
          <>
            Thank <b>you</b> for being a partner reviewer!
          </>
        ) : (
          <>
            Want your name on this list? <Link href="/login">Sign up now!</Link>
          </>
        )}
      </p>
    </div>
  );
}
