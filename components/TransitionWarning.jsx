import { useEffect, useState } from "react";
import styles from "../styles/TransitionWarning.module.css";

export default function TransitionWarning() {
  const [copy, setCopy] = useState(
    "It looks like you're still using the old version.  Please switch as soon as you can!"
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
        We are transitioning to a new domain,{" "}
        <a href="https://thecaf.app" target="_blank" rel="noreferrer">
          thecaf.app
        </a>
        ! {copy}
      </p>
    </div>
  );
}
