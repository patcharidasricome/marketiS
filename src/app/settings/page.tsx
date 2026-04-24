"use client";

import { useState } from "react";
import styles from "./page.module.css";

const PLATFORMS = ["Facebook", "Instagram", "LinkedIn"];
const TEAM_MEMBERS = [
  { name: "Tian",     role: "Admin"  },
  { name: "Pat",      role: "Author" },
  { name: "Michaela", role: "Author" },
  { name: "Hyunjung", role: "Viewer" },
];

export default function SettingsPage() {
  const [members, setMembers] = useState(TEAM_MEMBERS);

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="gradient-text" style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Settings & Configuration
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Manage system preferences and user roles.
        </p>
      </div>

      <div className={styles.settingsGrid}>
        {/* ── AI Prompt Configuration ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <i className={`fas fa-robot ${styles.sectionTitleIcon}`} />
            AI Prompt Configuration
          </h3>
          <div className={styles.formGroup}>
            <label className={styles.label}>Default Content Generation Prompt</label>
            <div className={styles.promptTemplate}>
              You are an expert social media strategist specializing in Life Science communications. Create engaging,
              accurate content.
            </div>
            <button className="btn-secondary" style={{ width: "100%" }}>
              <i className="fas fa-edit" /> Edit Template
            </button>
          </div>
        </div>

        {/* ── Storage & Integration ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <i className={`fas fa-link ${styles.sectionTitleIcon}`} />
            Storage & Integration
          </h3>

          <div className={styles.formGroup}>
            <label className={styles.label}>Google Sheets Integration</label>
            <div className={styles.integrationRow}>
              <span>Connected</span>
              <span className={styles.statusBadge}>Active</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Platform Integrations</label>
            {PLATFORMS.map((platform) => (
              <div key={platform} className={styles.integrationRow}>
                <span>{platform}</span>
                <span className={styles.statusBadge}>Connected</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Posting Configuration ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <i className={`fas fa-cog ${styles.sectionTitleIcon}`} />
            Posting Configuration
          </h3>

          <div className={styles.formGroup}>
            <label className={styles.label}>Default Timezone</label>
            <select className="form-select">
              <option>Eastern Time (ET)</option>
              <option>Central Time (CT)</option>
              <option>Pacific Time (PT)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Trending Topics Frequency</label>
            <select className="form-select">
              <option>Weekly</option>
              <option>Daily</option>
              <option>Bi-weekly</option>
            </select>
          </div>
        </div>

        {/* ── User Roles & Permissions ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <i className={`fas fa-lock ${styles.sectionTitleIcon}`} />
            User Roles & Permissions
          </h3>

          <label className={styles.label}>Team Members</label>
          <div className={styles.memberList}>
            {members.map((member, i) => (
              <div key={member.name} className={styles.memberRow}>
                <span className={styles.memberName}>{member.name}</span>
                <select
                  className={styles.roleSelect}
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
