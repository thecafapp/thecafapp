import styles from "../styles/Restaurant.module.css";

export default function Restaurant({ restaurant: rr }) {
  return (
    <div className={styles.restaurant} style={{backgroundImage: `url('${rr.image}')`, opacity: rr.hours.current ? 1 : 0.6}}>
      <h3 className={styles.name}>{rr.name}</h3>
      <h4>{rr.hours.current ? "Open" : "Closed"}</h4>
      {rr.hours.open && (<p>{rr.hours.open} - {rr.hours.close}</p>)}
      {!rr.hours.open && <p>Not open today</p>}
      <div className={styles.overlay} style={{backgroundColor: rr.hours.current ? rr.color : "#000"}}></div>
    </div>
  );
}
