import { useEffect, useState } from "react";
import Food from "./Food";
import styles from "../styles/Vote.module.css";
export default function RateModal({ myRating, closeModal, sendRating, meal }) {
  const [hasRated, setHasRated] = useState(false);
  const [ratings, setRatings] = useState([]);
  useEffect(() => {
    let ratingsLocal = [];
    meal.menu.forEach((item) => {
      ratingsLocal.push({ name: item, rating: false });
    });
    setRatings(ratingsLocal);
  }, []);
  return (
    <>
      <span className="material-symbols-outlined">reviews</span>
      <div className={styles.heading}>
        <h2>{myRating} stars</h2>
        <p>(optional) rate individual foods</p>
      </div>
      <ul className={styles.foodRatings}>
        {meal.menu.map((item, i) => (
          <Food
            food={item}
            key={i}
            rateMode={true}
            setRatings={setRatings}
            setHasRated={setHasRated}
            ratings={ratings}
          />
        ))}
      </ul>
      <button className={styles.cancelButton} onClick={closeModal}>
        Cancel
      </button>
      <button
        className={styles.submitButton}
        onClick={() => sendRating(ratings)}
      >
        {hasRated ? "Submit" : "Skip"}
      </button>
    </>
  );
}
