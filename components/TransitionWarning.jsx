import { useEffect, useState } from "react";
import styles from "../styles/TransitionWarning.module.css";

export default function TransitionWarning() {
  const [copy, setCopy] = useState(
    "You've been redirected from the old URL.  Please switch as soon as you can!"
  );
  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setCopy(
        "It looks like you've got the old version installed.  Please remove this from your home screen and re-add it from thecaf.app!"
      );
    }
  }, []);
  return (
    <div className={styles.card}>
      <h2>App Transition</h2>
      <p>
        You've been redirected to our new URL,{" "}
        <a href="https://thecaf.app" target="_blank" rel="noreferrer">
          thecaf.app
        </a>
        ! {copy} The old URL will be discontinued in October and you won&apos;t
        be able to access the app.
      </p>
    </div>
  );
}
