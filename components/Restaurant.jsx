import styles from "../styles/Restaurant.module.css";

/**
 * @desc Card that shows information regarding an on-campus dining location other than the cafeteria.  Shows hours, current open status, and provides a link to a Google Maps location.
 */
export default function Restaurant({ restaurant: rr }) {
  return (
    <a
      className={styles.restaurant}
      style={{
        backgroundImage: `url('${rr.image}')`,
        opacity: rr.hours.current ? 1 : 0.6,
      }}
      href={rr.link}
      target="_blank"
      rel="noreferrer"
    >
      <h3 className={styles.name}>{rr.name}</h3>
      <h4>{rr.hours.current ? "Open" : "Closed"}</h4>
      {rr.hours.open && (
        <p>
          <span className={styles.inlineIcon}>schedule</span>
          {rr.hours.open} - {rr.hours.close}
        </p>
      )}
      {!rr.hours.open && <p>Not open today</p>}
      <p>
        <span className={styles.inlineIcon}>location_on</span>
        {rr.location}
      </p>
      <div
        className={styles.overlay}
        style={{ backgroundColor: rr.hours.current ? rr.color : "#000" }}
      ></div>
    </a>
  );
}
