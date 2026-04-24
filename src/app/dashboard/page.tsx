"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const trendingTopics = [
  {
    id: 0,
    title: "mRNA Vaccine Updates",
    meta: "5 publications • 234 mentions",
    context:
      "Recent developments in mRNA vaccine technology show promising results in preventing multiple variants. Key research includes enhanced stability, faster production methods, and improved delivery systems. Major players in the field are conducting Phase 3 trials.",
  },
  {
    id: 1,
    title: "CRISPR Gene Therapy Breakthroughs",
    meta: "12 publications • 567 mentions",
    context:
      "CRISPR technology is rapidly advancing with new off-target editing techniques and precision improvements. Recent FDA approvals for genetic disorder treatments mark a major milestone. Clinical trials show success rates over 85% in certain applications.",
  },
  {
    id: 2,
    title: "Personalized Medicine Advances",
    meta: "8 publications • 345 mentions",
    context:
      "Personalized medicine is transforming healthcare with AI-driven diagnostics and treatment plans tailored to individual genetics. Integration with genomic sequencing improves patient outcomes by 40%. Major hospitals are adopting precision medicine protocols.",
  },
  {
    id: 3,
    title: "FDA Approval Announcements",
    meta: "3 publications • 89 mentions",
    context:
      "Recent FDA approvals include novel therapeutics for previously untreatable conditions. Expedited review programs are accelerating market entry for breakthrough therapies. Regulatory guidance updates support innovative treatment approaches.",
  },
];

const statCards = [
  { icon: "fa-calendar-check", color: "var(--primary-purple)", value: "24",    label: "Posts Scheduled" },
  { icon: "fa-share-alt",      color: "var(--accent-cyan)",    value: "156",   label: "Posted This Month" },
  { icon: "fa-heart",          color: "var(--accent-pink)",    value: "4,230", label: "Total Engagement" },
];

export default function DashboardPage() {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const router = useRouter();

  function toggleContext(id: number) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function useTopicForContent(topic: string) {
    sessionStorage.setItem("contentTopic", topic);
    router.push("/generator");
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 className={`gradient-text ${styles.statValue}`} style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
          Dashboard
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Welcome back! Here&apos;s your social media overview.
        </p>
      </div>

      {/* Stat cards */}
      <div className={styles.statGrid}>
        {statCards.map(({ icon, color, value, label }) => (
          <div key={label} className={styles.statCard}>
            <div className={styles.statIcon}>
              <i className={`fas ${icon}`} style={{ color }} />
            </div>
            <div className={`gradient-text ${styles.statValue}`}>{value}</div>
            <div className={styles.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      {/* Trending card */}
      <div className="card">
        <h2 className={styles.cardTitle}>
          <i className={`fas fa-fire ${styles.cardTitleIcon}`} />
          Weekly Trending Topics
        </h2>
        <p className={styles.updatedNote}>
          <i className="fas fa-sync-alt" style={{ marginRight: "0.5rem" }} />
          Updated weekly • Life Science focus
        </p>

        <div className={styles.trendingList}>
          {trendingTopics.map((topic) => (
            <div className="trending-item" key={topic.id}>
              <div className={styles.trendingRow}>
                <div className={styles.trendingInfo}>
                  <div className={styles.trendingTitle}>{topic.title}</div>
                  <div className={styles.trendingMeta}>{topic.meta}</div>
                </div>
                <button
                  className="btn-primary"
                  style={{ flexShrink: 0, padding: "0.45rem 0.9rem", fontSize: "0.8rem", whiteSpace: "nowrap" }}
                  onClick={() => useTopicForContent(topic.title)}
                >
                  <i className="fas fa-wand-magic-sparkles" /> Write Content
                </button>
              </div>

              {expanded[topic.id] && (
                <div className={styles.contextBlock}>
                  <strong>Context:</strong> {topic.context}
                </div>
              )}

              <button
                className={styles.expandBtn}
                onClick={() => toggleContext(topic.id)}
              >
                {expanded[topic.id] ? "Collapse" : "Expand"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
