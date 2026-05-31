"use client";

import { useEffect, useState } from "react";
import { getTimeline, saveTimelineItem, deleteTimelineItem } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

export default function TimelineManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  async function loadData() {
    setLoading(true);
    const data = await getTimeline();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await saveTimelineItem(formData);
    setEditingId(null);
    loadData();
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    await deleteTimelineItem(deleteId);
    setDeleteId(null);
    loadData();
    router.refresh();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "600", letterSpacing: "-0.02em" }}>Timeline Events</h1>
        <button 
          onClick={() => setEditingId("new")}
          style={{ padding: "0.5rem 1rem", background: "white", color: "black", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
        >
          + Add Event
        </button>
      </div>

      {editingId && (
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "1.5rem", borderRadius: "12px", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>{editingId === "new" ? "New Event" : "Edit Event"}</h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {editingId !== "new" && <input type="hidden" name="id" value={editingId} />}
            
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--c-muted)" }}>Year</label>
                <input type="text" name="year" required defaultValue={items.find(i => i.id === editingId)?.year} style={inputStyle} />
              </div>
              <div style={{ flex: 2 }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--c-muted)" }}>Title</label>
                <input type="text" name="title" required defaultValue={items.find(i => i.id === editingId)?.title} style={inputStyle} />
              </div>
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--c-muted)" }}>Description</label>
              <textarea name="desc" required defaultValue={items.find(i => i.id === editingId)?.desc} style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} />
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button type="submit" style={{ padding: "0.75rem 1.5rem", background: "white", color: "black", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>Save</button>
              <button type="button" onClick={() => setEditingId(null)} style={{ padding: "0.75rem 1.5rem", background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading timeline...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {items.map(item => (
            <div key={item.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "1.5rem", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontFamily: "var(--font-mono)", color: "#00aaff", fontSize: "0.9rem" }}>{item.year}</span>
                <h3 style={{ fontSize: "1.2rem", margin: "0.5rem 0" }}>{item.title}</h3>
                <p style={{ color: "var(--c-muted)", fontSize: "0.9rem", maxWidth: "600px", lineHeight: "1.6" }}>{item.desc}</p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => setEditingId(item.id)} style={actionBtnStyle}>Edit</button>
                <button onClick={() => setDeleteId(item.id)} style={{ ...actionBtnStyle, color: "#ff4444" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Delete Caution Modal */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#111", border: "1px solid rgba(255,68,68,0.3)", borderRadius: "12px", padding: "2rem", maxWidth: "400px", width: "90%", textAlign: "center", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ color: "#ff4444", marginBottom: "1rem" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
              </svg>
            </div>
            <h3 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem 0", color: "white" }}>Delete Event?</h3>
            <p style={{ color: "var(--c-muted)", fontSize: "0.95rem", marginBottom: "1.5rem", lineHeight: "1.5" }}>
              This action cannot be undone. The event will be permanently removed from your timeline.
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

const inputStyle = {
  width: "100%", padding: "0.75rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "white", outline: "none"
};

const actionBtnStyle = {
  padding: "0.5rem 1rem", background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem"
};
