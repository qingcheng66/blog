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
    title: "Serenity Lab（本博客）",
    description:
      "从 Serenity 主题逆向设计系统，Next.js 16 + GSAP + 玻璃拟态 + Three.js 天气背景。14 个 GSAP 动画、动态色相引擎、移动端底部 Sheet、Web Audio 频谱可视化。Docker + Cloudflare Tunnel 部署于腾讯云。",
    tech: ["Next.js 16", "React 19", "Tailwind v4", "GSAP", "Three.js", "Docker", "Cloudflare Tunnel"],
    github: "https://github.com/qingcheng66/blog",
    demo: "https://blog.084623224.xyz",
    year: "2026",
  },
  {
    title: "AI 技术工单平台",
    description:
      "Django 5 B2B SaaS 平台，三角色协作：客户端提交工单 → 运营 Kanban 管理 → 开发执行。PostgreSQL 16 + Gunicorn + Nginx 部署，SortableJS 拖拽看板。73/73 Playwright E2E 测试通过。",
    tech: ["Django 5", "PostgreSQL 16", "Bootstrap 5", "SortableJS", "Gunicorn", "Nginx", "Docker"],
    demo: "http://106.14.20.128/ticket/login/",
    year: "2025",
  },
  {
    title: "刷题无忧",
    description:
      "微信小程序刷题平台，CloudBase 云开发全栈。云函数 Node.js 后端 + CloudBase 数据库 + 静态托管管理后台。题库管理、错题本、模拟考试、成绩统计，服务校园考试备考场景。",
    tech: ["微信原生", "CloudBase", "云函数", "Node.js"],
    year: "2025",
  },
  {
    title: "UHH Mall",
    description:
      "Spring Boot (yudao-server) 商城系统，Docker Compose 部署于阿里云 ECS。三端：后端 REST API + uni-app 微信小程序 + Vue 管理后台。MySQL + Redis，OpenResty 反向代理。",
    tech: ["Spring Boot", "uni-app", "Vue", "MySQL", "Redis", "Docker Compose", "OpenResty"],
    year: "2024",
  },
]
