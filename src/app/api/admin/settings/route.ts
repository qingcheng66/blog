import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getSettings, saveSettings } from "@/lib/content"
import type { Settings } from "@/lib/content"

export async function GET() {
  const err = await auth()
  if (err) return err
  const settings = await getSettings()
  return NextResponse.json(settings)
}

export async function PUT(req: Request) {
  const err = await auth()
  if (err) return err

  try {
    const body = (await req.json()) as Settings
    // AD-021 惯例：spread 合并防丢失 — 保留未提交的区块
    const existing = await getSettings()

    const merged: Settings = { ...existing }

    if (body.background) {
      merged.background = {
        mode: body.background.mode === "image" ? "image" : "none",
        src: body.background.src?.trim() || "",
        overlay: body.background.overlay?.trim() || "rgba(20,12,6,0.45)",
        animation:
          body.background.animation === "kenburns" ? "kenburns" : "none",
      }
    }

    if (body.welcome) {
      merged.welcome = {
        enabled: !!body.welcome.enabled,
        title: body.welcome.title?.trim() || "",
        subtitle: body.welcome.subtitle?.trim() || "",
        background: body.welcome.background?.trim() || undefined,
        showParticles: !!body.welcome.showParticles,
      }
    }

    await saveSettings(merged)
    return NextResponse.json(merged)
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 })
  }
}
