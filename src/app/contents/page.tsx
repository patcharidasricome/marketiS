import Link from "next/link";
import SyncBanner from "@/components/SyncBanner";
import { FacebookIcon, InstagramIcon, LinkedInIcon, MrnaThumb, CrisprThumb, MedThumb } from "@/components/PlatformIcons";
import styles from "./page.module.css";

const CONTENTS = [
  {
    id: 1,
    thumb: <MrnaThumb />,
    title: "mRNA Vaccine Research",
    subtitle: "Latest findings on vaccine efficacy",
    author: "Pat",
    created: "2024-04-19",
    scheduled: "2024-04-25",
    platforms: [<FacebookIcon key="fb" />, <InstagramIcon key="ig" id="c1-ig" />],
    status: { label: "Drafted", bg: "#e0e7ff", color: "#3730a3" },
    approvedBy: "Michaela",
  },
  {
    id: 2,
    thumb: <CrisprThumb />,
    title: "CRISPR Gene Therapy",
    subtitle: "Breakthrough in genetic disease treatment",
    author: "Tian",
    created: "2024-04-18",
    scheduled: "2024-04-28",
    platforms: [<LinkedInIcon key="li" />],
    status: { label: "Scheduled", bg: "#fef3c7", color: "#92400e" },
    approvedBy: "Pat",
  },
  {
    id: 3,
    thumb: <MedThumb />,
    title: "Personalized Medicine Insights",
    subtitle: "How precision diagnostics transform patient care",
    author: "Michaela",
    created: "2024-04-17",
    scheduled: "—",
    platforms: [<FacebookIcon key="fb" />, <InstagramIcon key="ig" id="c3-ig" />, <LinkedInIcon key="li" />],
    status: { label: "Drafted", bg: "#e0e7ff", color: "#3730a3" },
    approvedBy: "Tian",
  },
];

export default function ContentsPage() {
  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="gradient-text" style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Contents Library
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Manage your drafted and scheduled content before scheduling.
        </p>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <Link href="/generator" className="btn-primary">
          <i className="fas fa-plus" /> Create New Content
        </Link>
        <select className="form-select" style={{ maxWidth: 200 }}>
          <option>All Status</option>
          <option>Drafted</option>
          <option>Scheduled</option>
        </select>
      </div>

      <SyncBanner />

      {/* Table */}
      <div className="card" style={{ padding: "1rem", overflowX: "auto" }}>
        <table style={{ fontSize: "0.85rem", minWidth: 900 }}>
          <thead>
            <tr>
              <th style={{ width: 64 }}>Thumbnail</th>
              <th>Title</th>
              <th>Author</th>
              <th>Date Created</th>
              <th>Date Scheduled</th>
              <th>Platforms</th>
              <th>Status</th>
              <th>Approved By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {CONTENTS.map((row) => (
              <tr key={row.id}>
                <td>{row.thumb}</td>
                <td>
                  <div className={styles.contentTitle}>{row.title}</div>
                  <div className={styles.contentSubtitle}>{row.subtitle}</div>
                </td>
                <td>{row.author}</td>
                <td>{row.created}</td>
                <td>{row.scheduled}</td>
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
                <td>{row.approvedBy}</td>
                <td>
                  <button className="btn-secondary btn-small">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
