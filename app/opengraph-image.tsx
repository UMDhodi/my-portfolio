import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Mayank Dhodi — Full-Stack Developer, Data Analyst & AI Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #080808 0%, #0a0a0a 50%, #111 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Accent glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,170,255,0.12) 0%, transparent 70%)",
          }}
        />
        {/* Eyebrow */}
        <div
          style={{
            fontSize: "18px",
            letterSpacing: "6px",
            textTransform: "uppercase",
            color: "#00aaff",
            marginBottom: "24px",
            display: "flex",
          }}
        >
          FULL-STACK DEVELOPER · DATA ANALYST · AI ENGINEER
        </div>
        {/* Name */}
        <div
          style={{
            fontSize: "96px",
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span>MAYANK</span>
          <span>DHODI</span>
        </div>
        {/* Tagline */}
        <div
          style={{
            fontSize: "22px",
            color: "rgba(240,240,240,0.5)",
            marginTop: "28px",
            display: "flex",
          }}
        >
          Building systems for the future.
        </div>
        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            height: "4px",
            background:
              "linear-gradient(90deg, transparent, #00aaff, transparent)",
          }}
        />
        {/* Corner logo */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            right: "40px",
            fontSize: "28px",
            fontWeight: 700,
            color: "rgba(255,255,255,0.3)",
            display: "flex",
          }}
        >
          MK<span style={{ color: "#00aaff" }}>.</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
