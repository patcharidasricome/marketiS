"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

/* ─── Types ───────────────────────────────────────────────────── */

type FeedbackType = "Bug Report" | "Enhancement" | "Feature Request";

type FeedbackItem = {
  id: string | number;
  name: string;
  type: FeedbackType;
  description: string;
  extra1: string; // severity / impact / priority
  extra2: string; // steps / current behavior / rationale
  extra3: string; // proposed improvement
  date: string;
};

/* ─── Helpers ─────────────────────────────────────────────────── */

function toDisplayDate(raw: string) {
  const d = new Date(raw);
  return isNaN(d.getTime()) ? raw : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ─── Type config ─────────────────────────────────────────────── */

const TYPE_CONFIG: Record<FeedbackType, { icon: string; color: string; badgeClass: string }> = {
  "Bug Report":      { icon: "fa-bug",                   color: "#ef4444", badgeClass: "bug" },
  "Enhancement":     { icon: "fa-lightbulb",              color: "#f59e0b", badgeClass: "enhancement" },
  "Feature Request": { icon: "fa-wand-magic-sparkles",    color: "#7c3aed", badgeClass: "feature" },
};

const EXTRA1_LABELS: Record<FeedbackType, string>  = {
  "Bug Report":      "Severity",
  "Enhancement":     "Impact",
  "Feature Request": "Priority",
};

const EXTRA1_OPTIONS: Record<FeedbackType, string[]> = {
  "Bug Report":      ["Critical", "High", "Medium", "Low"],
  "Enhancement":     ["High", "Medium", "Low"],
  "Feature Request": ["High", "Medium", "Low"],
};

/* ─── Modal ───────────────────────────────────────────────────── */

function FeedbackModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (item: FeedbackItem) => void }) {
  const [type, setType]             = useState<FeedbackType | null>(null);
  const [name, setName]             = useState("");
  const [description, setDescription] = useState("");
  const [extra1, setExtra1]         = useState("");
  const [extra2, setExtra2]         = useState("");
  const [extra3, setExtra3]         = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  const descLabel = type
    ? `${type === "Enhancement" ? "Enhancement" : type === "Bug Report" ? "Bug" : "Feature"} Description`
    : "Description";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!type || !description.trim() || !extra1) return;
    if (type === "Enhancement" && (!extra2.trim() || !extra3.trim())) return;
    if (type === "Feature Request" && !extra2.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Anonymous",
          type,
          description: description.trim(),
          extra1,
          extra2: extra2.trim(),
          extra3: extra3.trim(),
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed");
      }
      onSuccess({
        id: Date.now(),
        name: name.trim() || "Anonymous",
        type,
        description: description.trim(),
        extra1,
        extra2: extra2.trim(),
        extra3: extra3.trim(),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    !!type &&
    !!description.trim() &&
    !!extra1 &&
    (type !== "Feature Request" || !!extra2.trim()) &&
    (type !== "Enhancement" || (!!extra2.trim() && !!extra3.trim()));

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* Modal header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.modalIcon}>
              <i className="fas fa-comment-dots" />
            </div>
            <div>
              <h2 className={styles.modalTitle}>User Feedback</h2>
              <p className={styles.modalSubtitle}>Report bugs, request enhancements, or suggest features</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close"><i className="fas fa-xmark" /></button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.modalBody}>

            {/* Your name */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Your Name (Optional)</label>
              <input
                className={styles.fieldInput}
                type="text"
                placeholder="e.g. Pat"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Type selector */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Feedback Type</label>
              <div className={styles.typeGrid}>
                {(["Bug Report", "Enhancement", "Feature Request"] as FeedbackType[]).map((t) => {
                  const cfg = TYPE_CONFIG[t];
                  return (
                    <button
                      key={t}
                      type="button"
                      className={`${styles.typeCard} ${type === t ? styles.typeCardActive : ""}`}
                      onClick={() => { setType(t); setExtra1(""); setExtra2(""); setExtra3(""); setDescription(""); }}
                      style={{ "--type-color": cfg.color } as React.CSSProperties}
                    >
                      <i className={`fas ${cfg.icon} ${styles.typeCardIcon}`} style={{ color: cfg.color }} />
                      <span className={styles.typeCardTitle}>{t}</span>
                      <span className={styles.typeCardSub}>
                        {t === "Bug Report" ? "Report an issue" : t === "Enhancement" ? "Improve existing" : "Request new feature"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic fields */}
            {type && (
              <>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    {descLabel} <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    className={styles.fieldTextarea}
                    placeholder={`Describe the ${type === "Bug Report" ? "bug you encountered" : type === "Enhancement" ? "enhancement you'd like to see" : "feature you'd like to see"}...`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
                    rows={4}
                  />
                  <div className={styles.charCount}>{description.length} / 2,000 characters</div>
                </div>

                {type === "Enhancement" ? (
                  <>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Current Behavior <span className={styles.required}>*</span>
                      </label>
                      <textarea
                        className={styles.fieldTextarea}
                        placeholder="How does this feature currently work?"
                        value={extra2}
                        onChange={(e) => setExtra2(e.target.value.slice(0, 1000))}
                        rows={3}
                      />
                      <div className={styles.charCount}>{extra2.length} / 1,000 characters</div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Proposed Improvement <span className={styles.required}>*</span>
                      </label>
                      <textarea
                        className={styles.fieldTextarea}
                        placeholder="How should it work instead?"
                        value={extra3}
                        onChange={(e) => setExtra3(e.target.value.slice(0, 1000))}
                        rows={3}
                      />
                      <div className={styles.charCount}>{extra3.length} / 1,000 characters</div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Impact <span className={styles.required}>*</span>
                      </label>
                      <select className={styles.fieldSelect} value={extra1} onChange={(e) => setExtra1(e.target.value)}>
                        <option value="">Select impact...</option>
                        {EXTRA1_OPTIONS[type].map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </>
                ) : type === "Feature Request" ? (
                  <>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Rationale <span className={styles.required}>*</span>
                      </label>
                      <textarea
                        className={styles.fieldTextarea}
                        placeholder="Why would this feature be valuable? What problem does it solve?"
                        value={extra2}
                        onChange={(e) => setExtra2(e.target.value.slice(0, 1000))}
                        rows={3}
                      />
                      <div className={styles.charCount}>{extra2.length} / 1,000 characters</div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Priority <span className={styles.required}>*</span>
                      </label>
                      <select className={styles.fieldSelect} value={extra1} onChange={(e) => setExtra1(e.target.value)}>
                        <option value="">Select priority...</option>
                        {EXTRA1_OPTIONS[type].map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Severity <span className={styles.required}>*</span>
                      </label>
                      <select className={styles.fieldSelect} value={extra1} onChange={(e) => setExtra1(e.target.value)}>
                        <option value="">Select severity...</option>
                        {EXTRA1_OPTIONS[type].map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Steps to Reproduce (Optional)</label>
                      <textarea
                        className={styles.fieldTextarea}
                        placeholder="1. Go to...\n2. Click on...\n3. See error..."
                        value={extra2}
                        onChange={(e) => setExtra2(e.target.value.slice(0, 1000))}
                        rows={3}
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* Tips */}
            <div className={styles.tipsBox}>
              <div className={styles.tipsTitle}><i className="fas fa-circle-info" /> Tips for effective feedback</div>
              <ul className={styles.tipsList}>
                <li><strong>Be detailed and thorough</strong> — Provide as much context as possible</li>
                <li><strong>Bug:</strong> Include steps to reproduce the issue</li>
                <li><strong>Enhancement:</strong> Explain how it would improve your experience</li>
                <li><strong>Feature:</strong> Describe the use case and benefits</li>
              </ul>
            </div>

            {error && <p className={styles.errorMsg}><i className="fas fa-exclamation-circle" /> {error}</p>}
          </div>

          {/* Modal footer */}
          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting || !canSubmit}
            >
              {submitting ? <><i className="fas fa-spinner fa-spin" /> Submitting…</> : <><i className="fas fa-paper-plane" /> Submit Feedback</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Feedback card ───────────────────────────────────────────── */

function FeedbackCard({ item }: { item: FeedbackItem }) {
  const cfg = TYPE_CONFIG[item.type];
  const extra1Label = EXTRA1_LABELS[item.type];
  return (
    <div className={styles.fbCard}>
      <div className={styles.fbCardTop}>
        <span className={`${styles.typeBadge} ${styles[`badge_${cfg.badgeClass}`]}`}>{item.type}</span>
        <div className={styles.fbMeta}>
          <i className="fas fa-user-circle" style={{ marginRight: "0.3rem", opacity: 0.5 }} />
          {item.name}
          <span className={styles.fbDot}>•</span>
          {item.date}
        </div>
      </div>
      {item.description && (
        <div className={styles.fbSection}>
          <div className={styles.fbSectionLabel}>DESCRIPTION</div>
          <p className={styles.fbDescription}>{item.description}</p>
        </div>
      )}
      {item.extra1 && (
        <div className={styles.fbExtra}>
          <span className={styles.fbExtraLabel}>{extra1Label.toUpperCase()}:</span>
          <span className={`${styles.severityBadge} ${styles[`sev_${item.extra1.toLowerCase()}`]}`}>{item.extra1}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────── */

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch("/api/feedback");
        const json = await res.json();
        const items: FeedbackItem[] = (json.data ?? []).map(
          (r: { submittedAt: string; name: string; type: string; description: string; extra1: string; extra2: string; extra3: string }, i: number) => ({
            id:          i + 1,
            name:        r.name        || "Anonymous",
            type:        r.type        || "Bug Report",
            description: r.description || "",
            extra1:      r.extra1      || "",
            extra2:      r.extra2      || "",
            extra3:      r.extra3      || "",
            date:        toDisplayDate(String(r.submittedAt)),
          })
        );
        setFeedbacks(items.reverse());
      } catch {
        /* leave empty */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleSuccess(item: FeedbackItem) {
    setFeedbacks((prev) => [item, ...prev]);
    setModalOpen(false);
  }

  const bugs     = feedbacks.filter((f) => f.type === "Bug Report");
  const enhs     = feedbacks.filter((f) => f.type === "Enhancement");
  const features = feedbacks.filter((f) => f.type === "Feature Request");

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>User Feedback</h1>
          <p className={styles.pageSubtitle}>View and submit feedback to improve marketiS</p>
        </div>
        <button className={styles.submitFeedbackBtn} onClick={() => setModalOpen(true)}>
          <i className="fas fa-paper-plane" /> Submit Feedback
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <i className={`fas fa-bug ${styles.statIcon}`} style={{ color: "#ef4444" }} />
          <span className={styles.statCount}>{bugs.length}</span>
          <span className={styles.statLabel}>BUG REPORTS</span>
        </div>
        <div className={styles.statCard}>
          <i className={`fas fa-lightbulb ${styles.statIcon}`} style={{ color: "#f59e0b" }} />
          <span className={styles.statCount}>{enhs.length}</span>
          <span className={styles.statLabel}>ENHANCEMENTS</span>
        </div>
        <div className={styles.statCard}>
          <i className={`fas fa-wand-magic-sparkles ${styles.statIcon}`} style={{ color: "#7c3aed" }} />
          <span className={styles.statCount}>{features.length}</span>
          <span className={styles.statLabel}>FEATURES</span>
        </div>
      </div>

      {/* Sections */}
      {loading ? (
        <div className={styles.loadingState}>
          <i className="fas fa-spinner fa-spin" /> Loading feedback…
        </div>
      ) : (
        <>
          {/* Bug Reports */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <i className="fas fa-bug" style={{ color: "#ef4444" }} />
              <h2 className={styles.sectionTitle}>Bug Reports</h2>
            </div>
            {bugs.length === 0
              ? <p className={styles.emptyState}>No bug reports yet.</p>
              : <div className={styles.cardGrid}>{bugs.map((fb) => <FeedbackCard key={fb.id} item={fb} />)}</div>
            }
          </div>

          {/* Enhancements */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <i className="fas fa-lightbulb" style={{ color: "#f59e0b" }} />
              <h2 className={styles.sectionTitle}>Enhancement Requests</h2>
            </div>
            {enhs.length === 0
              ? <p className={styles.emptyState}>No enhancement requests yet.</p>
              : <div className={styles.cardGrid}>{enhs.map((fb) => <FeedbackCard key={fb.id} item={fb} />)}</div>
            }
          </div>

          {/* Features */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <i className="fas fa-wand-magic-sparkles" style={{ color: "#7c3aed" }} />
              <h2 className={styles.sectionTitle}>Feature Requests</h2>
            </div>
            {features.length === 0
              ? <p className={styles.emptyState}>No feature requests yet.</p>
              : <div className={styles.cardGrid}>{features.map((fb) => <FeedbackCard key={fb.id} item={fb} />)}</div>
            }
          </div>
        </>
      )}

      {/* Modal */}
      {modalOpen && <FeedbackModal onClose={() => setModalOpen(false)} onSuccess={handleSuccess} />}
    </div>
  );
}
