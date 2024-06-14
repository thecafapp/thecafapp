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
          {meal.name === "Breakfast" ? (
            <p>
              MC has stopped publishing the breakfast menu. Until they bring it
              back, we don&apos;t have a way to reliably provide a menu.
            </p>
          ) : meal.closed == true ? (
            <p>The Caf will not be serving this meal today.</p>
          ) : (
            <p>
              The Caf has not posted the menu for today. There&apos;s no way for
              us to display what will be available at this meal, or if the Caf
              is even open.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
