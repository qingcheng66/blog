import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAbout, saveAbout } from "@/lib/content"
import type { About } from "@/lib/content"

export async function GET() {
  const err = await auth()
  if (err) return err
  const about = await getAbout()
  if (!about) {
    return NextResponse.json({ error: "关于信息尚未初始化" }, { status: 404 })
  }
  return NextResponse.json(about)
}

export async function PUT(req: Request) {
  const err = await auth()
  if (err) return err

  try {
    const about = (await req.json()) as About
    if (!about.name) {
      return NextResponse.json({ error: "名称为必填项" }, { status: 400 })
    }
    await saveAbout(about)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 })
  }
}
