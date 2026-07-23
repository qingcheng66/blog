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
    title: "关于我与这个博客",
    description: "这是我个人博客的第一篇文章。聊聊我是做什么的，为什么写博客，以及这里会有什么内容。",
    date: "2026-07-19",
    slug: "hello-world",
    views: 89,
  },
  {
    title: "Docker 部署 Next.js 全流程指南",
    description: "从 Dockerfile 编写到生产部署，详细介绍 Next.js 应用容器化的最佳实践，包括多阶段构建、非 root 用户运行和 Cloudflare Tunnel 内网穿透。",
    date: "2026-07-18",
    slug: "docker-nextjs-deploy",
    views: 142,
    pinned: true,
  },
  {
    title: "Next.js 16 新特性与迁移体验",
    description: "从 Next.js 15 升级到 16 的实际体验，包括 Turbopack、React 19 集成和一些值得注意的破坏性变更。",
    date: "2026-07-15",
    slug: "nextjs-16",
    views: 116,
  },
  {
    title: "LLM 应用落地的技术选型思考",
    description: "构建 LLM 应用时，如何选择模型、框架和架构？本文从实际项目出发，分享一些技术选型的经验和判断标准。",
    date: "2026-07-12",
    slug: "llm-app-tech-selection",
    views: 73,
  },
  {
    title: "Tailwind CSS 4 正式版使用体验",
    description: "Tailwind CSS 4 带来了全新的 CSS-first 配置范式。从 v3 升级到 v4，除了惊喜也有一些需要适应的变化。",
    date: "2026-07-08",
    slug: "tailwind-css-4",
    views: 67,
  },
]

export interface StreamItem {
  verb: string
  target: string
  href: string
  date: string
}

export const streamItems: StreamItem[] = [
  { verb: "发布了文章", target: "关于我与这个博客", href: "#", date: "7月19日" },
  { verb: "发布了文章", target: "Docker 部署 Next.js 全流程指南", href: "#", date: "7月18日" },
  { verb: "发布了文章", target: "Next.js 16 新特性与迁移体验", href: "#", date: "7月15日" },
  { verb: "发布了文章", target: "LLM 应用落地的技术选型思考", href: "#", date: "7月12日" },
  { verb: "发布了文章", target: "Tailwind CSS 4 正式版使用体验", href: "#", date: "7月8日" },
  { verb: "更新了项目", target: "个人博客 & 作品集", href: "#", date: "7月5日" },
  { verb: "更新了项目", target: "LLM 对话平台", href: "#", date: "6月28日" },
]
