import { useEffect, useState } from "react";
import styles from "../styles/InstallPrompt.module.css";

export default function InstallPrompt() {
  const [shouldShow, setShouldShow] = useState(false);
  // This checks if a device is on iOS/iPadOS and is not running in standalone mode
  useEffect(() => {
    var ua = window.navigator.userAgent;
    var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
    var webkit = !!ua.match(/WebKit/i);
    if (
      iOS &&
      webkit &&
      !ua.match(/CriOS/i) &&
      !window.matchMedia("(display-mode: standalone)").matches &&
      window.localStorage.getItem("ir") != "yes"
    ) {
      setShouldShow(true);
    }
  }, []);
  const dismiss = () => {
    window.localStorage.setItem("ir", "yes");
    setShouldShow(false);
  };
  return (
    <>
      {shouldShow && (
        <div className={styles.prompt}>
          <h3>Install The Caf App</h3>
          <p className={styles.instructions}>
            Click the Share icon in Safari and then select{" "}
            <b>Add to homescreen</b> for a better experience!
          </p>
          <button className={styles.dismiss} onClick={dismiss}>
            Dismiss
          </button>
        </div>
      )}
    </>
  );
}
