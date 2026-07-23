# Project Memory

> Claude Code 自维护。记录跨会话有价值的信息，不记执行日志或 TODO。

## 架构决策

### AD-001: 复制主博客骨架而非从零搭建 (2026-07-21)
**决策：** reverse/ 的 Next.js 骨架直接复制 `~/Documents/blog/`，然后删掉不需要的部分。
**原因：** 主博客已经有一套完整的 App Router + hooks + GSAP 管线 + 部署配置。从 `create-next-app` 从零搭会在基础设施上浪费大量时间。reverse/ 的真正产出是 Serenity 风格的主题皮肤（CSS 变量 + React 组件），不是另一个独立博客。
**影响：** 保留了 3 个 hooks (use-theme, use-reduced-motion, use-touch-device)、GSAP 组件 (StarField, SplitText, ScrollToTop, MagneticWrapper 等)、lib/utils.ts。

### AD-002: 色相系统作为独立 hook (2026-07-21)
**决策：** `hooks/use-accent-hue.ts` 独立于任何 UI 组件，在 mount 时从 localStorage 读取 accent 色 → 计算 HSL → 写 CSS 变量到 `:root`。
**原因：** Serenity 的动态色相系统是全局 CSS 变量层的事，不应该和任何特定组件耦合。这样任何组件只需要引用 `var(--color-accent)` 就能自动跟随色相变化。

### AD-003: 不依赖 shadcn/ui (2026-07-21)
**决策：** 删除所有 `@/components/ui/*` 组件和相关依赖 (shadcn, tw-animate-css, @base-ui/react, @tailwindcss/typography, next-mdx-remote)。
**原因：** 玻璃拟态和动态色相需要完全控制 CSS，shadcn/ui 的组件抽象层反而成为阻力。

### AD-004: 多页面路由而非单页滚动 (2026-07-21)
**决策：** 使用 Next.js App Router 独立路由（/articles, /projects, /thoughts, /gallery, /about），每个页面独立 `page.tsx`。
**原因：** 用户明确要求多标签页面，不要单页长滚动把内容全塞首页。

### AD-005: 天气使用 QWeather API + 固定城市 (2026-07-22)
**决策：** 使用和风天气 API（`ky59febe7r.re.qweatherapi.com`），城市固定为苏州（locationId: 101190401），显示站主所在地天气而非访问者位置。
**原因：** wttr.in 在国内被墙（ERR_CONNECTION_CLOSED）。自动地理定位过度设计且涉及隐私，站主明确要求使用自己的固定城市。
**API 端点：** `GET https://{apiHost}/v7/weather/now?location={locationId}&key={apiKey}` → `data.now.temp` + `data.now.text`。

### AD-007: 主题色切换集成到 Header + 背景饱和度提升 (2026-07-22)
**决策：** 将 6 个预设色块从浮动调试面板迁移到 Header 桌面端导航栏（搜索按钮旁），删除原 AccentSwitcher 浮动组件。同时将背景色饱和度从 3-4% 提升到 14-20%，使不同主题的背景色调差异肉眼可感知。
**原因：** 原 AccentSwitcher 藏在右下角小圆点后，标签"色相调试"，用户完全感知不到。用户明确"主题色是指背景的颜色"——切换色块应当明显改变页面整体色调（暗紫/暗蓝/暗绿等），而非仅改变强调色。
**影响：** `use-accent-hue.ts` 新增 `accent` getter + 导出 `PRESET_COLORS` 常量。Header 直接调用 `useAccentHue()` 渲染 6 个 14px 色块。`applyAccent()` 背景公式改为 `hsl(H, sat%, lit%)`，由用户 slider 控制。

### AD-008: 背景饱和度 + 亮度可调节 slider (2026-07-22)
**决策：** 在 Header 色相圆点旁新增 `SlidersHorizontal` 图标按钮，点击弹出玻璃拟态下拉面板，内含饱和度(5-60%)和亮度(3-40%)两个 range 滑块。值通过 `use-accent-hue` 管理并写入 localStorage 持久化。
**原因：** 原背景饱和度和亮度硬编码为 sat=20%, lit=9%，用户无法调整。用户明确"最好可以有一个饱和度亮度条可以自由调整"。
**影响：** `use-accent-hue.ts` 新增 `saturation`/`lightness` 状态 + `SAT_KEY`/`LIT_KEY` localStorage key + setter 函数。`applyAccent()` 签名扩展为 `(hex, bgSat, bgLit)`，背景三变量使用动态值而非硬编码常量。`globals.css` 新增 `input[type="range"]` 自定义样式（thumb 跟随 accent 色发光）。

### AD-009: 移除亮/暗模式切换，项目仅暗色模式 (2026-07-22)
**决策：** 从 `glass-header.tsx` 移除主题切换按钮（桌面端 Sun/Moon + 移动端文字按钮），从 `use-accent-hue.ts` 移除 `useTheme` 依赖和 `isLight` 亮色分支逻辑。`globals.css` 中 `html.light` 块保留但不被激活。
**原因：** 用户明确"把日间模式和夜间模式删除吧"。此前亮色模式存在核心 bug——`applyAccent()` 通过 `root.style.setProperty` 写内联样式，优先级高于 `html.light` CSS 规则，导致背景色无法跟随主题切换。修复后用户仍不满意亮色效果，决定只保留暗色模式。
**影响：** `use-accent-hue.ts` 不再导入 `useTheme`，`applyAccent` 恢复为单一暗色公式。`glass-header.tsx` 移除 `useTheme`/`Sun`/`Moon`/`LIGHT_L_OFFSET` 导入和 `isDark`/`effectiveBrightness`/`setTheme` 变量。Header 导航栏更简洁。

### AD-010: 关于页联系方式更新 + 简历下载 (2026-07-22)
**决策：** 删除 Twitter 链接，替换为微信号 `xh084623224`（MessageSquare 图标，非链接）。Contact 卡片底部新增 accent 色 outline button，链接 `/resume.pdf`（download 属性）。
**原因：** 用户明确的个人联系方式变更。
**影响：** `site.ts` social 对象 `twitter` → `wechat`。`about-section.tsx` 导入 `MessageSquare` + `Download`，WeChat 行为 `<div>` 而非 `<a>`（无标准微信链接协议）。

### AD-011: 页面背景替换为水墨 GIF (2026-07-22)
**决策：** `public/bg.gif`（水墨山水飞鸟+水波动图）作为页面最底层固定背景，上方叠加 65% 不透明度黑色蒙层。StarField 粒子在蒙层之上（z:-5），玻璃拟态卡片通过 `backdrop-filter` 透过模糊的动图。`background-size: cover` 适配桌面和移动端。
**原因：** 原纯色背景缺乏视觉层次，水墨动图 + 玻璃拟态能体现 Serenity 设计系统的核心体验。
**影响：** `layout.tsx` 新增固定背景层（z:-10 GIF + z:-9 蒙层），`globals.css` body 背景改为 `#000` 兜底。

### AD-012: 音乐播放器组件 (2026-07-22)
**决策：** 新建 `src/components/music-player.tsx`，注册到 `layout.tsx`。右下角浮动圆按钮（玻璃拟态 + 播放时 3s 旋转动画）+ 展开面板（播放/暂停 + 垂直音量 slider）。音频源 `/music/bg.mp3`，loop 循环。
**原因：** 用户要求背景音乐功能。
**影响：**
- 首次播放由用户点击触发（浏览器 autoplay 限制），之后可自由控制
- 音量 localStorage key: `serenity-music-volume`，默认 0.5
- 未交互时按钮 opacity 0.45，hover 后 1.0
- 点击面板外自动关闭（pointerdown 监听）
- 垂直音量 slider 通过 `transform: rotate(-90deg)` 实现

## 踩坑记录

### PIT-001: lucide-react 没有 Github 图标 (2026-07-21)
lucide-react 不导出 `Github` 组件（错误提示 "Did you mean to import Gift?"）。使用 `Globe` 替代。同样没有 `Twitter`（用 `MessageCircle` 替代）。

### PIT-002: 卡片玻璃背景太透 (2026-07-21)
`--glass-bg: rgba(0,0,0,0.25)` 在深色背景上几乎看不见。卡片类组件（projects/articles/gallery/about）必须用 `--glass-bg-strong: rgba(0,0,0,0.4)`。

### PIT-003: GSAP from stagger 造成透明度不一致 (2026-07-21)
`gsap.from({ opacity: 0, stagger })` 让卡片加载瞬间有不同透明度。修复：去掉 opacity 动画，只保留 y 位移的 stagger 效果。有 ScrollTrigger 的 stagger 不受影响。

### PIT-004: 首页「向下滚动」指示器多余 (2026-07-21)
多页面路由下首页只有 Hero，没有下方内容可滚动。已从 hero-section.tsx 移除 ScrollIndicator（函数定义 + 调用 + ChevronDown 导入）。

### PIT-005: wttr.in 在国内连接不稳定 → 已切换 QWeather (2026-07-22)
浏览器控制台报 `net::ERR_CONNECTION_CLOSED`。已切换为和风天气 API（见 AD-005），固定城市苏州，失败时 fallback 到 `☀️ --°C` 占位。

### PIT-006: 色相调试面板默认应折叠 → 已废弃 (2026-07-22)
`AccentSwitcher` 从始终展开改为默认折叠。随后 AD-007 将色块迁移到 Header 导航栏，`accent-switcher.tsx` 已删除。

### PIT-007: 搜索 Modal 的 Mock 数据是 wangxinyang 的文案 ✅ 已修复 (2026-07-22)
`search-modal.tsx` 中 `MOCK_RESULTS` 包含 "初尝腾讯WorkBuddy"、"PPT Master 使用教程" 等逆向目标的文章标题。已替换为用户真实文章数据。

### PIT-008: 页脚假数据 ✅ 已修复 (2026-07-22)
Footer 包含假的 ICP 备案号（蜀ICP备XXXXXXXX号）、假的在线人数（3 人在线）、运行天数计数器。全部移除，只保留 Copyright + 技术栈标注。

### PIT-009: Tailwind `hover:` 类名未包 `@media (hover: hover)` ✅ 已修复 (2026-07-22)
`globals.css` 第 4 行已定义 `@custom-variant hover-media (@media (hover: hover))`，`skill-cloud.tsx` 也在用，但其他 9 个组件的 12 处 Tailwind `hover:` 工具类（如 `hover:scale-110`、`hover:bg-white/5`）未改用 `hover-media:hover:` 变体。`group-hover:` 由于都在 `md:` 断点以上（桌面端独有），影响极小，暂未修改。
另外 `compass-nav.tsx` 的 `<style>` 标签中 `.compass-card:hover` 也未包 `@media (hover: hover)`，一并修复。
**影响：** 触屏设备上按钮/链接 hover 状态会"粘住"（sticky hover），需要再点一次才能消除。
**修复：** 将以下文件中的 Tailwind `hover:` → `hover-media:hover:`：
- `accent-switcher.tsx` (3 处)、`search-modal.tsx` (2 处)、`glass-header.tsx` (2 处)
- `article-feed.tsx` (2 处)、`scroll-to-top.tsx` (1 处)、`welcome-splash.tsx` (1 处)
- `lightbox.tsx` (1 处)、`code-block.tsx` (1 处)、`table-of-contents.tsx` (1 处)
- `compass-nav.tsx` (CSS `:hover` 包 `@media (hover: hover)`)

### PIT-010: layout.tsx `className="dark"` 写死主题 ✅ 已修复 (2026-07-22)
`layout.tsx:25` `<html className="dark">` 硬编码暗色模式，导致 GlassHeader 中 Sun/Moon 按钮点击后 `use-theme.tsx` 的 `applyTheme()` 调用 `classList.remove("light", "dark")` 再 `classList.add("light")` 无效——因为服务端始终输出 `class="dark"`。同时 `use-theme.tsx` 默认 `defaultTheme="system"`，客户端 hydration 后按系统偏好恢复。
**修复：**
1. 去掉 `<html>` 上硬编码的 `className="dark"`
2. 在 `<head>` 中注入同步 inline `<script>`，在首次渲染前读 `localStorage('theme')` 设置正确 class：
   - `'light'` → `classList.add('light')`
   - `'dark'` → `classList.add('dark')`
   - 无存储 + 系统暗色 → `classList.add('dark')`
   - 无存储 + 系统亮色 → 不加 class（CSS `:root` 默认即为暗色 token，视觉效果保持暗色）


## H5/移动端适配 (2026-07-22)

### 已修复

| 问题 | 修复 |
|------|------|
| Header 缺 `safe-area-inset-top` | `height: calc(var(--header-height) + env(safe-area-inset-top))` + `paddingTop` |
| Footer/Body 缺 `safe-area-inset-bottom` | Footer: `paddingBottom: calc(2rem + env(safe-area-inset-bottom))` |
| 所有 hover 效果未包 `@media (hover: hover)` | `<style>` 标签中 `.xxx:hover` 包裹 `@media (hover: hover)`（5 组件）；Tailwind `hover:` 工具类改为 `hover-media:hover:`（10 组件，见 PIT-009） |
| 触屏内联 hover 处理器 | hero-section.tsx SocialLinks 添加 `useTouchDevice` 守卫，触屏跳过 onMouseEnter/Leave |
| StarField 移动端粒子数过高 | `<768px` 粒子数上限 120→40，密度公式从 /8000 改为 /15000 |
| 触摸目标 <44px | 搜索按钮和主题切换 `min-w-[44px] min-h-[44px]`，社交图标 p-2.5→p-3 + icon 18→20px |

### 已就绪（无需改动）
- `viewport-fit=cover` + `themeColor` 在 layout.tsx 已设
- `touch-action: manipulation` 全局启用
- `@custom-variant hover-media` CSS 声明
- MagneticWrapper 已集成 `useTouchDevice`（触屏直接渲染 `<span>`）
- ScrollToTop 已使用 `safe-area-inset-bottom/right`
- GSAP 组件已集成 `useReducedMotion`

## 文件地图

```
reverse/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # 根布局：ThemeProvider + StarField + GlassHeader + Footer + SearchModal
│   │   ├── page.tsx             # 首页：WelcomeSplash + HeroSection
│   │   ├── globals.css          # Serenity CSS 变量 + 玻璃拟态 + 暗色模式 + 自定义 range 滑块 + 滚动条
│   │   ├── articles/page.tsx    # 文章列表页 → ArticleFeed
│   │   ├── projects/page.tsx    # 项目卡片网格 → ProjectsGrid (projects-grid.tsx)
│   │   ├── thoughts/page.tsx    # 碎碎念时间线 → StreamTimeline
│   │   ├── gallery/page.tsx     # 相册占位网格 → GalleryGrid (gallery-grid.tsx)
│   │   └── about/page.tsx       # 关于页 → AboutSection (about-section.tsx)
│   ├── components/
│   │   ├── glass-header.tsx     # 玻璃导航栏 + safe-area + 6 色相圆点 + 背景 sat/lit slider + 搜索按钮
│   │   ├── hero-section.tsx     # Hero 区：头像发光环 + QWeather 天气时钟 + 渐变签名 + 社交图标(touch-safe)
│   │   ├── welcome-splash.tsx   # Welcome 开场动画（shimmer 标题，sessionStorage 防重复）
│   │   ├── article-feed.tsx     # 文章列表（编号 stroke→fill hover + 封面 + PIN + 阅读量）
│   │   ├── stream-timeline.tsx  # 站点动态时间线（渐变左边框 + 标记点 glow + 下划线动画）
│   │   ├── compass-nav.tsx      # 罗盘导航网格 — 当前未使用
│   │   ├── search-modal.tsx     # 全局搜索弹窗（Cmd+K 快捷键，用户真实数据）
│   │   ├── music-player.tsx     # 浮动音乐播放器：播放/暂停 + 垂直音量 slider + localStorage 持久化
│   │   ├── footer.tsx           # 极简页脚：Copyright + Powered by，safe-area-inset-bottom
│   │   ├── theme-provider.tsx   # 主题 Provider（useTheme hook）
│   │   ├── star-field.tsx       # Canvas 粒子背景（暗色模式，移动端粒子降级）
│   │   ├── scroll-to-top.tsx    # 回到顶部浮动按钮（已适配 safe-area-inset）
│   │   └── ...                  # 主博客复用组件（magnetic-wrapper, lightbox, split-text 等）
│   ├── hooks/
│   │   ├── use-theme.tsx        # 主题切换（html.dark / html.light class toggle）
│   │   ├── use-accent-hue.ts    # 动态色相引擎（hex→HSL→CSS 变量写入 :root，sat/lit slider 持久化，导出 PRESET_COLORS）
│   │   ├── use-reduced-motion.ts # prefers-reduced-motion 检测
│   │   └── use-touch-device.ts  # 触屏设备检测（pointer:coarse + ontouchstart）
│   ├── data/
│   │   ├── site.ts              # 站点元数据（刘 / 苏州 / QWeather API 配置 / 社交链接）
│   │   ├── articles.ts          # 文章列表 + StreamItem（从主博客 MDX frontmatter 提取）
│   │   └── projects.ts          # 项目数据（从主博客 src/data/projects.ts 复制）
│   └── lib/
│       ├── utils.ts             # cn() 工具函数
│       └── gsap.ts              # GSAP + ScrollTrigger 集中注册（避免多模块重复注册）
├── package.json
└── CLAUDE.md                    # 项目文档（稳定设计规范 + 已知坑位）
```

## 移植清单（到主博客 blog.084623224.xyz）

| 文件 | 操作 | 说明 |
|------|------|------|
| hooks/use-accent-hue.ts | 新增 | 核心：动态色相引擎 |
| globals.css | 合并 | Serenity CSS 变量体系，通过 `[data-theme-variant="serenity"]` 与原 warm oklch 共存 |
| glass-header.tsx | 替换 | 替换主博客 header.tsx（含 safe-area + 触摸目标优化） |
| hero-section.tsx | 重写 | Serenity 风格 Hero（含 QWeather 天气 + touch-safe 社交图标） |
| welcome-splash.tsx | 新增 | 主博客目前没有 |
| search-modal.tsx | 新增 | 全局搜索（Cmd+K） |
| footer.tsx | 替换 | 极简页脚（Copyright + Powered by） |
| accent-switcher.tsx | 不移植 | 已删除，色块已集成到 glass-header.tsx 中 |

---
*初始创建：2026-07-20*
*最新更新：2026-07-22 — AD-010 关于页联系方式更新 + AD-011 水墨 GIF 背景 + AD-012 音乐播放器*
