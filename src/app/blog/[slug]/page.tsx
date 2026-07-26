import { getArticleBySlug, getArticles } from "@/lib/content"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { ArrowLeft, Clock, Tag } from "lucide-react"
import Link from "next/link"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const articles = await getArticles()
  return articles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await getArticleBySlug(slug)
  if (!result) return { title: "文章不存在" }
  return {
    title: result.meta.title,
    description: result.meta.description,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const result = await getArticleBySlug(slug)

  if (!result) {
    notFound()
  }

  const { meta, content } = result

  return (
    <article className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-8 pt-24">
      {/* Back link */}
      <Link
        href="/articles"
        className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-[var(--color-accent)]"
        style={{ color: "var(--color-text-muted)" }}
      >
        <ArrowLeft size={15} />
        返回文章列表
      </Link>

      {/* Header */}
      <header className="mb-10">
        <h1
          className="text-3xl sm:text-4xl font-bold mb-4 leading-tight"
          style={{ color: "var(--color-text)" }}
        >
          {meta.title}
        </h1>

        {meta.description && (
          <p className="text-base mb-6 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            {meta.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span
            className="inline-flex items-center gap-1.5"
            style={{ color: "var(--color-text-muted)" }}
          >
            <Clock size={14} />
            {meta.date}
          </span>

          {meta.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tag size={14} style={{ color: "var(--color-text-muted)" }} />
              {meta.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    color: "var(--color-accent)",
                    background: "rgba(var(--color-accent-rgb), 0.1)",
                    border: "1px solid rgba(var(--color-accent-rgb), 0.15)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Divider */}
      <div className="mb-10" style={{ borderTop: "1px solid var(--color-border)" }} />

      {/* Markdown content */}
      <div className="prose-custom" style={{ color: "var(--color-text)" }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            h1: ({ children, ...props }) => (
              <h1 className="text-2xl font-bold mt-10 mb-4" style={{ color: "var(--color-text)" }} {...props}>
                {children}
              </h1>
            ),
            h2: ({ children, ...props }) => (
              <h2 className="text-xl font-bold mt-8 mb-3" style={{ color: "var(--color-text)" }} {...props}>
                {children}
              </h2>
            ),
            h3: ({ children, ...props }) => (
              <h3 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--color-text)" }} {...props}>
                {children}
              </h3>
            ),
            p: ({ children, ...props }) => (
              <p className="my-4 leading-relaxed text-[15px]" style={{ color: "var(--color-text-secondary)" }} {...props}>
                {children}
              </p>
            ),
            a: ({ children, href, ...props }) => (
              <a
                href={href}
                className="underline underline-offset-2"
                style={{ color: "var(--color-accent)" }}
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            ),
            ul: ({ children, ...props }) => (
              <ul className="list-disc pl-6 my-4 space-y-1" style={{ color: "var(--color-text-secondary)" }} {...props}>
                {children}
              </ul>
            ),
            ol: ({ children, ...props }) => (
              <ol className="list-decimal pl-6 my-4 space-y-1" style={{ color: "var(--color-text-secondary)" }} {...props}>
                {children}
              </ol>
            ),
            li: ({ children, ...props }) => (
              <li className="text-[15px] leading-relaxed" {...props}>
                {children}
              </li>
            ),
            blockquote: ({ children, ...props }) => (
              <blockquote
                className="border-l-4 pl-4 my-4 italic"
                style={{ borderColor: "var(--color-accent)", color: "var(--color-text-muted)" }}
                {...props}
              >
                {children}
              </blockquote>
            ),
            code: ({ className, children, ...props }: React.ComponentPropsWithoutRef<"code"> & { className?: string }) => {
              const isInline = !className
              if (isInline) {
                return (
                  <code
                    className="text-[13px] px-1.5 py-0.5 rounded font-mono"
                    style={{
                      background: "var(--color-bg-mute)",
                      color: "var(--color-accent)",
                      border: "1px solid var(--color-border)",
                    }}
                    {...props}
                  >
                    {children}
                  </code>
                )
              }
              return (
                <code className={`${className} text-[13px]`} {...props}>
                  {children}
                </code>
              )
            },
            pre: ({ children, ...props }) => (
              <pre
                className="rounded-xl p-5 my-4 overflow-x-auto text-[13px] leading-relaxed font-mono"
                style={{
                  background: "var(--color-bg-soft)",
                  border: "1px solid var(--color-border)",
                }}
                {...props}
              >
                {children}
              </pre>
            ),
            hr: () => (
              <hr className="my-8" style={{ borderColor: "var(--color-border)" }} />
            ),
            strong: ({ children, ...props }) => (
              <strong style={{ color: "var(--color-text)" }} {...props}>
                {children}
              </strong>
            ),
            table: ({ children, ...props }) => (
              <div className="overflow-x-auto my-4">
                <table
                  className="w-full text-sm border-collapse"
                  style={{ border: "1px solid var(--color-border)" }}
                  {...props}
                >
                  {children}
                </table>
              </div>
            ),
            th: ({ children, ...props }) => (
              <th
                className="px-4 py-2 text-left font-semibold"
                style={{
                  background: "var(--color-bg-mute)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
                {...props}
              >
                {children}
              </th>
            ),
            td: ({ children, ...props }) => (
              <td
                className="px-4 py-2"
                style={{
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-secondary)",
                }}
                {...props}
              >
                {children}
              </td>
            ),
          }}
        >
          {content || "*（本文暂未编写正文）*"}
        </ReactMarkdown>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6" style={{ borderTop: "1px solid var(--color-border)" }}>
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 text-sm transition-colors hover:text-[var(--color-accent)]"
          style={{ color: "var(--color-text-muted)" }}
        >
          <ArrowLeft size={15} />
          返回文章列表
        </Link>
      </div>
    </article>
  )
}
