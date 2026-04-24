"use client";

import styles from "./SyncBanner.module.css";

export default function SyncBanner() {
  return (
    <div className={styles.banner}>
      <div className={styles.left}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" fill="#34a853" />
          <rect x="6" y="7" width="12" height="1.5" rx="0.75" fill="white" />
          <rect x="6" y="10.5" width="12" height="1.5" rx="0.75" fill="white" />
          <rect x="6" y="14" width="8" height="1.5" rx="0.75" fill="white" />
        </svg>
        <span>
          <strong>Auto-synced</strong> from <strong>SocialAI Master Content Sheet</strong> · Google Sheets
        </span>
      </div>

      <div className={styles.right}>
        <span className={`${styles.dot} animate-pulse-dot`} />
        <span>Last synced 2 min ago</span>
        <button
          className={styles.syncBtn}
          onClick={(e) => {
            const btn = e.currentTarget;
            btn.textContent = "✓ Synced";
            setTimeout(() => { btn.textContent = "Sync now"; }, 1500);
          }}
        >
          Sync now
        </button>
      </div>
    </div>
  );
}
