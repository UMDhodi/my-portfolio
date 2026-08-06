import ProjectsPageComponent from "@/app/components/projects_page";
import { getProjects } from "@/app/actions/admin";

export const metadata = {
  title: "Projects | Mayank Dhodi",
  description: "Featured web applications, software products, and fullstack projects engineered by Mayank Dhodi.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsPageComponent initialProjects={projects} />;
}
