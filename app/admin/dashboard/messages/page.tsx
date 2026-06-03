"use client";

import { useEffect, useState } from "react";
import { getMessages, deleteMessage, markMessageRead, replyMessage } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

export default function MessagesManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState({ loading: false, success: false, error: "" });
  const router = useRouter();

  async function loadData() {
    setLoading(true);
    const data = await getMessages();
    setItems(data);
    if (data.length > 0 && !activeItem) {
      setActiveItem(data[0]);
    } else if (activeItem) {
      const updatedActive = data.find((i: any) => i._id === activeItem._id);
      if (updatedActive) setActiveItem(updatedActive);
      else setActiveItem(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSelect(item: any) {
    setActiveItem(item);
    setReplyText("");
    setReplyStatus({ loading: false, success: false, error: "" });
    if (!item.read) {
      await markMessageRead(item._id);
      // Optimistically update local state
      setItems(prev => prev.map(i => i._id === item._id ? { ...i, read: true } : i));
      item.read = true;
    }
  }

  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await deleteMessage(deleteId);
      loadData();
      router.refresh();
      if (activeItem?._id === deleteId) setActiveItem(null);
      setDeleteId(null);
    } catch (err) {
      console.error(err);
    }
  }

  function getHtmlTemplate(name: string, customText: string) {
    const paragraphs = customText.split('\n').map(p => '<p style="font-size:15px;color:#b0bec5;line-height:1.8;margin:0 0 14px;">' + p + '</p>').join('');
    return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:20px 0;background:#050505;">

<div style="font-family:'Courier New',Courier,monospace;max-width:580px;margin:0 auto;background:#0d1117;color:#e2e8f0;border-radius:14px;overflow:hidden;border:1px solid #1e2a3a;">

  <div style="padding:32px 36px 24px;border-bottom:1px solid #1e2a3a;">
    <p style="margin:0;font-size:22px;font-weight:700;color:#e2e8f0;letter-spacing:0.5px;">
      Mayank Dhodi
    </p>
  </div>

  <div style="padding:32px 36px 12px;">

    <p style="font-size:15px;margin:0 0 20px;color:#e2e8f0;">
      Hi ${name},
    </p>

    ${paragraphs}

    <div style="margin:32px 0 20px;border-top:1px solid #1e2a3a;"></div>

    <p style="font-size:13px;color:#64748b;margin:0 0 8px;">
      Best regards,
    </p>

    <p style="font-size:16px;font-weight:600;color:#e2e8f0;margin:0 0 28px;">
      Mayank Dhodi
    </p>

    <div style="margin-top:10px;border-radius:12px;overflow:hidden;background:#08111c;">
      <svg viewBox="0 0 600 120" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:90px;">
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0077ff"/>
            <stop offset="50%" stop-color="#00aaff"/>
            <stop offset="100%" stop-color="#33ccff"/>
          </linearGradient>
        </defs>
        <path d="M0,70 C120,20 220,110 340,65 C440,28 520,48 600,30 L600,120 L0,120 Z" fill="rgba(0,170,255,0.08)"/>
        <path d="M0,70 C120,20 220,110 340,65 C440,28 520,48 600,30" stroke="url(#waveGradient)" stroke-width="2.5" fill="none" opacity="0.95"/>
        <path d="M0,88 C140,50 240,125 360,82 C460,48 530,68 600,55" stroke="rgba(255,255,255,0.18)" stroke-width="1" fill="none"/>
      </svg>
    </div>

  </div>

</div>

</body>
</html>`;
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!activeItem) return;
    
    setReplyStatus({ loading: true, success: false, error: "" });
    const htmlContent = getHtmlTemplate(activeItem.name || "there", replyText);
    
    try {
      const res = await replyMessage(activeItem.email, "Reply from MK.", htmlContent);
      if (res.success) {
        setReplyStatus({ loading: false, success: true, error: "" });
        setReplyText("");
      } else {
        setReplyStatus({ loading: false, success: false, error: res.error || "Failed to send" });
      }
    } catch (err: any) {
      setReplyStatus({ loading: false, success: false, error: err.message });
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 6rem)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "600", letterSpacing: "-0.02em" }}>Messages</h1>
      </div>

      <div style={{ display: "flex", gap: "2rem", flex: 1, overflow: "hidden" }}>
        {/* Left Pane: Message List */}
        <div style={{ width: "320px", display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: "0.9rem", color: "var(--c-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Inbox</h3>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <p style={{ padding: "1rem", color: "var(--c-muted)" }}>Loading...</p>
            ) : items.length === 0 ? (
              <p style={{ padding: "1rem", color: "var(--c-muted)" }}>No messages.</p>
            ) : (
              items.map((item) => (
                <div 
                  key={item._id} 
                  onClick={() => handleSelect(item)}
                  style={{ 
                    padding: "1rem", 
                    borderBottom: "1px solid rgba(255,255,255,0.05)", 
                    cursor: "pointer",
                    background: activeItem?._id === item._id ? "rgba(255,255,255,0.05)" : "transparent",
                    transition: "background 0.2s",
                    borderLeft: !item.read ? "3px solid #00aaff" : "3px solid transparent"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                    <strong style={{ fontSize: "0.95rem", color: !item.read ? "white" : "#e0e0e0" }}>{item.name || item.email.split("@")[0]}</strong>
                    <span style={{ fontSize: "0.75rem", color: "var(--c-muted)" }}>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--c-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.message}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Pane: Message Details & Reply */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", overflow: "hidden" }}>
          {activeItem ? (
            <>
              {/* Header */}
              <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ fontSize: "1.2rem", margin: "0 0 0.25rem 0" }}>{activeItem.name || "Anonymous"}</h2>
                  <a href={`mailto:${activeItem.email}`} style={{ color: "#00aaff", fontSize: "0.9rem", textDecoration: "none" }}>{activeItem.email}</a>
                  <div style={{ fontSize: "0.8rem", color: "var(--c-muted)", marginTop: "0.5rem" }}>
                    Source: {activeItem.source || "Portfolio"} • Service: {activeItem.service || "None"} • {new Date(activeItem.createdAt).toLocaleString()}
                  </div>
                </div>
                <button 
                  onClick={() => setDeleteId(activeItem._id)} 
                  style={{ padding: "0.5rem 1rem", background: "rgba(255,68,68,0.1)", color: "#ff4444", border: "1px solid rgba(255,68,68,0.2)", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", transition: "background 0.2s" }}
                >
                  Delete
                </button>
              </div>
              
              {/* Message Body */}
              <div style={{ padding: "1.5rem", flex: 1, overflowY: "auto", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "1.5rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", whiteSpace: "pre-wrap", lineHeight: "1.6", color: "#f0f0f0" }}>
                  {activeItem.message}
                </div>
                
                {/* Reply UI */}
                <div style={{ marginTop: "2rem" }}>
                  <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Reply to Message</h3>
                  <form onSubmit={handleReply}>
                    <textarea 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your reply here... (Will be formatted in the Niora Star HTML template)"
                      required
                      style={{ 
                        width: "100%", 
                        height: "150px", 
                        padding: "1rem", 
                        background: "rgba(0,0,0,0.3)", 
                        border: "1px solid rgba(255,255,255,0.1)", 
                        borderRadius: "8px", 
                        color: "white", 
                        fontFamily: "inherit",
                        resize: "vertical",
                        marginBottom: "1rem"
                      }}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <button 
                        type="submit" 
                        disabled={replyStatus.loading || !replyText.trim()}
                        className="admin-btn-primary"
                        style={{ 
                          padding: "0.75rem 1.5rem", 
                          background: replyStatus.loading ? "rgba(255,255,255,0.1)" : "#fff", 
                          color: replyStatus.loading ? "white" : "black", 
                          border: "none", 
                          borderRadius: "6px", 
                          cursor: replyStatus.loading || !replyText.trim() ? "not-allowed" : "pointer", 
                          fontWeight: "500",
                          transition: "opacity 0.2s"
                        }}
                      >
                        {replyStatus.loading ? "Sending..." : "Send Reply"}
                      </button>
                      
                      {replyStatus.success && <span style={{ color: "#44ff44", fontSize: "0.9rem" }}>✓ Reply sent successfully!</span>}
                      {replyStatus.error && <span style={{ color: "#ff4444", fontSize: "0.9rem" }}>Failed to send: {replyStatus.error}. Check SMTP env vars.</span>}
                    </div>
                  </form>
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--c-muted)" }}>
              Select a message to view
            </div>
          )}
        </div>
      </div>

      {/* Delete Caution Modal */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#111", border: "1px solid rgba(255,68,68,0.3)", borderRadius: "12px", padding: "2rem", maxWidth: "400px", width: "90%", textAlign: "center", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ color: "#ff4444", marginBottom: "1rem" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
              </svg>
            </div>
            <h3 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem 0", color: "white" }}>Delete Message?</h3>
            <p style={{ color: "var(--c-muted)", fontSize: "0.95rem", marginBottom: "1.5rem", lineHeight: "1.5" }}>
              This action cannot be undone. The message will be permanently removed from your dashboard.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: "0.75rem 1.5rem", background: "rgba(255,255,255,0.1)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}>Cancel</button>
              <button onClick={confirmDelete} style={{ padding: "0.75rem 1.5rem", background: "#ff4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
