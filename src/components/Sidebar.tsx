"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { applyTheme, type Theme } from "@/lib/theme";
import styles from "./Sidebar.module.css";

const navItems = [
  {
    section: "Main",
    links: [
      { href: "/dashboard", label: "Dashboard",        icon: "fa-chart-line" },
      { href: "/generator", label: "Generator",        icon: "fa-wand-magic-sparkles" },
      { href: "/contents",  label: "Contents",         icon: "fa-folder-open" },
      { href: "/calendar",  label: "Calendar",         icon: "fa-calendar-days" },
    ],
  },
  {
    section: "Activity",
    links: [
      { href: "/history",   label: "Activity History", icon: "fa-history" },
      { href: "/analytics", label: "Analytics",        icon: "fa-bar-chart" },
    ],
  },
  {
    section: "Support",
    links: [
      { href: "/feedback",  label: "User Feedback",    icon: "fa-comments" },
    ],
  },
  {
    section: "Config",
    links: [
      { href: "/settings",  label: "Settings",         icon: "fa-sliders" },
    ],
  },
];

function readThemeFromDocument(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readThemeFromDocument());
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = readThemeFromDocument() === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }, []);

  const isDark = theme === "dark";

  return (
    <>
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        rel="stylesheet"
      />
      <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>

        {/* Logo */}
        <div className={styles.logo}>
          <i className={`fas fa-sparkles ${styles.logoIcon}`} />
          <span className={styles.logoText}>MarketiS</span>
        </div>

        {/* Nav sections */}
        <nav className={styles.nav}>
          {navItems.map(({ section, links }) => (
            <div key={section} className={styles.section}>
              <div className={styles.sectionTitle}>{section}</div>
              {links.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  title={collapsed ? label : undefined}
                  className={`${styles.link}${pathname === href ? ` ${styles.active}` : ""}`}
                >
                  <i className={`fas ${icon} ${styles.linkIcon}`} />
                  <span className={styles.linkLabel}>{label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.themeFooter}>
          {mounted ? (
            <button
              type="button"
              className={styles.themeToggle}
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Light mode" : "Dark mode"}
            >
              <i className={`fas ${isDark ? "fa-sun" : "fa-moon"} ${styles.themeToggleIcon}`} />
              <span className={styles.themeToggleLabel}>
                {isDark ? "Light mode" : "Dark mode"}
              </span>
            </button>
          ) : (
            <div className={styles.themeToggleSkeleton} aria-hidden />
          )}
        </div>
      </div>
    </>
  );
}
