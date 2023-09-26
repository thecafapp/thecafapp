import { useEffect, useRef, useState } from "react";
import useFirebaseUser from "../hooks/useFirebaseUser";
import styles from "../styles/Vote.module.css";
export default function PointModal({
  closeModal,
  currentPoints = "0.00",
  initialMode = "auto",
}) {
  const [mode, setMode] = useState(initialMode);
  const [spendVal, setSpendVal] = useState("0.00");
  const [finalVal, setFinalVal] = useState(currentPoints);
  const spendInput = useRef(null);
  useEffect(() => {
    if (!spendInput.current) return;
    spendInput.current.focus();
  }, []);
  const user = useFirebaseUser();
  const submitPoints = () => {
    let finalValue = finalVal;
    if (mode === "auto") {
      setFinalVal(finalVal - spendVal);
      finalValue -= spendVal;
    }
    user.getIdToken().then((idToken) => {
      fetch(`/api/balance?balance=${finalValue}`, {
        method: "PUT",
        headers: {
          "X-Firebase-Token": idToken,
        },
      });
    });
  };
  return (
    <>
      <span className="material-symbols-outlined">monetization_on</span>
      {mode === "auto" && (
        <>
          <div className={styles.heading}>
            <h2>how much did you spend?</h2>
            <p>
              or{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setMode("manual");
                }}
              >
                manually set your balance
              </a>
            </p>
          </div>
          <div className={styles.foodRatings}>
            <input
              type="number"
              className={styles.pointInput}
              value={spendVal}
              onChange={(e) => setSpendVal(e.target.value)}
              ref={spendInput}
            ></input>
          </div>
        </>
      )}
      {mode === "manual" && (
        <>
          <div className={styles.heading}>
            <h2>what is your balance?</h2>
            <p>
              or{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setMode("auto");
                }}
              >
                enter how much you spent
              </a>
            </p>
          </div>
          <div className={styles.foodRatings}>
            <input
              type="number"
              className={styles.pointInput}
              value={finalVal}
              onChange={(e) => setFinalVal(e.target.value)}
            ></input>
          </div>
        </>
      )}
      <button className={styles.cancelButton} onClick={closeModal}>
        Cancel
      </button>
      <button className={styles.submitButton} onClick={submitPoints}>
        Submit
      </button>
    </>
  );
}
