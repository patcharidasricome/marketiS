import SyncBanner from "@/components/SyncBanner";
import {
  FacebookIcon, InstagramIcon, LinkedInIcon,
  MrnaThumb, CrisprThumb, MedThumb, FdaThumb,
} from "@/components/PlatformIcons";
import styles from "./page.module.css";

const HISTORY = [
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
      {/* Page header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="gradient-text" style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Activity History
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Complete log of all post activities and engagements.
        </p>
      </div>

      {/* Filter */}
      <div className={styles.toolbar}>
        <select className="form-select" style={{ maxWidth: 200 }}>
          <option>All Status</option>
          <option>Posted</option>
          <option>Scheduled</option>
        </select>
      </div>

      <SyncBanner />

      {/* Table */}
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
            {HISTORY.map((row) => (
              <tr key={row.id}>
                <td>{row.thumb}</td>
                <td>{row.date}</td>
                <td>{row.topic}</td>
                <td>{row.author}</td>
                <td>
                  <div className={styles.platformRow}>{row.platforms}</div>
                </td>
                <td>
                  <span
                    className={styles.statusBadge}
                    style={{ background: row.status.bg, color: row.status.color }}
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
