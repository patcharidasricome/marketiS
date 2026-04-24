"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    section: "Main",
    links: [
      { href: "/dashboard", label: "Dashboard", icon: "fa-chart-line" },
      { href: "/generator", label: "Generator", icon: "fa-wand-magic-sparkles" },
      { href: "/contents", label: "Contents", icon: "fa-folder-open" },
      { href: "/calendar", label: "Calendar", icon: "fa-calendar-days" },
    ],
  },
  {
    section: "Management",
    links: [
      { href: "/history", label: "Activity History", icon: "fa-history" },
      { href: "/analytics", label: "Analytics", icon: "fa-bar-chart" },
    ],
  },
  {
    section: "Config",
    links: [
      { href: "/settings", label: "Settings", icon: "fa-sliders" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Font Awesome CDN */}
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        rel="stylesheet"
      />
      <aside
        className="animate-slide-left"
        style={{
          width: 280,
          background: "white",
          borderRight: "1px solid var(--border-light)",
          padding: "2rem 1.5rem",
          overflowY: "auto",
          boxShadow: "2px 0 8px rgba(0,0,0,0.03)",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          className="gradient-text"
          style={{
            fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
            fontSize: "1.3rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          <i className="fas fa-sparkles" />
          SocialAI
        </div>

        {navItems.map(({ section, links }) => (
          <div key={section} style={{ marginBottom: "2.5rem" }}>
            <div
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
                textTransform: "uppercase",
                color: "var(--text-secondary)",
                letterSpacing: 1,
                marginBottom: "1rem",
              }}
            >
              {section}
            </div>
            {links.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={`sidebar-link${pathname === href ? " active" : ""}`}
              >
                <i className={`fas ${icon}`} style={{ fontSize: "1.1rem", width: 20, textAlign: "center" }} />
                {label}
              </Link>
            ))}
          </div>
        ))}
      </aside>
    </>
  );
}
