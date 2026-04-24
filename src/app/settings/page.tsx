"use client";

import { useState } from "react";

const teamMembers = [
  { name: "Tian", role: "Admin" },
  { name: "Pat", role: "Author" },
  { name: "Michaela", role: "Author" },
  { name: "Hyunjung", role: "Viewer" },
];

export default function SettingsPage() {
  const [members, setMembers] = useState(teamMembers);

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
          Settings & Configuration
        </h1>
        <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Manage system preferences and user roles.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
        {/* AI Prompt Configuration */}
        <div className="settings-section">
          <h3
            style={{
              fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
              fontSize: "1rem",
              fontWeight: 600,
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <i className="fas fa-robot" style={{ color: "var(--primary-purple)" }} />
            AI Prompt Configuration
          </h3>
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
                marginBottom: "0.6rem",
                fontSize: "0.95rem",
              }}
            >
              Default Content Generation Prompt
            </label>
            <div
              style={{
                background: "#f9fafb",
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                padding: "1rem",
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                marginBottom: "1rem",
                maxHeight: 150,
                overflowY: "auto",
                lineHeight: 1.5,
              }}
            >
              You are an expert social media strategist specializing in Life Science communications. Create engaging,
              accurate content.
            </div>
            <button className="btn-secondary" style={{ width: "100%" }}>
              <i className="fas fa-edit" /> Edit Template
            </button>
          </div>
        </div>

        {/* Storage & Integration */}
        <div className="settings-section">
          <h3
            style={{
              fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
              fontSize: "1rem",
              fontWeight: 600,
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <i className="fas fa-link" style={{ color: "var(--primary-purple)" }} />
            Storage & Integration
          </h3>
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
                marginBottom: "0.6rem",
                fontSize: "0.95rem",
              }}
            >
              Google Sheets Integration
            </label>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.8rem 1rem",
                background: "#f9fafb",
                borderRadius: 8,
                marginBottom: "0.8rem",
                fontSize: "0.9rem",
              }}
            >
              <div>Connected</div>
              <span
                style={{
                  background: "#d1fae5",
                  color: "var(--success)",
                  padding: "0.3rem 0.8rem",
                  borderRadius: 4,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                Active
              </span>
            </div>
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
                marginBottom: "0.6rem",
                fontSize: "0.95rem",
              }}
            >
              Platform Integrations
            </label>
            {["Facebook", "Instagram", "LinkedIn"].map((platform) => (
              <div
                key={platform}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.8rem 1rem",
                  background: "#f9fafb",
                  borderRadius: 8,
                  marginBottom: "0.8rem",
                  fontSize: "0.9rem",
                }}
              >
                <div>{platform}</div>
                <span
                  style={{
                    background: "#d1fae5",
                    color: "var(--success)",
                    padding: "0.3rem 0.8rem",
                    borderRadius: 4,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  Connected
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Posting Configuration */}
        <div className="settings-section">
          <h3
            style={{
              fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
              fontSize: "1rem",
              fontWeight: 600,
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <i className="fas fa-cog" style={{ color: "var(--primary-purple)" }} />
            Posting Configuration
          </h3>
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
                marginBottom: "0.6rem",
                fontSize: "0.95rem",
              }}
            >
              Default Timezone
            </label>
            <select className="form-select">
              <option>Eastern Time (ET)</option>
              <option>Central Time (CT)</option>
              <option>Pacific Time (PT)</option>
            </select>
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
                marginBottom: "0.6rem",
                fontSize: "0.95rem",
              }}
            >
              Trending Topics Frequency
            </label>
            <select className="form-select">
              <option>Weekly</option>
              <option>Daily</option>
              <option>Bi-weekly</option>
            </select>
          </div>
        </div>

        {/* User Roles */}
        <div className="settings-section">
          <h3
            style={{
              fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
              fontSize: "1rem",
              fontWeight: 600,
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <i className="fas fa-lock" style={{ color: "var(--primary-purple)" }} />
            User Roles & Permissions
          </h3>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
              marginBottom: "0.6rem",
              fontSize: "0.95rem",
            }}
          >
            Team Members
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {members.map((member, i) => (
              <div
                key={member.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.8rem",
                  background: "#f9fafb",
                  borderRadius: 8,
                }}
              >
                <span style={{ fontWeight: 500 }}>{member.name}</span>
                <select
                  style={{
                    padding: "0.5rem",
                    border: "1px solid var(--border-light)",
                    borderRadius: 6,
                    background: "white",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                  value={member.role}
                  onChange={(e) =>
                    setMembers((prev) =>
                      prev.map((m, idx) => (idx === i ? { ...m, role: e.target.value } : m))
                    )
                  }
                >
                  <option>Admin</option>
                  <option>Author</option>
                  <option>Viewer</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
