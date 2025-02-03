import { useEffect, useRef, useState } from "react";
import useFirebaseUser from "../hooks/useFirebaseUser";
import styles from "../styles/Vote.module.css";

/**
 * @desc Popup modal to set the user's current meal points.  Allows setting points in both a relative manner (by subtracting a single transaction) and an absolute manner (by inputting an exact balance).
 */
export default function PointModal({
  closeModal,
  setBalance,
  setModalScreen,
  currentPoints = "0.00",
  initialMode = "auto",
}) {
  const [mode, setMode] = useState(initialMode);
  const [spendVal, setSpendVal] = useState("");
  const [finalVal, setFinalVal] = useState(currentPoints);
  const spendInput = useRef(null);
  const setInput = useRef(null);
  useEffect(() => {
    if (spendInput.current) spendInput.current.focus();
    if (setInput.current) setInput.current.focus();
  });
  const user = useFirebaseUser();
  const checkForSubmit = (e) => {
    if (e.key === "Enter") {
      submitPoints();
    }
  };
  const submitPoints = async () => {
    let finalValue = finalVal;
    if (mode === "auto") {
      setFinalVal(finalVal - spendVal);
      finalValue -= spendVal;
    }
    await fetch(`/api/balance?balance=${finalValue}`, {
      method: "POST",
      headers: {
        "X-Firebase-Token": await user.getIdToken(),
      },
    });
    setBalance(Number(finalValue).toFixed(2));
    setModalScreen("auto");
    closeModal();
  };
  const updateFieldVal = (e) => {
    if (e.target.value == 0) {
      e.target.value = "";
    }
  };
  return (
    <>
      <span className="material-symbols-outlined">monetization_on</span>
      <div className={styles.modeToggle}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setMode("manual");
          }}
          className={mode === "manual" ? styles.active : ""}
        >
          Set Balance
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setMode("auto");
          }}
          className={mode === "auto" ? styles.active : ""}
        >
          Subtract Points
        </a>
      </div>
      {mode === "auto" && (
        <>
          <div className={styles.heading}>
            <h2>how much did you spend?</h2>
          </div>
          <div className={styles.foodRatings}>
            <input
              type="number"
              className={styles.pointInput}
              value={spendVal}
              onChange={(e) => setSpendVal(e.target.value)}
              onFocus={updateFieldVal}
              onKeyUp={(e) => checkForSubmit(e)}
              ref={spendInput}
              placeholder="--.--"
            ></input>
          </div>
        </>
      )}
      {mode === "manual" && (
        <>
          <div className={styles.heading}>
            <h2>what is your balance?</h2>
          </div>
          <div className={styles.foodRatings}>
            <input
              type="number"
              className={styles.pointInput}
              value={finalVal}
              onChange={(e) => setFinalVal(e.target.value)}
              onKeyUp={(e) => checkForSubmit(e)}
              onFocus={updateFieldVal}
              ref={setInput}
              placeholder="--.--"
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
