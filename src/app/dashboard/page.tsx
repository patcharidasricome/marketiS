"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

type TrendCategory = "All" | "Life Sciences" | "Utilities" | "Oil & Gas" | "SAP";

type TrendTopic = {
  id: string;
  title: string;
  category: Exclude<TrendCategory, "All">;
  source: string;
  link: string;
  publishedAt: string;
  traffic: string;
  context: string;
};

const trendCategories: TrendCategory[] = ["All", "Life Sciences", "Utilities", "Oil & Gas", "SAP"];

const statCards = [
  { icon: "fa-calendar-check", color: "var(--primary-purple)", value: "24",    label: "Posts Scheduled" },
  { icon: "fa-share-alt",      color: "var(--accent-cyan)",    value: "156",   label: "Posted This Month" },
  { icon: "fa-heart",          color: "var(--accent-pink)",    value: "4,230", label: "Total Engagement" },
];

export default function DashboardPage() {
  const [topics, setTopics] = useState<TrendTopic[]>([]);
  const [activeCategory, setActiveCategory] = useState<TrendCategory>("All");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [trendsError, setTrendsError] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function loadTrends() {
      try {
        const res = await fetch("/api/trends");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unable to load trends");
        setTopics(data.topics ?? []);
        setUpdatedAt(data.updatedAt ?? "");
      } catch (error) {
        setTrendsError(error instanceof Error ? error.message : "Unable to load trends");
      } finally {
        setLoadingTopics(false);
      }
    }

    loadTrends();
  }, []);

  function toggleContext(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleUseTopicForContent(topic: string) {
    sessionStorage.setItem("contentTopic", topic);
    router.push(`/generator?topic=${encodeURIComponent(topic)}`);
  }

  const filteredTopics = activeCategory === "All"
    ? trendCategories
        .filter((category): category is Exclude<TrendCategory, "All"> => category !== "All")
        .flatMap((category) => topics.filter((topic) => topic.category === category).slice(0, 1))
    : topics.filter((topic) => topic.category === activeCategory);
  const formattedUpdatedAt = updatedAt
    ? new Date(updatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : "";

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
          RSS feeds • latest 7 days • cached 12 hours{formattedUpdatedAt ? ` • ${formattedUpdatedAt}` : ""}
        </p>

        <div className={styles.chipRow}>
          {trendCategories.map((category) => (
            <button
              key={category}
              className={`${styles.categoryChip}${activeCategory === category ? ` ${styles.categoryChipActive}` : ""}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className={styles.trendingList}>
          {loadingTopics && (
            <div className={styles.trendsState}>
              <i className="fas fa-spinner fa-spin" /> Loading Google Trends topics...
            </div>
          )}

          {!loadingTopics && trendsError && (
            <div className={styles.trendsState}>
              <i className="fas fa-circle-exclamation" /> {trendsError}
            </div>
          )}

          {!loadingTopics && !trendsError && filteredTopics.length === 0 && (
            <div className={styles.trendsState}>
              No topics available{activeCategory === "All" ? "" : ` for ${activeCategory}`}.
            </div>
          )}

          {!loadingTopics && !trendsError && filteredTopics.map((topic) => (
            <div className="trending-item" key={topic.id}>
              <div className={styles.trendingRow}>
                <div className={styles.trendingInfo}>
                  <span className={styles.topicCategory}>{topic.category}</span>
                  <div className={styles.trendingTitle}>{topic.title}</div>
                  <div className={styles.trendingMeta}>
                    {topic.source}{topic.traffic ? ` • ${topic.traffic}` : ""}{topic.publishedAt ? ` • ${new Date(topic.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}
                  </div>
                </div>
                <button
                  className="btn-primary"
                  style={{ flexShrink: 0, padding: "0.45rem 0.9rem", fontSize: "0.8rem", whiteSpace: "nowrap" }}
                  onClick={() => handleUseTopicForContent(topic.title)}
                >
                  <i className="fas fa-wand-magic-sparkles" /> Write Content
                </button>
              </div>

              {expanded[topic.id] && (
                <div className={styles.contextBlock}>
                  <strong>Context:</strong> {topic.context}
                  {topic.link && (
                    <a href={topic.link} target="_blank" rel="noreferrer" className={styles.trendLink}>
                      View source <i className="fas fa-arrow-up-right-from-square" />
                    </a>
                  )}
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
