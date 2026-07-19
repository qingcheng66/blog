import Link from "next/link"
import { projects } from "@/data/projects"
import { getAllPosts } from "@/lib/blog"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GradientBg } from "@/components/gradient-bg"
import { HeroSection } from "@/components/hero-section"
import { ScrollAnimator } from "@/components/scroll-animator"
import { TiltCard } from "@/components/tilt-card"
import { SplitText } from "@/components/split-text"
import { CountUp } from "@/components/count-up"

export default function Home() {
  const posts = getAllPosts().slice(0, 3)

  return (
    <div className="space-y-20">
      <GradientBg />

      <HeroSection />

      {/* Stats */}
      <section className="flex justify-center gap-12 md:gap-20 py-8">
        <CountUp end={getAllPosts().length} label="篇文章" />
        <CountUp end={projects.length} label="个项目" />
        <CountUp end={2} suffix="+" label="年经验" />
      </section>

      <ScrollAnimator sectionId="projects" sectionClass="space-y-4">
        <div className="flex items-center justify-between">
          <SplitText as="h2" className="text-2xl font-bold" stagger={0.04}>项目</SplitText>
          <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">
            全部 →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.slice(0, 2).map((p) => (
            <TiltCard key={p.title} className="scroll-card">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{p.title}</h3>
                    {p.year && (
                      <span className="shrink-0 text-xs text-muted-foreground font-mono">{p.year}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{p.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tech.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                  {(p.github || p.demo) && (
                    <div className="flex gap-3 pt-1">
                      {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors">Source</a>}
                      {p.demo && <a href={p.demo} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:text-primary/80 underline underline-offset-4 transition-colors">Live Demo</a>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TiltCard>
          ))}
        </div>
      </ScrollAnimator>

      <ScrollAnimator sectionId="posts" sectionClass="space-y-4">
        <div className="flex items-center justify-between">
          <SplitText as="h2" className="text-2xl font-bold" stagger={0.04}>最新文章</SplitText>
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
            全部 →
          </Link>
        </div>
        <div className="space-y-4">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="scroll-card transition-colors hover:bg-muted/50">
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
      </ScrollAnimator>
    </div>
  )
}
