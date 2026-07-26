import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getProjects, saveProjects } from "@/lib/content"
import type { Project } from "@/lib/content"

export async function GET() {
  const err = await auth()
  if (err) return err
  const projects = await getProjects()
  return NextResponse.json(projects)
}

export async function POST(req: Request) {
  const err = await auth()
  if (err) return err

  try {
    const project = (await req.json()) as Project & { id?: string }

    if (!project.title) {
      return NextResponse.json(
        { error: "项目名称为必填项" },
        { status: 400 }
      )
    }

    const projects = await getProjects()

    if (project.id) {
      // 编辑已有项目
      const idx = projects.findIndex((p) => p.id === project.id)
      if (idx >= 0) {
        projects[idx] = project as Project
      } else {
        return NextResponse.json({ error: "项目不存在" }, { status: 404 })
      }
    } else {
      // 新建项目 — 生成 ID
      project.id =
        Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
      projects.push(project as Project)
    }

    await saveProjects(projects)
    return NextResponse.json({ ok: true, id: project.id })
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 })
  }
}
