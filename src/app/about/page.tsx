import { site } from "@/data/site"
import { Download, Mail, ExternalLink } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "关于",
}

const skills = [
  "Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js",
  "Python", "PostgreSQL", "LLM / RAG", "Docker", "AI Agent",
]

export default function AboutPage() {
  return (
    <div className="space-y-12 max-w-2xl">
      {/* Bio */}
      <section className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">关于我</h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p>{site.bio}</p>
          <p>
            专注于将大模型能力落地到实际产品中，具备从模型集成到前端交互的全链路开发能力。
            热衷于探索 LLM 应用的最佳实践，关注 AI 工程化的每一个环节。
          </p>
        </div>
      </section>

      {/* Skills */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">技术栈</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span
              key={s}
              className="inline-block rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">联系我</h2>
        <div className="flex flex-wrap items-center gap-3">
          <a href={site.resumeUrl} download className={buttonVariants({ variant: "default" })}>
            <Download className="mr-1.5 size-4" />
            下载简历
          </a>
          <a href={`mailto:${site.social.email}`} className={buttonVariants({ variant: "outline" })}>
            <Mail className="mr-1.5 size-4" />
            联系我
          </a>
          <a href={site.social.github} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "ghost" })}>
            <ExternalLink className="mr-1.5 size-4" />
            GitHub
          </a>
        </div>
      </section>
    </div>
  )
}
