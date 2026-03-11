"use client";

import dynamic from "next/dynamic";
import { LangProvider, useLang } from "./LangContext";
import Nav from "./Nav";

const WaterShader = dynamic(() => import("./WaterShader"), {
  ssr: false,
});

const BASE_PATH = process.env.NODE_ENV === "production" ? "/ho-vinci" : "";

// ─── i18n content ────────────────────────────────────────────────────────────
const copy = {
  ja: {
    heroDesc: "毎日つくる。書く、描く、築く。",

    worksTitle: "作品",
    kindle100Title: "100日で100冊Kindle出版",
    kindle100Desc:
      "100日間でKindle本を100冊出版するという前人未到のチャレンジ。その記録と戦略をnoteで公開しています。",
    kindle100Link: "noteで読む →",
    kindleListTitle: "Kindle一覧",
    kindleListDesc:
      "Amazonで出版したKindle本の全ラインナップ。ビジネス・自己啓発・ライフスタイルなど幅広いジャンル。",
    kindleListLink: "Amazonで見る →",
    habitBirdTitle: "HabitBird",
    habitBirdDesc:
      "ハビットバードは、毎日の習慣をかわいいひよこで可視化する習慣トラッカーです。プロジェクトごとに習慣を管理し、目標達成を楽しくサポートします。",
    habitBirdLink: "アプリを見る →",

    noteTitle: "毎日note",
    noteDesc:
      "1500日以上、一日も欠かさずnoteを更新し続けています。思考・創作・人生について毎日発信。",
    noteLink: "noteを読む →",

    membershipTitle: "メンバーシップ",
    membershipSubtitle: "ストーリーハッカー",
    membershipDesc:
      "物語の力で人生を変える、クリエイターのためのnoteメンバーシップコミュニティ。ライティングの技術から思考法まで、深く学べる場所。",
    membershipLink: "参加する →",

    snsTitle: "SNS",
    threadsDesc: "小説を書いて、人生を変えるためのアカウント。物語をつくる側に、毎日1％近づくヒントを発信中。",
    threadsLink: "フォローする →",

    footerText: "© 2025 Hovinci. All rights reserved.",
  },
  en: {
    heroDesc: "Build every day. Write, Draw, Code.",

    worksTitle: "Works",
    kindle100Title: "100 Kindle Books in 100 Days",
    kindle100Desc:
      "An unprecedented challenge of publishing 100 Kindle books in 100 days. Records and strategies published on note.",
    kindle100Link: "Read on note →",
    kindleListTitle: "Kindle Library",
    kindleListDesc:
      "Full lineup of Kindle books published on Amazon — business, self-improvement, lifestyle and more.",
    kindleListLink: "View on Amazon →",
    habitBirdTitle: "HabitBird",
    habitBirdDesc:
      "HabitBird is a habit tracker that visualizes your daily habits with cute chicks. Manage habits by project and make achieving your goals fun.",
    habitBirdLink: "View app →",

    noteTitle: "Daily note",
    noteDesc:
      "Over 1,500 consecutive days of posting on note — sharing thoughts on creativity, writing, and life.",
    noteLink: "Read on note →",

    membershipTitle: "Membership",
    membershipSubtitle: "Story Hacker",
    membershipDesc:
      "A community for creators who use the power of story to transform their lives. Deep dives into writing craft and mental models.",
    membershipLink: "Join now →",

    snsTitle: "SNS",
    threadsDesc:
      "Daily thoughts, reading logs, and behind-the-scenes of my creative process on Threads.",
    threadsLink: "Follow →",

    footerText: "© 2025 Hovinci. All rights reserved.",
  },
};

// ─── Section components ───────────────────────────────────────────────────────

function Hero() {
  const { lang } = useLang();
  const t = copy[lang];

  return (
    <section
      id="top"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Water shader background */}
      <WaterShader />

      {/* Overlay gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.1) 50%, rgba(10,10,10,0.8) 100%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Hero text */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(3rem, 10vw, 8rem)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: "#f5f5f5",
            marginBottom: "1.5rem",
          }}
        >
          hovinci
          <span style={{ color: "#f5c518" }}>.</span>
        </h1>
        <p
          style={{
            fontSize: "clamp(0.875rem, 2vw, 1.125rem)",
            color: "rgba(245,245,245,0.6)",
            letterSpacing: "0.02em",
          }}
        >
          {t.heroDesc}
        </p>
      </div>

      {/* Scroll indicator — アニメーション線のみ */}
      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "1px",
            height: "3rem",
            background:
              "linear-gradient(to bottom, rgba(245,197,24,0.8), transparent)",
            animation: "scrollLine 1.8s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes scrollLine {
          0% { transform: scaleY(0); transform-origin: top; opacity: 1; }
          50% { transform: scaleY(1); transform-origin: top; opacity: 1; }
          100% { transform: scaleY(1); transform-origin: top; opacity: 0; }
        }
      `}</style>
    </section>
  );
}

function Works() {
  const { lang } = useLang();
  const t = copy[lang];

  return (
    <section
      id="works"
      style={{
        padding: "8rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          fontSize: "clamp(2.5rem, 6vw, 5rem)",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          color: "#f5f5f5",
          marginBottom: "5rem",
        }}
      >
        {t.worksTitle}
        <span style={{ color: "#f5c518" }}>.</span>
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "2px",
        }}
      >
        {/* Card 1 */}
        <WorkCard
          number="01"
          title={t.kindle100Title}
          desc={t.kindle100Desc}
          link="https://note.com/hovinci/n/n39f518d337f6"
          linkLabel={t.kindle100Link}
        />
        {/* Card 2 */}
        <WorkCard
          number="02"
          title={t.kindleListTitle}
          desc={t.kindleListDesc}
          link="https://www.amazon.co.jp/stores/%E3%83%9B%E3%83%B4%E3%82%A3%E3%83%B3%E3%83%81/author/B0DT3MZR3F?shoppingPortalEnabled=true"
          linkLabel={t.kindleListLink}
        />
        {/* Card 3 */}
        <WorkCard
          number="03"
          title={t.habitBirdTitle}
          desc={t.habitBirdDesc}
          link="https://habitbird.app/"
          linkLabel={t.habitBirdLink}
          image={`${BASE_PATH}/works/${lang === "ja" ? "habitbird-ja.png" : "habitbird-en.png"}`}
        />
      </div>
    </section>
  );
}

function WorkCard({
  number,
  title,
  desc,
  link,
  linkLabel,
  image,
}: {
  number: string;
  title: string;
  desc: string;
  link: string;
  linkLabel: string;
  image?: string;
}) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        padding: "3rem 2.5rem",
        background: "#111",
        borderTop: "1px solid #222",
        transition: "background 0.3s",
        textDecoration: "none",
        color: "inherit",
      }}
      onMouseEnter={e =>
        ((e.currentTarget as HTMLAnchorElement).style.background = "#161616")
      }
      onMouseLeave={e =>
        ((e.currentTarget as HTMLAnchorElement).style.background = "#111")
      }
    >
      <span
        style={{
          fontSize: "0.6875rem",
          letterSpacing: "0.15em",
          color: "#f5c518",
          fontWeight: 700,
          display: "block",
          marginBottom: "1.5rem",
        }}
      >
        {number}
      </span>
      <h3
        style={{
          fontSize: "1.5rem",
          fontWeight: 900,
          letterSpacing: "-0.02em",
          color: "#f5f5f5",
          marginBottom: "1rem",
          lineHeight: 1.2,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "0.9375rem",
          color: "#888",
          lineHeight: 1.7,
          marginBottom: "2rem",
        }}
      >
        {desc}
      </p>
      {image && (
        <div
          style={{
            marginBottom: "2rem",
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid #222",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={title}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
      )}
      <span
        style={{
          fontSize: "0.8125rem",
          fontWeight: 700,
          color: "#f5c518",
          letterSpacing: "0.05em",
        }}
      >
        {linkLabel}
      </span>
    </a>
  );
}

function NoteSection() {
  const { lang } = useLang();
  const t = copy[lang];

  return (
    <section
      id="note"
      style={{
        padding: "8rem 2rem",
        borderTop: "1px solid #222",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "center",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "clamp(2rem, 5vw, 4rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: "#f5f5f5",
              marginBottom: "2rem",
            }}
          >
            {t.noteTitle}
            <span style={{ color: "#f5c518" }}>.</span>
          </h2>
          <p style={{ fontSize: "1rem", color: "#888", lineHeight: 1.8, marginBottom: "2.5rem" }}>
            {t.noteDesc}
          </p>
          <a
            href="https://note.com/hovinci"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "0.875rem 2rem",
              background: "#f5c518",
              color: "#000",
              fontWeight: 900,
              fontSize: "0.875rem",
              letterSpacing: "0.05em",
              textDecoration: "none",
              transition: "background 0.2s",
            }}
            onMouseEnter={e =>
              ((e.currentTarget as HTMLAnchorElement).style.background = "#e6b800")
            }
            onMouseLeave={e =>
              ((e.currentTarget as HTMLAnchorElement).style.background = "#f5c518")
            }
          >
            {t.noteLink}
          </a>
        </div>
        <div
          style={{
            position: "relative",
            height: "320px",
            background: "#111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "6rem",
                fontWeight: 900,
                color: "#f5c518",
                lineHeight: 1,
                opacity: 0.15,
                letterSpacing: "-0.05em",
              }}
            >
              1500+
            </div>
            <div
              style={{
                fontSize: "0.875rem",
                color: "#888",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginTop: "-1rem",
              }}
            >
              days
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Membership() {
  const { lang } = useLang();
  const t = copy[lang];

  return (
    <section
      id="membership"
      style={{
        padding: "8rem 2rem",
        background: "#0d0d0d",
        borderTop: "1px solid #222",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "start",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(2rem, 5vw, 4rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "#f5f5f5",
            }}
          >
            {lang === "ja" ? (
              <>ストーリー<br />ハッカー<span style={{ color: "#f5c518" }}>.</span></>
            ) : (
              <>{t.membershipSubtitle}<span style={{ color: "#f5c518" }}>.</span></>
            )}
          </h2>
          <div>
            <p
              style={{
                fontSize: "1rem",
                color: "#888",
                lineHeight: 1.8,
                marginBottom: "2.5rem",
              }}
            >
              {t.membershipDesc}
            </p>
            <a
              href="https://note.com/hovinci/membership"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.875rem 2rem",
                border: "1px solid #f5c518",
                color: "#f5c518",
                fontWeight: 900,
                fontSize: "0.875rem",
                letterSpacing: "0.05em",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = "#f5c518";
                el.style.color = "#000";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = "transparent";
                el.style.color = "#f5c518";
              }}
            >
              {t.membershipLink}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function SNS() {
  const { lang } = useLang();
  const t = copy[lang];

  return (
    <section
      id="sns"
      style={{
        padding: "8rem 2rem",
        borderTop: "1px solid #222",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2
          style={{
            fontSize: "clamp(2rem, 5vw, 4rem)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: "#f5f5f5",
            marginBottom: "4rem",
          }}
        >
          {t.snsTitle}
          <span style={{ color: "#f5c518" }}>.</span>
        </h2>

        <a
          href="https://www.threads.com/@hovinci_books"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "2.5rem",
            background: "#111",
            borderTop: "1px solid #222",
            textDecoration: "none",
            color: "inherit",
            transition: "background 0.3s",
          }}
          onMouseEnter={e =>
            ((e.currentTarget as HTMLAnchorElement).style.background = "#161616")
          }
          onMouseLeave={e =>
            ((e.currentTarget as HTMLAnchorElement).style.background = "#111")
          }
        >
          <div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 900,
                color: "#f5f5f5",
                marginBottom: "0.5rem",
                letterSpacing: "-0.02em",
              }}
            >
              Threads
            </div>
            <div style={{ fontSize: "0.9375rem", color: "#888" }}>
              @hovinci_books
            </div>
            <div
              style={{
                fontSize: "0.875rem",
                color: "#555",
                marginTop: "0.5rem",
              }}
            >
              {t.threadsDesc}
            </div>
          </div>
          <span
            style={{
              fontSize: "1.5rem",
              color: "#f5c518",
              fontWeight: 900,
            }}
          >
            →
          </span>
        </a>
      </div>
    </section>
  );
}

function Footer() {
  const { lang } = useLang();
  const t = copy[lang];

  return (
    <footer
      style={{
        borderTop: "1px solid #222",
        padding: "3rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <span
        style={{
          fontWeight: 900,
          fontSize: "1.125rem",
          letterSpacing: "-0.03em",
        }}
      >
        hovinci<span style={{ color: "#f5c518" }}>.</span>
      </span>
      <span style={{ fontSize: "0.8125rem", color: "#555" }}>{t.footerText}</span>
    </footer>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PageContent() {
  return (
    <LangProvider>
      <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
        <Nav />
        <Hero />
        <Works />
        <NoteSection />
        <Membership />
        <SNS />
        <Footer />
      </div>
    </LangProvider>
  );
}
