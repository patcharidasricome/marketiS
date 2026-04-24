"use client";

import { useState } from "react";
import styles from "./page.module.css";

/* ─── Data ────────────────────────────────────────────────────── */

const METRICS = [
  { label: "Avg. Rating",    value: "4.6", suffix: "/ 5",  delta: "+0.3",  up: true  },
  { label: "Total Reviews",  value: "218", suffix: "",      delta: "+24",   up: true  },
  { label: "Response Rate",  value: "91",  suffix: "%",     delta: "+6%",   up: true  },
  { label: "Detractors",     value: "12",  suffix: "",      delta: "−3",    up: true  },
];

const RATING_DISTRIBUTION = [
  { stars: 5, count: 134, pct: 0.615 },
  { stars: 4, count: 51,  pct: 0.234 },
  { stars: 3, count: 21,  pct: 0.096 },
  { stars: 2, count: 8,   pct: 0.037 },
  { stars: 1, count: 4,   pct: 0.018 },
];

const SENTIMENT = [
  { label: "Positive",  pct: "73%", cls: styles.sentimentPositive, icon: "😊" },
  { label: "Neutral",   pct: "18%", cls: styles.sentimentNeutral,  icon: "😐" },
  { label: "Negative",  pct: "9%",  cls: styles.sentimentNegative, icon: "😞" },
];

const FILTERS = ["All", "5★", "4★", "3★", "≤2★", "Positive", "Negative"];

const AVATAR_COLORS = [
  "#7c3aed", "#06b6d4", "#ec4899", "#1a237e",
  "#059669", "#d97706", "#dc2626", "#0891b2",
];

const FEEDBACKS = [
  {
    id: 1,
    name: "Sarah L.",
    role: "Content Author",
    initials: "SL",
    color: 0,
    rating: 5,
    comment:
      "The AI content generator has completely transformed our workflow. We're publishing 3× faster and the tone always hits right for our life-science audience. The platform chip chips alone save us an hour every week.",
    tags: ["Generator", "Workflow", "AI"],
    date: "Apr 19, 2024",
  },
  {
    id: 2,
    name: "Marcus T.",
    role: "Social Media Manager",
    initials: "MT",
    color: 1,
    rating: 5,
    comment:
      "The calendar drag-and-drop is smoother than any tool I've used before. Being able to reschedule by dragging a badge is genuinely delightful UX. Google Sheets sync keeps everyone on the same page.",
    tags: ["Calendar", "UX", "Sync"],
    date: "Apr 18, 2024",
  },
  {
    id: 3,
    name: "Ji-Yoon K.",
    role: "Analytics Lead",
    initials: "JY",
    color: 2,
    rating: 4,
    comment:
      "Analytics section is solid — reach and engagement stats at a glance. Would love a time-series chart for engagement trends over the last 30 days. That would make it a perfect reporting tool.",
    tags: ["Analytics", "Feature Request"],
    date: "Apr 17, 2024",
  },
  {
    id: 4,
    name: "Priya N.",
    role: "Content Strategist",
    initials: "PN",
    color: 3,
    rating: 5,
    comment:
      "Trending topics with the context expansion feature is my favourite. It makes it so easy to stay current with mRNA and CRISPR developments without leaving the tool. Write Content button is well-placed.",
    tags: ["Dashboard", "Trending", "AI"],
    date: "Apr 16, 2024",
  },
  {
    id: 5,
    name: "David R.",
    role: "Admin",
    initials: "DR",
    color: 4,
    rating: 3,
    comment:
      "User roles management works well, but I'd like bulk assignment capability. Changing roles one by one across 15 team members is tedious. The integration status display is clean though.",
    tags: ["Settings", "Improvement"],
    date: "Apr 15, 2024",
  },
  {
    id: 6,
    name: "Aiko M.",
    role: "Content Author",
    initials: "AM",
    color: 5,
    rating: 4,
    comment:
      "Image upload in the generator is intuitive — loved that the aspect ratios update live per platform. The Instagram 3:4 preview is especially handy. Would appreciate a crop tool built in.",
    tags: ["Generator", "Images", "Feature Request"],
    date: "Apr 14, 2024",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className={styles.ratingStars} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor"
          className={i < rating ? styles.starFilled : styles.starEmpty}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */

export default function FeedbackPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <div>
      {/* ── Page header ── */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          className="gradient-text"
          style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}
        >
          User Feedback
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Aggregate ratings, sentiment analysis, and direct team feedback on the platform.
        </p>
      </div>

      {/* ── Top metrics ── */}
      <div className={styles.metricsRow}>
        {METRICS.map(({ label, value, suffix, delta, up }) => (
          <div key={label} className={styles.metricCard}>
            <div className={styles.metricLabel}>{label}</div>
            <div className={`gradient-text ${styles.metricValue}`}>
              {value}
              {suffix && (
                <span style={{ fontSize: "1rem", fontWeight: 500, opacity: 0.5, marginLeft: "0.3rem" }}>
                  {suffix}
                </span>
              )}
            </div>
            <div className={`${styles.metricDelta} ${up ? styles.deltaUp : styles.deltaDown}`}>
              <span>{up ? "↑" : "↓"}</span>
              <span>{delta} vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Body grid ── */}
      <div className={styles.bodyGrid}>

        {/* ── Left panel ── */}
        <div className={styles.leftPanel}>

          {/* NPS card */}
          <div className={styles.npsCard}>
            <div className={styles.npsLabel}>Net Promoter Score</div>
            <div className={styles.npsScore}>72</div>
            <div className={styles.npsSubtext}>World-class experience threshold</div>
            <div className={styles.npsBreakdown}>
              {[
                { val: "73%", label: "Promoters"  },
                { val: "18%", label: "Passives"   },
                { val: "9%",  label: "Detractors" },
              ].map(({ val, label }) => (
                <div key={label} className={styles.npsSegment}>
                  <div className={styles.npsSegmentVal}>{val}</div>
                  <div className={styles.npsSegmentLabel}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Rating distribution */}
          <div className={styles.ratingCard}>
            <div className={styles.ratingCardTitle}>Rating Distribution</div>
            {RATING_DISTRIBUTION.map(({ stars, count, pct }) => (
              <div key={stars} className={styles.ratingRow}>
                <div className={styles.ratingStarLabel}>{stars}★</div>
                <div className={styles.ratingBar}>
                  <div className={styles.ratingBarFill} style={{ width: `${pct * 100}%` }} />
                </div>
                <div className={styles.ratingCount}>{count}</div>
              </div>
            ))}
          </div>

          {/* Sentiment breakdown */}
          <div className={styles.sentimentCard}>
            <div className={styles.sentimentTitle}>Sentiment Analysis</div>
            {SENTIMENT.map(({ label, pct, cls, icon }) => (
              <div key={label} className={`${styles.sentimentRow} ${cls}`}>
                <span>{icon} {label}</span>
                <span className={styles.sentimentPct}>{pct}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel: feedback list ── */}
        <div className={styles.rightPanel}>
          <div className={styles.feedbackHeader}>
            <h2 className={styles.feedbackTitle}>Recent Feedback ({FEEDBACKS.length})</h2>
            <div className={styles.filterRow}>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  className={`${styles.filterChip}${activeFilter === f ? ` ${styles.filterChipActive}` : ""}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.feedbackList}>
            {FEEDBACKS.map((fb) => (
              <div key={fb.id} className={styles.feedbackCard}>
                <div className={styles.feedbackCardTop}>
                  <div className={styles.userInfo}>
                    <div
                      className={styles.avatar}
                      style={{ background: AVATAR_COLORS[fb.color] }}
                    >
                      {fb.initials}
                    </div>
                    <div>
                      <div className={styles.userName}>{fb.name}</div>
                      <div className={styles.userRole}>{fb.role}</div>
                    </div>
                  </div>
                  <Stars rating={fb.rating} />
                </div>

                <p className={styles.feedbackComment}>{fb.comment}</p>

                <div className={styles.feedbackCardBottom}>
                  <div className={styles.tagRow}>
                    {fb.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                  <span className={styles.feedbackDate}>{fb.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
