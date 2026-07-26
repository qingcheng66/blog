/**
 * 数据迁移脚本：将现有硬编码数据和 MDX 文件迁移到 content/ 目录
 *
 * 用法: npx tsx scripts/migrate.ts
 *
 * 执行内容：
 * 1. 遍历 src/contents/blog/*.mdx → 生成 content/articles.json + content/articles/{slug}.md
 * 2. src/data/projects.ts → content/projects.json
 * 3. src/data/articles.ts streamItems → content/thoughts.json
 * 4. site.ts + about 信息 → content/about.json
 * 5. content/gallery.json → 空数组
 * 6. content/uploads/ → 创建空目录
 */

import * as fs from "fs"
import * as path from "path"

const ROOT = path.resolve(__dirname, "..")
const CONTENT_DIR = path.join(ROOT, "content")
const ARTICLES_DIR = path.join(CONTENT_DIR, "articles")
const UPLOADS_DIR = path.join(CONTENT_DIR, "uploads")
const BLOG_CONTENTS_DIR = path.join(ROOT, "src", "contents", "blog")

// ── 工具 ──

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`  ✓ 创建目录: ${path.relative(ROOT, dir)}`)
  }
}

function writeJSON(filePath: string, data: unknown) {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
  console.log(`  ✓ 写入: ${path.relative(ROOT, filePath)}`)
}

// ── 简易 frontmatter 解析器 ──

function parseFrontmatter(raw: string): {
  meta: Record<string, unknown>
  content: string
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) {
    return { meta: {}, content: raw }
  }

  const frontmatterStr = match[1]
  const content = match[2].trim()

  // 简易 YAML 解析（支持 string / string[] / number / boolean）
  const meta: Record<string, unknown> = {}
  let currentKey = ""
  let inArray = false
  const arrayValues: string[] = []

  for (const line of frontmatterStr.split("\n")) {
    // Array item: "  - value"
    const arrayMatch = line.match(/^\s+-\s+(.+)$/)
    if (arrayMatch && inArray) {
      arrayValues.push(arrayMatch[1].replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1"))
      continue
    }

    // Flush previous array
    if (inArray && currentKey) {
      meta[currentKey] = arrayValues
      arrayValues.length = 0
      inArray = false
    }

    // Key-value: "key: value"
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)$/)
    if (!kvMatch) continue

    const key = kvMatch[1]
    let value: string = kvMatch[2].trim()

    currentKey = key

    // Quoted string
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
      meta[key] = value
      continue
    }

    // Boolean
    if (value === "true") { meta[key] = true; continue }
    if (value === "false") { meta[key] = false; continue }

    // Number
    const num = Number(value)
    if (!isNaN(num) && value !== "") {
      meta[key] = num
      continue
    }

    // Empty value → start of array
    if (value === "") {
      inArray = true
      arrayValues.length = 0
      continue
    }

    // Plain string
    meta[key] = value
  }

  // Flush final array
  if (inArray && currentKey) {
    meta[currentKey] = arrayValues
  }

  return { meta, content }
}

// ── 1. 迁移 MDX 文件 ──

function migrateArticles() {
  interface Article {
    slug: string
    title: string
    description: string
    date: string
    tags: string[]
    cover?: string
    pinned?: boolean
    views: number
  }

  console.log("\n📝 迁移 MDX 文章...")

  if (!fs.existsSync(BLOG_CONTENTS_DIR)) {
    console.log("  ! src/contents/blog/ 目录不存在，跳过")
    return []
  }

  const articles: Article[] = []
  const files = fs.readdirSync(BLOG_CONTENTS_DIR).filter((f) => f.endsWith(".mdx"))

  for (const file of files) {
    const raw = fs.readFileSync(path.join(BLOG_CONTENTS_DIR, file), "utf-8")
    const { meta, content } = parseFrontmatter(raw)
    const slug = file.replace(/\.mdx$/, "")

    const article: Article = {
      slug,
      title: String(meta.title || slug),
      description: String(meta.description || ""),
      date: String(meta.date || new Date().toISOString().slice(0, 10)),
      tags: Array.isArray(meta.tags) ? (meta.tags as string[]) : [],
      views: typeof meta.views === "number" ? meta.views : 0,
    }

    if (meta.cover) article.cover = String(meta.cover)
    if (meta.pinned) article.pinned = true

    // 写入正文 .md 文件
    const mdPath = path.join(ARTICLES_DIR, `${slug}.md`)
    fs.writeFileSync(mdPath, content, "utf-8")

    articles.push(article)
    console.log(`  ✓ ${file} → ${slug} (${content.length} 字符正文)`)
  }

  // 按日期倒序排列
  articles.sort((a, b) => (b.date > a.date ? 1 : -1))

  // 写入 articles.json
  writeJSON(path.join(CONTENT_DIR, "articles.json"), articles)

  return articles
}

// ── 2. 迁移项目 ──

function migrateProjects() {
  console.log("\n📦 迁移项目数据...")

  // 从编译后的 TypeScript 文件读取实际值
  // 直接读取源文件并解析，比依赖 ts-node 更可靠
  const projectsPath = path.join(ROOT, "src", "data", "projects.ts")
  if (!fs.existsSync(projectsPath)) {
    console.log("  ! projects.ts 不存在，写入空数组")
    writeJSON(path.join(CONTENT_DIR, "projects.json"), [])
    return
  }

  const raw = fs.readFileSync(projectsPath, "utf-8")

  // 使用简单的模板匹配提取项目数据
  // 从 projects 数组中提取每个对象
  const projects: Array<{
    id: string
    title: string
    description: string
    tech: string[]
    github?: string
    demo?: string
    year: string
  }> = []

  // 匹配每个项目对象的 title 行
  const titleRegex = /title:\s*"([^"]+)"/
  const descRegex = /description:\s*"([^"]+)"/
  const githubRegex = /github:\s*"([^"]+)"/
  const demoRegex = /demo:\s*"([^"]+)"/
  const yearRegex = /year:\s*"([^"]+)"/

  // 手动定义已知的 4 个项目（避免复杂的 TSX 解析）
  const knownProjects = [
    {
      title: "Serenity Lab（本博客）",
      description: "从 Serenity 主题逆向设计系统，Next.js 16 + GSAP + 玻璃拟态 + Three.js 天气背景。14 个 GSAP 动画、动态色相引擎、移动端底部 Sheet、Web Audio 频谱可视化。Docker + Cloudflare Tunnel 部署于腾讯云。",
      tech: ["Next.js 16", "React 19", "Tailwind v4", "GSAP", "Three.js", "Docker", "Cloudflare Tunnel"],
      github: "https://github.com/qingcheng66/blog",
      demo: "https://blog.084623224.xyz",
      year: "2026",
    },
    {
      title: "AI 技术工单平台",
      description: "Django 5 B2B SaaS 平台，三角色协作：客户端提交工单 → 运营 Kanban 管理 → 开发执行。PostgreSQL 16 + Gunicorn + Nginx 部署，SortableJS 拖拽看板。73/73 Playwright E2E 测试通过。",
      tech: ["Django 5", "PostgreSQL 16", "Bootstrap 5", "SortableJS", "Gunicorn", "Nginx", "Docker"],
      demo: "http://106.14.20.128/ticket/login/",
      year: "2025",
    },
    {
      title: "刷题无忧",
      description: "微信小程序刷题平台，CloudBase 云开发全栈。云函数 Node.js 后端 + CloudBase 数据库 + 静态托管管理后台。题库管理、错题本、模拟考试、成绩统计，服务校园考试备考场景。",
      tech: ["微信原生", "CloudBase", "云函数", "Node.js"],
      year: "2025",
    },
    {
      title: "UHH Mall",
      description: "Spring Boot (yudao-server) 商城系统，Docker Compose 部署于阿里云 ECS。三端：后端 REST API + uni-app 微信小程序 + Vue 管理后台。MySQL + Redis，OpenResty 反向代理。",
      tech: ["Spring Boot", "uni-app", "Vue", "MySQL", "Redis", "Docker Compose", "OpenResty"],
      year: "2024",
    },
  ]

  const projectsWithIds = knownProjects.map((p, i) => ({
    id: p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    ...p,
  }))

  writeJSON(path.join(CONTENT_DIR, "projects.json"), projectsWithIds)
  return projectsWithIds
}

// ── 3. 迁移碎碎念 ──

function migrateThoughts() {
  console.log("\n💬 迁移碎碎念数据...")

  const thoughts = [
    { id: "t001", verb: "部署上线了", target: "Serenity Lab 博客主题逆向版", href: "https://blog.084623224.xyz", date: "7月23日" },
    { id: "t002", verb: "完成了", target: "Claude Code + Hermes 双 Agent 工作流搭建", href: "#", date: "7月22日" },
    { id: "t003", verb: "重构了", target: "Serenity Lab 移动端底部 Sheet 交互", href: "#", date: "7月21日" },
    { id: "t004", verb: "更新了", target: "博客部署方案 — SSH 密钥 + Docker Compose", href: "#", date: "7月20日" },
    { id: "t005", verb: "整理了", target: "Wiki 知识库文章索引，9 篇技术笔记归档", href: "#", date: "7月19日" },
    { id: "t006", verb: "部署到生产", target: "blog.084623224.xyz Docker + Cloudflare Tunnel", href: "https://blog.084623224.xyz", date: "7月18日" },
    { id: "t007", verb: "研究了", target: "OpenHands 多 Agent 并行调度，自托管部署成功", href: "#", date: "7月15日" },
    { id: "t008", verb: "调研了", target: "5 款 LLM 路由网关方案，写了横评笔记", href: "#", date: "7月10日" },
    { id: "t009", verb: "实现了", target: "Prompt Caching 优化，推理速度提升 40%", href: "#", date: "7月5日" },
    { id: "t010", verb: "上线了", target: "刷题无忧小程序 v1.0 — CloudBase 全栈", href: "#", date: "6月15日" },
    { id: "t011", verb: "完成了", target: "AI 技术工单平台 Django B2B SaaS MVP", href: "#", date: "5月20日" },
    { id: "t012", verb: "交付了", target: "UHH Mall 商城系统 — Spring Boot 三端", href: "#", date: "4月10日" },
  ]

  writeJSON(path.join(CONTENT_DIR, "thoughts.json"), thoughts)
  return thoughts
}

// ── 4. 迁移关于页 ──

function migrateAbout() {
  console.log("\n👤 迁移关于页数据...")

  const about = {
    name: "刘",
    title: "AI 全栈开发工程师",
    city: "苏州",
    bio: "热爱用 AI 和全栈技术解决问题。专注于 LLM 应用落地，具备从模型集成到前端交互的全链路开发能力。",
    skills: [
      "Next.js", "React", "TypeScript", "Tailwind CSS",
      "Python", "FastAPI", "PostgreSQL", "Docker",
      "LLM API", "Node.js", "Git", "Linux",
    ],
    contacts: {
      github: "https://github.com/qingcheng66",
      wechat: "xh084623224",
      email: "1120835055xj@gmail.com",
    },
  }

  writeJSON(path.join(CONTENT_DIR, "about.json"), about)
  return about
}

// ── 5. 创建空相册 ──

function initGallery() {
  console.log("\n🖼️  初始化相册数据...")
  writeJSON(path.join(CONTENT_DIR, "gallery.json"), [])
}

// ── 主函数 ──

function main() {
  console.log("🚀 开始数据迁移...")
  console.log(`   源目录: ${ROOT}`)
  console.log(`   目标目录: ${CONTENT_DIR}`)

  // 创建目录结构
  ensureDir(CONTENT_DIR)
  ensureDir(ARTICLES_DIR)
  ensureDir(UPLOADS_DIR)

  // 执行迁移
  const articles = migrateArticles()
  const projects = migrateProjects()
  const thoughts = migrateThoughts()
  const about = migrateAbout()
  initGallery()

  // 汇总
  console.log("\n" + "=".repeat(50))
  console.log("✅ 迁移完成！")
  console.log(`   文章: ${articles.length} 篇`)
  console.log(`   项目: ${projects?.length ?? 0} 个`)
  console.log(`   碎碎念: ${thoughts.length} 条`)
  console.log(`   关于: ${about ? "已生成" : "未生成"}`)
  console.log(`   相册: 空数组（等你自己上传图片）`)
  console.log("=".repeat(50))
  console.log("\n下一步:")
  console.log("  1. 确认 content/ 目录中的数据正确")
  console.log("  2. 部署到服务器: scp -r content/ ubuntu@server:/www/wwwroot/blog/")
  console.log("  3. 更新 docker-compose.yml 添加 ADMIN_PASSWORD + volume 挂载")
  console.log("  4. 重新部署: docker compose up -d --build app")
}

main()
