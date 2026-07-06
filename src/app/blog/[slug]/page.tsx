import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import { getPost } from "@/lib/blog"
import { Badge } from "@/components/ui/badge"

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  return (
    <article className="space-y-8">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">{post.meta.title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <time>{post.meta.date}</time>
          {post.meta.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </header>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <MDXRemote source={post.content} />
      </div>
    </article>
  )
}
