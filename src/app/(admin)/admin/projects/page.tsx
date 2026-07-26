import { getProjects } from "@/lib/content"
import { ProjectsManager } from "./manager"

export default async function AdminProjectsPage() {
  const projects = await getProjects()
  return <ProjectsManager initial={projects} />
}
