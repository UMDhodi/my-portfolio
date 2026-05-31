"use client";

import { useEffect, useState } from "react";
import { getCertifications, saveCertification, deleteCertification } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

interface Cert {
  _id: string;
  id?: string;
  title: string;
  issuer: string;
  date: string;
  credId?: string;
  image?: string;
  link?: string;
}

export default function CertificationsManager() {
  const [items, setItems] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Search and Sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(false); // false = newest first
  const [filterIssuer, setFilterIssuer] = useState("");

  const router = useRouter();

  async function loadData() {
    setLoading(true);
    const data = await getCertifications();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await saveCertification(formData);
    setIsEditing(false);
    setIsNew(false);
    loadData();
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    await deleteCertification(deleteId);
    setSelectedId(null);
    setIsEditing(false);
    setDeleteId(null);
    loadData();
    router.refresh();
  }

  const handleCreateNew = () => {
    setSelectedId("new");
    setIsNew(true);
    setIsEditing(true);
    setImagePreview(null);
  };

  const handleSelectItem = (id: string) => {
    setSelectedId(id);
    setIsNew(false);
    setIsEditing(false);
    setImagePreview(null);
  };

  const handleDiscard = () => {
    if (isNew) {
      setSelectedId(null);
      setIsNew(false);
    }
    setIsEditing(false);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  // Derived state for filtered/sorted items
  const filteredItems = items
    .filter(item => 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.issuer?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(item => filterIssuer ? item.issuer === filterIssuer : true)
    .sort((a, b) => {
      // Basic string comparison for dates, assuming YYYY or similar formats
      if (sortAsc) return a.date.localeCompare(b.date);
      return b.date.localeCompare(a.date);
    });

  const uniqueIssuers = Array.from(new Set(items.map(i => i.issuer).filter(Boolean)));
  const selectedItem = selectedId === "new" ? {} as Cert : items.find(i => i._id === selectedId);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 6rem)", gap: "1rem" }}>
      
      {/* Top Bar: Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "1rem 1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "600", letterSpacing: "-0.02em", margin: 0 }}>Certifications</h1>
        
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <input 
            type="text" 
            placeholder="Search by title or issuer..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ ...inputStyle, width: "250px", padding: "0.5rem 1rem" }}
          />
          
          <select 
            value={filterIssuer} 
            onChange={(e) => setFilterIssuer(e.target.value)}
            style={{ ...inputStyle, padding: "0.5rem", width: "auto" }}
          >
            <option value="">All Issuers</option>
            {uniqueIssuers.map((issuer, idx) => (
              <option key={idx} value={issuer}>{issuer}</option>
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
            style={{ padding: "0.5rem 1rem", background: "white", color: "black", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
          >
            + New
          </button>
        </div>
      </div>

      {/* Main Split Pane Layout */}
      <div style={{ display: "flex", gap: "1.5rem", flex: 1, minHeight: 0 }}>
        
        {/* Left Pane: List */}
        <div style={{ flex: "0 0 350px", display: "flex", flexDirection: "column", gap: "0.5rem", overflowY: "auto", paddingRight: "0.5rem" }}>
          {loading ? (
            <p>Loading...</p>
          ) : filteredItems.length === 0 ? (
            <p style={{ color: "var(--c-muted)", textAlign: "center", marginTop: "2rem" }}>No certifications found.</p>
          ) : (
            filteredItems.map(item => (
              <div 
                key={item._id} 
                onClick={() => handleSelectItem(item._id)}
                style={{ 
                  background: selectedId === item._id ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)", 
                  border: `1px solid ${selectedId === item._id ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)"}`, 
                  padding: "1rem", 
                  borderRadius: "8px", 
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                  <h3 style={{ fontSize: "1rem", margin: 0, fontWeight: "500" }}>{item.title}</h3>
                  <span style={{ fontSize: "0.75rem", color: "var(--c-muted)", fontFamily: "var(--font-mono)" }}>{item.date}</span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--c-muted)", margin: 0 }}>{item.issuer}</p>
              </div>
            ))
          )}
        </div>

        {/* Right Pane: Details / Form */}
        <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "2rem", overflowY: "auto" }}>
          {!selectedId ? (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-muted)" }}>
              <p>Select a certification to view details, or create a new one.</p>
            </div>
          ) : (
            <>
              {/* Right Pane Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem" }}>
                <h2 style={{ fontSize: "1.25rem", margin: 0 }}>{isNew ? "Create New Certification" : "Certification Details"}</h2>
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
                    <button form="certForm" type="submit" style={{ ...actionBtnStyle, background: "white", color: "black", borderColor: "white", fontWeight: "600" }}>Save</button>
                  )}
                </div>
              </div>

              {/* Form / Detail View */}
              <form id="certForm" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingBottom: "2rem" }}>
                {!isNew && <input type="hidden" name="_id" value={selectedItem?._id} />}
                <input type="hidden" name="image" value={selectedItem?.image || ""} />
                
                {/* Image Banner */}
                <div style={{ width: "100%", height: "200px", minHeight: "200px", background: "rgba(0,0,0,0.5)", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "8px", overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {(imagePreview || selectedItem?.image) ? (
                    <img src={imagePreview || selectedItem?.image} alt="Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ color: "var(--c-muted)" }}>No Image</span>
                  )}
                  {isEditing && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", opacity: (imagePreview || selectedItem?.image) ? 0 : 1, transition: "opacity 0.2s", cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.opacity = "1"} onMouseLeave={(e) => { if (imagePreview || selectedItem?.image) e.currentTarget.style.opacity = "0" }}>
                      <label style={{ cursor: "pointer", background: "white", color: "black", padding: "0.5rem 1rem", borderRadius: "6px", fontWeight: "600", border: "1px solid rgba(0,0,0,0.1)" }}>
                        Upload Image
                        <input type="file" name="imageFile" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                      </label>
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                  <div>
                    <label style={labelStyle}>Title *</label>
                    {isEditing ? <input type="text" name="title" required defaultValue={selectedItem?.title} style={inputStyle} /> : <p style={detailTextStyle}>{selectedItem?.title}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Issuer *</label>
                    {isEditing ? <input type="text" name="issuer" required defaultValue={selectedItem?.issuer} style={inputStyle} /> : <p style={detailTextStyle}>{selectedItem?.issuer}</p>}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                  <div>
                    <label style={labelStyle}>Date *</label>
                    {isEditing ? <input type="text" name="date" required defaultValue={selectedItem?.date} style={inputStyle} placeholder="e.g. 2024 or Oct 2024" /> : <p style={detailTextStyle}>{selectedItem?.date}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Custom ID</label>
                    {isEditing ? <input type="text" name="id" defaultValue={selectedItem?.id} style={inputStyle} placeholder="Optional identifier" /> : <p style={detailTextStyle}>{selectedItem?.id || "-"}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Credential ID</label>
                    {isEditing ? <input type="text" name="credId" defaultValue={selectedItem?.credId} style={inputStyle} placeholder="Certificate hash/ID" /> : <p style={detailTextStyle}>{selectedItem?.credId || "-"}</p>}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Link</label>
                  {isEditing ? <input type="url" name="link" defaultValue={selectedItem?.link} style={inputStyle} placeholder="https://..." /> : <a href={selectedItem?.link} target="_blank" rel="noreferrer" style={{...detailTextStyle, color: "#00aaff", textDecoration: "none", display: "inline-block"}}>{selectedItem?.link || "-"}</a>}
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
            <h3 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem 0", color: "white" }}>Delete Certification?</h3>
            <p style={{ color: "var(--c-muted)", fontSize: "0.95rem", marginBottom: "1.5rem", lineHeight: "1.5" }}>
              This action cannot be undone. The certification will be permanently removed from your portfolio.
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
  width: "100%", padding: "0.75rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "white", outline: "none", fontFamily: "inherit"
};

const actionBtnStyle = {
  padding: "0.5rem 1rem", background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem"
};

const labelStyle = {
  display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--c-muted)", fontWeight: "500"
};

const detailTextStyle = {
  fontSize: "1rem", margin: 0, padding: "0.75rem 0", borderBottom: "1px solid transparent"
};
