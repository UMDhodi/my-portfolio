import { verifyAuth } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";
import { LogoutButton } from "./LogoutButton";
import { ReturnToSiteButton } from "./ReturnToSiteButton";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const isAuth = await verifyAuth();
  
  if (!isAuth) {
    redirect("/admin");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#080808", color: "#f0f0f0", fontFamily: "var(--font-inter, sans-serif)", cursor: "auto" }}>
      {/* Mobile top bar */}
      <div className="admin-mobile-bar">
        <h2 style={{ fontSize: "1.1rem", fontWeight: "600", fontFamily: "var(--font-mono, monospace)" }}>
          MK. <span style={{ color: "rgba(240,240,240,0.45)", fontWeight: "400" }}>Admin</span>
        </h2>
        <label htmlFor="admin-sidebar-toggle" className="admin-hamburger" aria-label="Toggle navigation">
          <span></span><span></span><span></span>
        </label>
      </div>

      {/* Hidden checkbox for mobile nav toggle (no JS needed) */}
      <input type="checkbox" id="admin-sidebar-toggle" className="admin-sidebar-checkbox" />

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "600", fontFamily: "var(--font-mono, monospace)", letterSpacing: "-0.02em" }}>
            MK. <span style={{ color: "var(--c-muted)", fontWeight: "400" }}>Admin</span>
          </h2>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1, userSelect: "auto", WebkitUserSelect: "auto" }}>
          <label htmlFor="admin-sidebar-toggle" className="admin-nav-close" aria-label="Close navigation">✕ Close</label>
          <Link href="/admin/dashboard" style={{ padding: "0.75rem 1rem", borderRadius: "6px", color: "white", textDecoration: "none", fontSize: "0.9rem", transition: "background 0.2s", cursor: "pointer", userSelect: "auto" }} className="admin-nav-link">
            Overview
          </Link>
          <Link href="/admin/dashboard/timeline" style={{ padding: "0.75rem 1rem", borderRadius: "6px", color: "white", textDecoration: "none", fontSize: "0.9rem", transition: "background 0.2s", cursor: "pointer", userSelect: "auto" }} className="admin-nav-link">
            Timeline
          </Link>
          <Link href="/admin/dashboard/projects" style={{ padding: "0.75rem 1rem", borderRadius: "6px", color: "white", textDecoration: "none", fontSize: "0.9rem", transition: "background 0.2s", cursor: "pointer", userSelect: "auto" }} className="admin-nav-link">
            Projects
          </Link>
          <Link href="/admin/dashboard/blog" style={{ padding: "0.75rem 1rem", borderRadius: "6px", color: "white", textDecoration: "none", fontSize: "0.9rem", transition: "background 0.2s", cursor: "pointer", userSelect: "auto" }} className="admin-nav-link">
            Blog
          </Link>
          <Link href="/admin/dashboard/certifications" style={{ padding: "0.75rem 1rem", borderRadius: "6px", color: "white", textDecoration: "none", fontSize: "0.9rem", transition: "background 0.2s", cursor: "pointer", userSelect: "auto" }} className="admin-nav-link">
            Certifications
          </Link>
          <Link href="/admin/dashboard/messages" style={{ padding: "0.75rem 1rem", borderRadius: "6px", color: "white", textDecoration: "none", fontSize: "0.9rem", transition: "background 0.2s", cursor: "pointer", userSelect: "auto" }} className="admin-nav-link">
            Messages
          </Link>
        </nav>

        <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.5rem" }}>
          <LogoutButton />
          <ReturnToSiteButton />
        </div>
      </aside>

      {/* Mobile backdrop overlay — clicking it closes the sidebar */}
      <label htmlFor="admin-sidebar-toggle" className="admin-sidebar-overlay" aria-hidden="true" />

      {/* Main Content */}
      <main className="admin-main">
        {children}
      </main>

      {/* Admin-specific styles */}
      <style dangerouslySetInnerHTML={{__html: `
        /* ── RESET CURSOR FOR ENTIRE ADMIN AREA ── */
        div, main, aside, nav, a, button, input, textarea, select, label, form,
        p, h1, h2, h3, h4, h5, h6, span, img, svg {
          cursor: auto !important;
        }
        a, .admin-nav-link { cursor: pointer !important; }
        button { cursor: pointer !important; }
        input, textarea, select { cursor: text !important; }

        /* ── TEXT SELECTION ── */
        .admin-nav-link {
          user-select: auto !important;
          -webkit-user-select: auto !important;
        }

        /* ── SIDEBAR LAYOUT ── */
        .admin-sidebar {
          width: 260px;
          flex-shrink: 0;
          background: rgba(255,255,255,0.02);
          border-right: 1px solid rgba(255,255,255,0.05);
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          transition: transform 0.3s ease;
        }

        .admin-main {
          flex: 1;
          padding: 3rem 4rem;
          overflow-y: auto;
          min-width: 0;
        }

        /* ── MOBILE TOP BAR (hidden on desktop) ── */
        .admin-mobile-bar {
          display: none;
        }

        /* ── MOBILE HAMBURGER TOGGLE ── */
        .admin-sidebar-checkbox { display: none; }
        .admin-hamburger { display: none; }
        .admin-sidebar-overlay { display: none; }
        .admin-nav-close { display: none; }

        /* ── TABLET & MOBILE RESPONSIVE ── */
        @media (max-width: 900px) {
          .admin-main {
            padding: 2rem 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .admin-mobile-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem 1.25rem;
            background: rgba(8,8,8,0.95);
            border-bottom: 1px solid rgba(255,255,255,0.06);
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 200;
            backdrop-filter: blur(12px);
          }

          .admin-hamburger {
            display: flex;
            flex-direction: column;
            gap: 5px;
            cursor: pointer;
            padding: 4px;
          }
          .admin-hamburger span {
            display: block;
            width: 22px;
            height: 2px;
            background: rgba(240,240,240,0.7);
            border-radius: 2px;
            transition: transform 0.3s ease, opacity 0.3s ease;
          }

          /* Sidebar hidden off-screen on mobile */
          .admin-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            z-index: 300;
            transform: translateX(-100%);
            box-shadow: 4px 0 30px rgba(0,0,0,0.5);
          }

          /* Checkbox checked = sidebar visible */
          .admin-sidebar-checkbox:checked ~ .admin-sidebar {
            transform: translateX(0);
          }

          /* Overlay */
          .admin-sidebar-overlay {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 250;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(2px);
          }
          .admin-sidebar-checkbox:checked ~ .admin-sidebar-overlay {
            display: block;
          }

          /* Close button inside sidebar on mobile */
          .admin-nav-close {
            display: block;
            color: rgba(240,240,240,0.4);
            font-size: 0.8rem;
            letter-spacing: 0.05em;
            padding: 0.5rem 1rem;
            cursor: pointer;
            margin-bottom: 0.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            padding-bottom: 1rem;
          }

          /* Hamburger X animation when open */
          .admin-sidebar-checkbox:checked ~ .admin-mobile-bar .admin-hamburger span:nth-child(1) {
            transform: translateY(7px) rotate(45deg);
          }
          .admin-sidebar-checkbox:checked ~ .admin-mobile-bar .admin-hamburger span:nth-child(2) {
            opacity: 0;
          }
          .admin-sidebar-checkbox:checked ~ .admin-mobile-bar .admin-hamburger span:nth-child(3) {
            transform: translateY(-7px) rotate(-45deg);
          }

          .admin-main {
            padding: 5.5rem 1rem 2rem;
          }
        }

        /* ── NAV LINK HOVER ── */
        .admin-nav-link:hover {
          background: rgba(0,170,255,0.08) !important;
          color: #fff !important;
        }
        .admin-nav-link:active {
          background: rgba(0,170,255,0.15) !important;
        }

        /* ── BUTTON HOVERS ── */
        button:hover { opacity: 0.9; }
        button[type="submit"]:hover {
          background: rgba(255,68,68,0.15) !important;
        }
        button[style*="background: white"]:hover,
        button[style*="background:#fff"]:hover,
        button[style*="background: #fff"]:hover,
        button[style*="background:white"]:hover {
          background: #e8e8e8 !important;
          color: black !important;
        }
        form button[type="submit"][style*="white"]:hover {
          background: #e8e8e8 !important;
          color: black !important;
        }
        form button[type="submit"][style*="ff4444"]:hover,
        form button[type="submit"][style*="#ff4444"]:hover {
          background: rgba(255,68,68,0.15) !important;
          color: #ff4444 !important;
        }
        button[style*="rgba(255,68,68"]:hover {
          background: rgba(255,68,68,0.2) !important;
          color: #ff4444 !important;
        }
        button[style*="background: transparent"]:hover,
        button[style*="background:transparent"]:hover {
          background: rgba(255,255,255,0.08) !important;
          color: white !important;
        }

        /* ── HIDE CURSOR ELEMENTS ── */
        .cursor-dot, .cursor-ring { display: none !important; }

        /* ── PRIMARY BUTTONS ── */
        .admin-btn-primary {
          background: #00aaff !important;
          color: #ffffff !important;
          border: 1px solid #00aaff !important;
          border-radius: 6px;
          font-weight: 600;
          transition: all 0.2s ease !important;
          cursor: pointer;
        }
        .admin-btn-primary:hover:not(:disabled) {
          background: #0088ff !important;
          color: #ffffff !important;
          border-color: #0088ff !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0, 170, 255, 0.4);
        }
        .admin-btn-primary:active:not(:disabled) {
          background: #0066cc !important;
          transform: translateY(0);
        }
        .admin-btn-primary:disabled {
          background: #0088ff !important;
          color: #ffffff !important;
          border-color: #0088ff !important;
          opacity: 0.9 !important;
          cursor: not-allowed !important;
        }

        select option {
          background: #111;
          color: #f0f0f0;
        }
      `}} />
      <Toaster />
    </div>
  );
}
