import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getThoughts, saveThoughts } from "@/lib/content"
import type { Thought } from "@/lib/content"

export async function GET() {
  const err = await auth()
  if (err) return err
  const thoughts = await getThoughts()
  return NextResponse.json(thoughts)
}

export async function POST(req: Request) {
  const err = await auth()
  if (err) return err

  try {
    const thought = (await req.json()) as Thought & { id?: string }

    if (!thought.verb || !thought.target) {
      return NextResponse.json(
        { error: "verb 和 target 为必填项" },
        { status: 400 }
      )
    }

    const thoughts = await getThoughts()

    if (thought.id) {
      const idx = thoughts.findIndex((t) => t.id === thought.id)
      if (idx >= 0) {
        // Merge to preserve fields not included in the edit form
        thoughts[idx] = { ...thoughts[idx], ...thought }
      } else {
        return NextResponse.json({ error: "动态不存在" }, { status: 404 })
      }
    } else {
      thought.id =
        Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
      thoughts.push(thought as Thought)
    }

    await saveThoughts(thoughts)
    return NextResponse.json({ ok: true, id: thought.id })
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 })
  }
}
