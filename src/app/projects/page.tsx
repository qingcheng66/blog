import type { Metadata } from "next"
import { ProjectsGrid } from "./projects-grid"

export const metadata: Metadata = {
  title: "项目",
  description: "个人项目作品集",
}

export default function ProjectsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <ProjectsGrid />
    </div>
  )
}
