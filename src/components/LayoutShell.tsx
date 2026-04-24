"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import styles from "./LayoutShell.module.css";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/generator": "Content Generator",
  "/contents":  "Contents Library",
  "/calendar":  "Posting Calendar",
  "/history":   "Activity History",
  "/analytics": "Analytics",
  "/feedback":  "User Feedback",
  "/settings":  "Settings",
};

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname  = usePathname();
  const pageTitle = PAGE_TITLES[pathname] ?? "marketiS";

  return (
    <div className={styles.shell}>
      {/* ── Sidebar ── */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}>
        <Sidebar collapsed={collapsed} />
      </aside>

      {/* ── Content area (header + page) ── */}
      <div className={styles.content}>
        <header className={styles.header}>
          <button
            className={styles.toggleBtn}
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <i className="fas fa-angles-right" />
            ) : (
              <i className="fas fa-angles-left" />
            )}
          </button>
          <span className={`gradient-text ${styles.pageTitle}`}>{pageTitle}</span>
        </header>

        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
