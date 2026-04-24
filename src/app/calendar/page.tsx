"use client";

import { FacebookIcon, InstagramIcon, LinkedInIcon } from "@/components/PlatformIcons";

const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type DayData = {
  num: number;
  otherMonth?: boolean;
  today?: boolean;
  posts?: React.ReactNode[];
};

const calendarDays: DayData[] = [
  { num: 31, otherMonth: true },
  { num: 1 }, { num: 2 }, { num: 3 }, { num: 4 }, { num: 5 }, { num: 6 },
  { num: 7 },
  { num: 8 },
  {
    num: 9, today: true,
    posts: [
      <div key="fb" className="platform-badge" style={{ background: "#1877f2", width: 22, height: 22 }}><FacebookIcon size={12} /></div>,
      <div key="ig" className="platform-badge" style={{ background: "linear-gradient(135deg,#E09B3D,#C74C4D,#C21975,#7024C4)", width: 22, height: 22 }}><InstagramIcon size={12} id="cal9" /></div>,
    ],
  },
  { num: 10 },
  {
    num: 11,
    posts: [<div key="li" className="platform-badge" style={{ background: "#0A66C2", width: 22, height: 22 }}><LinkedInIcon size={12} /></div>],
  },
  { num: 12 }, { num: 13 },
  { num: 14 },
  {
    num: 15,
    posts: [<div key="fb" className="platform-badge" style={{ background: "#1877f2", width: 22, height: 22 }}><FacebookIcon size={12} /></div>],
  },
  { num: 16 }, { num: 17 }, { num: 18 }, { num: 19 }, { num: 20 },
  { num: 21 },
  {
    num: 22,
    posts: [
      <div key="ig" className="platform-badge" style={{ background: "linear-gradient(135deg,#E09B3D,#C74C4D,#C21975,#7024C4)", width: 22, height: 22 }}><InstagramIcon size={12} id="cal22" /></div>,
      <div key="li" className="platform-badge" style={{ background: "#0A66C2", width: 22, height: 22 }}><LinkedInIcon size={12} /></div>,
    ],
  },
  { num: 23 }, { num: 24 }, { num: 25 }, { num: 26 }, { num: 27 },
  { num: 28 }, { num: 29 }, { num: 30 },
  { num: 1, otherMonth: true }, { num: 2, otherMonth: true }, { num: 3, otherMonth: true }, { num: 4, otherMonth: true },
];

export default function CalendarPage() {
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
          Posting Calendar
        </h1>
        <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Schedule, reschedule, and manage your posts. Click posts to edit/delete, drag to reschedule.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        {/* Calendar */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
              fontSize: "1.1rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.8rem",
            }}
          >
            <i
              className="fas fa-calendar-days"
              style={{
                background: "linear-gradient(135deg, var(--primary-navy), var(--primary-purple))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            />
            April 2024
          </h2>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: "1rem" }}>
            {dayHeaders.map((d) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  fontWeight: 600,
                  fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  padding: "0.5rem",
                  textTransform: "uppercase",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: "2rem" }}>
            {calendarDays.map((day, i) => (
              <div
                key={i}
                className={`calendar-day${day.otherMonth ? " other-month" : ""}${day.today ? " today" : ""}`}
              >
                <div style={{ fontWeight: 600 }}>{day.num}</div>
                {day.posts && (
                  <div style={{ display: "flex", gap: 2, justifyContent: "center", marginTop: 4, flexWrap: "wrap" }}>
                    {day.posts}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Posts */}
        <div className="card" style={{ padding: "1.5rem", height: "fit-content" }}>
          <h2
            style={{
              fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
              fontSize: "1.1rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.8rem",
            }}
          >
            <i
              className="fas fa-list-check"
              style={{
                background: "linear-gradient(135deg, var(--primary-navy), var(--primary-purple))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            />
            Upcoming Posts
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { title: "mRNA Vaccine Updates", meta: "April 9 • 10:00 AM" },
              { title: "CRISPR Gene Therapy", meta: "April 11 • 2:30 PM" },
            ].map((post) => (
              <div className="trending-item" key={post.title}>
                <div
                  style={{
                    fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
                    fontWeight: 600,
                    marginBottom: "0.3rem",
                  }}
                >
                  {post.title}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{post.meta}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
