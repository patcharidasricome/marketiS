"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FacebookIcon, InstagramIcon, LinkedInIcon } from "@/components/PlatformIcons";
import styles from "./page.module.css";

type ContentItem = {
  id: string | number;
  thumbnailImage: string;
  title: string;
  author: string;
  dateCreated: string;
  dateScheduled: string;
  status: string;
  platforms: string[];
};

const ARCHIVED_STORAGE_KEY = "marketiS-contents-archived";

type ContentsTab = "all" | "drafted" | "scheduled" | "archived" | "posted";

const TAB_ITEMS: { id: ContentsTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "drafted", label: "Drafted" },
  { id: "scheduled", label: "Scheduled" },
  { id: "archived", label: "Archived" },
  { id: "posted", label: "Posted" },
];

function parseScheduleDate(value: string): Date | null {
  if (!value?.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function loadArchivedFromStorage(): ContentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ARCHIVED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ContentItem[]) : [];
  } catch {
    return [];
  }
}

function rowMatchesTab(
  row: ContentItem,
  tab: ContentsTab,
  archivedIds: ReadonlySet<string>,
): boolean {
  const status = getDisplayStatus(row, archivedIds).toLowerCase();

  if (tab === "all") return true;
  return status === tab;
}

function emptyTableMessage(activeTab: ContentsTab, mergedLength: number): string {
  if (mergedLength === 0) return "No contents available.";
  switch (activeTab) {
    case "drafted":
      return "No drafted content yet.";
    case "scheduled":
      return "Nothing scheduled yet.";
    case "archived":
      return "No archived content yet.";
    case "posted":
      return "No posted content yet.";
    default:
      return "No items in this view.";
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value || "—" : date.toLocaleDateString("en-CA");
}

function normalizeStatus(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "scheduled") return "Scheduled";
  if (normalized === "archived") return "Archived";
  if (normalized === "posted") return "Posted";
  return "Drafted";
}

function getDisplayStatus(row: ContentItem, archivedIds: ReadonlySet<string>) {
  if (archivedIds.has(String(row.id))) return "Archived";
  if (row.status?.trim()) return normalizeStatus(row.status);

  const sched = parseScheduleDate(row.dateScheduled);
  if (!sched) return "Drafted";
  return sched < new Date() ? "Posted" : "Scheduled";
}

/** Stable React keys / SVG gradient ids — never use thumbnail data URLs as keys (duplicate rows share same image). */
function platformIcon(platform: string, rowIdx: number, platformIdx: number) {
  const keyBase = `${rowIdx}-${platformIdx}`;
  const igDomId = `contents-ig-${rowIdx}-${platformIdx}`;
  const normalized = platform.toLowerCase();
  if (normalized.includes("facebook")) return <FacebookIcon key={`fb-${keyBase}`} />;
  if (normalized.includes("ig") || normalized.includes("instagram"))
    return <InstagramIcon key={`ig-${keyBase}`} id={igDomId} />;
  if (normalized.includes("linkedin")) return <LinkedInIcon key={`li-${keyBase}`} />;
  return (
    <span key={`pt-${keyBase}-${platform}`} className={styles.platformText}>
      {platform}
    </span>
  );
}

export default function ContentsPage() {
  const [activeTab, setActiveTab] = useState<ContentsTab>("all");
  const [apiContents, setApiContents] = useState<ContentItem[]>([]);
  const [archivedContents, setArchivedContents] = useState<ContentItem[]>(() => loadArchivedFromStorage());
  const [loading, setLoading] = useState(true);
  const [archivingId, setArchivingId] = useState<string | number | null>(null);
  const [archiveError, setArchiveError] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(ARCHIVED_STORAGE_KEY, JSON.stringify(archivedContents));
    } catch {
      /* ignore quota */
    }
  }, [archivedContents]);

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
          status: row.status || "Drafted",
          platforms: Array.isArray(row.platforms) ? row.platforms : String(row.platforms || "").split(", ").filter(Boolean),
        }));
        setApiContents(rows.reverse());
      } catch {
        setApiContents([]);
      } finally {
        setLoading(false);
      }
    }

    loadContents();
  }, []);

  const archivedIds = useMemo(
    () => new Set(archivedContents.map((r) => String(r.id))),
    [archivedContents],
  );

  const mergedContents = useMemo(() => {
    const rest = apiContents.filter((r) => !archivedIds.has(String(r.id)));
    return [...rest, ...archivedContents];
  }, [apiContents, archivedContents, archivedIds]);

  const filteredContents = useMemo(
    () => mergedContents.filter((row) => rowMatchesTab(row, activeTab, archivedIds)),
    [mergedContents, activeTab, archivedIds],
  );

  async function handleArchive(row: ContentItem) {
    if (!window.confirm(`Archive “${row.title}”? You can find it under the Archived tab.`)) return;

    setArchivingId(row.id);
    setArchiveError("");

    try {
      const res = await fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: row.title,
          action: "was archived from Contents Library",
          author: row.author?.trim() || "Current User",
          date: new Date().toISOString(),
          remarks: "",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Could not log archive activity.");

      setArchivedContents((prev) => {
        const next = prev.filter((item) => String(item.id) !== String(row.id));
        return [...next, { ...row, status: "Archived" }];
      });
      setApiContents((prev) => prev.filter((item) => String(item.id) !== String(row.id)));
      setActiveTab("archived");
    } catch (e) {
      setArchiveError(e instanceof Error ? e.message : "Could not archive.");
    } finally {
      setArchivingId(null);
    }
  }

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
      </div>

      <div className={styles.tabsWrap} role="tablist" aria-label="Filter contents by status">
        <div className={styles.tabs}>
          {TAB_ITEMS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`contents-tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              tabIndex={activeTab === tab.id ? 0 : -1}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {archiveError && (
        <p style={{ marginBottom: "1rem", color: "var(--error)", fontSize: "0.85rem" }}>
          <i className="fas fa-circle-exclamation" /> {archiveError}
        </p>
      )}

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
              <th>Status</th>
              <th>Platforms</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                  <i className="fas fa-spinner fa-spin" /> Loading contents...
                </td>
              </tr>
            )}

            {!loading && filteredContents.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                  {emptyTableMessage(activeTab, mergedContents.length)}
                </td>
              </tr>
            )}

            {!loading && filteredContents.map((row, rowIdx) => (
              <tr key={`content-${rowIdx}-${String(row.id)}`}>
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
                  <span className={styles.statusBadge}>{getDisplayStatus(row, archivedIds)}</span>
                </td>
                <td>
                  <div className={styles.platformRow}>
                    {row.platforms.map((platform, pi) => platformIcon(platform, rowIdx, pi))}
                  </div>
                </td>
                <td>
                  <div className={styles.actionCell}>
                    <button type="button" className={`btn-secondary btn-small ${styles.actionToolbarBtn}`}>
                      Edit
                    </button>
                    <Link
                      href={`/calendar?from=contents&id=${encodeURIComponent(String(row.id))}&title=${encodeURIComponent(row.title)}&author=${encodeURIComponent(row.author)}`}
                      className={`btn-secondary btn-small ${styles.scheduleLink} ${styles.actionToolbarBtn}`}
                      aria-label={`Schedule ${row.title}`}
                    >
                      <i className="fas fa-calendar-plus" aria-hidden />
                      Schedule
                    </Link>
                    <button
                      type="button"
                      className={`${styles.archiveBtn} ${styles.actionToolbarBtn}`}
                      disabled={archivingId === row.id}
                      onClick={() => handleArchive(row)}
                      aria-label={`Archive ${row.title}`}
                    >
                      {archivingId === row.id ? (
                        <i className="fas fa-spinner fa-spin" aria-hidden />
                      ) : (
                        <i className="fas fa-archive" aria-hidden />
                      )}
                      Archive
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
