import { getTimeline, getCertifications, getMessages } from "@/app/actions/admin";

export default async function DashboardOverview() {
  const timeline = await getTimeline();
  const certs = await getCertifications();
  const messages = await getMessages();

  return (
    <div>
      <h1 style={{ fontSize: "2rem", fontWeight: "600", marginBottom: "2rem", letterSpacing: "-0.02em" }}>Dashboard Overview</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
        
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "1.5rem", borderRadius: "12px" }}>
          <h3 style={{ fontSize: "0.9rem", color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Timeline Events</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "600", color: "#00aaff" }}>{timeline.length}</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "1.5rem", borderRadius: "12px" }}>
          <h3 style={{ fontSize: "0.9rem", color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Certifications</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "600", color: "#00aaff" }}>{certs.length}</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "1.5rem", borderRadius: "12px" }}>
          <h3 style={{ fontSize: "0.9rem", color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Unread Messages</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "600", color: "#00aaff" }}>{messages.length}</p>
        </div>

      </div>
    </div>
  );
}
