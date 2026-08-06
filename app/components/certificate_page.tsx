"use client";

import { useEffect, useMemo, useState } from "react";
import { MorphingInfinity } from "@/components/loading-ui/morphing-infinity";

export type Cert = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  issuer?: string;
  org?: string;
  date: string;
  type?: string;
  credId?: string;
  image?: string;
  link?: string;
};

interface CertificationsProps {
  initialCerts?: Cert[];
}

function fmtDate(ym: string) {
  if (!ym) return "";
  const raw = ym.length === 7 ? ym + "-01" : ym;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? ym : d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getName(c: Cert) { return c.title || c.name || "Untitled"; }
function getOrg(c: Cert) { return c.issuer || c.org || ""; }
function getType(c: Cert) {
  if (c.type) return c.type;
  return "Certification";
}

export default function CertificationsAchievements({ initialCerts = [] }: CertificationsProps) {
  const certs: Cert[] = initialCerts;

  const [certSearch, setCertSearch] = useState("");
  const [certFilter, setCertFilter] = useState("all");
  const [certSort, setCertSort] = useState("newest");
  const [activeCert, setActiveCert] = useState<Cert | null>(null);
  const [navigatingHome, setNavigatingHome] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Read URL search param ?cert=id to automatically expand certificate if navigated from Home page
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const certId = params.get("cert");
      if (certId && certs.length > 0) {
        const match = certs.find((c) => c._id === certId || c.id === certId);
        if (match) setActiveCert(match);
      }
    }
  }, [certs]);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = "https://fonts.googleapis.com";
    const font = document.createElement("link");
    font.rel = "stylesheet";
    font.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap";
    document.head.appendChild(link);
    document.head.appendChild(font);
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(font);
    };
  }, []);

  // ── CUSTOM CURSOR ────────────────────────────────────────────────────────
  useEffect(() => {
    const dot = document.getElementById("cursor-dot-cert");
    const ring = document.getElementById("cursor-ring-cert");
    let mx = 0, my = 0, rx = 0, ry = 0;
    let raf: number;
    let onMove: ((e: MouseEvent) => void) | null = null;

    if (dot && ring && window.matchMedia("(hover: hover)").matches) {
      onMove = (e: MouseEvent) => {
        mx = e.clientX; my = e.clientY;
        dot.style.left = `${mx}px`;
        dot.style.top = `${my}px`;
      };
      document.addEventListener("mousemove", onMove);
      const loop = () => {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        ring.style.left = `${rx}px`;
        ring.style.top = `${ry}px`;
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      const expand = () => ring.classList.add("expanded");
      const shrink = () => ring.classList.remove("expanded");
      document.querySelectorAll("a, button, input, select").forEach((el) => {
        el.addEventListener("mouseenter", expand);
        el.addEventListener("mouseleave", shrink);
      });
    }

    // Nav scroll effect
    const nav = document.getElementById("cert-nav");
    const onScroll = () => {
      if (!nav) return;
      nav.classList.toggle("scrolled", window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (onMove) document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const list = useMemo(() => {
    const q = certSearch.toLowerCase().trim();
    let filtered = certs.filter((c) => {
      const name = getName(c).toLowerCase();
      const org = getOrg(c).toLowerCase();
      const matchesQ = !q || name.includes(q) || org.includes(q);
      const matchesF = certFilter === "all" || getType(c) === certFilter;
      return matchesQ && matchesF;
    });
    filtered = [...filtered].sort((a, b) => {
      if (certSort === "az") return getName(a).localeCompare(getName(b));
      const da = new Date(a.date && a.date.length === 7 ? a.date + "-01" : a.date).getTime();
      const db = new Date(b.date && b.date.length === 7 ? b.date + "-01" : b.date).getTime();
      if (certSort === "oldest") return da - db;
      return db - da;
    });
    return filtered;
  }, [certSearch, certFilter, certSort, certs]);

  return (
    <>
      <style>{`
        .cert-page {
          --bg: #080808;
          --bg-elev: #0f0f0f;
          --bg-card: #0d0d0d;
          --text: #f0f0f0;
          --text-dim: rgba(240,240,240,0.55);
          --text-faint: rgba(240,240,240,0.3);
          --accent: #00aaff;
          --accent-dim: rgba(0,170,255,0.15);
          --line: rgba(255,255,255,0.07);
          --line-strong: rgba(255,255,255,0.15);
          box-sizing: border-box;
          background: var(--bg);
          color: var(--text);
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
          padding: 100px 24px 80px;
          min-height: 100vh;
        }
        .cert-page * { box-sizing: border-box; }
        .cert-page .wrap { max-width: 1140px; margin: 0 auto; }

        .cert-page .section { margin-bottom: 60px; }

        .cert-page .eyebrow {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: var(--accent);
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 18px;
        }
        .cert-page .eyebrow .idx { color: var(--text-faint); }
        .cert-page .eyebrow::after { content: ""; flex: 1; height: 1px; background: var(--line); }
        .cert-page h1.title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: clamp(34px, 5vw, 56px);
          letter-spacing: -.02em;
          line-height: 1.05;
          margin-bottom: 12px;
        }
        .cert-page .subhead {
          color: var(--text-dim);
          font-size: 15px;
          max-width: 560px;
          margin-bottom: 40px;
          line-height: 1.6;
        }

        .cert-page .controls {
          display: flex; flex-wrap: wrap; gap: 14px;
          margin-bottom: 36px; padding-bottom: 24px;
          border-bottom: 1px solid var(--line);
          align-items: center;
        }
        .cert-page .search-box { flex: 1 1 240px; position: relative; }
        .cert-page .search-box input {
          width: 100%;
          background: var(--bg-elev);
          border: 1px solid var(--line-strong);
          color: var(--text);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          padding: 11px 14px 11px 36px;
          border-radius: 8px;
          outline: none;
          transition: border-color .2s ease;
        }
        .cert-page .search-box input::placeholder { color: var(--text-faint); }
        .cert-page .search-box input:focus { border-color: var(--accent); }
        .cert-page .search-box svg {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          width: 15px; height: 15px; stroke: var(--text-faint);
        }
        .cert-page .select-wrap { position: relative; }
        .cert-page select {
          appearance: none;
          background: var(--bg-elev);
          border: 1px solid var(--line-strong);
          color: var(--text);
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: .06em;
          text-transform: uppercase;
          padding: 11px 32px 11px 14px;
          border-radius: 8px;
          cursor: pointer;
          outline: none;
        }
        .cert-page select:focus { border-color: var(--accent); }
        .cert-page .select-wrap::after {
          content: "";
          position: absolute; right: 12px; top: 50%;
          width: 6px; height: 6px;
          border-right: 1px solid var(--text-dim);
          border-bottom: 1px solid var(--text-dim);
          transform: translateY(-65%) rotate(45deg);
          pointer-events: none;
        }

        .cert-page .count-tag {
          font-family: 'Space Mono', monospace;
          font-size: 11px; color: var(--text-faint); margin-left: auto; white-space: nowrap;
        }
        .cert-page .count-tag b { color: var(--accent); font-weight: 700; }

        .cert-page .cert-list {
          display: flex; flex-direction: column;
          gap: 12px;
        }
        .cert-page .cert-row {
          display: grid; grid-template-columns: 48px 54px 1fr auto auto;
          align-items: center; gap: 20px;
          padding: 18px 20px;
          background: var(--bg-elev);
          border: 1px solid var(--line);
          border-radius: 12px;
          transition: border-color .25s ease, transform .25s ease, box-shadow .25s ease;
          cursor: pointer;
        }
        .cert-page .cert-row:hover {
          border-color: rgba(0,170,255,0.3);
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(0,170,255,0.08);
        }
        .cert-page .cert-thumb {
          width: 50px; height: 50px; border-radius: 8px;
          object-fit: cover; border: 1px solid var(--line-strong);
          background: #000;
        }
        .cert-page .cert-thumb-placeholder {
          width: 50px; height: 50px; border-radius: 8px;
          border: 1px solid var(--line);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          background: rgba(255,255,255,0.03);
        }
        .cert-page .cert-idx {
          font-family: 'Space Mono', monospace; font-size: 12px; color: var(--text-faint);
        }
        .cert-page .cert-main h4 {
          font-family: 'Space Grotesk', sans-serif; font-weight: 600;
          font-size: 17px; margin-bottom: 4px; letter-spacing: -.01em;
          color: var(--text);
        }
        .cert-page .cert-main span { font-size: 13px; color: var(--text-dim); }
        .cert-page .cert-cred {
          font-family: 'Space Mono', monospace; font-size: 11px;
          color: var(--accent); margin-top: 4px; letter-spacing: .04em;
        }
        .cert-page .cert-type {
          font-family: 'Space Mono', monospace; font-size: 10px;
          letter-spacing: .08em; text-transform: uppercase;
          padding: 4px 12px; border: 1px solid var(--line-strong);
          border-radius: 20px; color: var(--text-dim); white-space: nowrap;
        }
        .cert-page .cert-type.hackathon {
          color: var(--accent); border-color: rgba(0,170,255,0.4);
          background: rgba(0,170,255,0.08);
        }
        .cert-page .cert-date {
          font-family: 'Space Mono', monospace; font-size: 11px;
          color: var(--text-faint); white-space: nowrap;
        }
        @media (max-width: 680px) {
          .cert-page .cert-row { grid-template-columns: 32px 1fr; row-gap: 10px; }
          .cert-page .cert-thumb, .cert-page .cert-thumb-placeholder { display: none; }
          .cert-page .cert-type, .cert-page .cert-date { grid-column: 2; }
        }

        .cert-page .not-found {
          padding: 80px 20px; text-align: center;
          border: 1px solid var(--line); border-radius: 12px;
          background: var(--bg-elev);
        }
        .cert-page .not-found-icon { font-size: 44px; margin-bottom: 16px; opacity: .6; }
        .cert-page .not-found h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600; font-size: 22px;
          color: var(--text); margin-bottom: 8px;
        }
        .cert-page .not-found p {
          font-size: 14px; color: var(--text-faint); font-family: 'Space Mono', monospace;
          letter-spacing: .04em;
        }

        .cert-page .empty-state {
          padding: 60px 20px; text-align: center; color: var(--text-faint);
          font-family: 'Space Mono', monospace; font-size: 12px; letter-spacing: .05em;
          border: 1px solid var(--line); border-radius: 12px;
          background: var(--bg-elev);
        }

        .cert-page footer {
          margin-top: 80px; padding-top: 24px; border-top: 1px solid var(--line);
          font-family: 'Space Mono', monospace; font-size: 11px; color: var(--text-faint);
          display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;
        }
      `}</style>

      {/* Custom cursor elements — same as home screen */}
      <div className="cursor-dot" id="cursor-dot-cert" suppressHydrationWarning />
      <div className="cursor-ring" id="cursor-ring-cert" suppressHydrationWarning />

      {/* HOME-SCREEN NAV */}
      <nav id="cert-nav" className="sub-page-nav" aria-label="Main navigation">
        <a
          href="/"
          className="nav-logo mono"
          aria-label="Mayank Dhodi"
          onClick={(e) => {
            e.preventDefault();
            setNavigatingHome(true);
            window.location.href = "/";
          }}
        >
          MK.
        </a>
        <div className="nav-end desktop-nav">
          <div className="nav-links">
            <a
              href="/"
              className="nav-page-link mono"
              onClick={(e) => {
                e.preventDefault();
                setNavigatingHome(true);
                window.location.href = "/";
              }}
            >
              Home
            </a>
            <a
              href="/blog"
              className="nav-page-link mono"
              onClick={(e) => {
                e.preventDefault();
                setNavigatingHome(true);
                window.location.href = "/blog";
              }}
            >
              Blog
            </a>
            <a
              href="/certifications"
              className="nav-page-link mono active-page"
              onClick={(e) => {
                if (activeCert) {
                  e.preventDefault();
                  setActiveCert(null);
                  if (typeof window !== "undefined" && window.history.pushState) {
                    window.history.pushState(null, "", "/certifications");
                  }
                }
              }}
            >
              Certifications
            </a>
          </div>
          <a href="/#contact" className="nav-pill">Available for work</a>
        </div>

        {/* MOBILE BURGER TRIGGER BUTTON */}
        <button
          type="button"
          className={`mobile-menu-trigger${mobileMenuOpen ? " active" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          <span className="burger-bar bar-1"></span>
          <span className="burger-bar bar-2"></span>
        </button>
      </nav>

      {/* MOBILE DRAWER OVERLAY */}
      <div className={`mobile-nav-drawer${mobileMenuOpen ? " open" : ""}`}>
        <div className="mobile-nav-inner">
          <div className="mobile-nav-header">
            <span className="mono" style={{ fontSize: "0.75rem", color: "var(--c-accent)", letterSpacing: "0.15em" }}>NAVIGATION</span>
          </div>

          <div className="mobile-nav-items">
            <a
              href="/"
              className="mobile-nav-item mono"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                setNavigatingHome(true);
                window.location.href = "/";
              }}
            >
              <span className="item-num">01</span>
              <span>HOME</span>
            </a>

            <a
              href="/blog"
              className="mobile-nav-item mono"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                setNavigatingHome(true);
                window.location.href = "/blog";
              }}
            >
              <span className="item-num">02</span>
              <span>BLOG</span>
            </a>

            <a
              href="/certifications"
              className="mobile-nav-item mono active"
              onClick={() => {
                setMobileMenuOpen(false);
                if (activeCert) setActiveCert(null);
              }}
            >
              <span className="item-num">03</span>
              <span>CERTIFICATIONS</span>
            </a>

            <a
              href="/#contact"
              className="mobile-nav-item mono"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="item-num">04</span>
              <span>CONTACT</span>
            </a>
          </div>

          <div className="mobile-nav-footer">
            <span className="mono" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
              ● Available for projects
            </span>
          </div>
        </div>
      </div>

      {navigatingHome && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 999999,
          background: "#080808",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem"
        }}>
          <MorphingInfinity size={48} color="#00aaff" />
          <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.9rem", color: "rgba(255,255,255,0.75)", letterSpacing: "0.05em" }}>
            Loading...
          </span>
        </div>
      )}

      {/* PAGE CONTENT */}
      <div className="cert-page">
        <div className="wrap">
          <section className="section" id="proof">

            {/* EXPANDED CERTIFICATE CARD VIEW */}
            {activeCert ? (
              <div style={{ maxWidth: "860px", margin: "0 auto" }}>
                {/* Top Back Button */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveCert(null);
                    if (typeof window !== "undefined" && window.history.pushState) {
                      window.history.pushState(null, "", "/certifications");
                    }
                  }}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#ffffff",
                    padding: "0.6rem 1.25rem",
                    borderRadius: "100px",
                    fontSize: "0.85rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "2.5rem",
                    transition: "all 0.2s ease"
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  <span>Back to Certifications</span>
                </button>

                {/* Fit Image Container */}
                <div style={{
                  width: "100%",
                  background: "#0d0d0d",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: "2rem",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.5)"
                }}>
                  {activeCert.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeCert.image}
                      alt={getName(activeCert)}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "520px",
                        objectFit: "contain",
                        borderRadius: "8px"
                      }}
                    />
                  ) : (
                    <div style={{ padding: "4rem 2rem", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                      <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🏅</div>
                      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.9rem" }}>Certificate Image Verified</p>
                    </div>
                  )}
                </div>

                {/* Header: Title (align start) | Date (align end) */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
                  <div style={{ flex: 1, minWidth: "280px" }}>
                    <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: "700", lineHeight: "1.2", letterSpacing: "-0.02em", color: "#ffffff", margin: 0, textAlign: "left" }}>
                      {getName(activeCert)}
                    </h1>
                  </div>

                  <div style={{ textAlign: "right", fontFamily: "'Space Mono', monospace", fontSize: "0.9rem", color: "var(--accent)", paddingTop: "0.5rem", whiteSpace: "nowrap" }}>
                    {fmtDate(activeCert.date)}
                  </div>
                </div>

                {/* Issuer Name & Credential ID */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
                  {getOrg(activeCert) && (
                    <div style={{ fontSize: "1.05rem", color: "rgba(240,240,240,0.85)", fontWeight: "500" }}>
                      <span style={{ color: "rgba(240,240,240,0.45)", fontFamily: "'Space Mono', monospace", fontSize: "0.85rem" }}>ISSUER: </span>
                      {getOrg(activeCert)}
                    </div>
                  )}

                  {activeCert.credId && (
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.85rem", color: "#00aaff", background: "rgba(0,170,255,0.08)", padding: "0.4rem 0.8rem", borderRadius: "6px", width: "fit-content", border: "1px solid rgba(0,170,255,0.2)" }}>
                      Credential ID: {activeCert.credId}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "2rem" }}>
                  <span className={`cert-type${getType(activeCert) === "Hackathon" ? " hackathon" : ""}`}>
                    {getType(activeCert)}
                  </span>
                </div>

                {/* Verification Button */}
                {activeCert.link ? (
                  <div style={{ paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                    <a
                      href={activeCert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        background: "#00aaff",
                        color: "#000000",
                        padding: "0.85rem 1.6rem",
                        borderRadius: "100px",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        textDecoration: "none",
                        transition: "transform 0.2s ease, background 0.2s ease"
                      }}
                    >
                      <span>Check Verification</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>
                ) : (
                  <div style={{ paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#00aaff", fontFamily: "'Space Mono', monospace", fontSize: "0.85rem", background: "rgba(0,170,255,0.08)", padding: "0.6rem 1.2rem", borderRadius: "100px", border: "1px solid rgba(0,170,255,0.3)" }}>
                      ✓ Verification Confirmed
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* CERTIFICATES LIST VIEW */
              <>
                <div className="eyebrow">
                  <span className="idx">03</span>
                  PROOF OF WORK
                </div>
                <h1 className="title">Certifications &amp; Achievements</h1>
                <p className="subhead">Credentials, hackathon results, and milestones — the receipts behind the resume.</p>

                {certs.length === 0 ? (
                  <div className="not-found">
                    <div className="not-found-icon">🏅</div>
                    <h2>No certifications found</h2>
                    <p>Nothing in the database yet — check back soon.</p>
                  </div>
                ) : (
                  <>
                    <div className="controls">
                      <div className="search-box">
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} aria-hidden="true">
                          <circle cx="11" cy="11" r="7" />
                          <path d="M21 21l-4.3-4.3" />
                        </svg>
                        <input
                          id="certSearch"
                          type="text"
                          placeholder="Search certifications…"
                          value={certSearch}
                          onChange={(e) => setCertSearch(e.target.value)}
                        />
                      </div>
                      <div className="select-wrap">
                        <select id="certFilter" value={certFilter} onChange={(e) => setCertFilter(e.target.value)}>
                          <option value="all">All types</option>
                          <option value="Certification">Certification</option>
                          <option value="Hackathon">Hackathon</option>
                          <option value="Achievement">Achievement</option>
                        </select>
                      </div>
                      <div className="select-wrap">
                        <select id="certSort" value={certSort} onChange={(e) => setCertSort(e.target.value)}>
                          <option value="newest">Newest first</option>
                          <option value="oldest">Oldest first</option>
                          <option value="az">A–Z</option>
                        </select>
                      </div>
                      <div className="count-tag">
                        <b>{list.length}</b> / {certs.length} entries
                      </div>
                    </div>

                    {list.length === 0 ? (
                      <div className="empty-state">NO SIGNAL — try a different search or filter</div>
                    ) : (
                      <div className="cert-list">
                        {list.map((c, i) => (
                          <div
                            className="cert-row"
                            key={c._id || c.id || getName(c)}
                            onClick={() => setActiveCert(c)}
                          >
                            <div className="cert-idx">{String(i + 1).padStart(2, "0")}</div>

                            {c.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={c.image} alt={getName(c)} className="cert-thumb" />
                            ) : (
                              <div className="cert-thumb-placeholder">🏅</div>
                            )}

                            <div className="cert-main">
                              <h4>{getName(c)}</h4>
                              <span>{getOrg(c)}</span>
                              {c.credId && <div className="cert-cred">ID: {c.credId}</div>}
                            </div>
                            <div className={`cert-type${getType(c) === "Hackathon" ? " hackathon" : ""}`}>
                              {getType(c)}
                            </div>
                            <div className="cert-date">{fmtDate(c.date)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </section>

          <footer>
            <span>Mayank Dhodi © 2026</span>
            <span>Built with precision.</span>
          </footer>
        </div>
      </div>
    </>
  );
}
