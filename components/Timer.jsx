import styles from "../styles/Timer.module.css";
import ft from "friendly-time";
import { stringify as du } from "simple-duration";
import { useEffect, useState } from "react";

export default function Timer({ meal }) {
  const [method, setMethod] = useState(null);
  useEffect(() => {
    if (localStorage.getItem("method")) {
      setMethod(localStorage.getItem("method"));
    } else {
      setMethod("relative");
      localStorage.setItem("method", "relative");
    }
  }, []);
  const toggleMethod = () => {
    if (method == "relative") {
      setMethod("exact");
      localStorage.setItem("method", "exact");
    } else {
      setMethod("relative");
      localStorage.setItem("method", "relative");
    }
  };
  return (
    <>
      {method && (
        <div className={styles.timerParent} onClick={toggleMethod}>
          <span title="Swap time views" className={styles.timerSwap}>
            swap_horiz
          </span>
          {meal.start >= new Date() && (
            <>
              <p>Next mealtime starts {method == "exact" && " in"}</p>
              <h2>
                {method == "relative"
                  ? ft(new Date(meal.start))
                  : du(meal.start / 1000 - Date.now() / 1000, "m")}
              </h2>
            </>
          )}
          {meal.start < new Date() && (
            <>
              <p>This mealtime ends</p>
              <h2>
                {method == "relative"
                  ? ft(new Date(meal.end))
                  : du(meal.end / 1000 - Date.now() / 1000, "m")}
              </h2>
            </>
          )}
        </div>
      )}
    </>
  );
}
