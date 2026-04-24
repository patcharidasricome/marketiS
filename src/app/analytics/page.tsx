export default function AnalyticsPage() {
  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          className="gradient-text"
          style={{
            fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
            fontSize: "1.8rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          Performance Analytics
        </h1>
        <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Track engagement metrics and optimize your content strategy.
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {[
          { label: "Total Reach", value: "45.2K", trend: "↑ 12% vs last week" },
          { label: "Engagement Rate", value: "6.8%", trend: "↑ 2.3% vs last week" },
        ].map(({ label, value, trend }) => (
          <div
            key={label}
            style={{
              background: "white",
              borderRadius: 12,
              padding: "1.5rem",
              border: "1px solid var(--border-light)",
              textAlign: "center",
            }}
          >
            <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{label}</div>
            <div
              className="gradient-text"
              style={{
                fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
                fontSize: "2.2rem",
                fontWeight: 700,
                margin: "0.5rem 0",
              }}
            >
              {value}
            </div>
            <div style={{ color: "var(--success)", fontSize: "0.85rem" }}>{trend}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2
          style={{
            fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
            fontSize: "1.1rem",
            fontWeight: 600,
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
          }}
        >
          <i
            className="fas fa-chart-column"
            style={{
              background: "linear-gradient(135deg, var(--primary-navy), var(--primary-purple))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          />
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
            {[
              { platform: "Facebook", reach: "18.5K", engagement: "1,240" },
              { platform: "Instagram", reach: "16.2K", engagement: "1,456" },
              { platform: "LinkedIn", reach: "10.5K", engagement: "375" },
            ].map(({ platform, reach, engagement }) => (
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
