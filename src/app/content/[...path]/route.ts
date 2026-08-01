import { NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import { getUploadsDir, getMusicDir } from "@/lib/content"

/**
 * 服务 content/ 下的静态文件（无需鉴权，前台展示用）。
 * 上传 API 返回 `/content/uploads/xxx`，但 content/ 不在 public/ 里，
 * 需要此路由把 /content/* 映射到磁盘读取。
 * 允许子目录：uploads（图片）、music（音频）。
 */
const ALLOWED_SUBDIRS = ["uploads", "music"] as const

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const segments = (await params).path

    // 只允许 uploads / music 子目录，防止目录穿越
    const root = segments[0]
    if (!ALLOWED_SUBDIRS.includes(root as (typeof ALLOWED_SUBDIRS)[number])) {
      return new NextResponse("Not Found", { status: 404 })
    }

    const baseDir = path.resolve(
      root === "music" ? getMusicDir() : getUploadsDir()
    )
    const filePath = path.join(baseDir, ...segments.slice(1))
    const resolved = path.resolve(filePath)

    // 防目录穿越：解析后必须仍在对应目录内
    if (!resolved.startsWith(baseDir + path.sep)) {
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
        : ext === ".mp3"
        ? "audio/mpeg"
        : ext === ".m4a"
        ? "audio/mp4"
        : ext === ".ogg" || ext === ".oga"
        ? "audio/ogg"
        : ext === ".wav"
        ? "audio/wav"
        : ext === ".webm"
        ? "audio/webm"
        : ext === ".flac"
        ? "audio/flac"
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
