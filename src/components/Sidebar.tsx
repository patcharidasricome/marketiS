"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

const navItems = [
  {
    section: "Main",
    links: [
      { href: "/dashboard", label: "Dashboard",       icon: "fa-chart-line" },
      { href: "/generator", label: "Generator",       icon: "fa-wand-magic-sparkles" },
      { href: "/contents",  label: "Contents",        icon: "fa-folder-open" },
      { href: "/calendar",  label: "Calendar",        icon: "fa-calendar-days" },
    ],
  },
  {
    section: "Management",
    links: [
      { href: "/history",   label: "Activity History", icon: "fa-history" },
      { href: "/analytics", label: "Analytics",        icon: "fa-bar-chart" },
    ],
  },
  {
    section: "Config",
    links: [
      { href: "/settings",  label: "Settings",         icon: "fa-sliders" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        rel="stylesheet"
      />
      <aside className={styles.sidebar}>
        <div className={`${styles.logo} gradient-text`}>
          <i className="fas fa-sparkles" />
          SocialAI
        </div>

        {navItems.map(({ section, links }) => (
          <div key={section} className={styles.section}>
            <div className={styles.sectionTitle}>{section}</div>
            {links.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={`${styles.link}${pathname === href ? ` ${styles.active}` : ""}`}
              >
                <i className={`fas ${icon} ${styles.linkIcon}`} />
                {label}
              </Link>
            ))}
          </div>
        ))}
      </aside>
    </>
  );
}
