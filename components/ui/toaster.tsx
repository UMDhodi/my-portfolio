"use client";

import { useToast } from "./use-toast";

export function Toaster() {
  const { toasts, toast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        maxWidth: "400px",
        width: "90%",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => {
        const isSuccess = t.variant === "success";
        const isError = t.variant === "destructive";

        return (
          <div
            key={t.id}
            style={{
              pointerEvents: "auto",
              background: "rgba(18, 18, 18, 0.95)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${
                isSuccess
                  ? "rgba(0, 170, 255, 0.4)"
                  : isError
                  ? "rgba(255, 68, 68, 0.4)"
                  : "rgba(255, 255, 255, 0.15)"
              }`,
              borderRadius: "10px",
              padding: "0.9rem 1.15rem",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
              color: "#ffffff",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.85rem",
              animation: "toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Icon */}
            <div style={{ flexShrink: 0, marginTop: "2px" }}>
              {isSuccess ? (
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "rgba(0, 170, 255, 0.15)",
                    border: "1px solid rgba(0, 170, 255, 0.5)",
                    color: "#00aaff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              ) : isError ? (
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "rgba(255, 68, 68, 0.15)",
                    border: "1px solid rgba(255, 68, 68, 0.5)",
                    color: "#ff4444",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
              ) : null}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: "600", color: "#ffffff" }}>{t.title}</h4>
              {t.description && (
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.65)", lineHeight: "1.4" }}>
                  {t.description}
                </p>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255, 255, 255, 0.4)",
                cursor: "pointer",
                padding: "2px",
                lineHeight: 1,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        );
      })}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes toastSlideIn {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `
      }} />
    </div>
  );
}
