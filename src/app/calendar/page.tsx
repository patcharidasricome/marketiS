"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { FacebookIcon, InstagramIcon, LinkedInIcon } from "@/components/PlatformIcons";

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type CalendarDay = {
  num: number;
  otherMonth?: boolean;
  today?: boolean;
  posts?: React.ReactNode[];
};

const fbBadge = (key: string) => (
  <div key={key} className={styles.platformBadge} style={{ background: "#1877f2" }} title="Facebook">
    <FacebookIcon size={12} />
  </div>
);
const igBadge = (key: string, id: string) => (
  <div key={key} className={styles.platformBadge} style={{ background: "linear-gradient(135deg,#E09B3D,#C74C4D,#C21975,#7024C4)" }} title="Instagram">
    <InstagramIcon size={12} id={id} />
  </div>
);
const liBadge = (key: string) => (
  <div key={key} className={styles.platformBadge} style={{ background: "#0A66C2" }} title="LinkedIn">
    <LinkedInIcon size={12} />
  </div>
);

const CALENDAR_DAYS: CalendarDay[] = [
  { num: 31, otherMonth: true },
  { num: 1 }, { num: 2 }, { num: 3 }, { num: 4 }, { num: 5 }, { num: 6 },
  { num: 7 }, { num: 8 },
  { num: 9,  today: true, posts: [fbBadge("fb9"), igBadge("ig9", "c9")] },
  { num: 10 },
  { num: 11, posts: [liBadge("li11")] },
  { num: 12 }, { num: 13 }, { num: 14 },
  { num: 15, posts: [fbBadge("fb15")] },
  { num: 16 }, { num: 17 }, { num: 18 }, { num: 19 }, { num: 20 }, { num: 21 },
  { num: 22, posts: [igBadge("ig22", "c22"), liBadge("li22")] },
  { num: 23 }, { num: 24 }, { num: 25 }, { num: 26 }, { num: 27 },
  { num: 28 }, { num: 29 }, { num: 30 },
  { num: 1, otherMonth: true }, { num: 2, otherMonth: true },
  { num: 3, otherMonth: true }, { num: 4, otherMonth: true },
];

const upcomingPosts = [
  { title: "mRNA Vaccine Updates",  meta: "April 9 • 10:00 AM" },
  { title: "CRISPR Gene Therapy",   meta: "April 11 • 2:30 PM" },
];

type SelectedContent = {
  id: string;
  title: string;
  author: string;
};

function readSelectedContentFromUrl(): SelectedContent | null {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const fromContents = params.get("from") === "contents";
  const title = params.get("title")?.trim();

  if (!fromContents || !title) return null;

  return {
    id: params.get("id") || "",
    title,
    author: params.get("author")?.trim() || "Current User",
  };
}

export default function CalendarPage() {
  const [selectedContent] = useState<SelectedContent | null>(() => readSelectedContentFromUrl());
  const [activityStatus, setActivityStatus] = useState("");
  const [activityError, setActivityError] = useState("");
  const [loggingAction, setLoggingAction] = useState<"schedule" | "reschedule" | null>(null);

  async function logScheduleActivity(kind: "schedule" | "reschedule") {
    if (!selectedContent) return;

    setLoggingAction(kind);
    setActivityError("");
    setActivityStatus("");

    try {
      const res = await fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: selectedContent.title,
          action: kind === "schedule" ? "scheduled content" : "rescheduled content",
          author: selectedContent.author,
          date: new Date().toISOString(),
          remarks: kind === "schedule" ? "from Posting Calendar" : "updated from Posting Calendar",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Could not log activity.");

      setActivityStatus(kind === "schedule" ? "Schedule activity logged." : "Reschedule activity logged.");
    } catch (err) {
      setActivityError(err instanceof Error ? err.message : "Could not log activity.");
    } finally {
      setLoggingAction(null);
    }
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="gradient-text" style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Posting Calendar
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Schedule, reschedule, and manage your posts. Click posts to edit/delete, drag to reschedule.
        </p>
      </div>

      {selectedContent && (
        <div className={styles.scheduleContextCard}>
          <div>
            <div className={styles.scheduleContextEyebrow}>Scheduling from Contents Library</div>
            <div className={styles.scheduleContextTitle}>{selectedContent.title}</div>
          </div>
          <div className={styles.scheduleActionRow}>
            <button
              type="button"
              className="btn-primary btn-small"
              disabled={loggingAction !== null}
              onClick={() => logScheduleActivity("schedule")}
            >
              {loggingAction === "schedule" ? (
                <><i className="fas fa-spinner fa-spin" /> Scheduling...</>
              ) : (
                <><i className="fas fa-calendar-plus" /> Mark Scheduled</>
              )}
            </button>
            <button
              type="button"
              className="btn-secondary btn-small"
              disabled={loggingAction !== null}
              onClick={() => logScheduleActivity("reschedule")}
            >
              {loggingAction === "reschedule" ? (
                <><i className="fas fa-spinner fa-spin" /> Rescheduling...</>
              ) : (
                <><i className="fas fa-calendar-days" /> Mark Rescheduled</>
              )}
            </button>
          </div>
          {activityStatus && <p className={styles.activitySuccess}>{activityStatus}</p>}
          {activityError && <p className={styles.activityError}>{activityError}</p>}
        </div>
      )}

      <div className={styles.calendarWrapper}>
        {/* ── Main calendar ── */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2 className={styles.cardTitle}>
            <i className={`fas fa-calendar-days ${styles.cardTitleIcon}`} />
            April 2024
          </h2>

          {/* Day-of-week headers */}
          <div className={styles.dayHeaders}>
            {DAY_HEADERS.map((d) => (
              <div key={d} className={styles.dayHeader}>{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className={styles.calendarGrid}>
            {CALENDAR_DAYS.map((day, i) => (
              <div
                key={i}
                className={[
                  styles.calendarDay,
                  day.otherMonth ? styles.otherMonth : "",
                  day.today      ? styles.today      : "",
                ].join(" ")}
              >
                <div className={styles.dayNumber}>{day.num}</div>
                {day.posts && (
                  <div className={styles.dayPosts}>{day.posts}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Upcoming posts sidebar ── */}
        <div className="card" style={{ padding: "1.5rem", height: "fit-content" }}>
          <h2 className={styles.cardTitle}>
            <i className={`fas fa-list-check ${styles.cardTitleIcon}`} />
            Upcoming Posts
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {upcomingPosts.map((post, i) => (
              <div className="trending-item" key={`${post.title}-${i}`}>
                <div className={styles.upcomingTitle}>{post.title}</div>
                <div className={styles.upcomingMeta}>{post.meta}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
