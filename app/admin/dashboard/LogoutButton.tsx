"use client";

import { useState } from "react";
import { logout } from "@/app/actions/auth";
import { MorphingInfinity } from "@/components/loading-ui/morphing-infinity";

export function LogoutButton() {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout(e: React.FormEvent) {
    e.preventDefault();
    setLoggingOut(true);
    await logout();
  }

  return (
    <form onSubmit={handleLogout}>
      <button 
        type="submit" 
        disabled={loggingOut}
        style={{ 
          width: "100%", 
          padding: "0.75rem", 
          background: "transparent", 
          color: "#ff4444", 
          border: "1px solid rgba(255,68,68,0.2)", 
          borderRadius: "6px", 
          cursor: "pointer", 
          transition: "background 0.2s",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem"
        }}
      >
        {loggingOut ? (
          <>
            <MorphingInfinity size={16} color="#ff4444" />
            <span>Logging out...</span>
          </>
        ) : (
          "Logout"
        )}
      </button>
    </form>
  );
}
