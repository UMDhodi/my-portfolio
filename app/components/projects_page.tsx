"use client";

import { useEffect, useState } from "react";
import { MorphingInfinity } from "@/components/loading-ui/morphing-infinity";

export interface ProjectItem {
  _id: string;
  title: string;
  description: string;
  image?: string;
  tags?: string;
  demoLink?: string;
  githubLink?: string;
  category?: string;
  date?: string;
  featured?: boolean;
}

interface ProjectsPageProps {
  initialProjects?: ProjectItem[];
}

export default function ProjectsPageComponent({ initialProjects = [] }: ProjectsPageProps) {
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [navigatingScreen, setNavigatingScreen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── FONTS INJECTION ──────────────────────────────────────────────────────
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

  // ── CUSTOM CURSOR & NAV SCROLL ──────────────────────────────────────────
  useEffect(() => {
    const dot = document.getElementById("cursor-dot-projects");
    const ring = document.getElementById("cursor-ring-projects");
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
    const nav = document.getElementById("projects-nav");
    const onScroll = () => {
      if (nav) {
        if (window.scrollY > 40) nav.classList.add("scrolled");
        else nav.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", onScroll);

    return () => {
      if (onMove) document.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Extract unique categories
  const categories = ["all", ...Array.from(new Set(projects.map((p) => p.category || "Web"))).filter(Boolean)];

  // Filter & Sort Logic
  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tags && p.tags.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        categoryFilter === "all" || (p.category || "Web").toLowerCase() === categoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date || a._id).getTime();
      const dateB = new Date(b.date || b._id).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            try {
              if (sessionStorage.getItem("site_visited") === "true") {
                document.documentElement.classList.add("site-visited");
              }
            } catch(e){}
          `,
        }}
      />

      {/* CURSOR */}
      <div className="cursor-dot" id="cursor-dot-projects" suppressHydrationWarning />
      <div className="cursor-ring" id="cursor-ring-projects" suppressHydrationWarning />

      {/* NAVIGATION */}
      <nav id="projects-nav" className="sub-page-nav" aria-label="Main navigation">
        <a
          href="/"
          className="nav-logo mono"
          aria-label="Mayank Dhodi"
          onClick={(e) => {
            e.preventDefault();
            setNavigatingScreen(true);
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
                setNavigatingScreen(true);
                window.location.href = "/";
              }}
            >
              Home
            </a>
            <a href="/projects" className="nav-page-link mono active-page">
              Projects
            </a>
            <a
              href="/blog"
              className="nav-page-link mono"
              onClick={(e) => {
                e.preventDefault();
                setNavigatingScreen(true);
                window.location.href = "/blog";
              }}
            >
              Blog
            </a>
            <a
              href="/certifications"
              className="nav-page-link mono"
              onClick={(e) => {
                e.preventDefault();
                setNavigatingScreen(true);
                window.location.href = "/certifications";
              }}
            >
              Certifications
            </a>
          </div>
          <a href="/#contact" className="nav-pill">
            Available for work
          </a>
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
            <span className="mono" style={{ fontSize: "0.75rem", color: "var(--c-accent)", letterSpacing: "0.15em" }}>
              NAVIGATION
            </span>
          </div>

          <div className="mobile-nav-items">
            <a
              href="/"
              className="mobile-nav-item mono"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                setNavigatingScreen(true);
                window.location.href = "/";
              }}
            >
              <span className="item-num">01</span>
              <span>HOME</span>
            </a>

            <a
              href="/projects"
              className="mobile-nav-item mono active"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="item-num">02</span>
              <span>PROJECTS</span>
            </a>

            <a
              href="/blog"
              className="mobile-nav-item mono"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                setNavigatingScreen(true);
                window.location.href = "/blog";
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
                setNavigatingScreen(true);
                window.location.href = "/certifications";
              }}
            >
              <span className="item-num">04</span>
              <span>CERTIFICATIONS</span>
            </a>

            <a href="/#contact" className="mobile-nav-item mono" onClick={() => setMobileMenuOpen(false)}>
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

      {/* CENTERED DARK LOADING OVERLAY */}
      {navigatingScreen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            background: "#080808",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <MorphingInfinity size={48} color="#00aaff" />
          <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.9rem", color: "rgba(255,255,255,0.75)", letterSpacing: "0.05em" }}>
            Loading...
          </span>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="projects-page-wrap" style={{ minHeight: "100vh", background: "#080808", paddingTop: "7rem", paddingBottom: "6rem", color: "#fff" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 1.5rem" }}>
          
          {/* Header */}
          <div style={{ marginBottom: "3rem" }}>
            <span className="mono" style={{ fontSize: "0.75rem", color: "var(--c-accent, #00aaff)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              PROOF OF BUILD
            </span>
            <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0.5rem 0 1rem 0", lineHeight: 1.1 }}>
              Projects &amp; Creations
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.1rem", maxWidth: "650px", lineHeight: 1.6 }}>
              A curated collection of web applications, AI integrations, and fullstack software products engineered with precision.
            </p>
          </div>

          {/* Controls Bar: Search, Filters, Sort */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", background: "rgba(255,255,255,0.03)", padding: "1.25rem", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
            
            {/* Search Input */}
            <div style={{ flex: "1 1 300px", position: "relative" }}>
              <input
                type="text"
                placeholder="Search projects by title, stack or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(0,0,0,0.6)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
              {categories.map((cat) => {
                const isActive = categoryFilter.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className="mono"
                    style={{
                      background: isActive ? "rgba(0,170,255,0.18)" : "rgba(255,255,255,0.04)",
                      color: isActive ? "#00aaff" : "rgba(255,255,255,0.7)",
                      border: `1px solid ${isActive ? "rgba(0,170,255,0.5)" : "rgba(255,255,255,0.1)"}`,
                      padding: "0.45rem 1rem",
                      borderRadius: "100px",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {cat === "all" ? "All Projects" : cat}
                  </button>
                );
              })}
            </div>

            {/* Sort Order Dropdown */}
            <div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="mono"
                style={{
                  background: "rgba(0,0,0,0.6)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  padding: "0.65rem 1rem",
                  borderRadius: "10px",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* 3x3 GRID LAYOUT UI CARDS */}
          {filteredProjects.length === 0 ? (
            <div style={{ padding: "5rem 2rem", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px dashed rgba(255,255,255,0.1)" }}>
              <span style={{ fontSize: "2rem" }}>🚀</span>
              <h3 style={{ fontSize: "1.25rem", marginTop: "1rem", color: "rgba(255,255,255,0.8)" }}>No projects found</h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>Try adjusting your search or category filter.</p>
            </div>
          ) : (
            <div className="projects-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "2rem" }}>
              {filteredProjects.map((p) => {
                const tagList = p.tags
                  ? p.tags.split(",").map((t) => t.trim()).filter(Boolean)
                  : [];
                return (
                  <article
                    key={p._id}
                    className="project-card"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "16px",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1), border-color 0.3s ease, box-shadow 0.3s ease",
                      cursor: "default"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-6px)";
                      e.currentTarget.style.borderColor = "rgba(0,170,255,0.35)";
                      e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.5), 0 0 20px rgba(0,170,255,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Banner Image Container */}
                    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#111", overflow: "hidden" }}>
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.title}
                          loading="lazy"
                          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #121212 0%, #1a1a1a 100%)", color: "var(--c-accent, #00aaff)", fontSize: "2.5rem" }}>
                          💻
                        </div>
                      )}
                      <div style={{ position: "absolute", top: "0.85rem", left: "0.85rem" }}>
                        <span className="mono" style={{ background: "rgba(8,8,8,0.85)", backdropFilter: "blur(8px)", color: "var(--c-accent, #00aaff)", padding: "0.25rem 0.65rem", borderRadius: "100px", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid rgba(0,170,255,0.3)" }}>
                          {p.category || "Web"}
                        </span>
                      </div>
                      {p.date && (
                        <div style={{ position: "absolute", top: "0.85rem", right: "0.85rem" }}>
                          <span className="mono" style={{ background: "rgba(8,8,8,0.85)", backdropFilter: "blur(8px)", color: "rgba(255,255,255,0.7)", padding: "0.25rem 0.65rem", borderRadius: "100px", fontSize: "0.68rem" }}>
                            {p.date}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
                      <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0 0 0.5rem 0", color: "#fff", lineHeight: 1.35 }}>
                        {p.title}
                      </h3>

                      <p style={{
                        color: "rgba(255,255,255,0.65)",
                        fontSize: "0.85rem",
                        lineHeight: 1.5,
                        margin: "0 0 1rem 0",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        minHeight: "2.55rem"
                      }}>
                        {p.description}
                      </p>

                      {/* Tech Stack Tag Pills */}
                      {tagList.length > 0 && (
                        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                          {tagList.slice(0, 4).map((tag, idx) => (
                            <span
                              key={idx}
                              className="mono"
                              style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                color: "rgba(255,255,255,0.75)",
                                padding: "0.15rem 0.5rem",
                                borderRadius: "4px",
                                fontSize: "0.68rem"
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Links Bar */}
                      <div style={{ display: "flex", gap: "0.75rem", marginTop: "auto", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)", alignItems: "center" }}>
                        {p.demoLink ? (
                          <a
                            href={p.demoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mono"
                            style={{
                              flex: 1,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.4rem",
                              background: "#00aaff",
                              color: "#000",
                              fontWeight: 700,
                              padding: "0.55rem 0.85rem",
                              borderRadius: "8px",
                              fontSize: "0.75rem",
                              textDecoration: "none",
                              textTransform: "uppercase",
                              transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#0088cc"; e.currentTarget.style.color = "#ffffff"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "#00aaff"; e.currentTarget.style.color = "#000000"; }}
                          >
                            <span>Live Demo</span>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        ) : (
                          <span className="mono" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)", padding: "0.55rem 0.85rem", borderRadius: "8px", fontSize: "0.75rem" }}>
                            Internal Build
                          </span>
                        )}

                        {p.githubLink && (
                          <a
                            href={p.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="GitHub Repository"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "32px",
                              height: "32px",
                              borderRadius: "8px",
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              color: "#fff",
                              transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#00aaff"; e.currentTarget.style.color = "#00aaff"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
