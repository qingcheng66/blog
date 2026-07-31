import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getMusic, saveMusic } from "@/lib/content"
import type { MusicConfig } from "@/lib/content"

export async function GET() {
  const err = await auth()
  if (err) return err
  const music = await getMusic()
  return NextResponse.json(music)
}

export async function PUT(req: Request) {
  const err = await auth()
  if (err) return err

  try {
    const music = (await req.json()) as MusicConfig

    if (!music.trackName?.trim() || !music.file?.trim()) {
      return NextResponse.json(
        { error: "trackName 和 file 为必填项" },
        { status: 400 }
      )
    }

    const cleaned: MusicConfig = {
      trackName: music.trackName.trim(),
      artist: music.artist?.trim() || undefined,
      file: music.file.trim(),
    }

    await saveMusic(cleaned)
    return NextResponse.json(cleaned)
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 })
  }
}
