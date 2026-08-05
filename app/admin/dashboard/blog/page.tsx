"use client";

import { useEffect, useState, useRef } from "react";
import { getBlogPosts, saveBlogPost, deleteBlogPost } from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import { MorphingInfinity } from "@/components/loading-ui/morphing-infinity";
import { toast } from "@/components/ui/use-toast";

interface BlogPost {
  _id: string;
  title: string;
  date: string;
  tag: string;
  stack: string;
  excerpt: string;
  slug?: string;
  link?: string;
  published?: boolean;
}

export default function BlogManager() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  // Search, Filter, Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [sortAsc, setSortAsc] = useState(false);

  // Rich Text Editor Content State
  const editorRef = useRef<HTMLDivElement>(null);
  const [excerptHtml, setExcerptHtml] = useState("");

  const router = useRouter();

  async function loadData() {
    setLoading(true);
    const data = await getBlogPosts();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const selectedItem = selectedId === "new" ? {} as BlogPost : items.find(i => i._id === selectedId);

  useEffect(() => {
    setFormError("");
    if (selectedItem?.excerpt) {
      setExcerptHtml(selectedItem.excerpt);
      if (editorRef.current) {
        editorRef.current.innerHTML = selectedItem.excerpt;
      }
    } else {
      setExcerptHtml("");
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    }
  }, [selectedId, isEditing]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    // Grab rich text content from editor if present
    let content = "";
    if (editorRef.current) {
      content = editorRef.current.innerHTML;
    } else {
      content = excerptHtml;
    }

    const plainText = content.replace(/<[^>]*>/g, "").trim();
    if (!content.trim() || !plainText) {
      setFormError("Please provide content / excerpt for the blog post.");
      setSubmitting(false);
      return;
    }

    formData.set("excerpt", content);

    try {
      const res = await saveBlogPost(formData);
      if (res?.success) {
        setIsEditing(false);
        setIsNew(false);
        toast.success("Blog post uploaded successfully!", "Your blog post has been saved to the database.");
        await loadData();
        router.refresh();
      } else {
        setFormError(res?.error || "Failed to save blog post.");
        toast.error("Upload failed", res?.error || "Failed to save blog post.");
      }
    } catch (err: any) {
      console.error("Failed to save blog post:", err);
      setFormError(err.message || "Failed to save blog post.");
      toast.error("Upload error", err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteBlogPost(deleteId);
      setSelectedId(null);
      setIsEditing(false);
      setDeleteId(null);
      toast.success("Blog post deleted successfully.");
      await loadData();
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed.");
    } finally {
      setDeleting(false);
    }
  }

  const handleCreateNew = () => {
    setFormError("");
    setSelectedId("new");
    setIsNew(true);
    setIsEditing(true);
    setExcerptHtml("");
    if (editorRef.current) editorRef.current.innerHTML = "";
  };

  const handleSelectItem = (id: string) => {
    setFormError("");
    setSelectedId(id);
    setIsNew(false);
    setIsEditing(false);
  };

  const handleDiscard = () => {
    setFormError("");
    if (isNew) {
      setSelectedId(null);
      setIsNew(false);
    }
    setIsEditing(false);
  };

  // Rich Text Editor Commands
  const formatDoc = (cmd: string, value: string | undefined = undefined) => {
    document.execCommand(cmd, false, value);
    if (editorRef.current) {
      setExcerptHtml(editorRef.current.innerHTML);
    }
  };

  const handleQuote = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    try {
      document.execCommand("formatBlock", false, "blockquote");
    } catch {
      document.execCommand("formatBlock", false, "BLOCKQUOTE");
    }
    if (editorRef.current) {
      setExcerptHtml(editorRef.current.innerHTML);
    }
  };

  const handleClear = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
      setExcerptHtml("");
      editorRef.current.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    if (editorRef.current) {
      setExcerptHtml(editorRef.current.innerHTML);
    }
  };

  const filteredItems = items
    .filter(item =>
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.excerpt && item.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.tag && item.tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(item => (filterTag ? item.tag === filterTag : true))
    .sort((a, b) => {
      if (sortAsc) return (a.date || "").localeCompare(b.date || "");
      return (b.date || "").localeCompare(a.date || "");
    });

  const uniqueTags = Array.from(new Set(items.map(i => i.tag).filter(Boolean)));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 6rem)", gap: "1rem" }}>
      
      {/* Top Bar: Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "1rem 1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "600", letterSpacing: "-0.02em", margin: 0 }}>Blog Posts</h1>
        
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <input 
            type="text" 
            placeholder="Search posts or tags..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            style={{ ...inputStyle, width: "250px", padding: "0.5rem 1rem" }}
          />
          
          <select 
            value={filterTag} 
            onChange={(e) => setFilterTag(e.target.value)}
            style={{ ...inputStyle, padding: "0.5rem", width: "auto" }}
          >
            <option value="">All Topics</option>
            {uniqueTags.map((tag, idx) => (
              <option key={idx} value={tag}>{tag}</option>
            ))}
          </select>

          <button 
            onClick={() => setSortAsc(!sortAsc)} 
            style={actionBtnStyle}
          >
            Sort Date {sortAsc ? "↑" : "↓"}
          </button>

          <button 
            onClick={handleCreateNew}
            className="admin-btn-primary"
            style={{ padding: "0.5rem 1rem", background: "white", color: "black", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
          >
            + New Post
          </button>
        </div>
      </div>

      {/* Main Split Pane Layout */}
      <div style={{ display: "flex", gap: "1.5rem", flex: 1, minHeight: 0 }}>
        
        {/* Left Pane: List */}
        <div style={{ flex: "0 0 350px", display: "flex", flexDirection: "column", gap: "0.5rem", overflowY: "auto", paddingRight: "0.5rem" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 1rem", gap: "1rem" }}>
              <MorphingInfinity size={48} />
              <span style={{ color: "var(--c-muted)", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>Fetching posts...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <p style={{ color: "var(--c-muted)", textAlign: "center", marginTop: "2rem" }}>No blog posts found.</p>
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
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                  <h3 style={{ fontSize: "1rem", margin: 0, fontWeight: "600", color: "#f0f0f0" }}>{item.title}</h3>
                  <span style={{ fontSize: "0.72rem", color: "#00aaff", background: "rgba(0,170,255,0.1)", padding: "2px 8px", borderRadius: "12px", border: "1px solid rgba(0,170,255,0.2)" }}>{item.tag}</span>
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--c-muted)", margin: "0 0 0.5rem 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {item.excerpt?.replace(/<[^>]*>?/gm, '')}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "rgba(240,240,240,0.35)", fontFamily: "var(--font-mono)" }}>
                  <span>{item.date}</span>
                  <span>{item.stack || "General"}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Pane: Details / Form */}
        <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "2rem", overflowY: "auto" }}>
          {!selectedId ? (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-muted)" }}>
              <p>Select a blog post to view or edit details, or create a new post.</p>
            </div>
          ) : (
            <>
              {/* Right Pane Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem" }}>
                <h2 style={{ fontSize: "1.25rem", margin: 0 }}>{isNew ? "Create New Blog Post" : "Blog Post Details"}</h2>
                <div style={{ display: "flex", gap: "0.5rem" }}>
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
                      form="blogForm" 
                      type="submit" 
                      disabled={submitting}
                      className="admin-btn-primary" 
                      style={{ 
                        ...actionBtnStyle, 
                        background: "#00aaff", 
                        color: "white", 
                        borderColor: "#00aaff", 
                        fontWeight: "600",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem"
                      }}
                    >
                      {submitting ? (
                        <>
                          <MorphingInfinity size={16} color="#ffffff" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        "Save Post"
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Form / Detail View */}
              <form id="blogForm" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingBottom: "2rem" }}>
                {!isNew && <input type="hidden" name="_id" value={selectedItem?._id} />}
                <input type="hidden" name="excerpt" value={excerptHtml} />

                {formError && (
                  <div style={{ color: "#ff4444", background: "rgba(255,68,68,0.1)", padding: "0.75rem 1rem", borderRadius: "6px", border: "1px solid rgba(255,68,68,0.2)", fontSize: "0.9rem" }}>
                    ⚠️ {formError}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
                  <div>
                    <label style={labelStyle}>Title *</label>
                    {isEditing ? <input type="text" name="title" required defaultValue={selectedItem?.title} style={inputStyle} placeholder="Post Title" /> : <p style={detailTextStyle}>{selectedItem?.title}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Tag / Topic *</label>
                    {isEditing ? <input type="text" name="tag" required defaultValue={selectedItem?.tag || "Tech"} style={inputStyle} placeholder="e.g. AI, Web Dev, Vibe Coding" /> : <p style={detailTextStyle}>{selectedItem?.tag}</p>}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                  <div>
                    <label style={labelStyle}>Date *</label>
                    {isEditing ? <input type="text" name="date" required defaultValue={selectedItem?.date || new Date().toISOString().split("T")[0]} style={inputStyle} placeholder="YYYY-MM-DD" /> : <p style={detailTextStyle}>{selectedItem?.date}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Tech Stack</label>
                    {isEditing ? <input type="text" name="stack" defaultValue={selectedItem?.stack} style={inputStyle} placeholder="e.g. Next.js · TypeScript" /> : <p style={detailTextStyle}>{selectedItem?.stack || "-"}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Status</label>
                    {isEditing ? (
                      <select name="published" defaultValue={selectedItem?.published !== false ? "true" : "false"} style={inputStyle}>
                        <option value="true">Published</option>
                        <option value="false">Draft</option>
                      </select>
                    ) : (
                      <p style={detailTextStyle}>{selectedItem?.published !== false ? "Published" : "Draft"}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>External Article Link (Optional)</label>
                  {isEditing ? <input type="url" name="link" defaultValue={selectedItem?.link} style={inputStyle} placeholder="https://medium.com/... or https://github.com/..." /> : <a href={selectedItem?.link} target="_blank" rel="noreferrer" style={{...detailTextStyle, color: "#00aaff", textDecoration: "none", display: "inline-block"}}>{selectedItem?.link || "-"}</a>}
                </div>

                {/* Rich Text Editor for Content / Excerpt */}
                <div>
                  <label style={labelStyle}>Blog Content / Excerpt (Rich Text Supported) *</label>
                  {isEditing ? (
                    <div style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", overflow: "hidden", background: "rgba(0,0,0,0.6)" }}>
                      {/* Rich Text Toolbar */}
                      <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", padding: "0.5rem 0.75rem", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <button type="button" onClick={() => formatDoc("bold")} title="Bold" style={toolbarBtnStyle}><b>B</b></button>
                        <button type="button" onClick={() => formatDoc("italic")} title="Italic" style={toolbarBtnStyle}><i>I</i></button>
                        <button type="button" onClick={() => formatDoc("underline")} title="Underline" style={toolbarBtnStyle}><u>U</u></button>
                        <button type="button" onClick={() => formatDoc("strikeThrough")} title="Strikethrough" style={toolbarBtnStyle}><s>S</s></button>
                        <span style={dividerStyle} />
                        <button type="button" onClick={() => formatDoc("formatBlock", "<h2>")} title="Heading 2" style={toolbarBtnStyle}>H2</button>
                        <button type="button" onClick={() => formatDoc("formatBlock", "<h3>")} title="Heading 3" style={toolbarBtnStyle}>H3</button>
                        <button type="button" onClick={() => formatDoc("formatBlock", "<p>")} title="Paragraph" style={toolbarBtnStyle}>P</button>
                        <span style={dividerStyle} />
                        <button type="button" onClick={() => formatDoc("insertUnorderedList")} title="Bullet List" style={toolbarBtnStyle}>• List</button>
                        <button type="button" onClick={() => formatDoc("insertOrderedList")} title="Numbered List" style={toolbarBtnStyle}>1. List</button>
                        <button type="button" onClick={handleQuote} title="Quote" style={toolbarBtnStyle}>&quot; Quote</button>
                        <button type="button" onClick={() => formatDoc("insertHorizontalRule")} title="Divider Line" style={toolbarBtnStyle}>― Line</button>
                        <span style={dividerStyle} />
                        <button type="button" onClick={handleClear} title="Clear All Content" style={{ ...toolbarBtnStyle, color: "#ff8888" }}>Clear</button>
                      </div>
                      
                      {/* Content Editable Body */}
                      <div 
                        ref={editorRef}
                        contentEditable
                        className="blog-editor-content"
                        onInput={() => {
                          if (editorRef.current) setExcerptHtml(editorRef.current.innerHTML);
                        }}
                        onPaste={handlePaste}
                        style={{
                          minHeight: "180px",
                          maxHeight: "350px",
                          overflowY: "auto",
                          padding: "1rem 1.25rem",
                          outline: "none",
                          fontSize: "0.95rem",
                          lineHeight: "1.6"
                        }}
                      />
                    </div>
                  ) : (
                    <div 
                      className="blog-editor-content"
                      dangerouslySetInnerHTML={{ __html: selectedItem?.excerpt || "-" }}
                      style={{
                        ...detailTextStyle,
                        background: "rgba(0,0,0,0.3)",
                        padding: "1rem 1.25rem",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.05)",
                        lineHeight: "1.6"
                      }}
                    />
                  )}
                </div>

              </form>
            </>
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
            <h3 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem 0", color: "white" }}>Delete Blog Post?</h3>
            <p style={{ color: "var(--c-muted)", fontSize: "0.95rem", marginBottom: "1.5rem", lineHeight: "1.5" }}>
              This action cannot be undone. The blog post will be permanently removed from your database and site.
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

const inputStyle = {
  width: "100%", padding: "0.75rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "white", outline: "none", fontFamily: "inherit"
};

const actionBtnStyle = {
  padding: "0.5rem 1rem", background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem"
};

const labelStyle = {
  display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--c-muted)", fontWeight: "500"
};

const detailTextStyle = {
  fontSize: "1rem", margin: 0, padding: "0.75rem 0"
};

const toolbarBtnStyle = {
  padding: "0.3rem 0.6rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "4px", color: "white", cursor: "pointer", fontSize: "0.78rem"
};

const dividerStyle = {
  width: "1px", height: "20px", background: "rgba(255,255,255,0.15)", alignSelf: "center", margin: "0 2px"
};
