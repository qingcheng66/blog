export interface Project {
  title: string
  description: string
  tech: string[]
  github?: string
  demo?: string
  year?: string
}

export const projects: Project[] = [
  {
    title: "个人博客 & 作品集",
    description:
      "基于 Next.js 16 + shadcn/ui 构建的全栈个人网站。支持 MDX 博客、亮/暗主题、GSAP 动效、Docker 部署。注重性能与开发者体验。",
    tech: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "shadcn/ui", "Docker"],
    github: "https://github.com/qingcheng66/blog",
    demo: "https://blog.084623224.xyz",
    year: "2026",
  },
  {
    title: "LLM 对话平台",
    description:
      "企业级 LLM 对话应用，支持多模型切换、对话历史管理、RAG 知识库集成、Prompt 模板管理。基于 Next.js + Python 后端架构。",
    tech: ["Next.js", "Python", "FastAPI", "PostgreSQL", "LLM API", "Docker"],
    github: "https://github.com/qingcheng66/llm-platform",
    year: "2025",
  },
  {
    title: "AI 辅助开发工具链",
    description:
      "命令行 AI 开发助手，集成代码生成、Review、重构功能。支持多模型后端，可自定义工作流。",
    tech: ["TypeScript", "Node.js", "OpenAI API", "CLI"],
    github: "https://github.com/qingcheng66/ai-toolchain",
    year: "2025",
  },
]
