import { NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import { getUploadsDir } from "@/lib/content"

/**
 * 服务 content/ 下的静态文件（无需鉴权，前台展示用）。
 * 上传 API 返回 `/content/uploads/xxx`，但 content/ 不在 public/ 里，
 * 需要此路由把 /content/* 映射到磁盘读取。
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const segments = (await params).path

    // 只允许 uploads 子目录，防止目录穿越
    if (segments[0] !== "uploads") {
      return new NextResponse("Not Found", { status: 404 })
    }

    const uploadsDir = path.resolve(getUploadsDir())
    const filePath = path.join(uploadsDir, ...segments.slice(1))
    const resolved = path.resolve(filePath)

    // 防目录穿越：解析后必须仍在 uploads 目录内
    if (!resolved.startsWith(uploadsDir + path.sep)) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const data = await fs.promises.readFile(resolved)
    const ext = path.extname(resolved).toLowerCase()
    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : ext === ".gif"
        ? "image/gif"
        : ext === ".webp"
        ? "image/webp"
        : ext === ".svg"
        ? "image/svg+xml"
        : "application/octet-stream"

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return new NextResponse("Not Found", { status: 404 })
  }
}
