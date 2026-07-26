# Task: 博客管理后台

## 一句话目标

在博客里加一个管理后台 `/admin`，让我能在浏览器里编辑文章/项目/碎碎念/相册/关于页，改了立刻生效，不需要 rebuild 容器。

---

## 架构决策

| 决策 | 选择 | 原因 |
|------|------|------|
| 数据存储 | JSON 文件，存在 Docker volume 上 | 单用户博客不需要数据库，JSON 可读可备份 |
| 渲染方式 | SSR 动态渲染（server component 读文件） | 改完立刻生效，不 rebuild |
| 文章格式 | 纯 Markdown + `react-markdown` | 不需要编译，比 MDX 简单 |
| 后台 UI | 复用现有 Tailwind + 玻璃拟态 | 风格一致，无需新依赖 |
| 登录鉴权 | 环境变量 `ADMIN_PASSWORD` + httpOnly cookie | 简单够用 |
| 图片上传 | 存到 volume 的 `uploads/` 目录 | 和文章数据一起持久化 |

---

## 数据存储

所有内容存为 JSON 文件，在 Docker volume 挂载的 `/app/content/` 目录下。宿主机路径 `/www/wwwroot/blog/content/`。

### content/ 目录结构

```
content/
├── articles.json          # 文章元数据数组
├── articles/              # 文章正文，每篇一个 .md 文件
│   ├── claude-hermes-workflow.md
│   ├── docker-nextjs-deploy.md
│   └── ...
├── projects.json          # 项目数组
├── thoughts.json          # 碎碎念数组
├── gallery.json           # 相册数组
├── about.json             # 关于页内容（单个对象）
└── uploads/               # 上传的图片
```

### 数据格式

```typescript
// articles.json
interface Article {
  slug: string          // URL 标识，如 "docker-nextjs-deploy"
  title: string
  description: string
  date: string          // "2026-07-18"
  tags: string[]
  cover?: string        // 封面图路径，如 "/content/uploads/cover-xxx.jpg"
  pinned?: boolean
  views: number
}

// articles/{slug}.md  — 纯 Markdown 正文，不加 frontmatter

// projects.json
interface Project {
  id: string            // 唯一 ID，如 "serenity-lab"
  title: string
  description: string
  tech: string[]
  github?: string
  demo?: string
  year: string
}

// thoughts.json
interface Thought {
  id: string            // 自增或时间戳
  verb: string          // "部署上线了"
  target: string        // "Serenity Lab"
  href?: string         // 可选链接
  date: string          // "7月23日"
}

// gallery.json
interface GalleryItem {
  id: string
  src: string           // 图片路径，如 "/content/uploads/photo-1.jpg"
  label: string         // 照片标题
}

// about.json
interface About {
  name: string          // "刘"
  title: string         // "AI 全栈开发工程师"
  city: string          // "苏州"
  bio: string           // 个人简介
  skills: string[]      // 技术栈标签
  contacts: {
    github: string
    wechat: string
    email: string
  }
}
```

---

## 管理后台路由

所有在 `/admin/*` 下。未登录重定向到 `/admin/login`。

```
/admin                     仪表盘（各内容数量统计）
/admin/login               登录页 — 一个密码输入框
/admin/articles            文章列表
/admin/articles/new        新建文章
/admin/articles/[slug]     编辑文章
/admin/projects            项目列表 + 新建/编辑（内联表单）
/admin/thoughts            碎碎念列表 + 新建/编辑（内联表单）
/admin/gallery             相册管理 + 上传
/admin/about               关于页编辑
```

### 登录流程

1. 用户访问 `/admin` → 检查 cookie `admin_token` → 没有就跳 `/admin/login`
2. 输入密码 → POST `/api/admin/login` → 服务端比对 `process.env.ADMIN_PASSWORD` → 匹配则 Set-Cookie
3. 密码写在 `docker-compose.yml` 的 environment 里

---

## API 路由

所有 API 在 `/api/admin/*` 下，统一校验 cookie。

```typescript
// 每个 API route 开头校验
import { cookies } from 'next/headers'
function auth() {
  const token = (await cookies()).get('admin_token')?.value
  if (token !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: '未登录' }, { status: 401 })
  }
}
```

### 端点清单

```
POST   /api/admin/login                body: { password } → Set-Cookie
POST   /api/admin/logout               → 清除 cookie

GET    /api/admin/articles             返回 articles.json 数组
POST   /api/admin/articles             body: Article → 写入 articles.json + 创建 articles/{slug}.md
GET    /api/admin/articles/[slug]      返回单篇文章 meta + 正文
PUT    /api/admin/articles/[slug]      body: { meta: Article, content: string } → 更新
DELETE /api/admin/articles/[slug]      删除条目 + 删除 .md 文件

GET    /api/admin/projects             
POST   /api/admin/projects             
PUT    /api/admin/projects/[id]        
DELETE /api/admin/projects/[id]        

GET    /api/admin/thoughts             
POST   /api/admin/thoughts             
PUT    /api/admin/thoughts/[id]        
DELETE /api/admin/thoughts/[id]        

GET    /api/admin/gallery              
POST   /api/admin/gallery              （图片上传用单独的 upload 接口）
PUT    /api/admin/gallery/[id]         
DELETE /api/admin/gallery/[id]        

POST   /api/admin/upload               上传图片 → 存到 /content/uploads/ → 返回路径

GET    /api/admin/about                返回 about.json
PUT    /api/admin/about                body: About → 覆盖 about.json
```

### 数据读写工具函数

新建 `src/lib/content.ts`，封装所有数据读写：

```typescript
import fs from 'fs/promises'
import path from 'path'

const CONTENT_DIR = path.join(process.cwd(), 'content')

// 文章
export async function getArticles(): Promise<Article[]>
export async function getArticleBySlug(slug: string): Promise<{ meta: Article, content: string } | null>
export async function saveArticle(slug: string, meta: Article, content: string): Promise<void>
export async function deleteArticle(slug: string): Promise<void>

// 项目
export async function getProjects(): Promise<Project[]>
export async function saveProjects(projects: Project[]): Promise<void>

// 碎碎念
export async function getThoughts(): Promise<Thought[]>
export async function saveThoughts(thoughts: Thought[]): Promise<void>

// 相册
export async function getGallery(): Promise<GalleryItem[]>
export async function saveGallery(items: GalleryItem[]): Promise<void>

// 关于
export async function getAbout(): Promise<About>
export async function saveAbout(about: About): Promise<void>
```

---

## 前端页面改动

### 需要改为动态读取的现有文件

把页面从 "构建时静态 import" 改为 "请求时服务端读取"：

| 文件 | 现在 | 改为 |
|------|------|------|
| `app/articles/page.tsx` | 客户端组件直接渲染 ArticleFeed | async server component，`await getArticles()` → props 传给 ArticleFeed |
| `app/projects/page.tsx` | 客户端组件直接渲染 ProjectsGrid | async server component，`await getProjects()` → props |
| `app/thoughts/page.tsx` | 客户端组件直接渲染 StreamTimeline | async server component，`await getThoughts()` → props |
| `app/gallery/page.tsx` | 客户端组件直接渲染 GalleryGrid | async server component，`await getGallery()` → props |
| `app/about/page.tsx` | 客户端组件直接渲染 AboutSection | async server component，`await getAbout()` → props |
| `app/page.tsx` (首页) | HeroSection 内嵌 WeatherClock 等 | 不动（首页数据来自 QWeather API + site.ts，不涉及后台管理内容） |

### 需要重构的客户端组件

`ArticleFeed`、`StreamTimeline`、`ProjectsGrid`、`GalleryGrid`、`AboutSection` 改为接收 props，不再 hardcode import：

```typescript
// 之前
import { articles } from "@/data/articles"
export function ArticleFeed() {
  return articles.map(...)
}

// 之后
import type { Article } from "@/lib/content"
export function ArticleFeed({ articles }: { articles: Article[] }) {
  return articles.map(...)
}
```

### 新建：文章详情页（填补 Task 1 缺口）

```
src/app/blog/[slug]/page.tsx
```

- async server component
- `await getArticleBySlug(params.slug)`
- 用 `react-markdown` 渲染正文
- 用 `remark-gfm` 支持表格/删除线
- 用 `rehype-highlight` 代码高亮
- ArticleFeed 中 href 从 `#slug` 改为 `/blog/${article.slug}`

### 可以删除的文件

- `src/data/articles.ts` — 被 `lib/content.ts` + volume 替代
- `src/data/projects.ts` — 同上
- `src/contents/blog/*.mdx` — 正文迁到 volume 的 `content/articles/` 后不再需要

---

## 迁移脚本

新建 `scripts/migrate.ts`，做一次性数据迁移：

1. 遍历 `src/contents/blog/*.mdx`，解析 frontmatter + 正文
2. 生成 `content/articles.json`
3. 每篇正文写入 `content/articles/{slug}.md`
4. `src/data/projects.ts` → `content/projects.json`
5. `articles.ts` 的 `streamItems` → `content/thoughts.json`
6. `site.ts` 中 name/title/city/bio → `content/about.json`（skills 和 contacts 用当前 AboutSection 里的值）
7. `content/gallery.json` → 空数组 `[]`
8. `content/uploads/` → 创建空目录

执行方式：本地跑 `npx tsx scripts/migrate.ts`，生成 content/ 目录，然后 scp 到服务器。

---

## 依赖

```bash
npm install react-markdown remark-gfm rehype-highlight
```

不装 better-sqlite3、不装 Prisma、不装 JWT、不装 next-auth。就上面 3 个。

---

## 部署改动

### Dockerfile — 不需要改

因为 Next.js standalone 模式下我们通过 volume 挂载 content/ 目录。

### docker-compose.yml

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    expose:
      - "3000"
    environment:
      - NODE_ENV=production
      - ADMIN_PASSWORD=yourpasswordhere    # 新增：管理后台密码
    volumes:
      - ./content:/app/content              # 新增：挂载数据目录

  tunnel:
    # 不变
```

### 服务器部署步骤

```bash
# 1. 在服务器上创建数据目录
mkdir -p /www/wwwroot/blog/content/uploads

# 2. 本地运行迁移脚本生成 content/ 文件
npx tsx scripts/migrate.ts

# 3. 上传 content/ 到服务器
scp -i ~/Downloads/admin.pem -r content/ ubuntu@110.42.249.198:/www/wwwroot/blog/

# 4. 正常部署
git push
ssh -i ~/Downloads/admin.pem ubuntu@110.42.249.198 \
  "cd /www/wwwroot/blog && sudo git pull && sudo docker compose up -d --build app"
```

---

## 边界

- 不装数据库驱动（SQLite/MySQL/Prisma 都不需要）
- 不修改 Docker 多阶段构建逻辑
- 不修改现有 GSAP/Three.js/StarField 等组件
- 不修改首页 HeroSection（它只展示天气和签名，不涉及后台管理内容）
- 后台 UI 复用现有 Tailwind + 玻璃拟态 CSS 变量，不引入 UI 框架
- 文章编辑器用 textarea，不做富文本/双栏预览（你写 Markdown 够用了）
- 不上传文件大小限制（个人用，信你自己）
