import React from "react";

interface MorphingInfinityProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export function MorphingInfinity({
  className = "",
  size = 24,
  color = "currentColor",
}: MorphingInfinityProps) {
  const numericSize = typeof size === "number" ? size : parseInt(size) || 24;

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        width: numericSize,
        height: numericSize,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        verticalAlign: "middle",
        flexShrink: 0,
      }}
    >
      <svg
        width={numericSize}
        height={numericSize}
        viewBox="0 0 100 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="infinityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00aaff" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
        {/* Track path background */}
        <path
          d="M 30 25 C 10 25 10 45 30 45 C 50 45 50 5 70 5 C 90 5 90 25 70 25 C 50 25 50 45 30 45 C 10 45 10 25 30 25"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Animated morphing stroke */}
        <path
          d="M 30 25 C 10 25 10 45 30 45 C 50 45 50 5 70 5 C 90 5 90 25 70 25 C 50 25 50 45 30 45 C 10 45 10 25 30 25"
          stroke={color === "currentColor" ? "url(#infinityGrad)" : color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="morphing-infinity-path"
          style={{
            strokeDasharray: "140 100",
            animation: "morphingInfinityAnim 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
          }}
        />
        <style>{`
          @keyframes morphingInfinityAnim {
            0% {
              stroke-dashoffset: 240;
              filter: drop-shadow(0 0 3px rgba(0, 170, 255, 0.4));
            }
            50% {
              stroke-dashoffset: 120;
              filter: drop-shadow(0 0 8px rgba(0, 170, 255, 0.8));
            }
            100% {
              stroke-dashoffset: 0;
              filter: drop-shadow(0 0 3px rgba(0, 170, 255, 0.4));
            }
          }
        `}</style>
      </svg>
    </div>
  );
}

export default MorphingInfinity;
