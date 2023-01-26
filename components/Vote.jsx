import { useEffect, useState } from "react";
import Modal from "react-modal";
import { Rating } from "react-simple-star-rating";
import useFirebaseUser from "../hooks/useFirebaseUser";
import styles from "../styles/Vote.module.css";

Modal.setAppElement("#__next");
export default function Vote({ currentMealtime }) {
  const [dailyRating, setDailyRating] = useState(null);
  const [numItems, setNumItems] = useState(null);
  const [canRate, setCanRate] = useState(true);
  const [myRating, setMyRating] = useState(null);
  const [modalIsOpen, setIsOpen] = useState(false);
  const user = useFirebaseUser();
  useEffect(() => {
    getRating();
    console.log(user);
  }, []);
  const getRating = (noCache) => {
    fetch(
      `/api/ratings?id=${
        user ? user.uid : window.localStorage.getItem("iden")
      }&_vercel_no_cache=${noCache || 0}`
    )
      .then((res) => res.json())
      .then((json) => {
        setCanRate(!json.alreadyRated);
        setDailyRating(json.average);
        setNumItems(json.numItems);
      });
  };
  const sendRating = () => {
    fetch(
      `/api/ratings?id=${
        user ? user.uid : window.localStorage.getItem("iden")
      }&idType=${user ? "user" : "anon"}`,
      {
        method: "POST",
        body: JSON.stringify({
          rating: myRating,
          expires: currentMealtime.end,
        }),
      }
    )
      .then((res) => res.json())
      .then(() => {
        closeModal();
        setCanRate(false);
        getRating(1);
      });
  };
  const openModal = (rating) => {
    setMyRating(rating);
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
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
            <p>Meal rating</p>
            <h2>
              {dailyRating}{" "}
              <span
                className="material-symbols-outlined"
                style={{ marginLeft: 5 }}
              >
                star
              </span>
            </h2>
            <p className={styles.voteNumber}>{numItems} ratings</p>
          </div>
          <Modal
            isOpen={modalIsOpen}
            className={styles.alertModal}
            overlayClassName={styles.alertOverlay}
          >
            <span className="material-symbols-outlined">reviews</span>
            <h2>Rate {myRating} stars?</h2>
            <button className={styles.cancelButton} onClick={closeModal}>
              Cancel
            </button>
            <button className={styles.submitButton} onClick={sendRating}>
              Submit
            </button>
          </Modal>
          <div className={styles.voteButtonCell}>
            {canRate ? (
              Date.now() > currentMealtime.start ? (
                <>
                  <p>Rate your meal to help others</p>
                  <Rating
                    onClick={openModal}
                    allowFraction={true}
                    fillColor="#dca627"
                    className={styles.rating}
                  />
                </>
              ) : (
                <p>You can only vote during mealtimes.</p>
              )
            ) : (
              <p>You&apos;ve provided your rating for the day. Thank you!</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
