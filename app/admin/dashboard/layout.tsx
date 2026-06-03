import { verifyAuth, logout } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const isAuth = await verifyAuth();
  
  if (!isAuth) {
    redirect("/admin");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#080808", color: "#f0f0f0", fontFamily: "var(--font-inter, sans-serif)", cursor: "auto" }}>
      {/* Sidebar */}
      <aside style={{ width: "260px", background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "2rem 1.5rem", display: "flex", flexDirection: "column" }}>
        
        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "600", fontFamily: "var(--font-mono, monospace)", letterSpacing: "-0.02em" }}>MK. <span style={{ color: "var(--c-muted)", fontWeight: "400" }}>Admin</span></h2>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1, userSelect: "auto", WebkitUserSelect: "auto" }}>
          <Link href="/admin/dashboard" style={{ padding: "0.75rem 1rem", borderRadius: "6px", color: "white", textDecoration: "none", fontSize: "0.9rem", transition: "background 0.2s", cursor: "pointer", userSelect: "auto" }} className="admin-nav-link">
            Overview
          </Link>
          <Link href="/admin/dashboard/timeline" style={{ padding: "0.75rem 1rem", borderRadius: "6px", color: "white", textDecoration: "none", fontSize: "0.9rem", transition: "background 0.2s", cursor: "pointer", userSelect: "auto" }} className="admin-nav-link">
            Timeline
          </Link>
          <Link href="/admin/dashboard/certifications" style={{ padding: "0.75rem 1rem", borderRadius: "6px", color: "white", textDecoration: "none", fontSize: "0.9rem", transition: "background 0.2s", cursor: "pointer", userSelect: "auto" }} className="admin-nav-link">
            Certifications
          </Link>
          <Link href="/admin/dashboard/messages" style={{ padding: "0.75rem 1rem", borderRadius: "6px", color: "white", textDecoration: "none", fontSize: "0.9rem", transition: "background 0.2s", cursor: "pointer", userSelect: "auto" }} className="admin-nav-link">
            Messages
          </Link>
        </nav>

        <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.5rem" }}>
          <form action={logout}>
            <button type="submit" style={{ width: "100%", padding: "0.75rem", background: "transparent", color: "#ff4444", border: "1px solid rgba(255,68,68,0.2)", borderRadius: "6px", cursor: "pointer", transition: "background 0.2s" }}>
              Logout
            </button>
          </form>
          <Link href="/" style={{ display: "block", textAlign: "center", marginTop: "1rem", color: "var(--c-muted)", fontSize: "0.85rem", textDecoration: "none" }}>
            Return to Site ↗
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "3rem 4rem", overflowY: "auto" }}>
        {children}
      </main>

      {/* Admin-specific style overrides — fixes cursor, hover colors, and nav selectability */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Reset cursor for entire admin area — override the portfolio's cursor:none */
        div, main, aside, nav, a, button, input, textarea, select, label, form, p, h1, h2, h3, h4, h5, h6, span, img, svg {
          cursor: auto !important;
        }
        a, .admin-nav-link { cursor: pointer !important; }
        button { cursor: pointer !important; }
        input, textarea, select { cursor: text !important; }

        /* Enable text selection in admin navigation */
        .admin-nav-link {
          user-select: auto !important;
          -webkit-user-select: auto !important;
          -moz-user-select: auto !important;
          -ms-user-select: auto !important;
        }

        /* Nav link hover — clean blue tint instead of browser default */
        .admin-nav-link:hover {
          background: rgba(0,170,255,0.08) !important;
          color: #fff !important;
        }
        .admin-nav-link:active {
          background: rgba(0,170,255,0.15) !important;
        }

        /* Fix ALL button hovers — prevent maroon/dark browser-default colors */
        button:hover {
          opacity: 0.9;
        }
        button[type="submit"]:hover {
          background: rgba(255,68,68,0.15) !important;
        }

        /* White/primary buttons: hover should stay clean (not maroon) */
        button[style*="background: white"]:hover,
        button[style*="background:#fff"]:hover,
        button[style*="background: #fff"]:hover,
        button[style*="background:white"]:hover {
          background: #e8e8e8 !important;
          color: black !important;
        }

        /* Generic admin buttons with white bg and black text */
        form button[type="submit"][style*="white"]:hover {
          background: #e8e8e8 !important;
          color: black !important;
        }

        /* Logout button: red border style */
        form button[type="submit"][style*="ff4444"]:hover,
        form button[type="submit"][style*="#ff4444"]:hover {
          background: rgba(255,68,68,0.15) !important;
          color: #ff4444 !important;
        }

        /* Delete-style buttons: keep red theme */
        button[style*="rgba(255,68,68"]:hover {
          background: rgba(255,68,68,0.2) !important;
          color: #ff4444 !important;
        }

        /* Transparent/outline buttons: subtle fill on hover */
        button[style*="background: transparent"]:hover,
        button[style*="background:transparent"]:hover {
          background: rgba(255,255,255,0.08) !important;
          color: white !important;
        }

        /* Hide the custom cursor elements in admin */
        .cursor-dot, .cursor-ring { display: none !important; }

        /* Primary action buttons (white bg) — explicit clean hover */
        .admin-btn-primary {
          transition: background 0.2s ease, transform 0.15s ease !important;
        }
        .admin-btn-primary:hover {
          background: #e0e0e0 !important;
          color: #000 !important;
          transform: translateY(-1px);
        }
        .admin-btn-primary:active {
          background: #d0d0d0 !important;
          transform: translateY(0);
        }

        /* Smooth select/option styling */
        select option {
          background: #111;
          color: #f0f0f0;
        }
      `}} />
    </div>
  );
}
