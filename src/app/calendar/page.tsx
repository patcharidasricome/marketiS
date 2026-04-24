"use client";

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

export default function CalendarPage() {
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
            {upcomingPosts.map((post) => (
              <div className="trending-item" key={post.title}>
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
