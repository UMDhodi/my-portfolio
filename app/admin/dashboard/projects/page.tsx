"use client";

import { useEffect, useState } from "react";
import { getProjects, saveProject, deleteProject } from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import { MorphingInfinity } from "@/components/loading-ui/morphing-infinity";
import { toast } from "@/components/ui/use-toast";

interface ProjectItem {
  _id: string;
  title: string;
  description: string;
  image?: string;
  tags?: string;
  demoLink?: string;
  githubLink?: string;
  category?: string;
  date?: string;
  featured?: boolean;
}

export default function ProjectsManager() {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");

  const router = useRouter();

  async function loadData() {
    setLoading(true);
    const data = await getProjects();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await saveProject(formData);
      if (res && !res.success) {
        toast.error("Upload failed", res.error || "Failed to save project.");
        return;
      }
      setIsEditing(false);
      setIsNew(false);
      toast.success("Project saved successfully!", "Project details uploaded to database.");
      await loadData();
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error("Upload failed", err.message || "Failed to save project.");
    } finally {
      setSubmitting(false);
    }
  }

  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteProject(deleteId);
      setSelectedId(null);
      setIsEditing(false);
      setDeleteId(null);
      toast.success("Project deleted", "The project has been removed.");
      await loadData();
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error("Delete failed", "Could not delete project.");
    } finally {
      setDeleting(false);
    }
  }

  function handleSelectItem(id: string) {
    setSelectedId(id);
    setIsNew(false);
    setIsEditing(false);
    const item = items.find((i) => i._id === id);
    setImagePreview(item?.image || null);
  }

  function handleAddNew() {
    setSelectedId("new");
    setIsNew(true);
    setIsEditing(true);
    setImagePreview(null);
  }

  function handleDiscard() {
    if (isNew) {
      setSelectedId(null);
      setIsNew(false);
      setIsEditing(false);
      setImagePreview(null);
    } else {
      setIsEditing(false);
      const item = items.find((i) => i._id === selectedId);
      setImagePreview(item?.image || null);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  const selectedItem = items.find((i) => i._id === selectedId);

  // Filter and Sort logic
  const filteredItems = items
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.tags && item.tags.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        !filterCategory || (item.category || "Web").toLowerCase() === filterCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date || a._id).getTime();
      const dateB = new Date(b.date || b._id).getTime();
      return sortAsc ? dateA - dateB : dateB - dateA;
    });

  const categories = Array.from(new Set(items.map((i) => i.category || "Web"))).filter(Boolean);

  const actionBtnStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    fontSize: "0.85rem",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    cursor: "pointer",
    transition: "all 0.2s ease"
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.8rem",
    color: "rgba(255,255,255,0.6)",
    marginBottom: "0.4rem",
    fontFamily: "var(--font-sans, sans-serif)"
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(0,0,0,0.5)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "6px",
    padding: "0.65rem 0.85rem",
    color: "white",
    fontSize: "0.875rem",
    boxSizing: "border-box",
    outline: "none"
  };

  const detailTextStyle: React.CSSProperties = {
    fontSize: "0.95rem",
    color: "rgba(255,255,255,0.9)",
    margin: 0
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 6rem)", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "600", letterSpacing: "-0.02em", margin: 0 }}>Projects</h1>
          <p style={{ color: "var(--c-muted, rgba(255,255,255,0.5))", fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>Manage showcase web applications and creations</p>
        </div>
        <button type="button" onClick={handleAddNew} className="admin-btn-primary" style={{ ...actionBtnStyle, background: "#00aaff", color: "black", borderColor: "#00aaff", fontWeight: "600" }}>
          + Add New
        </button>
      </div>

      {/* Controls Bar: Search & Filter */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ ...inputStyle, width: "300px" }}
        />
        {categories.length > 0 && (
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ ...inputStyle, width: "180px", cursor: "pointer" }}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <button
          type="button"
          onClick={() => setSortAsc(!sortAsc)}
          style={{ ...actionBtnStyle, marginLeft: "auto" }}
        >
          Sort: {sortAsc ? "Oldest First" : "Newest First"}
        </button>
      </div>

      {/* Split Pane Layout */}
      <div style={{ display: "flex", gap: "1.5rem", flex: 1, minHeight: 0 }}>
        
        {/* Left Pane: List */}
        <div style={{ flex: "0 0 360px", display: "flex", flexDirection: "column", gap: "0.5rem", overflowY: "auto", paddingRight: "0.5rem" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 1rem", gap: "1rem" }}>
              <MorphingInfinity size={48} color="#00aaff" />
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>Fetching projects...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: "2rem" }}>No projects found.</p>
          ) : (
            filteredItems.map(item => (
              <div 
                key={item._id} 
                onClick={() => handleSelectItem(item._id)}
                style={{ 
                  background: selectedId === item._id ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)", 
                  border: `1px solid ${selectedId === item._id ? "rgba(0,170,255,0.4)" : "rgba(255,255,255,0.05)"}`, 
                  padding: "1rem", 
                  borderRadius: "8px", 
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  gap: "0.85rem",
                  alignItems: "center"
                }}
              >
                {item.image ? (
                  <img src={item.image} alt={item.title} style={{ width: "48px", height: "36px", objectFit: "cover", borderRadius: "4px", flexShrink: 0, border: "1px solid rgba(255,255,255,0.1)" }} />
                ) : (
                  <div style={{ width: "48px", height: "36px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", flexShrink: 0, display: "grid", placeItems: "center", fontSize: "0.8rem" }}>💻</div>
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem" }}>
                    <h3 style={{ fontSize: "0.95rem", margin: 0, fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</h3>
                    <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{item.date}</span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", margin: "0.2rem 0 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.category || "Web"} {item.tags ? `• ${item.tags}` : ""}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Pane: Details / Form (Matches Screenshot 1 UI) */}
        <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "2rem", overflowY: "auto" }}>
          {!selectedId ? (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)" }}>
              <p>Select a project to view details, or click "+ Add New" to create one.</p>
            </div>
          ) : (
            <>
              {/* Header Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem" }}>
                <h2 style={{ fontSize: "1.35rem", margin: 0, fontWeight: "700" }}>{isNew ? "Create New Project" : "Project Details"}</h2>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  {isEditing ? (
                    <button type="button" onClick={handleDiscard} style={{ ...actionBtnStyle, background: "rgba(255,255,255,0.1)" }}>Discard</button>
                  ) : (
                    <>
                      <button type="button" onClick={() => setIsEditing(true)} style={actionBtnStyle}>Edit</button>
                      {selectedItem?._id && (
                        <button type="button" onClick={() => setDeleteId(selectedItem._id)} style={{ ...actionBtnStyle, background: "rgba(255,68,68,0.1)", color: "#ff4444", border: "1px solid rgba(255,68,68,0.2)" }}>Delete</button>
                      )}
                    </>
                  )}
                  {isEditing && (
                    <button 
                      form="projectForm" 
                      type="submit" 
                      disabled={submitting}
                      style={{ 
                        ...actionBtnStyle, 
                        background: "#00aaff", 
                        color: "black", 
                        borderColor: "#00aaff", 
                        fontWeight: "700",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem"
                      }}
                    >
                      {submitting ? (
                        <>
                          <MorphingInfinity size={16} color="#000000" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        "Save"
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Form matching Screenshot 1 Layout */}
              <form id="projectForm" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingBottom: "2rem" }}>
                {!isNew && <input type="hidden" name="_id" value={selectedItem?._id} />}
                <input type="hidden" name="image" value={selectedItem?.image || ""} />
                
                {/* Big Image Upload Box matching Screenshot 1 */}
                <div style={{ width: "100%", height: "220px", minHeight: "220px", background: "rgba(0,0,0,0.6)", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "8px", overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {(imagePreview || selectedItem?.image) ? (
                    <img src={imagePreview || selectedItem?.image} alt="Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.9rem" }}>No Banner Uploaded</span>
                  )}
                  {isEditing && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", opacity: (imagePreview || selectedItem?.image) ? 0 : 1, transition: "opacity 0.2s", cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.opacity = "1"} onMouseLeave={(e) => { if (imagePreview || selectedItem?.image) e.currentTarget.style.opacity = "0" }}>
                      <label style={{ cursor: "pointer", background: "white", color: "black", padding: "0.6rem 1.25rem", borderRadius: "8px", fontWeight: "700", fontSize: "0.9rem", border: "1px solid rgba(0,0,0,0.1)" }}>
                        Upload Image
                        <input type="file" name="imageFile" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                      </label>
                    </div>
                  )}
                </div>

                {/* Title & Category */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                  <div>
                    <label style={labelStyle}>Title *</label>
                    {isEditing ? <input type="text" name="title" required defaultValue={selectedItem?.title} style={inputStyle} placeholder="e.g. Next.js E-Commerce Platform" /> : <p style={detailTextStyle}>{selectedItem?.title}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Category</label>
                    {isEditing ? <input type="text" name="category" defaultValue={selectedItem?.category || "Web"} style={inputStyle} placeholder="e.g. Fullstack, AI, Mobile" /> : <p style={detailTextStyle}>{selectedItem?.category || "Web"}</p>}
                  </div>
                </div>

                {/* Date | Tech Stack | Deploy Link */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.2fr", gap: "1.5rem" }}>
                  <div>
                    <label style={labelStyle}>Date *</label>
                    {isEditing ? <input type="text" name="date" required defaultValue={selectedItem?.date || new Date().toISOString().split("T")[0]} style={inputStyle} placeholder="e.g. 2026 or Aug 2026" /> : <p style={detailTextStyle}>{selectedItem?.date}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Tech Stack / Tags</label>
                    {isEditing ? <input type="text" name="tags" defaultValue={selectedItem?.tags} style={inputStyle} placeholder="React, Next.js, Tailwind" /> : <p style={detailTextStyle}>{selectedItem?.tags || "-"}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Live Deploy / Demo Link</label>
                    {isEditing ? <input type="url" name="demoLink" defaultValue={selectedItem?.demoLink} style={inputStyle} placeholder="https://my-app.vercel.app" /> : <a href={selectedItem?.demoLink} target="_blank" rel="noreferrer" style={{...detailTextStyle, color: "#00aaff", textDecoration: "none", display: "inline-block"}}>{selectedItem?.demoLink || "-"}</a>}
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label style={labelStyle}>Short Description *</label>
                  {isEditing ? (
                    <textarea name="description" required rows={3} defaultValue={selectedItem?.description} style={{ ...inputStyle, resize: "vertical" }} placeholder="Brief summary of what the project does and key features..." />
                  ) : (
                    <p style={{ ...detailTextStyle, lineHeight: 1.6 }}>{selectedItem?.description}</p>
                  )}
                </div>

                {/* GitHub Link & Featured Checkbox */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "center" }}>
                  <div>
                    <label style={labelStyle}>GitHub Repository Link</label>
                    {isEditing ? <input type="url" name="githubLink" defaultValue={selectedItem?.githubLink} style={inputStyle} placeholder="https://github.com/..." /> : <a href={selectedItem?.githubLink} target="_blank" rel="noreferrer" style={{...detailTextStyle, color: "#00aaff", textDecoration: "none", display: "inline-block"}}>{selectedItem?.githubLink || "-"}</a>}
                  </div>
                  <div style={{ paddingTop: isEditing ? "1.25rem" : "0" }}>
                    {isEditing ? (
                      <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>
                        <input type="checkbox" name="featured" defaultChecked={selectedItem?.featured !== false} style={{ cursor: "pointer" }} />
                        <span>Feature in Home Page Preview</span>
                      </label>
                    ) : (
                      <p style={detailTextStyle}>Featured: {selectedItem?.featured !== false ? "Yes" : "No"}</p>
                    )}
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 9999, display: "grid", placeItems: "center", padding: "1rem" }}>
          <div style={{ background: "#111", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", padding: "1.5rem", maxWidth: "400px", width: "100%" }}>
            <h3 style={{ fontSize: "1.1rem", margin: "0 0 0.5rem 0", color: "white" }}>Delete Project?</h3>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                style={{ ...actionBtnStyle, background: "rgba(255,255,255,0.1)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                style={{
                  ...actionBtnStyle,
                  background: "#ff4d4d",
                  color: "white",
                  borderColor: "#ff4d4d",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                {deleting ? (
                  <>
                    <MorphingInfinity size={16} color="#ffffff" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
