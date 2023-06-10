import styles from "../styles/Meal.module.css";
import Food from "./Food";

export default function Meal({ meal }) {
  return (
    <div className={styles.mealInfo}>
      <p>{meal.times}</p>
      <ul className={styles.mealFoods}>
        {meal.menu.map((item, j) => (
          <Food food={item} key={j} />
        ))}
      </ul>
    </div>
  );
}
