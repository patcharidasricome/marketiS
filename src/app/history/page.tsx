"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

type ActivityItem = {
  id: string | number;
  item: string;
  action: string;
  author: string;
  date: string;
  remarks: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value || "—"
    : date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function HistoryPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      try {
        const res = await fetch("/api/activity");
        const json = await res.json();
        const rows: ActivityItem[] = (json.data ?? []).map((row: ActivityItem, index: number) => ({
          id: row.id ?? index + 1,
          item: row.item || "",
          action: row.action || "",
          author: row.author || "Unknown",
          date: row.date || "",
          remarks: row.remarks || "",
        }));
        setActivities(rows.reverse());
      } catch {
        setActivities([]);
      } finally {
        setLoading(false);
      }
    }

    loadActivities();
  }, []);

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="gradient-text" style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Activity History
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Complete log of user activities across the website.
        </p>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: "1rem", overflowX: "auto" }}>
        <table style={{ fontSize: "0.85rem", minWidth: 780 }}>
          <thead>
            <tr>
              <th>Activity</th>
              <th>Item</th>
              <th>Action</th>
              <th>Author</th>
              <th>Date</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className={styles.emptyCell}>
                  <i className="fas fa-spinner fa-spin" /> Loading activity history...
                </td>
              </tr>
            )}

            {!loading && activities.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.emptyCell}>
                  No activity history available.
                </td>
              </tr>
            )}

            {!loading && activities.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className={styles.activitySentence}>
                    <strong>{row.item}</strong> {row.action} by <strong>{row.author}</strong> on {formatDate(row.date)}
                    {row.remarks ? <> because {row.remarks}</> : null}
                  </div>
                </td>
                <td>{row.item}</td>
                <td>{row.action}</td>
                <td>{row.author}</td>
                <td>{formatDate(row.date)}</td>
                <td>{row.remarks || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
