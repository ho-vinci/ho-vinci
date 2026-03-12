"use client";

import { useLang } from "./LangContext";

const labels = {
  ja: { writing: "文筆", apps: "アプリ", membership: "メンバーシップ", sns: "SNS" },
  en: { writing: "Writing", apps: "Apps", membership: "Membership", sns: "SNS" },
};

export default function Nav() {
  const { lang, toggle } = useLang();
  const t = labels[lang];

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1.25rem 2rem",
        background: "linear-gradient(to bottom, rgba(10,10,10,0.9) 0%, transparent 100%)",
      }}
    >
      <a
        href="#top"
        style={{
          fontWeight: 900,
          fontSize: "1.25rem",
          letterSpacing: "-0.03em",
          color: "#f5f5f5",
        }}
      >
        hovinci
        <span style={{ color: "#f5c518" }}>.</span>
      </a>

      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        <a href="#writing" style={{ fontSize: "0.875rem", color: "#888", transition: "color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#f5f5f5")}
          onMouseLeave={e => (e.currentTarget.style.color = "#888")}
        >
          {t.writing}
        </a>
        <a href="#apps" style={{ fontSize: "0.875rem", color: "#888", transition: "color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#f5f5f5")}
          onMouseLeave={e => (e.currentTarget.style.color = "#888")}
        >
          {t.apps}
        </a>
        <a href="#membership" style={{ fontSize: "0.875rem", color: "#888", transition: "color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#f5f5f5")}
          onMouseLeave={e => (e.currentTarget.style.color = "#888")}
        >
          {t.membership}
        </a>
        <a href="#sns" style={{ fontSize: "0.875rem", color: "#888", transition: "color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#f5f5f5")}
          onMouseLeave={e => (e.currentTarget.style.color = "#888")}
        >
          {t.sns}
        </a>

        {/* Language toggle */}
        <button
          onClick={toggle}
          style={{
            border: "1px solid #f5c518",
            color: "#f5c518",
            background: "transparent",
            padding: "0.25rem 0.75rem",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            cursor: "pointer",
            borderRadius: "2px",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "#f5c518";
            (e.currentTarget as HTMLButtonElement).style.color = "#000";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "#f5c518";
          }}
        >
          {lang === "ja" ? "EN" : "JA"}
        </button>
      </div>
    </nav>
  );
}
