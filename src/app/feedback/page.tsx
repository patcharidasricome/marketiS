"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

/* ─── Constants ───────────────────────────────────────────────── */

const TAG_OPTIONS = ["Generator", "Calendar", "Analytics", "Settings", "UI/UX", "Performance", "Feature Request", "Bug"];
const FILTERS     = ["All", "5★", "4★", "3★", "≤2★"];
const AVATAR_COLORS = ["#7c3aed","#06b6d4","#ec4899","#1a237e","#059669","#d97706","#dc2626","#0891b2"];

/* ─── Types ───────────────────────────────────────────────────── */

type Feedback = {
  id: number | string;
  name: string;
  role: string;
  initials: string;
  color: number;
  rating: number;
  comment: string;
  tags: string[];
  date: string;
};

/* ─── Helpers ─────────────────────────────────────────────────── */

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("") || "AN";
}

function toDisplayDate(raw: string) {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ─── Sub-components ──────────────────────────────────────────── */

function StarDisplay({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className={styles.cardStars}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="currentColor"
          className={i < rating ? styles.starFilled : styles.starEmpty}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────── */

export default function FeedbackPage() {
  // Form state
  const [name, setName]       = useState("");
  const [role, setRole]       = useState("");
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [tags, setTags]       = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus]   = useState<"idle" | "success" | "error">("idle");

  // Feedback list
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  // Fetch existing feedback from Google Sheet on mount
  useEffect(() => {
    async function fetchFeedback() {
      try {
        const res  = await fetch("/api/feedback");
        const json = await res.json();
        const rows: Feedback[] = (json.data ?? []).map(
          (r: { submittedAt: string; name: string; role: string; rating: number; comment: string; tags: string[] }, i: number) => ({
            id:       i + 1,
            name:     r.name     || "Anonymous",
            role:     r.role     || "",
            initials: getInitials(r.name || "Anonymous"),
            color:    i % AVATAR_COLORS.length,
            rating:   Number(r.rating) || 0,
            comment:  r.comment  || "",
            tags:     Array.isArray(r.tags) ? r.tags : (r.tags ? String(r.tags).split(", ").filter(Boolean) : []),
            date:     toDisplayDate(r.submittedAt),
          })
        );
        // newest first
        setFeedbacks(rows.reverse());
      } catch {
        // leave list empty on error
      } finally {
        setLoading(false);
      }
    }
    fetchFeedback();
  }, []);

  function toggleTag(tag: string) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim() || rating === 0) return;

    setSubmitting(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || "Anonymous", role: role.trim(), rating, comment: comment.trim(), tags }),
      });

      if (!res.ok) throw new Error("Failed");

      // Optimistically prepend to list
      const displayName = name.trim() || "Anonymous";
      const newEntry: Feedback = {
        id:       Date.now(),
        name:     displayName,
        role:     role.trim() || "Team Member",
        initials: getInitials(displayName),
        color:    feedbacks.length % AVATAR_COLORS.length,
        rating,
        comment:  comment.trim(),
        tags,
        date:     new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };
      setFeedbacks((prev) => [newEntry, ...prev]);

      // Reset form
      setName(""); setRole(""); setRating(0); setComment(""); setTags([]);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  // Compute stats from real data
  const totalReviews = feedbacks.length;
  const avgRating    = totalReviews > 0
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / totalReviews).toFixed(1)
    : "–";

  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = feedbacks.filter((f) => f.rating === stars).length;
    return { stars, count, pct: totalReviews > 0 ? count / totalReviews : 0 };
  });

  // Top tags by mention count
  const tagCounts = feedbacks.reduce<Record<string, number>>((acc, fb) => {
    fb.tags.forEach((tag) => { acc[tag] = (acc[tag] || 0) + 1; });
    return acc;
  }, {});
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (activeFilter === "All")  return true;
    if (activeFilter === "5★")   return fb.rating === 5;
    if (activeFilter === "4★")   return fb.rating === 4;
    if (activeFilter === "3★")   return fb.rating === 3;
    if (activeFilter === "≤2★")  return fb.rating <= 2;
    return true;
  });

  const displayStar = hovered || rating;

  return (
    <div>
      {/* ── Page header ── */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="gradient-text" style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          User Feedback
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Rate the platform and share your thoughts with the team.
        </p>
      </div>

      {/* ── Top summary row ── */}
      <div className={styles.topStats}>

        {/* Overall Rating */}
        <div className={styles.overallCard}>
          <div className={styles.sideCardTitle}>Overall Rating</div>
          <div className={styles.avgRating}>
            <span className={`gradient-text ${styles.avgNum}`}>{avgRating}</span>
            <span className={styles.avgDenom}>/ 5</span>
          </div>
          <div className={styles.avgStars}>
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill="currentColor"
                className={i < Math.round(Number(avgRating)) ? styles.starFilled : styles.starEmpty}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <div className={styles.reviewCount}>{totalReviews} reviews</div>
        </div>

        {/* Tag insight cards */}
        <div className={styles.insightGrid}>
          {topTags.length === 0 ? (
            <div className={styles.insightEmpty}>
              No feedback yet — insights will appear here after submissions.
            </div>
          ) : (
            topTags.map(([tag, count], idx) => (
              <div key={tag} className={`${styles.insightCard} ${idx === 0 ? styles.insightCardPrimary : ""}`}>
                {idx >= 2 ? (
                  <>
                    <span className={styles.insightBigCount}>{count}</span>
                    <span className={styles.insightMentionsLabel}>mentions about</span>
                    <span className={styles.insightTagName}>{tag}</span>
                  </>
                ) : (
                  <>
                    <span className={styles.insightTagName}>{tag}</span>
                    <span className={styles.insightBigCount}>{count}</span>
                    <span className={styles.insightMentionsLabel}>mentions</span>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.bodyGrid}>

        {/* ── Left: Rating Distribution ── */}
        <div className={styles.leftPanel}>
          <div className={styles.ratingCard}>
            <div className={styles.sideCardTitle}>Rating Distribution</div>

            {ratingDistribution.map(({ stars, count, pct }) => (
              <div key={stars} className={styles.ratingRow}>
                <div className={styles.ratingStarLabel}>{stars}★</div>
                <div className={styles.ratingBar}>
                  <div className={styles.ratingBarFill} style={{ width: `${pct * 100}%` }} />
                </div>
                <div className={styles.ratingCount}>{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Form + Feedback list ── */}
        <div className={styles.rightPanel}>

          {/* Give Feedback form */}
          <div className={styles.formCard}>
            <h2 className={styles.formCardTitle}>Give Feedback</h2>
            <p className={styles.formCardSubtitle}>
              Your feedback is logged to our shared sheet and helps the team improve.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Your Name</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    placeholder="e.g. Pat"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Role</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    placeholder="e.g. Content Author"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.starRatingGroup}>
                <div className={styles.formLabel}>Rating <span style={{ color: "var(--error)" }}>*</span></div>
                <div className={styles.starRatingRow}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={styles.starBtn}
                      onMouseEnter={() => setHovered(i + 1)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(i + 1)}
                      aria-label={`${i + 1} star${i > 0 ? "s" : ""}`}
                    >
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"
                        className={i < displayStar ? styles.starFilled : styles.starEmpty}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                  {rating > 0 && (
                    <span style={{ alignSelf: "center", marginLeft: "0.5rem", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                      {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginBottom: "1.1rem" }}>
                <label className={styles.formLabel}>
                  Comment <span style={{ color: "var(--error)" }}>*</span>
                </label>
                <textarea
                  className={styles.formTextarea}
                  placeholder="Share your thoughts on the platform — what's working well, what could be improved..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className={styles.tagsGroup}>
                <div className={styles.formLabel}>Category Tags</div>
                <div className={styles.tagOptions}>
                  {TAG_OPTIONS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`${styles.tagOption}${tags.includes(tag) ? ` ${styles.tagOptionActive}` : ""}`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.submitRow}>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting || !comment.trim() || rating === 0}
                  style={{ opacity: submitting || !comment.trim() || rating === 0 ? 0.6 : 1 }}
                >
                  {submitting ? (
                    <><i className="fas fa-spinner fa-spin" /> Submitting…</>
                  ) : (
                    <><i className="fas fa-paper-plane" /> Submit Feedback</>
                  )}
                </button>

                {status === "success" && (
                  <span className={`${styles.submitStatus} ${styles.statusSuccess}`}>
                    <i className="fas fa-check-circle" style={{ marginRight: "0.3rem" }} />
                    Feedback submitted & logged to Google Sheets!
                  </span>
                )}
                {status === "error" && (
                  <span className={`${styles.submitStatus} ${styles.statusError}`}>
                    <i className="fas fa-exclamation-circle" style={{ marginRight: "0.3rem" }} />
                    Submission failed — please try again.
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Recent Feedback list */}
          <div>
            <div className={styles.listHeader}>
              <h2 className={styles.listTitle}>
                Recent Feedback
                <span style={{ fontWeight: 400, color: "var(--text-secondary)", fontSize: "0.85rem", marginLeft: "0.4rem" }}>
                  ({filteredFeedbacks.length})
                </span>
              </h2>
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
              {loading ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: "0.5rem" }} />
                  Loading feedback from Google Sheets…
                </div>
              ) : filteredFeedbacks.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  {activeFilter === "All" ? "No feedback yet — be the first to share!" : "No feedback matches this filter."}
                </div>
              ) : (
                filteredFeedbacks.map((fb) => (
                  <div key={fb.id} className={styles.feedbackCard}>
                    <div className={styles.feedbackCardTop}>
                      <div className={styles.userInfo}>
                        <div className={styles.avatar} style={{ background: AVATAR_COLORS[fb.color] }}>
                          {fb.initials}
                        </div>
                        <div>
                          <div className={styles.userName}>{fb.name}</div>
                          <div className={styles.userRole}>{fb.role}</div>
                        </div>
                      </div>
                      <StarDisplay rating={fb.rating} />
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
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
