import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { saveUpload } from "@/lib/content"

export async function POST(req: Request) {
  const err = await auth()
  if (err) return err

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "未选择文件" }, { status: 400 })
    }

    // 限制文件类型
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "仅支持 JPEG/PNG/GIF/WebP/SVG 图片" },
        { status: 400 }
      )
    }

    // 生成唯一文件名
    const ext = file.name.split(".").pop() || "jpg"
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await saveUpload(filename, buffer)

    return NextResponse.json({ ok: true, url })
  } catch {
    return NextResponse.json({ error: "上传失败" }, { status: 500 })
  }
}
