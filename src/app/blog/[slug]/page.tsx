import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import { getPost, getAllPosts } from "@/lib/blog"
import { Badge } from "@/components/ui/badge"
import { site } from "@/data/site"
import { TableOfContents } from "@/components/table-of-contents"
import { ReadingProgress } from "@/components/reading-progress"
import { CodeBlock } from "@/components/code-block"
import { ParallaxImage } from "@/components/parallax-image"
import { LightboxImage } from "@/components/lightbox"
import { SplitText } from "@/components/split-text"
import type { Metadata } from "next"

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return { title: "未找到" }
  return {
    title: post.meta.title,
    description: post.meta.description,
    openGraph: {
      title: post.meta.title,
      description: post.meta.description,
      type: "article",
      publishedTime: post.meta.date,
      tags: post.meta.tags,
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const allPosts = getAllPosts()
  const currentIndex = allPosts.findIndex((p) => p.slug === slug)
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null

  // Related posts: share at least one tag, exclude current, max 3
  const relatedPosts = allPosts
    .filter(
      (p) =>
        p.slug !== slug &&
        post.meta.tags &&
        p.tags?.some((t) => post.meta.tags?.includes(t)),
    )
    .slice(0, 3)

  return (
    <div className="min-h-screen">
      <ReadingProgress />

      {/* Back navigation */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="size-4" />
        返回博客
      </Link>

      <div className="flex gap-8 lg:gap-12">
        <article className="space-y-8 max-w-3xl flex-1 min-w-0">
          {/* JSON-LD Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                headline: post.meta.title,
                description: post.meta.description,
                datePublished: post.meta.date,
                author: { "@type": "Person", name: site.name },
                url: `${site.url}/blog/${slug}`,
              }),
            }}
          />

          {/* Header */}
          <header className="space-y-4">
            <SplitText as="h1" className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight" stagger={0.03} delay={0.2} scrollTrigger={false}>
              {post.meta.title}
            </SplitText>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <time className="font-medium text-foreground">{post.meta.date}</time>

              <span className="text-border">·</span>
              <span>{Math.max(1, Math.ceil(post.content.length / 500))} 分钟阅读</span>

              {post.meta.tags && post.meta.tags.length > 0 && (
                <>
                  <span className="text-border">·</span>
                  <div className="flex flex-wrap gap-2">
                    {post.meta.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-img:rounded-lg prose-a:text-primary prose-a:underline-offset-4 prose-pre:bg-muted prose-pre:rounded-lg prose-pre:mt-6 prose-pre:mb-6">
            <MDXRemote
              source={post.content}
              components={{
                pre: CodeBlock,
                img: LightboxImage,
                ParallaxImage,
              }}
            />
          </div>
        </article>

        {/* Table of Contents (desktop only) */}
        <TableOfContents />
      </div>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-16 pt-8 border-t">
          <h2 className="text-lg font-semibold mb-4">相关文章</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {relatedPosts.map((rp) => (
              <Link
                key={rp.slug}
                href={`/blog/${rp.slug}`}
                className="group p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <h3 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                  {rp.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {rp.date}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Navigation between posts */}
      {(prevPost || nextPost) && (
        <nav className="mt-8 pt-8 border-t grid md:grid-cols-2 gap-4">
          {prevPost && (
            <Link
              href={`/blog/${prevPost.slug}`}
              className="group flex flex-col gap-1 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <span className="text-xs text-muted-foreground">上一篇</span>
              <span className="font-medium group-hover:text-primary transition-colors">
                {prevPost.title}
              </span>
            </Link>
          )}
          {nextPost && (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="group flex flex-col gap-1 p-4 rounded-lg border hover:bg-muted/50 transition-colors md:text-right"
            >
              <span className="text-xs text-muted-foreground">下一篇</span>
              <span className="font-medium group-hover:text-primary transition-colors">
                {nextPost.title}
              </span>
            </Link>
          )}
        </nav>
      )}
    </div>
  )
}