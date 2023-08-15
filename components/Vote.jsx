import { useEffect, useState } from "react";
import Modal from "react-modal";
import { Rating } from "@micahlt/react-simple-star-rating";
import useFirebaseUser from "../hooks/useFirebaseUser";
import styles from "../styles/Vote.module.css";
import RateModal from "./RateModal";
import { useRouter } from "next/router";

Modal.setAppElement("#__next");
export default function Vote({ currentMealtime, shimData = false }) {
  const [mealRating, setMealRating] = useState(shimData ? 4.5 : 0);
  const [numOfRatings, setNumOfRatings] = useState(shimData ? 17 : 0);
  const [canRate, setCanRate] = useState(true);
  const [myRating, setMyRating] = useState(null);
  const [modalIsOpen, setIsOpen] = useState(false);
  const user = useFirebaseUser();
  const router = useRouter();
  useEffect(() => {
    if (user || user == false) {
      getRating(0, user);
    }
  }, [user]);
  const getRating = async (noCache, personalUser, forceNoRate) => {
    fetch(
      `/api/ratings?id=${
        personalUser ? personalUser.uid : window.localStorage.getItem("iden")
      }&_vercel_no_cache=${noCache || 0}`
    )
      .then((res) => res.json())
      .then((json) => {
        setCanRate(forceNoRate == true ? false : !json.alreadyRated);
        setMealRating(json.average);
        setNumOfRatings(json.numItems);
      });
  };
  const sendRating = (foodRatings, overrideRating = null) => {
    fetch(
      `/api/ratings?id=${
        user ? user.uid : window.localStorage.getItem("iden")
      }`,
      {
        method: "POST",
        body: JSON.stringify({
          rating: overrideRating || myRating,
          expires: currentMealtime.end,
        }),
      }
    )
      .then((res) => res.json())
      .then(() => {
        closeModal();
        setCanRate(false);
        getRating(1, user, true);
      });
    foodRatings.forEach((food) => {
      if (typeof food.rating === "number") {
        fetch(
          `/api/food?name=${food.name}&id=${
            user ? user.uid : window.localStorage.getItem("iden")
          }`,
          {
            method: "POST",
            body: JSON.stringify({
              rating: food.rating,
            }),
          }
        );
      }
    });
  };
  const openModal = (rating) => {
    if (user?.uid) {
      setMyRating(rating);
      if (currentMealtime.menu.length < 1) {
        sendRating([], rating);
      } else {
        setIsOpen(true);
      }
    } else {
      router.push("/login");
    }
  };
  const closeModal = () => {
    setIsOpen(false);
  };
  return (
    <>
      {typeof mealRating == Number ? (
        <div className={styles.voteSkeleton}>
          <h3>Loading ratings...</h3>
        </div>
      ) : (
        <div className={styles.voteParent}>
          <div className={styles.votePercentageCell}>
            <p>Meal rating</p>
            <h2>
              {mealRating}{" "}
              <span
                className="material-symbols-outlined"
                style={{ marginLeft: 5 }}
              >
                star
              </span>
            </h2>
            <p className={styles.voteNumber}>{numOfRatings} ratings</p>
          </div>
          <Modal
            isOpen={modalIsOpen}
            className={styles.alertModal}
            overlayClassName={styles.alertOverlay}
          >
            <RateModal
              myRating={myRating}
              closeModal={closeModal}
              sendRating={sendRating}
              meal={currentMealtime}
            />
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
                    allowHover={window.matchMedia("(pointer: coarse)").matches}
                  />
                </>
              ) : (
                <p>You can only vote during mealtimes.</p>
              )
            ) : (
              <p>
                You&apos;ve provided your rating for this mealtime. Thank you!
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
