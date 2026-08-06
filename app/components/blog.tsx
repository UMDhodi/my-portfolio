"use client";

import { useEffect, useMemo, useState } from "react";
import { MorphingInfinity } from "@/components/loading-ui/morphing-infinity";

export type Post = {
  _id?: string;
  title: string;
  date: string;
  tag: string;
  stack: string;
  excerpt: string;
  link?: string;
};

interface BlogProps {
  initialPosts?: Post[];
}

function fmtDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function Blog({ initialPosts = [] }: BlogProps) {
  const posts: Post[] = initialPosts;

  const [blogSearch, setBlogSearch] = useState("");
  const [blogFilter, setBlogFilter] = useState("all");
  const [blogSort, setBlogSort] = useState("newest");
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [navigatingHome, setNavigatingHome] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Read URL search param ?post=id to automatically expand post if navigated from Home page
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const postId = params.get("post");
      if (postId && posts.length > 0) {
        const match = posts.find((p) => p._id === postId);
        if (match) setActivePost(match);
      }
    }
  }, [posts]);

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
    const dot = document.getElementById("cursor-dot-blog");
    const ring = document.getElementById("cursor-ring-blog");
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
    const nav = document.getElementById("blog-nav");
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

  // Derive unique tags from real data for filter dropdown
  const allTags = useMemo(() => {
    const tags = new Set(posts.map((p) => p.tag).filter(Boolean));
    return Array.from(tags).sort();
  }, [posts]);

  const list = useMemo(() => {
    const q = blogSearch.toLowerCase().trim();
    let filtered = posts.filter((p) => {
      const matchesQ =
        !q ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
        (p.stack && p.stack.toLowerCase().includes(q));
      const matchesF = blogFilter === "all" || p.tag === blogFilter;
      return matchesQ && matchesF;
    });
    filtered = [...filtered].sort((a, b) => {
      if (blogSort === "az") return (a.title || "").localeCompare(b.title || "");
      if (blogSort === "oldest") return +new Date(a.date) - +new Date(b.date);
      return +new Date(b.date) - +new Date(a.date);
    });
    return filtered;
  }, [blogSearch, blogFilter, blogSort, posts]);

  return (
    <>
      <style>{`
        .blog-page {
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
        .blog-page * { box-sizing: border-box; }
        .blog-page .wrap { max-width: 1140px; margin: 0 auto; }

        .blog-page .section { margin-bottom: 60px; }

        .blog-page .eyebrow {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: var(--accent);
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 18px;
        }
        .blog-page .eyebrow .idx { color: var(--text-faint); }
        .blog-page .eyebrow::after { content: ""; flex: 1; height: 1px; background: var(--line); }
        .blog-page h1.title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: clamp(34px, 5vw, 56px);
          letter-spacing: -.02em;
          line-height: 1.05;
          margin-bottom: 12px;
        }
        .blog-page .subhead {
          color: var(--text-dim);
          font-size: 15px;
          max-width: 560px;
          margin-bottom: 40px;
          line-height: 1.6;
        }

        .blog-page .controls {
          display: flex; flex-wrap: wrap; gap: 14px;
          margin-bottom: 36px; padding-bottom: 24px;
          border-bottom: 1px solid var(--line);
          align-items: center;
        }
        .blog-page .search-box { flex: 1 1 240px; position: relative; }
        .blog-page .search-box input {
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
        .blog-page .search-box input::placeholder { color: var(--text-faint); }
        .blog-page .search-box input:focus { border-color: var(--accent); }
        .blog-page .search-box svg {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          width: 15px; height: 15px; stroke: var(--text-faint);
        }
        .blog-page .select-wrap { position: relative; }
        .blog-page select {
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
        .blog-page select:focus { border-color: var(--accent); }
        .blog-page .select-wrap::after {
          content: "";
          position: absolute; right: 12px; top: 50%;
          width: 6px; height: 6px;
          border-right: 1px solid var(--text-dim);
          border-bottom: 1px solid var(--text-dim);
          transform: translateY(-65%) rotate(45deg);
          pointer-events: none;
        }
        .blog-page .signal-meter { display: flex; gap: 3px; align-items: flex-end; height: 16px; margin-left: 4px; }
        .blog-page .signal-meter span { width: 3px; background: var(--accent); border-radius: 1px; animation: blog-pulse 1.1s ease-in-out infinite; }
        .blog-page .signal-meter span:nth-child(1) { height: 6px; animation-delay: 0s; }
        .blog-page .signal-meter span:nth-child(2) { height: 14px; animation-delay: .15s; }
        .blog-page .signal-meter span:nth-child(3) { height: 9px; animation-delay: .3s; }
        .blog-page .signal-meter span:nth-child(4) { height: 16px; animation-delay: .45s; }
        @keyframes blog-pulse { 0%,100% { transform: scaleY(.4); opacity: .5; } 50% { transform: scaleY(1); opacity: 1; } }

        .blog-page .count-tag {
          font-family: 'Space Mono', monospace;
          font-size: 11px; color: var(--text-faint); margin-left: auto; white-space: nowrap;
        }
        .blog-page .count-tag b { color: var(--accent); font-weight: 700; }

        .blog-page .blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        .blog-page .post {
          background: var(--bg-elev);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 24px;
          display: flex; flex-direction: column; gap: 14px;
          transition: border-color .25s ease, transform .25s ease, box-shadow .25s ease;
          cursor: pointer;
        }
        .blog-page .post:hover {
          border-color: rgba(0,170,255,0.3);
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0,170,255,0.08);
        }
        .blog-page .post-meta {
          display: flex; justify-content: space-between; align-items: center;
          font-family: 'Space Mono', monospace;
          font-size: 11px; letter-spacing: .06em; text-transform: uppercase;
          color: var(--text-faint);
        }
        .blog-page .post-tag {
          color: var(--accent);
          padding: 2px 8px;
          border: 1px solid rgba(0,170,255,0.3);
          border-radius: 999px;
          font-size: 10px;
        }
        .blog-page .post h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600; font-size: 20px; line-height: 1.35;
          letter-spacing: -.01em;
          color: var(--text);
        }
        .blog-page .post p { font-size: 14px; line-height: 1.6; color: var(--text-dim); flex: 1; }
        .blog-page .post-stack {
          font-family: 'Space Mono', monospace;
          font-size: 11px; color: var(--text-faint); letter-spacing: .02em;
          padding-top: 12px; border-top: 1px solid var(--line);
        }

        .blog-page .not-found {
          padding: 80px 20px; text-align: center;
          border: 1px solid var(--line);
          border-radius: 12px;
          background: var(--bg-elev);
        }
        .blog-page .not-found-icon { font-size: 44px; margin-bottom: 16px; opacity: .6; }
        .blog-page .not-found h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600; font-size: 22px;
          color: var(--text); margin-bottom: 8px;
        }
        .blog-page .not-found p {
          font-size: 14px; color: var(--text-faint); font-family: 'Space Mono', monospace;
          letter-spacing: .04em;
        }

        .blog-page .empty-state {
          padding: 60px 20px; text-align: center; color: var(--text-faint);
          font-family: 'Space Mono', monospace; font-size: 12px; letter-spacing: .05em;
          border: 1px solid var(--line); border-radius: 12px;
          background: var(--bg-elev);
        }

        .blog-page footer {
          margin-top: 80px; padding-top: 24px; border-top: 1px solid var(--line);
          font-family: 'Space Mono', monospace; font-size: 11px; color: var(--text-faint);
          display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;
        }
      `}</style>

      {/* Custom cursor elements — same as home screen */}
      <div className="cursor-dot" id="cursor-dot-blog" suppressHydrationWarning />
      <div className="cursor-ring" id="cursor-ring-blog" suppressHydrationWarning />

      {/* HOME-SCREEN NAV */}
      <nav id="blog-nav" className="sub-page-nav" aria-label="Main navigation">
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
              href="/projects"
              className="nav-page-link mono"
              onClick={(e) => {
                e.preventDefault();
                setNavigatingHome(true);
                window.location.href = "/projects";
              }}
            >
              Projects
            </a>
            <a
              href="/blog"
              className="nav-page-link mono active-page"
              onClick={(e) => {
                if (activePost) {
                  e.preventDefault();
                  setActivePost(null);
                  if (typeof window !== "undefined" && window.history.pushState) {
                    window.history.pushState(null, "", "/blog");
                  }
                }
              }}
            >
              Blog
            </a>
            <a
              href="/certifications"
              className="nav-page-link mono"
              onClick={(e) => {
                e.preventDefault();
                setNavigatingHome(true);
                window.location.href = "/certifications";
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
              href="/projects"
              className="mobile-nav-item mono"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                setNavigatingHome(true);
                window.location.href = "/projects";
              }}
            >
              <span className="item-num">02</span>
              <span>PROJECTS</span>
            </a>

            <a
              href="/blog"
              className="mobile-nav-item mono active"
              onClick={() => {
                setMobileMenuOpen(false);
                if (activePost) setActivePost(null);
              }}
            >
              <span className="item-num">03</span>
              <span>BLOG</span>
            </a>

            <a
              href="/certifications"
              className="mobile-nav-item mono"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                setNavigatingHome(true);
                window.location.href = "/certifications";
              }}
            >
              <span className="item-num">04</span>
              <span>CERTIFICATIONS</span>
            </a>

            <a
              href="/#contact"
              className="mobile-nav-item mono"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="item-num">05</span>
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

      <div className="blog-page">
        <div className="wrap">
          <section className="section" id="blog">

            {/* EXPANDED FULL ARTICLE VIEW */}
            {activePost ? (
              <div style={{ maxWidth: "860px", margin: "0 auto" }}>
                {/* Top Back Button */}
                <button
                  type="button"
                  onClick={() => {
                    setActivePost(null);
                    if (typeof window !== "undefined" && window.history.pushState) {
                      window.history.pushState(null, "", "/blog");
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
                  <span>Back to Blog</span>
                </button>

                {/* Article Header: Title (start) | Date (end) */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
                  <div style={{ flex: 1, minWidth: "280px" }}>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.75rem" }}>
                      <span className="post-tag">{activePost.tag || "TECH"}</span>
                      {activePost.stack && (
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.75rem", color: "var(--text-faint)" }}>
                          {activePost.stack}
                        </span>
                      )}
                    </div>
                    <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: "700", lineHeight: "1.15", letterSpacing: "-0.02em", color: "#ffffff", margin: 0, textAlign: "left" }}>
                      {activePost.title}
                    </h1>
                  </div>

                  <div style={{ textAlign: "right", fontFamily: "'Space Mono', monospace", fontSize: "0.85rem", color: "var(--text-faint)", paddingTop: "0.5rem", whiteSpace: "nowrap" }}>
                    {fmtDate(activePost.date)}
                  </div>
                </div>

                {/* Divider Line */}
                <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.12)", margin: "1.5rem 0 2.5rem 0" }} />

                {/* Formatted Content Body (Rich HTML support) */}
                <div 
                  className="blog-editor-content"
                  dangerouslySetInnerHTML={{ __html: activePost.excerpt || "" }}
                  style={{
                    fontSize: "1.05rem",
                    lineHeight: "1.8",
                    color: "#f0f0f0",
                    background: "transparent",
                    padding: 0
                  }}
                />

                {/* Third Party External Article Link (at the bottom) */}
                {activePost.link && (
                  <div style={{ marginTop: "3.5rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                    <a
                      href={activePost.link}
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
                      <span>Read full article on external platform</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            ) : (
              /* BLOG LIST VIEW */
              <>
                <div className="eyebrow"><span className="idx">02</span> FIELD NOTES</div>
                <h1 className="title">Blog</h1>
                <p className="subhead">Notes from the build — vibe coding logs, hackathon post-mortems, and AI automation experiments.</p>

                {posts.length === 0 ? (
                  <div className="not-found">
                    <div className="not-found-icon">📡</div>
                    <h3>Blog not found</h3>
                    <p>No posts available in database yet — check back soon.</p>
                  </div>
                ) : (
                  <>
                    <div className="controls">
                      <div className="search-box">
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth={2}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
                        <input
                          id="blogSearch"
                          type="text"
                          placeholder="Search posts…"
                          value={blogSearch}
                          onChange={(e) => setBlogSearch(e.target.value)}
                        />
                      </div>
                      <div className="select-wrap">
                        <select id="blogFilter" value={blogFilter} onChange={(e) => setBlogFilter(e.target.value)}>
                          <option value="all">All topics</option>
                          {allTags.map((tag) => (
                            <option key={tag} value={tag}>{tag}</option>
                          ))}
                        </select>
                      </div>
                      <div className="select-wrap">
                        <select id="blogSort" value={blogSort} onChange={(e) => setBlogSort(e.target.value)}>
                          <option value="newest">Newest first</option>
                          <option value="oldest">Oldest first</option>
                          <option value="az">Title A–Z</option>
                        </select>
                      </div>
                      <div className="signal-meter"><span></span><span></span><span></span><span></span></div>
                      <div className="count-tag" id="blogCount">
                        <b>{list.length}</b> / {posts.length} posts
                      </div>
                    </div>

                    {list.length === 0 ? (
                      <div className="empty-state" id="blogEmpty">NO SIGNAL — try a different search or filter</div>
                    ) : (
                      <div className="blog-grid" id="blogGrid">
                        {list.map((p) => {
                          // Strip HTML tags for clean card preview snippet
                          const plainSnippet = (p.excerpt || "")
                            .replace(/<[^>]*>/g, " ")
                            .replace(/\s+/g, " ")
                            .trim()
                            .substring(0, 150);

                          return (
                            <article
                              className="post"
                              key={p._id || p.title}
                              onClick={() => setActivePost(p)}
                            >
                              <div className="post-meta">
                                <span>{fmtDate(p.date)}</span>
                                <span className="post-tag">{p.tag}</span>
                              </div>
                              <h3>{p.title}</h3>
                              <p>{plainSnippet ? plainSnippet + "..." : "Click to read full post"}</p>
                              
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid var(--line)" }}>
                                <span className="post-stack">{p.stack || "TECH"}</span>
                                <span style={{ fontSize: "0.8rem", color: "#00aaff", fontWeight: "600" }}>Read Article →</span>
                              </div>
                            </article>
                          );
                        })}
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