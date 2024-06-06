import { useEffect, useState } from "react";
import { Rating } from "@micahlt/react-simple-star-rating";
import classNames from "classnames";
import styles from "../styles/Food.module.css";

/**
 * @desc Food component rendered in the meal menu, top foods list, and the rating modal.
 */
export default function Food({
  food,
  mode = "menu",
  setRatings,
  setHasRated,
  ratings,
}) {
  const [rating, setRating] = useState(null);
  const [foodName, setFoodName] = useState("");
  useEffect(() => {
    if (food) {
      if (mode === "menu") {
        setFoodName(food);
        fetch(`/api/foods?name=${encodeURIComponent(food)}`)
          .then((res) => {
            if (res.ok) {
              return res.json();
            } else {
              setRating("0");
              return false;
            }
          })
          .then((json) => {
            if (json) {
              setRating(json.rating);
            }
          });
      } else if (mode === "top") {
        setRating(food.rating);
        setFoodName(food.name);
      } else if (mode === "rate") {
        setFoodName(food);
      }
    }
  }, [food]);

  const rateHandler = (num) => {
    let tempRatings = ratings;
    const foodIndex = tempRatings.findIndex((item) => {
      return item.name === food;
    });
    tempRatings[foodIndex].rating = num;
    setRatings(tempRatings);
    setHasRated(true);
  };

  return (
    <li
      className={classNames(
        styles.menuItem,
        mode === "rate" ? styles.rate : ""
      )}
    >
      <span className={styles.foodName}>{foodName}</span>
      {rating && mode != "rate" && (
        <span className={styles.foodRating} data-rating={rating}>
          {Number(rating).toFixed(1)}
        </span>
      )}
      {mode == "rate" && (
        <Rating
          onClick={rateHandler}
          size={20}
          style={{ marginBottom: -2, marginLeft: 16, alignSelf: "center" }}
          emptyColor={window
            .getComputedStyle(document.documentElement)
            .getPropertyValue("--text-secondary")}
          allowHover={window.matchMedia("(pointer: coarse)").matches}
        />
      )}
    </li>
  );
}
