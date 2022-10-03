import Head from "next/head";
import { useEffect, useState } from "react";
import Meal from "../components/Meal";
import Timer from "../components/Timer";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch("/api/today")
      .then((res) => res.json())
      .then((info) => {
        setData(info);
      });
  }, []);
  return (
    <div className={styles.container}>
      <Head>
        <title>MC CafInfo</title>
        <meta
          name="description"
          content="Access hours and menus from the cafeteria at Mississippi College."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1>CafInfo</h1>
        </header>
        {!data && <div className={styles.loading}>Loading...</div>}
        {data && (
          <div className={styles.content}>
            <Timer meal={data.meals[0]} />
            {data.meals.map((meal, i) => (
              <details key={i} open={i == 0}>
                <summary className={styles.mealTitle}>{meal.name}</summary>
                <Meal meal={meal} />
              </details>
            ))}
            <div className={styles.divider}></div>
            <p className={styles.disclaimer}>
              All data comes from the official Mississippi College website. This
              dashboard was created by{" "}
              <a
                href="https://micahlindley.com"
                target="_blank"
                rel="noreferrer"
              >
                Micah Lindley
              </a>
              .
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
