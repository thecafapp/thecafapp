import { useEffect, useState } from "react";
import Modal from "react-modal";
import PointModal from "./PointModal";
import styles from "../styles/PointTracker.module.css";
import modalStyles from "../styles/Vote.module.css";
import useFirebaseUser from "../hooks/useFirebaseUser";

export default function PointTracker() {
  const [balance, setBalance] = useState("--.--");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const user = useFirebaseUser();
  const enoughFor = (itemCost) => {
    return Math.floor(balance / itemCost);
  };
  const fetchBalance = async () => {
    if (!user) return;
    fetch(`/api/balance`, {
      headers: {
        "X-Firebase-Token": await user.getIdToken(),
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        try {
          setBalance(json?.balance?.toFixed(2) || "--.--");
        } catch {
          setBalance("--.--");
        }
      });
  };
  useEffect(() => {
    fetchBalance();
  }, [user]);
  return (
    <>
      <div className={styles.tracker}>
        <h4>Point Tracker</h4>
        <h2 className={styles.remaining}>
          <span
            className={styles.pointValue}
            title="Click to edit your points"
            onClick={() => setModalIsOpen(true)}
          >
            ${balance}
          </span>{" "}
          points remaining
        </h2>
        <p className={styles.usedFor}>
          <span className={styles.usedForHeading}>That&apos;s enough for:</span>
        </p>
        <ul>
          <li>
            <b>{enoughFor(9.19)}</b> Chick-Fil-A Sandwich Meals
          </li>
          <li>
            <b>{enoughFor(4.19)}</b> Chick-Fil-A Milkshakes
          </li>
          <li>
            <b>{enoughFor(3.25)}</b> Starbucks Caffe Lattes
          </li>
          <li>
            <b>{enoughFor(5.0)}</b> Einstein&apos;s Regular Bagels
          </li>
        </ul>
        <span
          title="Click to edit your points"
          className={styles.edit}
          onClick={() => setModalIsOpen(true)}
        >
          edit
        </span>
      </div>
      <Modal
        isOpen={modalIsOpen}
        className={modalStyles.alertModal}
        overlayClassName={modalStyles.alertOverlay}
      >
        <PointModal
          closeModal={() => setModalIsOpen(false)}
          currentPoints={balance}
        />
      </Modal>
    </>
  );
}
