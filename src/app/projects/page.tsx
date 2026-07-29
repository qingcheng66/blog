import type { Metadata } from "next"
import { getProjects } from "@/lib/content"
import { ProjectsGrid } from "./projects-grid"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "项目",
  description: "个人项目作品集",
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <ProjectsGrid projects={projects} />
    </div>
  )
}
