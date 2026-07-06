import Link from "next/link"
import { getAllPosts } from "@/lib/blog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">博客</h1>
      {posts.length === 0 && <p className="text-muted-foreground">暂无文章</p>}
      <div className="space-y-4">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">{post.title}</h2>
                  <time className="text-sm text-muted-foreground">{post.date}</time>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{post.description}</p>
                {post.tags && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
