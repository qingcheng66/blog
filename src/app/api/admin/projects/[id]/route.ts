import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getProjects, saveProjects } from "@/lib/content"
import type { Project } from "@/lib/content"

interface Params {
  params: Promise<{ id: string }>
}

export async function PUT(req: Request, { params }: Params) {
  const err = await auth()
  if (err) return err

  const { id } = await params
  try {
    const data = (await req.json()) as Partial<Project>
    const projects = await getProjects()
    const idx = projects.findIndex((p) => p.id === id)

    if (idx < 0) {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 })
    }

    projects[idx] = { ...projects[idx], ...data, id } // id 不可改
    await saveProjects(projects)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const err = await auth()
  if (err) return err

  const { id } = await params
  const projects = await getProjects()
  const filtered = projects.filter((p) => p.id !== id)
  await saveProjects(filtered)
  return NextResponse.json({ ok: true })
}
