import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getMusicList, saveMusicList } from "@/lib/content"
import type { MusicTrack } from "@/lib/content"

function makeId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  }
}

function cleanTrack(track: Partial<MusicTrack>): Omit<MusicTrack, "id"> | null {
  if (!track.trackName?.trim() || !track.file?.trim()) return null
  return {
    trackName: track.trackName.trim(),
    artist: track.artist?.trim() || undefined,
    file: track.file.trim(),
  }
}

export async function GET() {
  const err = await auth()
  if (err) return err
  const list = await getMusicList()
  return NextResponse.json(list)
}

export async function POST(req: Request) {
  const err = await auth()
  if (err) return err

  try {
    const body = (await req.json()) as Partial<MusicTrack>
    const track = cleanTrack(body)

    if (!track) {
      return NextResponse.json(
        { error: "trackName 和 file 为必填项" },
        { status: 400 }
      )
    }

    const list = await getMusicList()

    // 携带 id → 编辑已有曲目
    let id: string
    if (body.id) {
      id = body.id
      const idx = list.findIndex((t) => t.id === id)
      if (idx >= 0) {
        list[idx] = { ...track, id }
      } else {
        return NextResponse.json({ error: "曲目不存在" }, { status: 404 })
      }
    } else {
      // 无 id → 新增曲目
      id = makeId()
      list.push({ ...track, id })
    }

    await saveMusicList(list)
    return NextResponse.json({ ok: true, id })
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 })
  }
}

export async function PUT(req: Request) {
  const err = await auth()
  if (err) return err

  try {
    const body = (await req.json()) as MusicTrack[] | Partial<MusicTrack>

    // 兼容旧式单对象 PUT → 转成整体列表
    if (!Array.isArray(body)) {
      const track = cleanTrack(body)
      if (!track) {
        return NextResponse.json(
          { error: "trackName 和 file 为必填项" },
          { status: 400 }
        )
      }
      const trackWithId = body.id ? { ...track, id: body.id } : { ...track, id: makeId() }
      await saveMusicList([trackWithId])
      return NextResponse.json({ ok: true, id: trackWithId.id })
    }

    // 数组 → 整体替换（用于排序 / 批量编辑）
    const cleaned: MusicTrack[] = []
    for (const raw of body) {
      const track = cleanTrack(raw)
      if (track) cleaned.push(raw.id ? { ...track, id: raw.id } : { ...track, id: makeId() })
    }
    await saveMusicList(cleaned)
    return NextResponse.json({ ok: true, count: cleaned.length })
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  const err = await auth()
  if (err) return err

  const id = new URL(req.url).searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "缺少 id 参数" }, { status: 400 })
  }

  const list = await getMusicList()
  await saveMusicList(list.filter((t) => t.id !== id))
  return NextResponse.json({ ok: true })
}
