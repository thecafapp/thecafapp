import { useEffect, useState } from "react";
import Modal from "react-modal";
import PointModal from "./PointModal";
import styles from "../styles/PointTracker.module.css";
import modalStyles from "../styles/Vote.module.css";

export default function PointTracker() {
  const [balance, setBalance] = useState("--.--");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const enoughFor = (itemCost) => {
    return Math.floor(balance / itemCost);
  };
  const fetchBalance = () => {
    fetch(`/api/balance?id=iBwrzJeuabVTeetitsBWmjxxV4m2`)
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        try {
          setBalance(Number(json.balance.$numberDecimal).toFixed(2));
        } catch {
          setBalance("--.--");
        }
      });
  };
  useEffect(fetchBalance, []);
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
            <b>{enoughFor(5.0)}</b> Einstein's Regular Bagels
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
