import Link from "next/link"
import { site } from "@/data/site"
import { projects } from "@/data/projects"
import { getAllPosts } from "@/lib/blog"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const posts = getAllPosts().slice(0, 3)

  return (
    <div className="space-y-16">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{site.name}</h1>
        <p className="text-xl text-muted-foreground">{site.title}</p>
        <p className="max-w-2xl text-muted-foreground">
          热爱用 AI 和全栈技术解决问题。这个网站是我的作品集和博客，记录技术探索与项目实践。
        </p>
        <div className="flex gap-3">
          <Link href={site.social.github} className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
            GitHub
          </Link>
          <Link href={`mailto:${site.social.email}`} className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
            Email
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">项目</h2>
          <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">
            全部 →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.slice(0, 2).map((p) => (
            <Card key={p.title}>
              <CardHeader>
                <h3 className="font-semibold">{p.title}</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{p.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">最新文章</h2>
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
            全部 →
          </Link>
        </div>
        <div className="space-y-4">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{post.title}</h3>
                    <time className="text-sm text-muted-foreground">{post.date}</time>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{post.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
