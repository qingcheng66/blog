import type { BackgroundConfig } from "@/lib/content"

export function BackgroundLayer({
  background,
}: {
  background?: BackgroundConfig
}) {
  if (!background || background.mode !== "image" || !background.src) return null

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none" aria-hidden>
      <div
        className={`absolute inset-0 bg-cover bg-center ${
          background.animation === "kenburns" ? "ken-burns" : ""
        }`}
        style={{ backgroundImage: `url(${background.src})` }}
      />
      {/* 暗色遮罩，保证玻璃卡片与背景图对比度 */}
      <div
        className="absolute inset-0"
        style={{ background: background.overlay || "rgba(20,12,6,0.45)" }}
      />
    </div>
  )
}
