import Meal from "../Meal";
import s from "../../styles/Meal.module.css";

/**
 * @desc Block that provides a collapsable list of Meal components for each meal of the current day.
 */
export default function Meals({ cafData }) {
  return (
    <>
      {cafData.meals.map((meal, i) => (
        <details key={i} open={i == 0}>
          <summary className={s.mealTitle}>{meal.name}</summary>
          <Meal meal={meal} />
        </details>
      ))}
    </>
  );
}
