import { useEffect, useState } from "react";
import { Rating } from "@micahlt/react-simple-star-rating";
import classNames from "classnames";
import styles from "../styles/Food.module.css";

export default function Food({
  food,
  rateMode,
  setRatings,
  setHasRated,
  ratings,
}) {
  const [rating, setRating] = useState(null);
  useEffect(() => {
    if (!rateMode) {
      fetch(`/api/food?name=${encodeURIComponent(food)}`)
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
    }
  }, []);

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
    <li className={classNames(styles.menuItem, rateMode ? styles.rate : "")}>
      <span className={styles.foodName}>{food}</span>
      {rating && !rateMode && (
        <span className={styles.foodRating} data-rating={rating}>
          {rating}
        </span>
      )}
      {rateMode && (
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
