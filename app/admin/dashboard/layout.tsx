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

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
          <Link href="/admin/dashboard" style={{ padding: "0.75rem 1rem", borderRadius: "6px", color: "white", textDecoration: "none", fontSize: "0.9rem", transition: "background 0.2s" }} className="admin-nav-link">
            Overview
          </Link>
          <Link href="/admin/dashboard/timeline" style={{ padding: "0.75rem 1rem", borderRadius: "6px", color: "white", textDecoration: "none", fontSize: "0.9rem", transition: "background 0.2s" }} className="admin-nav-link">
            Timeline
          </Link>
          <Link href="/admin/dashboard/certifications" style={{ padding: "0.75rem 1rem", borderRadius: "6px", color: "white", textDecoration: "none", fontSize: "0.9rem", transition: "background 0.2s" }} className="admin-nav-link">
            Certifications
          </Link>
          <Link href="/admin/dashboard/messages" style={{ padding: "0.75rem 1rem", borderRadius: "6px", color: "white", textDecoration: "none", fontSize: "0.9rem", transition: "background 0.2s" }} className="admin-nav-link">
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

      {/* Basic styles for hover states and cursor fix */}
      <style dangerouslySetInnerHTML={{__html: `
        * { cursor: auto !important; }
        .admin-nav-link:hover { background: rgba(255,255,255,0.05); }
        button[type="submit"]:hover { background: rgba(255,68,68,0.1) !important; }
      `}} />
    </div>
  );
}
