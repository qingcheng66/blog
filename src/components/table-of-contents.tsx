"use client"

import { useEffect, useState, useCallback } from "react"

interface TocItem {
  id: string
  text: string
  level: number
}

export function TableOfContents() {
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const headings = document.querySelectorAll(".prose h2, .prose h3")
    const tocItems: TocItem[] = []

    headings.forEach((h) => {
      const id = h.textContent?.toLowerCase().replace(/\s+/g, "-").replace(/[^\w一-龥-]/g, "") ?? ""
      h.id = id
      tocItems.push({
        id,
        text: h.textContent ?? "",
        level: h.tagName === "H2" ? 2 : 3,
      })
    })

    setItems(tocItems)
  }, [])

  const handleClick = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100
      window.scrollTo({ top, behavior: "smooth" })
    }
  }, [])

  // Track active heading
  useEffect(() => {
    if (items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px" },
    )

    items.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  if (items.length < 2) return null

  return (
    <nav className="hidden xl:block sticky top-24 w-56 shrink-0" aria-label="文章目录">
      <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        目录
      </h2>
      <ul className="space-y-1.5 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className={`block transition-colors py-0.5 ${
                item.level === 3 ? "pl-4" : ""
              } ${
                activeId === item.id
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
