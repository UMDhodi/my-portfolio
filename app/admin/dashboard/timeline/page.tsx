"use client";

import { useEffect, useState } from "react";
import { getTimeline, saveTimelineItem, deleteTimelineItem } from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import { MorphingInfinity } from "@/components/loading-ui/morphing-infinity";

export default function TimelineManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  function openNew() {
    setEditingItem({ year: "", title: "", desc: "" });
    setIsNew(true);
  }

  function openEdit(item: any) {
    setEditingItem({ ...item });
    setIsNew(false);
  }

  function closeForm() {
    setEditingItem(null);
    setIsNew(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    await saveTimelineItem(formData);
    setSaving(false);
    closeForm();
    await loadData();
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteTimelineItem(deleteId);
      setDeleteId(null);
      await loadData();
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", fontWeight: "600", letterSpacing: "-0.02em" }}>Timeline Events</h1>
        <button
          onClick={openNew}
          className="admin-btn-primary"
          style={{ padding: "0.5rem 1rem", background: "white", color: "black", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}
        >
          + Add Event
        </button>
      </div>

      {editingItem && (
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "1.5rem", borderRadius: "12px", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>{isNew ? "New Event" : "Edit Event"}</h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Pass MongoDB _id for edits */}
            {!isNew && editingItem._id && <input type="hidden" name="_id" value={editingItem._id} />}

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 100px", minWidth: "100px" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--c-muted)" }}>Year</label>
                <input
                  type="text"
                  name="year"
                  required
                  defaultValue={editingItem.year}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: "2 1 200px", minWidth: "200px" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--c-muted)" }}>Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingItem.title}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--c-muted)" }}>Description</label>
              <textarea
                name="desc"
                required
                defaultValue={editingItem.desc}
                style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
              <button
                type="submit"
                disabled={saving}
                className="admin-btn-primary"
                style={{ padding: "0.75rem 1.5rem", background: "white", color: "black", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", opacity: saving ? 0.7 : 1, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                {saving ? (
                  <>
                    <MorphingInfinity size={16} color="#000000" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save"
                )}
              </button>
              <button
                type="button"
                onClick={closeForm}
                style={{ padding: "0.75rem 1.5rem", background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 0", gap: "1rem" }}>
          <MorphingInfinity size={48} />
          <span style={{ color: "var(--c-muted)", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>Fetching timeline events...</span>
        </div>
      ) : items.length === 0 ? (
        <p style={{ color: "var(--c-muted)", textAlign: "center", padding: "3rem 0" }}>
          No timeline events yet. Click &quot;+ Add Event&quot; to create one.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {items.map((item) => (
            <div
              key={item._id}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                padding: "1.5rem",
                borderRadius: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: "200px" }}>
                <span style={{ fontFamily: "var(--font-mono)", color: "#00aaff", fontSize: "0.9rem" }}>{item.year}</span>
                <h3 style={{ fontSize: "1.2rem", margin: "0.5rem 0" }}>{item.title}</h3>
                <p style={{ color: "var(--c-muted)", fontSize: "0.9rem", maxWidth: "600px", lineHeight: "1.6" }}>{item.desc}</p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                <button onClick={() => openEdit(item)} style={actionBtnStyle}>Edit</button>
                <button onClick={() => setDeleteId(item._id)} style={{ ...actionBtnStyle, color: "#ff4444" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
              <button onClick={() => setDeleteId(null)} disabled={deleting} style={{ padding: "0.75rem 1.5rem", background: "rgba(255,255,255,0.1)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}>Cancel</button>
              <button onClick={confirmDelete} disabled={deleting} style={{ padding: "0.75rem 1.5rem", background: "#ff4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                {deleting ? (
                  <>
                    <MorphingInfinity size={16} color="#ffffff" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.75rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "white", outline: "none", fontSize: "1rem",
};

const actionBtnStyle: React.CSSProperties = {
  padding: "0.5rem 1rem", background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem",
};
