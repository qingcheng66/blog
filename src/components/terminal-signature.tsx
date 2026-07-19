"use client"

import { useState, useEffect } from "react"

const LINES = [
  { text: "> whoami", delay: 300 },
  { text: "> AI 全栈工程师 / LLM 践行者", delay: 800 },
  { text: "> echo $MOTTO", delay: 600 },
  { text: "> 知行合一，学以致用", delay: 800 },
  { text: "", delay: 400 },
  { text: "> uptime", delay: 500 },
  { text: "> 持续迭代中 ...", delay: 600 },
]

export function TerminalSignature() {
  const [visibleLines, setVisibleLines] = useState(0)
  const [cursor, setCursor] = useState(true)

  useEffect(() => {
    if (visibleLines >= LINES.length) return

    const timer = setTimeout(() => {
      setVisibleLines((v) => v + 1)
    }, LINES[visibleLines]?.delay ?? 500)

    return () => clearTimeout(timer)
  }, [visibleLines])

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => setCursor((c) => !c), 530)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="font-mono text-xs leading-relaxed">
      <div className="rounded-lg border bg-muted/40 p-4 max-w-sm mx-auto text-left">
        {LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} className="text-muted-foreground">
            {line.text}
          </div>
        ))}
        <span
          className={`inline-block w-[6px] h-[14px] bg-primary align-text-bottom ml-0.5 ${cursor ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </div>
  )
}
