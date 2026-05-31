"use client";

import { useState } from "react";
import { login } from "@/app/actions/auth";
import Link from "next/link";

export default function AdminLogin() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const res = await login(formData);
    
    if (res.success) {
      window.location.href = "/admin/dashboard";
    } else {
      setError(res.error || "Login failed");
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#080808", color: "#f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-inter, sans-serif)", position: "relative", overflow: "hidden", cursor: "auto" }}>
      
      {/* Background Waves */}
      <div className="hero-wave-wrap" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "hidden", zIndex: 0, pointerEvents: "none", opacity: 0.4, mixBlendMode: "screen", maskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)" }}>
        <svg className="hero-wave-svg" viewBox="0 0 1400 300" preserveAspectRatio="none" style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", width: "200%", height: "100vh", minWidth: "2800px" }}>
          {/* Gray fine wave */}
          <path className="wave-gray" d="M0,150 Q87.5,70 175,150 T350,150 T525,150 T700,150 T875,150 T1050,150 T1225,150 T1400,150 T1575,150 T1750,150 T1925,150 T2100,150" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.08" />
          {/* Main Blue wave */}
          <path className="wave-blue" d="M0,150 Q175,0 350,150 T700,150 T1050,150 T1400,150 T1750,150 T2100,150" fill="none" stroke="#00aaff" strokeWidth="2" opacity="0.3" />
          {/* Faded Blue wave offset */}
          <path className="wave-blue-2" d="M0,150 Q175,250 350,150 T700,150 T1050,150 T1400,150 T1750,150 T2100,150" fill="none" stroke="#00aaff" strokeWidth="1" opacity="0.15" />
        </svg>
      </div>
      <Link href="/" style={{ position: "absolute", top: "2rem", left: "2rem", color: "var(--c-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", zIndex: 10 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Site
      </Link>

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "400px", padding: "2rem", background: "rgba(20,20,20,0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
        
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "600", marginBottom: "0.5rem" }}>Admin Access</h1>
          <p style={{ color: "var(--c-muted)", fontSize: "0.9rem" }}>Authorized personnel only.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--c-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Password</label>
            <input 
              type="password" 
              name="password"
              placeholder="••••••••"
              required
              style={{
                width: "100%", padding: "0.8rem 1rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "white", outline: "none", fontSize: "1rem"
              }}
            />
          </div>

          {error && <div style={{ color: "#ff4444", fontSize: "0.85rem", textAlign: "center" }}>{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: "0.9rem", background: "white", color: "black", border: "none", borderRadius: "6px", fontSize: "1rem", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", transition: "opacity 0.2s"
            }}
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>
      </div>
      <style dangerouslySetInnerHTML={{__html: `* { cursor: auto !important; }`}} />
    </main>
  );
}
