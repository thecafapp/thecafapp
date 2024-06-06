import { useEffect, useState } from "react";
import styles from "../../styles/Meal.module.css";
import Food from "../Food";

/**
 * @desc Block that provides a list of the top foods served at the cafeteria based on user ratings.
 */
export default function TopFoods() {
  const [topFoods, setTopFoods] = useState([]);
  useEffect(() => {
    fetch(`/api/foods`)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          return { topFoods: [] };
        }
      })
      .then((json) => {
        setTopFoods(json.topFoods);
      });
  }, []);
  return (
    <div className={styles.mealInfo}>
      <p>All-Time Top Rated Foods</p>
      <div className={styles.mealFoods}>
        {topFoods.map((item, i) => (
          <Food food={item} key={i} mode="top" />
        ))}
      </div>
    </div>
  );
}
