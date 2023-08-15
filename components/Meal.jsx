import styles from "../styles/Meal.module.css";
import Food from "./Food";

export default function Meal({ meal }) {
  return (
    <div className={styles.mealInfo}>
      <p>{meal.times}</p>
      {meal.menu.length > 0 ? (
        <ul className={styles.mealFoods}>
          {meal.menu.map((item, j) => (
            <Food food={item} key={j} />
          ))}
        </ul>
      ) : (
        <div className={styles.emptyMenu}>
          <b>No menu provided.</b>
          {meal.name === "Breakfast" && (
            <p>
              MC has stopped publishing the breakfast menu. Until they bring it
              back, we don&apos;t have a way to reliably provide a menu.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
