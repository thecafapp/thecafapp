import { useEffect, useRef, useState } from "react";
import useFirebaseUser from "../hooks/useFirebaseUser";
import styles from "../styles/Vote.module.css";
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
    setBalance(finalValue.toFixed(2));
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
              onFocus={updateFieldVal}
              onKeyUp={(e) => checkForSubmit(e)}
              ref={spendInput}
            ></input>
          </div>
        </>
      )}
      {mode === "manual" && (
        <>
          <div className={styles.heading}>
            <h2>what is your current balance?</h2>
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
              onKeyUp={(e) => checkForSubmit(e)}
              onFocus={updateFieldVal}
              ref={setInput}
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
