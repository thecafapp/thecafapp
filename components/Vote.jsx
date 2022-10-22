import { useEffect, useState } from "react";
import { Rating } from "react-simple-star-rating";
import styles from "../styles/Vote.module.css";
export default function Vote() {
  const [dailyRating, setDailyRating] = useState(null);
  const [canRate, setCanRate] = useState(true);
  useEffect(() => {
    fetch(`/api/ratings?id=${window.localStorage.getItem("iden")}`)
      .then((res) => res.json())
      .then((json) => {
        setCanRate(!json.alreadyRated);
        setDailyRating(json.average);
      });
  }, []);
  const sendRating = (rating) => {
    fetch(`/api/ratings?id=${window.localStorage.getItem("iden")}`, {
      method: "POST",
      body: JSON.stringify({ rating }),
    })
      .then((res) => res.json())
      .then((json) => {
        setCanRate(false);
        setDailyRating((dailyRating + rating) / 2);
      });
  };
  return (
    <>
      {typeof dailyRating == Number ? (
        <div className={styles.voteSkeleton}>
          <h3>Loading ratings...</h3>
        </div>
      ) : (
        <div className={styles.voteParent}>
          <div className={styles.votePercentageCell}>
            <p>Day rating</p>
            <h2>
              {dailyRating}{" "}
              <span
                className="material-symbols-outlined"
                style={{ marginLeft: 5 }}
              >
                star
              </span>
            </h2>
          </div>
          {canRate ? (
            <div className={styles.voteButtonCell}>
              <p>Rate your meal to help others</p>
              <Rating
                onClick={sendRating}
                allowFraction={true}
                fillColor="#dca627"
                className={styles.rating}
              />
            </div>
          ) : (
            <div className={styles.voteButtonCell}>
              <p>You've provided your rating for the day. Thank you!</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
