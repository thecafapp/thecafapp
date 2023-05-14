import styles from "../styles/Memo.module.css";

export default function Memo({ memo, closeMemo }) {
  return (
    <div className={styles.memo}>
      <h4>{memo.memo_title}</h4>
      <p dangerouslySetInnerHTML={{ __html: memo.memo_text }} />
      {memo.dismissable && (
        <span
          title="Dismiss message"
          className={styles.close}
          onClick={closeMemo}
        >
          close
        </span>
      )}
    </div>
  );
}
