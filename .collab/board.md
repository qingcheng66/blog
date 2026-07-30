# 任务公告栏

> Hermes 分配 → Claude Code 认领 → 做完移 ✅
> 状态：⏳ 待认领 | 🔄 进行中 | ✅ 完成 | ❌ 放弃

## ⏳ 待认领

### REQ-002 [P0] 主题动效 — 纸纹 + 光扫 + 微悬浮

**涉及文件：** `src/app/globals.css`、`src/app/layout.tsx`、`src/components/glass-header.tsx`、多个卡片组件

**目标：**

1. **修复 `--glass-blur` 缺失** — `globals.css` `:root` 加 `--glass-blur: 12px;`。全站 blur 参数当前为空，修复玻璃效果立即可见变化。

2. **纸纹噪点纹理** — 在 `layout.tsx` `<body>` 内最底层加一个固定全屏 `<div>`，用 CSS `background-image: url("data:image/svg+xml,...")` （SVG feTurbulence 生成噪点），`opacity: 0.04`，`mix-blend-mode: multiply`，`pointer-events: none`。让暖白底从纯色变成纸张感。

3. **玻璃卡片 hover 光扫** — 全局 `.glass` 类加 `::before` 伪元素：对角线渐变（透明→白半透→透明），`translateX(-100%)`，hover 时 `translateX(100%)` 过渡 0.5s。模拟光线掠过玻璃。

4. **卡片微悬浮动画** — 首页 Hero、文章卡片、项目卡片在视口中时，有 ±3px 缓慢上下浮动。用 CSS `@keyframes float-card` + 每张卡片不同 `animation-delay` 实现错相位。`prefers-reduced-motion` 时禁用。

5. **导航 hover 下划线流动** — `glass-header.tsx` 导航链接 hover 时，下划线用 `::after` 伪元素 `scaleX(0→1)` + `transform-origin: left`，0.3s ease。

**边界：**
- 改动限于 CSS + layout.tsx + glass-header.tsx，不碰组件内部结构
- `npm run build` 通过
- 不支持 `backdrop-filter` 的浏览器降级为纯色背景（已有 fallback）

---

### REQ-003 [P1] 音乐播放器 — 后台可管理曲目

**涉及文件：**
- `src/lib/content.ts` — 新增 Music 类型 + getMusic/saveMusic
- `src/app/api/admin/music/route.ts` — GET + PUT API
- `src/app/layout.tsx` — 服务端读 music.json 传给 MusicPlayer
- `src/components/music-player.tsx` — 接收 props，从数据源读曲目
- `src/app/(admin)/admin/music/page.tsx` — 后台管理页
- `src/app/(admin)/admin/layout.tsx` — sidebar 加「音乐」链接
- `content/music.json` — 初始数据文件

**数据模型：**

```typescript
interface MusicConfig {
  trackName: string    // 曲目标题
  artist?: string      // 艺术家（可选）
  file: string         // 音频文件路径，如 "/music/bg.mp3"
}
```

**目标：**

1. **数据层** — `content.ts` 新增 `MusicConfig` 类型 + `getMusic()` / `saveMusic()` 函数，读写 `content/music.json`。初始数据 `{ trackName: "背景音乐", file: "/music/bg.mp3" }`。

2. **API** — `GET /api/admin/music` 返回当前配置；`PUT /api/admin/music` 保存配置（body 含 trackName/artist/file）。鉴权复用 `auth()`。

3. **后台管理页** — `/admin/music`：表单（曲目名称输入框 + 艺术家输入框 + 文件路径输入框 + 保存按钮）。简单直白——不上传音频文件（文件放 `public/music/`，后台只填路径）。玻璃卡片样式与现有后台一致。

4. **Sidebar** — `admin/layout.tsx` `SIDEBAR_LINKS` 数组加 `{ href: "/admin/music", label: "音乐", icon: Music }`。

5. **前端读取** — `layout.tsx`（服务端）用 `getMusic()` 读取配置，通过 props 传给 `<MusicPlayer music={musicConfig} />`。MusicPlayer 接收 props：`trackName`、`artist`、`file`，替代硬编码的 `"/music/bg.mp3"` 和 `"背景音乐"`。props 可选（类型 `MusicConfig | null`），为 null 时用默认值兜底。

6. **播放器 UI 微调** — 展开面板显示 `{artist} - {trackName}`（有 artist 时），否则只显示 trackName。去掉硬编码的「背景音乐」。

**边界：**
- 不上传音频文件——只管理元数据，音频文件手动放 `public/music/`
- `npm run build` 通过
- 曲目管理与现有 6 类数据（articles/projects/thoughts/gallery/about）风格一致

---

### REQ-004 [P2] 起始页 — Welcome 优化 + Hero 下方内容引导

**涉及文件：** `src/components/welcome-splash.tsx`、`src/app/page.tsx`

**目标：**

1. **任意位置点击关闭** — Welcome splash 全屏 div 加 `onClick` 关闭（不只是底部小按钮），按钮保留但加 `opacity-60` 作为提示。

2. **微粒子动效** — Welcome 屏幕加 8-12 个暖金色微小光点（CSS absolute positioned dots），`animation: float-welcome 3s ease-in-out infinite`，每个不同 delay。光点半径 2-3px，opacity 0.3-0.6。

3. **Hero 下方内容预览** — `page.tsx` 在 HeroSection 下方加一个「最近动态」区块：并排两张迷你卡片——左侧「最新文章」（标题+日期，点击跳转 /articles），右侧「最近碎碎念」（verb+target+日期，点击跳转 /thoughts）。服务端 `page.tsx` 用 `getArticles()` / `getThoughts()` 取最新 1 条，通过 props 传给客户端组件渲染。

**边界：** 不改变 HeroSection/WelcomeSplash 现有结构，`npm run build` 通过。

---

## ✅ 最近完成

- 临时任务：移除天气3D代码 + 死代码清理 + 项目状态同步 (Claude Code, 7/30) — 删除 weather-scene(2)+use-time-of-day+star-field+bg.gif+three dep，构建通过
- REQ-001 修复 stream-timeline groupByMonth 年份硬编码 (Claude Code, a52a167, 7/30) — AD-023 已修复
- AD-018~021 修订+重设计 (Claude Code, 505218c, 7/28)
- AD-013~017 暖纸色+管理后台+去占位化 (Claude Code, 7/25-26)
