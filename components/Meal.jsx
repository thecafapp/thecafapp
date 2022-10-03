import { useEffect } from "react";
import styles from "../styles/Meal.module.css";

export default function Meal({ meal }) {
  return (
    <div className={styles.mealInfo}>
      <p>{meal.times}</p>
      <ul className={styles.mealFoods}>
        {meal.menu.map((food, j) => (
          <li key={j}>{food}</li>
        ))}
      </ul>
    </div>
  );
}
