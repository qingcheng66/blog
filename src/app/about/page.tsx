import { site } from "@/data/site"
import { Download, Mail, ExternalLink } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { SplitText } from "@/components/split-text"
import { SkillCloud } from "@/components/skill-cloud"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "关于",
}

const skills = [
  { name: "Next.js" },
  { name: "React" },
  { name: "TypeScript" },
  { name: "Tailwind CSS" },
  { name: "Node.js" },
  { name: "Python" },
  { name: "PostgreSQL" },
  { name: "LLM / RAG" },
  { name: "Docker" },
  { name: "AI Agent" },
  { name: "shadcn/ui" },
  { name: "Git" },
]

export default function AboutPage() {
  return (
    <div className="space-y-12 max-w-2xl">
      {/* Bio */}
      <section className="space-y-4">
        <SplitText as="h1" className="text-3xl font-bold tracking-tight" stagger={0.04}>关于我</SplitText>
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
        <SkillCloud skills={skills} />
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
