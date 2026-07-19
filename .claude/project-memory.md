# 项目记忆 — 由 Claude Code 维护

> 记录你对这个项目的理解、决策、坑位。每次启动先读，关会话前追加新发现。
> 只记**跨会话还有价值**的信息，不记执行日志。

---

## 架构理解

### 路由结构
- **App Router** — 所有页面在 `src/app/` 下
- 首页 `page.tsx`：Server Component，调用 `getAllPosts()` 和 `projects` 数据，渲染 Hero + Stats + 项目卡片 + 文章列表
- 博客列表 `/blog`：Server/Client 分离——`page.tsx`（Server）读取数据传给 `blog-client.tsx`（Client）处理标签筛选/分页/动效
- 博客详情 `/blog/[slug]`：Server Component，`generateStaticParams` SSG，MDX 渲染 + TOC + 相关文章
- 项目页 `/projects`：Server Component，TiltCard 3D 效果
- 关于页 `/about`：Server Component，技能云 + 联系链接

### 主题系统
- 自实现 `hooks/use-theme.tsx`，不依赖 `next-themes`
- localStorage 持久化 + `prefers-color-scheme` 监听
- 亮/暗/系统 三模式，CSS transition 0.5s 平滑切换

### 数据流
- `src/data/site.ts` — 全站点配置，所有页面依赖
- `src/data/projects.ts` — 项目数据，首页 + 项目页
- `src/lib/blog.ts` — 读取 `src/contents/blog/*.mdx`，fs 仅在服务端使用
- 客户端组件通过 props 接收数据（Server/Client 分离模式）

---

## 关键决策

| 时间 | 决策 | 原因 |
|------|------|------|
| 2026-07-19 | 使用 GSAP RAF 循环驱动 3D 视差 | requestAnimationFrame 比 scroll 事件更流畅 |
| 2026-07-19 | Split Text 手动实现而非 GSAP SplitText 插件 | SplitText 是 premium 插件，手动 split 足够且无额外费用 |
| 2026-07-19 | 主题切换使用 CSS transition + 辉光 overlay | next-themes 的 disableTransitionOnChange 防止闪白，叠加 overlay 提供视觉反馈 |
| 2026-07-19 | 替换 next-themes 为自实现 use-theme hook | 消除 React 19 script 标签 console warning，减少依赖 |
| 2026-07-19 | Warm Precision 首页布局 | Vercel 排版精度 + Stripe 大气层，5 列网格（左 3/5 文字 + 右 2/5 头像） |
| 2026-07-19 | GSAP 动效移除 opacity，仅保留 Y 轴位移 | 避免 ScrollTrigger 触发前卡片全透明，确保截图/首屏卡片始终可见 |
| 2026-07-19 | Google Fonts 替换为系统字体栈 | Google Fonts 在中国无法访问，导致构建失败 |

---

## 已知坑位

- **Next.js 16 有 breaking changes**，参考 `node_modules/next/dist/docs/` 而非在线文档
- **shadcn 组件用 @base-ui/react**，不是传统 Radix UI，所有组件用 `data-slot` 属性而非 className
- **Docker 部署用 standalone output**，凭证在 cloudflared/*.json（已 gitignore）
- **Avatar 组件**的 `size="lg"` prop 内部有 `data-[size=lg]:size-10`（强制 40px），需移除 size prop 才能用自定义尺寸类
- **fs 模块**只能在 Server Component 使用，Client Component 需通过 props 获取数据
- **Google Fonts** 在中国被墙，构建会失败，需用系统字体栈或自托管字体

---

## 个人信息

- 姓名: 刘
- 邮箱: 1120835055xj@gmail.com
- GitHub: qingcheng66
- 域名: blog.084623224.xyz
- 部署: Docker + Cloudflare Tunnel

---

## 正在做 / 下一步

Phase 1-3 全部完成。最近完成了 Warm Precision 首页重设计、头像布局调整、GSAP 透明度问题修复。

---

## 相关资源

- Wiki 项目文档: `~/knowledge/projects/blog/blog.md`
- 部署: Docker + Cloudflare Tunnel → `blog.084623224.xyz`
