import Meal from "../Meal";
import s from "../../styles/Meal.module.css";
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
