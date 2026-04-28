"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SyncBanner from "@/components/SyncBanner";
import { FacebookIcon, InstagramIcon, LinkedInIcon } from "@/components/PlatformIcons";
import styles from "./page.module.css";

type ContentItem = {
  id: string | number;
  thumbnailImage: string;
  title: string;
  author: string;
  dateCreated: string;
  dateScheduled: string;
  platforms: string[];
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value || "—" : date.toLocaleDateString("en-CA");
}

function platformIcon(platform: string, id: string | number) {
  const normalized = platform.toLowerCase();
  if (normalized.includes("facebook")) return <FacebookIcon key={`${id}-fb`} />;
  if (normalized.includes("ig") || normalized.includes("instagram")) return <InstagramIcon key={`${id}-ig`} id={`${id}-ig`} />;
  if (normalized.includes("linkedin")) return <LinkedInIcon key={`${id}-li`} />;
  return <span key={`${id}-${platform}`} className={styles.platformText}>{platform}</span>;
}

export default function ContentsPage() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContents() {
      try {
        const res = await fetch("/api/contents");
        const json = await res.json();
        const rows: ContentItem[] = (json.data ?? []).map((row: ContentItem, index: number) => ({
          id: row.id ?? index + 1,
          thumbnailImage: row.thumbnailImage || "",
          title: row.title || "Untitled Content",
          author: row.author || "Current User",
          dateCreated: row.dateCreated || "",
          dateScheduled: row.dateScheduled || "",
          platforms: Array.isArray(row.platforms) ? row.platforms : String(row.platforms || "").split(", ").filter(Boolean),
        }));
        setContents(rows.reverse());
      } catch {
        setContents([]);
      } finally {
        setLoading(false);
      }
    }

    loadContents();
  }, []);

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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                  <i className="fas fa-spinner fa-spin" /> Loading contents...
                </td>
              </tr>
            )}

            {!loading && contents.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                  No contents available.
                </td>
              </tr>
            )}

            {!loading && contents.map((row) => (
              <tr key={row.id}>
                <td>
                  {row.thumbnailImage ? (
                    <img src={row.thumbnailImage} alt="" className={styles.thumbnailImage} />
                  ) : (
                    <div className={styles.thumbnailPlaceholder}>
                      <i className="fas fa-image" />
                    </div>
                  )}
                </td>
                <td>
                  <div className={styles.contentTitle}>{row.title}</div>
                </td>
                <td>{row.author}</td>
                <td>{formatDate(row.dateCreated)}</td>
                <td>{formatDate(row.dateScheduled)}</td>
                <td>
                  <div className={styles.platformRow}>
                    {row.platforms.map((platform) => platformIcon(platform, row.id))}
                  </div>
                </td>
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
