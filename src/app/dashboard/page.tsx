"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      <div style={{ marginBottom: "2rem" }}>
        <h1
          className="gradient-text"
          style={{
            fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
            fontSize: "1.8rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          Dashboard
        </h1>
        <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Welcome back! Here&apos;s your social media overview.
        </div>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {[
          { icon: "fa-calendar-check", color: "var(--primary-purple)", value: "24", label: "Posts Scheduled" },
          { icon: "fa-share-alt", color: "var(--accent-cyan)", value: "156", label: "Posted This Month" },
          { icon: "fa-heart", color: "var(--accent-pink)", value: "4,230", label: "Total Engagement" },
        ].map(({ icon, color, value, label }) => (
          <div
            key={label}
            style={{
              background: "white",
              borderRadius: 12,
              padding: "1.5rem",
              border: "1px solid var(--border-light)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "1.5rem" }}>
              <i className={`fas ${icon}`} style={{ color }} />
            </div>
            <div
              className="gradient-text"
              style={{
                fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
                fontSize: "2.2rem",
                fontWeight: 700,
                margin: "0.5rem 0",
              }}
            >
              {value}
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Trending Topics */}
      <div className="card">
        <h2
          style={{
            fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
            fontSize: "1.1rem",
            fontWeight: 600,
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            color: "var(--text-primary)",
          }}
        >
          <i
            className="fas fa-fire"
            style={{
              fontSize: "1.3rem",
              background: "linear-gradient(135deg, var(--primary-navy), var(--primary-purple))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          />
          Weekly Trending Topics
        </h2>
        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          <i className="fas fa-sync-alt" style={{ marginRight: "0.5rem" }} /> Updated weekly • Life Science focus
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {trendingTopics.map((topic) => (
            <div className="trending-item" key={topic.id}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
                      fontWeight: 600,
                      marginBottom: "0.25rem",
                    }}
                  >
                    {topic.title}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{topic.meta}</div>
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
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    background: "#f9fafb",
                    borderRadius: 6,
                    borderLeft: "3px solid var(--primary-purple)",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    color: "var(--text-primary)",
                  }}
                >
                  <strong>Context:</strong> {topic.context}
                </div>
              )}

              <button
                style={{
                  marginTop: "0.6rem",
                  background: "transparent",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                  padding: "0.4rem 0.8rem",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                }}
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
