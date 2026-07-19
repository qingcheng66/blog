"use client"

import { useState, useCallback, type ReactNode } from "react"
import { Check, Copy } from "lucide-react"

interface CodeBlockProps {
  className?: string
  children: ReactNode
}

export function CodeBlock({ className, children, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const match = className?.match(/language-(\w+)/)
  const lang = match?.[1] ?? ""

  const codeContent = extractText(children)
  const lines = codeContent.split("\n")
  // Remove trailing empty line
  if (lines[lines.length - 1] === "") lines.pop()

  const handleCopy = useCallback(async () => {
    if (!codeContent) return
    try {
      await navigator.clipboard.writeText(codeContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = codeContent
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [codeContent])

  return (
    <div className="group relative my-6 rounded-lg border bg-muted/50">
      {/* Header: language label + copy button */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b bg-muted/30 rounded-t-lg">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          {lang || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label={copied ? "已复制" : "复制代码"}
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-green-500" />
              已复制
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              复制
            </>
          )}
        </button>
      </div>

      {/* Code with line numbers */}
      <div className="overflow-x-auto">
        <pre className="!mt-0 !rounded-t-none !border-0 !bg-transparent" {...props}>
          <code className={className}>
            {lines.map((line, i) => (
              <span key={i} className="block leading-relaxed">
                <span className="inline-block w-8 md:w-10 shrink-0 text-right text-xs text-muted-foreground/40 select-none mr-3 md:mr-4 font-mono tabular-nums">
                  {i + 1}
                </span>
                <span>{line || " "}</span>
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  )
}

/** Extract text content from React children (code elements) */
function extractText(node: ReactNode): string {
  if (typeof node === "string") return node
  if (typeof node === "number" || typeof node === "boolean") return String(node)
  if (node == null) return ""

  if (Array.isArray(node)) {
    return node.map(extractText).join("")
  }

  if (typeof node === "object" && "props" in node) {
    return extractText((node as { props: { children: ReactNode } }).props.children)
  }

  return ""
}
