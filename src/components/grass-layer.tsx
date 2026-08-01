import type { CSSProperties } from "react"

/**
 * REQ-018 全站底部「草叶装饰层」
 * 纯展示组件（无交互/无浏览器 API → Server Component）。
 * 12 片草叶用内联 CSS 变量随机化位置/尺寸/摇摆节奏，
 * 样式见 globals.css 的 .grass-layer / .grass-leaf / @keyframes grass-sway。
 */
const BLADES = [
  { left: "2%",  width: 14, height: 110, duration: 3.4, delay: 0 },
  { left: "10%", width: 18, height: 150, duration: 4.2, delay: -0.6 },
  { left: "17%", width: 12, height: 90,  duration: 3.8, delay: -1.2 },
  { left: "25%", width: 20, height: 170, duration: 3.1, delay: -0.3 },
  { left: "33%", width: 11, height: 80,  duration: 4.5, delay: -1.8 },
  { left: "41%", width: 16, height: 130, duration: 3.6, delay: -0.9 },
  { left: "49%", width: 13, height: 100, duration: 4.0, delay: -2.4 },
  { left: "57%", width: 19, height: 160, duration: 3.3, delay: -1.5 },
  { left: "65%", width: 12, height: 95,  duration: 4.4, delay: -0.2 },
  { left: "73%", width: 15, height: 120, duration: 3.7, delay: -2.1 },
  { left: "81%", width: 17, height: 145, duration: 3.2, delay: -0.7 },
  { left: "90%", width: 14, height: 105, duration: 4.1, delay: -1.4 },
] as const

export function GrassLayer() {
  return (
    <div className="grass-layer" aria-hidden>
      {BLADES.map((b, i) => (
        <span
          key={i}
          className="grass-leaf"
          style={
            {
              "--grass-left": b.left,
              "--grass-width": `${b.width}px`,
              "--grass-height": `${b.height}px`,
              "--grass-duration": `${b.duration}s`,
              "--grass-delay": `${b.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
