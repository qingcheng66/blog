"use client"

import { useRef, useMemo, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import type { BlogPost } from "@/lib/blog"
import { Badge } from "@/components/ui/badge"
import { SplitText } from "@/components/split-text"
import { ArrowRight, Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

gsap.registerPlugin(ScrollTrigger)

const PAGE_SIZE = 6
const ALL_TAG = "_all"

const calculateReadingTime = (description: string) => {
  const wordsPerMinute = 200
  const wordCount = description.length / 5
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

function BlogContent({ posts }: { posts: BlogPost[] }) {
  const searchParams = useSearchParams()
  const activeTag = searchParams.get("tag") ?? ALL_TAG
  const page = Math.max(1, Number(searchParams.get("page")) || 1)

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>()
    posts.forEach((p) => p.tags?.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1)))
    return counts
  }, [posts])

  const filtered = useMemo(
    () => (activeTag === ALL_TAG ? posts : posts.filter((p) => p.tags?.includes(activeTag))),
    [posts, activeTag],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const gridRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useGSAP(() => {
    if (reducedMotion) {
      gsap.set(".blog-card", { opacity: 1, y: 0 })
      return
    }

    gsap.from(".blog-card", {
      y: 40,
      stagger: 0.08,
      duration: 0.5,
      ease: "power2.out",
      scrollTrigger: { trigger: gridRef.current, start: "top 80%" },
    })
  }, { dependencies: [reducedMotion] })

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <SplitText as="h1" className="text-4xl md:text-5xl font-bold tracking-tight" stagger={0.04}>博客</SplitText>
        <p className="text-lg text-muted-foreground max-w-2xl">
          分享技术见解、项目经验和学习笔记
        </p>
      </header>

      {/* Tag Cloud */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/blog"
          className={`text-sm px-3 py-1 rounded-full transition-colors ${
            activeTag === ALL_TAG
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          全部 ({posts.length})
        </Link>
        {Array.from(tagCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([tag, count]) => (
            <Link
              key={tag}
              href={`/blog?tag=${encodeURIComponent(tag)}`}
              className={`text-sm px-3 py-1 rounded-full transition-colors ${
                activeTag === tag
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {tag} ({count})
            </Link>
          ))}
      </div>

      {paged.length === 0 && (
        <div className="min-h-[30dvh] flex items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-xl font-medium text-muted-foreground">该标签下暂无文章</p>
            <Link href="/blog" className="text-sm text-primary hover:underline">
              查看全部文章 →
            </Link>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6" ref={gridRef}>
        {paged.map((post) => {
          const readingTime = calculateReadingTime(post.description)
          return (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <article className="blog-card relative overflow-hidden rounded-xl border bg-card/50 p-6 transition-all duration-300 hover-media:hover:bg-card hover-media:hover:shadow-lg hover-media:hover:-translate-y-0.5">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-accent/50 opacity-0 transition-opacity hover-media:group-hover:opacity-100" />
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold leading-tight hover-media:group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {post.description}
                  </p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      <time>{post.date}</time>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      <span>{readingTime} 分钟阅读</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="absolute bottom-6 right-6 size-4 text-muted-foreground opacity-0 -translate-x-2 transition-all hover-media:group-hover:opacity-100 hover-media:group-hover:translate-x-0" />
              </article>
            </Link>
          )
        })}
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-4 pt-4">
          <Link
            href={`/blog?${new URLSearchParams({ tag: activeTag, page: String(currentPage - 1) })}`}
            className={`inline-flex items-center gap-1 text-sm transition-colors ${
              currentPage <= 1
                ? "pointer-events-none text-muted-foreground/40"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="上一页"
          >
            <ChevronLeft className="size-4" />
            上一页
          </Link>
          <span className="text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          <Link
            href={`/blog?${new URLSearchParams({ tag: activeTag, page: String(currentPage + 1) })}`}
            className={`inline-flex items-center gap-1 text-sm transition-colors ${
              currentPage >= totalPages
                ? "pointer-events-none text-muted-foreground/40"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="下一页"
          >
            下一页
            <ChevronRight className="size-4" />
          </Link>
        </nav>
      )}
    </div>
  )
}

export function BlogClient({ posts }: { posts: BlogPost[] }) {
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <header className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">博客</h1>
          </header>
          <div className="flex items-center justify-center min-h-[30dvh]">
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      }
    >
      <BlogContent posts={posts} />
    </Suspense>
  )
}
