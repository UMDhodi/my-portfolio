import { getTimeline, getCertifications, getMessages, getBlogPosts, getProjects } from "@/app/actions/admin";
import DashboardCharts from "./DashboardCharts";

export default async function DashboardOverview() {
  const timeline = await getTimeline();
  const certs = await getCertifications();
  const messages = await getMessages();
  const blogs = await getBlogPosts();
  const projects = await getProjects();

  return (
    <div>
      <h1 style={{ fontSize: "2rem", fontWeight: "600", marginBottom: "2rem", letterSpacing: "-0.02em" }}>Dashboard Overview</h1>
      
      {/* Charts Section */}
      <DashboardCharts timeline={timeline} certs={certs} messages={messages} blogs={blogs} projects={projects} />
    </div>
  );
}
