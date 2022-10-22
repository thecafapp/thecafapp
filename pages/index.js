import Head from "next/head";
import { useEffect, useState } from "react";
import Meal from "../components/Meal";
import Restaurant from "../components/Restaurant";
import Timer from "../components/Timer";
import Vote from "../components/Vote";
import styles from "../styles/Home.module.css";
import getUID from "crypto-random-string";

export default function Home() {
  const [data, setData] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  useEffect(() => {
    if (!window.localStorage.getItem("iden")) {
      window.localStorage.setItem("iden", getUID({ length: 20 }));
    }
    fetch("/api/caf")
      .then((res) => res.json())
      .then((info) => {
        setData(info);
      });
    fetch("/api/restaurants")
      .then((res) => res.json())
      .then((info) => {
        setRestaurants(info.restaurants);
      });
  }, []);
  return (
    <div className={styles.container}>
      <Head>
        <title>The Caf at MC</title>
        <meta
          name="description"
          content="Access hours and menus from the cafeteria at Mississippi College."
        />
        <link rel="icon" href="/icons/icon.png" />
      </Head>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1>The Caf at MC</h1>
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
            <Vote />
            <div className={styles.divider}></div>
            <h3 className={styles.mealTitle} style={{ marginBottom: "0.5em" }}>
              Other Dining
            </h3>
            <div className={styles.restaurants}>
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
            <p>
              <b>Notice:</b> this section may vary on breaks and holidays
            </p>
            <div className={styles.divider}></div>
            <p className={styles.disclaimer}>
              All data comes from the{" "}
              <a
                href="https://www.mc.edu/offices/food/"
                target="_blank"
                rel="noreferrer"
              >
                official MC website
              </a>
              . This dashboard was created by{" "}
              <a
                href="https://micahlindley.com"
                target="_blank"
                rel="noreferrer"
              >
                Micah Lindley
              </a>
              .<br />
              Is something wrong?{" "}
              <a
                href="https://instagram.com/micahtlindley"
                target="_blank"
                rel="noreferrer"
              >
                Shoot me a DM
              </a>
              .
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
