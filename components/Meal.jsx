import styles from "../styles/Meal.module.css";
import Food from "./Food";

/**
 * @desc Meal component rendered in the Meals block.  Contains a list of foods, as well as the name and time of the meal.
 */
export default function Meal({ meal }) {
  return (
    <div className={styles.mealInfo}>
      <p>{meal.times}</p>
      {meal.menu.length > 0 ? (
        <ul className={styles.mealFoods}>
          {meal.menu.map((item, j) => (
            <Food food={item} mode="menu" key={j} />
          ))}
        </ul>
      ) : (
        <div className={styles.emptyMenu}>
          <b>No menu provided.</b>
          {meal.closed == true ? (
            <p>The Caf will not be serving this meal today.</p>
          ) : (
            <p>
              The Caf has not posted the menu for today.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
