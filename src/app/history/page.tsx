import SyncBanner from "@/components/SyncBanner";
import { FacebookIcon, InstagramIcon, LinkedInIcon, MrnaThumb, CrisprThumb, MedThumb, FdaThumb } from "@/components/PlatformIcons";

const historyRows = [
  {
    id: 1,
    thumb: <MrnaThumb />,
    date: "2024-04-19 10:30",
    topic: "mRNA Vaccine Updates",
    author: "Pat",
    platforms: [<FacebookIcon key="fb" />, <InstagramIcon key="ig" id="h1ig" />],
    status: { label: "Posted", bg: "#dcfce7", color: "#166534" },
  },
  {
    id: 2,
    thumb: <CrisprThumb />,
    date: "2024-04-18 14:15",
    topic: "CRISPR Gene Therapy",
    author: "Tian",
    platforms: [<LinkedInIcon key="li" />],
    status: { label: "Posted", bg: "#dcfce7", color: "#166534" },
  },
  {
    id: 3,
    thumb: <MedThumb />,
    date: "2024-04-17 09:45",
    topic: "Personalized Medicine",
    author: "Michaela",
    platforms: [<FacebookIcon key="fb" />, <InstagramIcon key="ig" id="h3ig" />, <LinkedInIcon key="li" />],
    status: { label: "Scheduled", bg: "#fef3c7", color: "#92400e" },
  },
  {
    id: 4,
    thumb: <FdaThumb />,
    date: "2024-04-16 16:20",
    topic: "FDA Approval Announcements",
    author: "Michaela",
    platforms: [<FacebookIcon key="fb" />],
    status: { label: "Scheduled", bg: "#fef3c7", color: "#92400e" },
  },
];

export default function HistoryPage() {
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
          Activity History
        </h1>
        <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Complete log of all post activities and engagements.
        </div>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <select className="form-select" style={{ maxWidth: 200 }}>
          <option>All Status</option>
          <option>Posted</option>
          <option>Scheduled</option>
        </select>
      </div>

      <SyncBanner />

      <div className="card" style={{ padding: "1rem", overflowX: "auto" }}>
        <table style={{ fontSize: "0.85rem", minWidth: 780 }}>
          <thead>
            <tr>
              <th style={{ width: 64 }}>Thumbnail</th>
              <th>Date Created</th>
              <th>Topic</th>
              <th>Author</th>
              <th>Platforms</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {historyRows.map((row) => (
              <tr key={row.id}>
                <td>{row.thumb}</td>
                <td>{row.date}</td>
                <td>{row.topic}</td>
                <td>{row.author}</td>
                <td>
                  <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                    {row.platforms}
                  </div>
                </td>
                <td>
                  <span
                    style={{
                      background: row.status.bg,
                      color: row.status.color,
                      padding: "0.3rem 0.6rem",
                      borderRadius: 4,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    {row.status.label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
