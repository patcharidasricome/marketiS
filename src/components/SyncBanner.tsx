"use client";

export default function SyncBanner() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem 1.1rem",
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: 8,
        marginBottom: "1.2rem",
        fontSize: "0.85rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", color: "#166534" }}>
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
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#166534" }}>
        <span
          className="animate-pulse-dot"
          style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }}
        />
        <span>Last synced 2 min ago</span>
        <button
          style={{
            background: "transparent",
            border: "1px solid #86efac",
            color: "#166534",
            padding: "0.3rem 0.7rem",
            borderRadius: 5,
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
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
