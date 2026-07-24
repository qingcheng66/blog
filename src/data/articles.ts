export interface Article {
  title: string
  description: string
  date: string
  slug: string
  cover?: string
  views: number
  pinned?: boolean
}

export const articles: Article[] = [
  {
    title: "Claude Code + Hermes 双 Agent 协作工作流",
    description: "Claude Code 写代码、Hermes 写文档，两个终端并排跑，通过 git 通信的双工具分工模式。让 AI 做各自擅长的事。",
    date: "2026-07-22",
    slug: "claude-hermes-workflow",
    views: 231,
    pinned: true,
  },
  {
    title: "Docker 部署 Next.js 全流程指南",
    description: "从 Dockerfile 编写到生产部署，多阶段构建、非 root 用户运行、Cloudflare Tunnel 内网穿透。",
    date: "2026-07-18",
    slug: "docker-nextjs-deploy",
    views: 184,
    pinned: true,
  },
  {
    title: "Cloudflare Tunnel：笔记本变公网服务器",
    description: "不买服务器、不配端口映射，用 Cloudflare 加密隧道让外网通过域名访问本地服务——开发调试、演示、自托管的最佳路径。",
    date: "2026-07-16",
    slug: "cloudflare-tunnel",
    views: 156,
  },
  {
    title: "Claude Code 配置与优化实战",
    description: "配置路径、关键文件、上下文监控、迁移打包——用好 Claude Code 的完整指南，从安装到高效使用。",
    date: "2026-07-14",
    slug: "claude-code-setup",
    views: 203,
  },
  {
    title: "OpenHands：自托管 AI Agent 控制中心",
    description: "不是帮你写代码的，是帮你管一群帮你写代码的 AI 的——多 Agent 并行调度平台，自托管部署全记录。",
    date: "2026-07-10",
    slug: "openhands-ai-agent",
    views: 142,
  },
  {
    title: "LLM 路由器 / AI 网关方案对比",
    description: "按请求内容自动分发到最合适模型：文本→便宜模型，图片→视觉模型，推理→强模型。5 款开源方案横评。",
    date: "2026-07-06",
    slug: "llm-router-gateway",
    views: 127,
  },
  {
    title: "Prompt Caching 原理：让 LLM 推理快 30-50%",
    description: "第一次请求存 KV Cache，后续相同前缀跳过 prefill 阶段直接生成——省时省钱的核心优化技术。",
    date: "2026-07-02",
    slug: "prompt-caching",
    views: 98,
  },
  {
    title: "LLM Wiki：让 AI 维护会生长的知识库",
    description: "Karpathy 提出的模式——不是每次检索，而是 AI 帮你读完全部写成精华笔记，标好交叉引用，知识越滚越厚。",
    date: "2026-06-28",
    slug: "llm-wiki",
    views: 85,
  },
  {
    title: "AI 全栈学习路线（大三→大四）",
    description: "从项目经验、技能树到求职方向，一份 AI 全栈工程师的成长规划。适合正在找方向的 CS 学生参考。",
    date: "2026-06-20",
    slug: "ai-fullstack-roadmap",
    views: 312,
  },
]

export interface StreamItem {
  verb: string
  target: string
  href: string
  date: string
}

export const streamItems: StreamItem[] = [
  { verb: "部署上线了", target: "Serenity Lab 博客主题逆向版", href: "https://blog.084623224.xyz", date: "7月23日" },
  { verb: "完成了", target: "Claude Code + Hermes 双 Agent 工作流搭建", href: "#", date: "7月22日" },
  { verb: "重构了", target: "Serenity Lab 移动端底部 Sheet 交互", href: "#", date: "7月21日" },
  { verb: "更新了", target: "博客部署方案 — SSH 密钥 + Docker Compose", href: "#", date: "7月20日" },
  { verb: "整理了", target: "Wiki 知识库文章索引，9 篇技术笔记归档", href: "#", date: "7月19日" },
  { verb: "部署到生产", target: "blog.084623224.xyz Docker + Cloudflare Tunnel", href: "https://blog.084623224.xyz", date: "7月18日" },
  { verb: "研究了", target: "OpenHands 多 Agent 并行调度，自托管部署成功", href: "#", date: "7月15日" },
  { verb: "调研了", target: "5 款 LLM 路由网关方案，写了横评笔记", href: "#", date: "7月10日" },
  { verb: "实现了", target: "Prompt Caching 优化，推理速度提升 40%", href: "#", date: "7月5日" },
  { verb: "上线了", target: "刷题无忧小程序 v1.0 — CloudBase 全栈", href: "#", date: "6月15日" },
  { verb: "完成了", target: "AI 技术工单平台 Django B2B SaaS MVP", href: "#", date: "5月20日" },
  { verb: "交付了", target: "UHH Mall 商城系统 — Spring Boot 三端", href: "#", date: "4月10日" },
]
