import styles from "./page.module.css";

const STATS = [
  { label: "Total Reach",      value: "45.2K", trend: "↑ 12% vs last week" },
  { label: "Engagement Rate",  value: "6.8%",  trend: "↑ 2.3% vs last week" },
];

const PLATFORM_ROWS = [
  { platform: "Facebook",  reach: "18.5K", engagement: "1,240" },
  { platform: "Instagram", reach: "16.2K", engagement: "1,456" },
  { platform: "LinkedIn",  reach: "10.5K", engagement: "375"   },
];

export default function AnalyticsPage() {
  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="gradient-text" style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Performance Analytics
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Track engagement metrics and optimize your content strategy.
        </p>
      </div>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        {STATS.map(({ label, value, trend }) => (
          <div key={label} className={styles.statCard}>
            <div className={styles.statLabel}>{label}</div>
            <div className={`gradient-text ${styles.statValue}`}>{value}</div>
            <div className={styles.statTrend}>{trend}</div>
          </div>
        ))}
      </div>

      {/* Platform performance table */}
      <div className="card">
        <h2 className={styles.cardTitle}>
          <i className={`fas fa-chart-column ${styles.cardTitleIcon}`} />
          Platform Performance
        </h2>
        <table>
          <thead>
            <tr>
              <th>Platform</th>
              <th style={{ textAlign: "right" }}>Reach</th>
              <th style={{ textAlign: "right" }}>Engagement</th>
            </tr>
          </thead>
          <tbody>
            {PLATFORM_ROWS.map(({ platform, reach, engagement }) => (
              <tr key={platform}>
                <td style={{ fontWeight: 600 }}>{platform}</td>
                <td style={{ textAlign: "right" }}>{reach}</td>
                <td style={{ textAlign: "right" }}>{engagement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
