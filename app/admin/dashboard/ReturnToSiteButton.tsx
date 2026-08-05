"use client";

import { useState } from "react";
import { MorphingInfinity } from "@/components/loading-ui/morphing-infinity";

export function ReturnToSiteButton() {
  const [navigating, setNavigating] = useState(false);

  return (
    <>
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault();
          setNavigating(true);
          window.location.href = "/";
        }}
        style={{
          display: "block",
          textAlign: "center",
          marginTop: "1rem",
          color: "rgba(255,255,255,0.5)",
          fontSize: "0.85rem",
          textDecoration: "none",
          cursor: "pointer",
          transition: "color 0.2s ease"
        }}
      >
        Return to Site ↗
      </a>

      {navigating && (
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
    </>
  );
}
