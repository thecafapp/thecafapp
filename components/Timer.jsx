import styles from "../styles/Timer.module.css";
import ft from "friendly-time";

export default function Timer({ meal }) {
  return (
    <div className={styles.timerParent}>
      {meal.start > new Date() && (
        <>
          <p>Next mealtime starts</p>
          <h2>{ft(new Date(meal.start))}</h2>
        </>
      )}
    </div>
  );
}
