import { useEffect, useState } from "react";
import useFirebaseUser from "../../hooks/useFirebaseUser";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../../styles/Leaderboard.module.css";

export default function Leaderboard({ memo, closeMemo }) {
  const user = useFirebaseUser();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState([]);
  const [noUsers, setNoUsers] = useState(false);
  useEffect(() => {
    fetch(`/api/leaderboard`)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          setNoUsers(true);
          return { leaderboard: [] };
        }
      })
      .then((json) => {
        setLeaderboard(json.leaderboard);
      });
  }, [user]);

  return (
    <div className={styles.leaderboard}>
      <h4>Top Reviewers Leaderboard</h4>
      {noUsers && (
        <div className={styles.noUsers}>
          <h5>No leaders yet!</h5>
          <p>
            Looks like nobody has points yet.
            <br />
            Go rate your meal and be the first!
          </p>
        </div>
      )}
      <ol>
        {leaderboard &&
          leaderboard.map((u) => (
            <li
              key={u.uid}
              role="link"
              onClick={() => {
                router.push(`/user/${u.uid}`);
              }}
              title="Open user profile"
            >
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
