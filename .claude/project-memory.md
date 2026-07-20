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

### 可访问性 & 设备适配 Hooks
- `src/hooks/use-reduced-motion.ts` — 检测 `prefers-reduced-motion: reduce`，SSR 时返回 false 避免 hydration mismatch。所有 GSAP/rAF 组件都应使用此 hook 跳过或简化动画
- `src/hooks/use-touch-device.ts` — 检测 `pointer: coarse` + `ontouchstart`，SSR 安全的设备检测。触屏设备上应禁用鼠标跟随效果（tilt card、magnetic hover、3D 视差），改用自动漂移动画作为后备
- **约定**：新组件如果包含动画或 pointer 交互，必须导入这两个 hook 做适配

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
| 2026-07-19 | 全站可访问性适配 | 新增 useReducedMotion + useTouchDevice hooks，所有动画组件尊重 prefers-reduced-motion，触屏禁用 pointer 跟随改用自动漂移 |
| 2026-07-19 | ScrollAnimator scope 隔离 | `gsap.from(".scroll-card")` 改为 `ref.current.querySelectorAll(".scroll-card")`，避免跨 section 误触发其他区域的卡片 |
| 2026-07-19 | Hero3DBg 触屏自动漂移 | 触屏设备上鼠标跟随走 sin/cos 自动漂移（`idlePhaseRef`），桌面端保持 pointer 跟随；添加 visibilitychange 监听以在标签页隐藏时暂停 rAF 省电 |

---

## 已知坑位

- **Next.js 16 有 breaking changes**，参考 `node_modules/next/dist/docs/` 而非在线文档
- **shadcn 组件用 @base-ui/react**，不是传统 Radix UI，所有组件用 `data-slot` 属性而非 className
- **Docker 部署用 standalone output**，凭证在 cloudflared/*.json（已 gitignore）
- **Avatar 组件**的 `size="lg"` prop 内部有 `data-[size=lg]:size-10`（强制 40px），需移除 size prop 才能用自定义尺寸类
- **fs 模块**只能在 Server Component 使用，Client Component 需通过 props 获取数据
- **Google Fonts** 在中国被墙，构建会失败，需用系统字体栈或自托管字体
- **pointer-events** 必须加在 Hero3DBg 的各层 div 上，不能只靠容器的 `pointer-events-none`——3D 层叠会拦截点击；但有 pointer 交互的子元素（如按钮）需保留 auto
- **touch-action: manipulation** 应加到 body（全局消双击缩放延迟）和 tilt-card（防止3D倾斜被浏览器手势拦截）
- **媒体溢出**：`.prose img/video/iframe` 必须设 `max-width: 100%`，否则移动端会撑破布局
- **safe-area-inset**：有刘海屏/灵动岛的设备需要 `header-safe` 类给 header 加 padding-top，否则内容被遮挡

---

## 个人信息

- 姓名: 刘
- 邮箱: 1120835055xj@gmail.com
- GitHub: qingcheng66
- 域名: blog.084623224.xyz
- 部署: Docker + Cloudflare Tunnel

---

## 正在做 / 下一步

Phase 1-3 完成。最近一轮（2026-07-19）：全站可访问性适配（reduced motion + touch device detection）、RAF 省电优化（visibilitychange）、移动端安全区/媒体溢出修复、ScrollAnimator scope 隔离。

下一步方向：
- MDX 文章内容补充
- 部署验证（Docker + Tunnel）

---

## 相关资源

- Wiki 项目文档: `~/knowledge/projects/blog/blog.md`
- 部署: Docker + Cloudflare Tunnel → `blog.084623224.xyz`
