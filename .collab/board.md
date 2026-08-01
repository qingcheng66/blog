# 任务公告栏

> Hermes 分配 → Claude Code 认领 → 做完移 ✅
> 状态：⏳ 待认领 | 🔄 进行中 | ✅ 完成 | ❌ 放弃

## ⏳ 待认领

### REQ-013 [P1] 音乐文件路径迁移到 content/（配合 REQ-012）

**问题：** 音乐 mp3 放 `public/music/` 是 Docker build 时 COPY 进镜像的（非 volume），换歌必须 rebuild 镜像，体验差。

**方案（推荐）：** 音乐文件移到 `content/music/`（volume 挂载，REQ-012 的 /content route 会 serve），前端路径改 `/content/music/xxx.mp3`：
- ⚠️ **注意（Hermes 08-01）：** 现有 `src/app/content/[...path]/route.ts` 只允许 `uploads` 子目录（`segments[0] !== "uploads"` → 404）！若走 content/music/ 需扩展 route 白名单加 `music`（或音乐继续用其他方式）
- 或最简单：**REQ-012 落地后，音乐文件手动放 content/music/，后台填路径 `/content/music/xxx.mp3`**，换歌无需 rebuild
- 保留旧 `/music/bg.mp3` 兼容（public 里的旧文件仍在）

**验证：** 添加曲目路径 `/content/music/xxx.mp3` → 播放器能播。

---

### REQ-014 [P2] 清理 lint 遗留 15 errors（Claude Code 既有代码）

**现状：** `npm run lint` 全量 15 errors + 292 warnings，均为既有遗留（与 Hermes 本轮 .gitignore/route.ts 改动无关）。分布：use-touch-device.ts、use-theme.tsx、use-reduced-motion.ts、welcome-splash.tsx、table-of-contents.tsx、music-player.tsx(86:5, 68:7)、code-block.tsx(21:34)、bg-style-sheet.tsx、article-editor.tsx(49:5)、app/error.tsx、admin/login/page.tsx

**目标：** 消灭 errors（warnings 可酌情）。多为 react-hooks/set-state-in-effect 类（如 `const mq = window.matchMedia(...)` 放 effect 外）。

**验证：** `npm run lint` 0 errors（warnings 不计）。

---

### REQ-015 [P1] 碎碎念与文章合并 + 新排版方式

**需求来源：** 用户 08-01 决定把「碎碎念」和「文章」合并为单一内容流，用新的排版方式展示。

**状态：** 🔄 排版方式待用户提供（用户说"具体排版方式我后面会给你"）——收到排版参考后再细化任务规格。

**初步方向（未定）：**
- 现有 /articles 与 /thoughts 两个页面/数据源，合并后导航栏怎么处理？
- 数据是否合并到一个 JSON？还是保留两个数据源前端统一渲染？
- 等用户给排版样例

---

### REQ-016 [P2] Hero 口号「用代码让想法成真」改动态播放效果

**需求来源：** 用户 08-01 截图（/Users/apple/Pictures/截屏2026-08-01 21.43.51.png）方框圈出 Hero 区口号（橙色粗体 + 黑色细线框，当前静态文字）。

**目标：** 方框内内容换成动态播放的那种（打字机逐字/轮播多句口号/流光描边？——具体动效风格待与用户确认，可先按打字机 + 多句口号轮播做）。

**涉及文件：** src/components/hero-section.tsx（口号渲染处）

**边界：** 保持方框视觉框架（黑色细线框 + 橙色粗体）或按动效需要微调；不引重型依赖（GSAP 已有）；`npm run build` 通过。

---

## ✅ 最近完成

- **REQ-012 [P0] /content 静态文件服务 — 修复上传图片 404** (Claude Code 实现 + Hermes 修复 gitignore, 4508333, 08-01) — Claude Code 已写 `src/app/content/[...path]/route.ts`（仅 uploads 子目录 + path.resolve 防目录穿越 + Content-Type + immutable 缓存，本地验证 gif/png 200）**但 .gitignore 的 `content/` 规则误伤 `src/app/content/`，代码从未进 git，线上从未部署！** Hermes 修复 .gitignore（`/content/` 只匹配根数据目录）+ 提交 4508333 + build 通过。**待部署后线上图片才恢复**

- **REQ-010 [P0] 修复音乐 API 新增曲目 bug** (Claude Code, 7/31) — cleanTrack 改 `Omit<MusicTrack,"id">` 不再无条件生成 id；POST 用 body.id 判断新增/编辑（新增 makeId+push）；PUT 数组/单对象对无 id 条目补 makeId。tsc+build 通过，curl 实测新增 200+id/编辑 200/不存在 404/数组排序 count:2/删除 200
- **REQ-011 [P1] 相册图片点击放大** (Claude Code subagent, 7/31) — gallery-grid 裸 `<img>` 换 `LightboxImage`（点击放大/滚轮缩放/触摸下滑关闭/body scroll lock），补 `.gallery-item button` 撑满样式；tsc+build 通过
- **REQ-006 [P0] 背景图增强** (Claude Code, 7/31) — Settings 类型 + getSettings/saveSettings + GET/PUT `/api/admin/settings` + `/admin/settings` 后台页（上传+预览+遮罩+动效开关）+ BackgroundLayer 全屏背景 + Ken Burns 慢缩放（reduced-motion 禁用）+ sidebar「设置」
- **REQ-007 [P1] 音乐播放器多曲目** (Claude Code, 7/31) — MusicTrack[] + getMusicList/saveMusicList（旧单对象兼容）+ music API 列表 CRUD + `/admin/music` 列表管理（增删改+上下移排序）+ 播放器连播/上一首/下一首 + layout 读全列表
- **REQ-008 [P2] Welcome 后台可配置** (Claude Code, 7/31) — settings.json 加 welcome 区块 + PUT 改 spread 合并（AD-021 防丢失）+ `/admin/settings` 加 Welcome 卡片（开关/标题/副标题/动态图上传/微粒子开关）+ welcome-splash 读 props（enabled=false 不渲染、动态图+暗遮罩、微粒子开关），保留点击关闭+粒子
- **REQ-009 [P2] 博客质量提升** (Claude Code, 7/31) — Hero 弥散光晕双 radial-gradient（accent 暖橙 + secondary 琥珀）+ NavCards 复用 MagneticWrapper 磁吸 hover。未动首页聚合板块（用户已移除）、未改移动端 drawer
- **REQ-002 [P0] 主题动效** (Claude Code team, 7/31) — `--glass-blur: 12px` 修复 + 纸纹噪点覆层(.paper-grain) + 玻璃 hover 光扫(.glass::before) + 卡片微悬浮(float-card ±3px 错相位, reduced-motion 禁用) + 导航下划线流动(.nav-underline scaleX)
- **REQ-003 [P1] 音乐播放器后台** (Claude Code team, 7/31) — MusicConfig + getMusic/saveMusic + GET/PUT `/api/admin/music` + `/admin/music` 管理页 + sidebar「音乐」+ MusicPlayer 读 props 可切歌
- **REQ-004 [P2] 起始页优化** (Claude Code team, 7/31) — Welcome 任意处点击关闭 + 10 暖金微粒子(float-welcome) + Hero 下方「最近动态」两张玻璃卡片(recent-updates.tsx) + 首页 force-dynamic
- 临时任务：移除天气3D代码 + 死代码清理 + 项目状态同步 (Claude Code, 7/30) — 删除 weather-scene(2)+use-time-of-day+star-field+bg.gif+three dep，构建通过
- REQ-001 修复 stream-timeline groupByMonth 年份硬编码 (Claude Code, a52a167, 7/30) — AD-023 已修复
- AD-018~021 修订+重设计 (Claude Code, 505218c, 7/28)
- AD-013~017 暖纸色+管理后台+去占位化 (Claude Code, 7/25-26)

## 📄 任务存档（已完成详情）

> 以下为已完成任务的原始需求描述，归档备查。

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

### REQ-004 [P2] 起始页 — Welcome 优化 + Hero 下方内容引导

**涉及文件：** `src/components/welcome-splash.tsx`、`src/app/page.tsx`

**目标：**

1. **任意位置点击关闭** — Welcome splash 全屏 div 加 `onClick` 关闭（不只是底部小按钮），按钮保留但加 `opacity-60` 作为提示。

2. **微粒子动效** — Welcome 屏幕加 8-12 个暖金色微小光点（CSS absolute positioned dots），`animation: float-welcome 3s ease-in-out infinite`，每个不同 delay。光点半径 2-3px，opacity 0.3-0.6。

3. **Hero 下方内容预览** — `page.tsx` 在 HeroSection 下方加一个「最近动态」区块：并排两张迷你卡片——左侧「最新文章」（标题+日期，点击跳转 /articles），右侧「最近碎碎念」（verb+target+日期，点击跳转 /thoughts）。服务端 `page.tsx` 用 `getArticles()` / `getThoughts()` 取最新 1 条，通过 props 传给客户端组件渲染。

**边界：** 不改变 HeroSection/WelcomeSplash 现有结构，`npm run build` 通过。

> 注：第 3 条（最近动态板块）已被用户要求移除，REQ-004 实际落地为第 1-2 条。

### REQ-005 [P1] H5 适配 — 移动端菜单抽屉不透明化

**涉及文件：** `src/components/glass-header.tsx`（移动端 drawer）

**问题：** 移动端菜单抽屉背景用 `var(--glass-bg-strong)` = `rgba(255,255,255,0.75)` + `backdrop-filter: blur(12px)`。移动端部分浏览器（尤其 Safari iOS）`backdrop-filter` 失效或表现差，抽屉变成半透明，底下内容透出来影响菜单可用性。

**目标：**
1. 移动端抽屉背景改为**接近不透明**（如 `rgba(255,255,255,0.97)` 或纯色 `var(--color-bg)`），不依赖 backdrop-filter
2. 桌面端行为不变（桌面 backdrop-filter 支持良好，保持玻璃效果）

**边界：** 只改移动端抽屉背景，不碰导航结构/链接逻辑；`npm run build` 通过。

**实现（Claude Code, 7/31）：** drawer 本身即 `md:hidden`（仅移动端渲染），背景直接改 `var(--color-bg)` 实色 + 移除 backdrop-filter/WebkitBackdropFilter，桌面端完全不受影响。

### REQ-006 [P0] 背景图增强 — 后台可切换 + Ken Burns 动效（学习.md #1）

**涉及文件：**
- `src/lib/content.ts` — 新增 Settings 类型 + getSettings/saveSettings（或独立的 background.json）
- `src/app/api/admin/settings/route.ts` — GET + PUT API
- `src/app/(admin)/admin/settings/page.tsx` — 后台背景设置页
- `src/app/layout.tsx` — 服务端读 settings 传给背景层
- `src/components/background-layer.tsx` — 新建全屏背景组件（或并入现有布局）
- `src/app/globals.css` — Ken Burns 动画 keyframes

**数据模型：**

```json
{
  "background": {
    "mode": "image",              // "image" | "none"
    "src": "/content/uploads/bg.webp",
    "overlay": "rgba(20,12,6,0.45)",  // 暗色遮罩，保证玻璃卡片 blur 可见
    "animation": "kenburns"       // "kenburns" | "none"
  }
}
```

**目标：**
1. **背景层组件** — 全屏固定背景 div（`position: fixed inset-0 z-[-1]`），背景图 `background-size: cover` + 暗色 overlay，Ken Burns 慢缩放动画（`transform: scale(1.05→1.15)` 交替，20-30s 一个循环，reduced-motion 禁用）
2. **后台管理页** — `/admin/settings`：上传背景图（复用现有 upload API）+ 预览 + 保存配置
3. **玻璃拟态适配** — 背景图必须叠暗色 overlay（`rgba(20,12,6,0.4~0.5)`），否则白色玻璃卡片与亮背景对比不足文字难读。overlay 值写入 settings.json 可调
4. **回退机制** — 无背景图时保持现有暖纸色纯色底（mode: "none" 默认值）
5. **已有素材提示** — `content/uploads/` 有张 800×450 水墨飞鸟 GIF，分辨率偏低，全屏需 `scale(1.1)+blur(2px)` 掩盖低清；长期建议换高清静态图（WebP）

**边界：** 不动现有玻璃卡片样式（overlay 由背景层负责）；`npm run build` 通过。

### REQ-007 [P1] 音乐播放器 — 多首音乐 + 自动连播 + 后台列表管理（学习.md #2/3/4）

**调研结论（Hermes 已完成）：** 现有自绘播放器（AnalyserNode 实时频谱 + 音量旋钮 + 可拖进度条）是资产，不换库。APlayer 停更 8 年、plyr 需自建列表且丢频谱。方案 = 自研扩展 + 数据模型升级。

**涉及文件：**
- `src/lib/content.ts` — MusicConfig 从单曲扩展为 `MusicTrack[]`（新增 getMusicList/saveMusicList，保留向后兼容）
- `src/app/api/admin/music/route.ts` — 改为列表 CRUD（GET 全部 / POST 新增 / PUT 更新）
- `src/app/(admin)/admin/music/page.tsx` — 列表管理：多首曲目表格 + 新增/编辑/删除 + 排序（上移/下移）
- `src/components/music-player.tsx` — 播放列表状态 + 自动连播 + 上一首/下一首
- `content/music.json` — 改为数组 `[{ trackName, artist, file }]`

**数据模型：**

```typescript
interface MusicTrack {
  id: string        // 唯一 ID
  trackName: string
  artist?: string
  file: string      // 音频路径
}
```

**目标：**
1. **播放器连播** — `audio.onended` → 播下一首，循环到列表末尾回第一首。曲目切换时更新显示 trackName/artist。上一首/下一首按钮
2. **后台列表管理** — `/admin/music` 支持多曲目：新增条目（曲名/艺术家/文件路径）、编辑、删除、上移/下移排序
3. **前端读取** — layout.tsx 读 `MusicTrack[]` 传给 MusicPlayer，单曲兼容（数组长度 1 时行为不变）
4. **可选增强（不阻塞）** — 若时间充裕：展开面板显示播放列表（当前曲目高亮，点击切换）；当前曲目封面色块（用 accent 渐变占位，无封面图）

**边界：** 保持现有频谱/旋钮/进度条 UI 不动；`npm run build` 通过。

### REQ-008 [P2] 起始页 Welcome — 后台可配置 + 动态图（学习.md #6）

**涉及文件：**
- `src/components/welcome-splash.tsx` — 从 settings 读配置
- `src/app/api/admin/settings/route.ts` — 复用 REQ-006 的 settings 结构
- `src/app/(admin)/admin/settings/page.tsx` — 复用 REQ-006 管理页（Welcome 配置区）

**数据模型（并入 settings.json）：**

```json
{
  "welcome": {
    "enabled": true,
    "title": "刘 · Lab",
    "subtitle": "AI 全栈 · 构建与写作",
    "background": "/content/uploads/welcome-bg.gif",  // 可选动态图
    "showParticles": true
  }
}
```

**目标：**
1. **后台可配置** — Welcome 的标题/副标题/开关在后台可编辑，保存后前台生效（复用 REQ-006 的 settings.json + 管理页，加一个 Welcome 区块）
2. **动态图支持** — Welcome 背景支持 GIF/WebP 动图（`<img>` 或 background-image），放在文字层后面、粒子层下面。用户已有水墨飞鸟 GIF 素材可用
3. 保留现有「点击任意处关闭 + 10 暖金微粒子」

**依赖：** REQ-006 先落地（共享 settings.json 结构）。`npm run build` 通过。

### REQ-009 [P2] 博客质量提升 — 逆向分析落地（学习.md #7）

**调研结论（Hermes 已完成）：** 3 个参考站点的可借鉴点与项目映射：
1. immmmm.com → 首页「生活仪表盘」模块化聚合（激活本项目空的相册页，加 光影/好物/观影/阅读 模块）
2. zhheo.com → Hero 弥散光晕背景（暖橙/琥珀版天然适配暖纸色）
3. rauno.me → 磁吸/反色 hover 反馈

**建议落地（挑 1-2 项，Claude Code 可自行判断）：**
1. **首页内容聚合模块** — Hero 下方加「近期光影/好物/阅读」迷你网格（读 content/gallery.json 等已有数据），激活空相册页
2. **Hero 弥散光晕** — hero-section 加一个柔和 radial-gradient 光晕层（accent 色，blur 大，opacity 0.15-0.25），纯 CSS 零依赖
3. **卡片 hover 反馈强化** — 现有 hover 已是 translateY + 边框发光，可加轻微磁吸（GSAP MagneticWrapper 已有，可复用到更多卡片）

**边界：** 纯设计增强，不引入新依赖；`npm run build` 通过。

**实现（Claude Code, 7/31）：** 选了第 2、3 项 — Hero 弥散光晕双 radial-gradient（accent 暖橙 + secondary 琥珀）+ NavCards 复用 MagneticWrapper 磁吸 hover。未动首页聚合板块（用户此前已移除「最近动态」）。
