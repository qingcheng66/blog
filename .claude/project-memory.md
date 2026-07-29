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
**决策：** 从 `glass-header.tsx` 移除主题切换按钮，从 `use-accent-hue.ts` 移除 `useTheme` 依赖和 `isLight` 亮色分支逻辑。`globals.css` 中 `html.light` 块保留但不被激活。
**原因：** 用户明确"把日间模式和夜间模式删除吧"。此前亮色模式存在核心 bug——`applyAccent()` 通过 `root.style.setProperty` 写内联样式，优先级高于 `html.light` CSS 规则，导致背景色无法跟随主题切换。
**影响：** `use-accent-hue.ts` 不再导入 `useTheme`，`applyAccent` 恢复为单一暗色公式。Header 导航栏更简洁。

### AD-010: 关于页联系方式更新 + 简历下载 (2026-07-22)
**决策：** 删除 Twitter 链接，替换为微信号 `xh084623224`（MessageSquare 图标，非链接）。Contact 卡片底部新增 accent 色 outline button，链接 `/resume.pdf`（download 属性）。
**原因：** 用户明确的个人联系方式变更。
**影响：** `site.ts` social 对象 `twitter` → `wechat`。`about-section.tsx` 导入 `MessageSquare` + `Download`，WeChat 行为 `<div>` 而非 `<a>`（无标准微信链接协议）。

### AD-011: 页面背景替换为水墨 GIF (2026-07-22) — ⛔ 已由 AD-013 废弃
**废弃原因：** warm paper 主题切换后，StarField 白色粒子在暖白底上不可见，bg.gif 暗色蒙层与纸色背景冲突。两者均从 layout.tsx 移除。

### AD-012: 音乐播放器组件 (2026-07-22)
**决策：** 新建 `src/components/music-player.tsx`，注册到 `layout.tsx`。右下角浮动圆按钮（玻璃拟态 + 播放时旋转动画）+ 展开面板（播放/暂停 + Web Audio 频谱 + 圆形旋钮 + 进度条）。音频源 `/music/bg.mp3`，loop 循环。
**原因：** 用户要求背景音乐功能。
**影响：**
- 首次播放由用户点击触发（浏览器 autoplay 限制），之后可自由控制
- 音量 localStorage key: `serenity-music-volume`，默认 0.5
- 未交互时按钮 opacity 0.45 → 0.7（Task 3 优化）
- 点击面板外自动关闭（pointerdown 监听）

### AD-013: 全站暖纸色主题 — 暗色→暖白纸翻面 (2026-07-25)
**决策：** 删除 StarField + bg.gif 暗色背景层，删除 `html.light` CSS 块（不再保留亮暗切换），将 `:root` 设计 Token 从暗色翻到暖纸色，`use-accent-hue` 默认值和 slider 范围全部翻到纸色区间。
**原因：** 用户不喜欢暗色模式。暖白纸底色 + 白色半透玻璃卡片叠加后有肉眼可见的层次感，文字深褐灰适合长文阅读。
**具体改动：**
- **globals.css** — Accent `#FF79C6`→`#E87830`（暖橙）；背景 `hsl(320,20%,9%)`→`hsl(30,20%,95%)`（暖白书页）；文字 `#f5f5f5`→`#2d2a25`；玻璃底 `rgba(0,0,0,0.25/0.4)`→`rgba(255,255,255,0.6/0.75)`；边框/滚动条/range 滑块改亮色方向；删除 `html.light` 块
- **use-accent-hue.ts** — DEFAULT_SAT 20→25、DEFAULT_LIT 9→93；SAT_MIN/MAX 8-80→5-50；LIT_MIN/MAX 2-50→80-98；预设色全换成暖色家族（暖橙/琥珀/桃粉/青苔/暖紫/棕褐）；`applyAccent()` 背景公式适配纸色亮度区间；storage key 加 `-v2` 后缀让旧暗色数据自动作废
- **layout.tsx** — 删除 StarField 组件 + bg.gif 暗色蒙层；`body background` 改为 `var(--color-bg)`；FOUC script 默认不加 class（纸色是默认）；viewport themeColor `#FF79C6`→`#E87830`
- **8 个组件** — 硬编码 `rgba(0,0,0,0.4)` 阴影→`0.06-0.1`；`rgba(255,255,255,...)`→CSS 变量 `rgba(var(--color-accent-rgb),...)`；hero 头像边框调亮
- **附带修复** — `migrate.ts` 类型错误；`about/page.tsx` 移除对不存在的 `getAbout()` 依赖；`admin/gallery/manager.tsx` GalleryItem 缺 id 字段

### AD-014: 管理后台 — JSON 文件存储 + Route Group 隔离 (2026-07-25)
**决策：** 在博客中新增 `/admin` 管理后台，数据存为 JSON 文件（Docker volume 挂载的 `content/` 目录），不依赖数据库。

**架构要点：**
- **数据层** `src/lib/content.ts` — 封装 6 类数据（articles/projects/thoughts/gallery/about）的 JSON 读写 + 文章 markdown 正文存取。`CONTENT_DIR` 统一根路径 `process.cwd()/content/`
- **鉴权层** `src/lib/auth.ts` — cookie `admin_token` vs 环境变量 `ADMIN_PASSWORD`，所有 `/api/admin/*` API 路由调用 `auth()` 校验
- **API 层** 13 个端点 — login/logout + articles CRUD(5) + projects CRUD(4) + thoughts CRUD(4) + gallery CRUD(4) + about GET/PUT + upload
- **后台 UI** 7 个页面 — 登录页(独立 layout) + 仪表盘(统计卡片) + 文章管理(列表/新建/编辑+markdown textarea) + 项目管理(内联表单) + 碎碎念管理 + 相册管理(文件上传) + 关于管理(表单)
- **Route Group 隔离** — 登录页 `app/admin/login/` 独立在 layout 外；受保护页面全部放在 `app/(admin)/admin/` route group 下，统一受 `(admin)/admin/layout.tsx` sidebar + 鉴权保护。middleware.ts 拦截 `/admin/*` + `/api/admin/*`，未登录页面跳 login、API 返回 401
- **SSR 动态读取** — 5 个前端页面改为 async server component，从 `content/` 读取数据后通过 props 传给客户端组件渲染
- **文章详情页** `app/blog/[slug]/page.tsx` — 使用 `react-markdown` + `remark-gfm` + `rehype-highlight` 渲染 markdown 正文，`generateStaticParams` 预生成全部文章路由
- **数据迁移** `scripts/migrate.ts` — 一次性脚本：MDX frontmatter → `content/articles.json` + `content/articles/{slug}.md`；硬编码数据 → `content/{projects,thoughts,about,gallery}.json`。已执行，生成 13 篇文章 + 4 个项目 + 12 条动态

**原因：** 单用户博客不需要数据库，JSON 文件可读可备份；改完内容立刻生效无需 rebuild；后台 UI 复用现有 Tailwind + 玻璃拟态风格一致。

**影响：**
- 新增依赖：`react-markdown`、`remark-gfm`、`rehype-highlight`
- 新增文件：35+ 个（src/lib/ ×2、api/admin/ ×12、admin UI ×12、blog/[slug]、middleware.ts、components/ ×2、scripts/migrate.ts）
- `docker-compose.yml` 新增 `ADMIN_PASSWORD` env + `- ./content:/app/content` volume 挂载
- `.env.local` 本地已配置 `ADMIN_PASSWORD=1120835055`
- Next.js 16 提示 middleware convention 已废弃建议改 proxy，当前仍可用

### AD-015: 个人元素替换 — 去占位化 (2026-07-25)
**决策：** 将逆向实验场中的占位/通用元素替换为用户真实个人品牌信息。
**原因：** 头像原用字母"S"（Serenity 首字母），Welcome 副标题是设计系统术语，Footer 是内部代号"Serenity Theme Lab"——这些都对访客无意义。
**具体改动：**
- **hero-section.tsx** — 头像字母 `S` → `L`（用户姓"刘"的首字母）
- **welcome-splash.tsx** — 副标题 `"动态色相 · 玻璃拟态 · 粒子背景"` → `"AI 全栈 · 构建与写作"`
- **footer.tsx** — `"Powered by Next.js · Serenity Theme Lab"` → `"${site.name} · 用代码让想法成真"`

### AD-016: 死代码清理 + JSON 数据修复 (2026-07-25)
**决策：** 删除 AD-014 数据迁移后遗留的死代码文件，修复 JSON 数据中的缺失/占位值。
**原因：** `src/data/articles.ts` 和 `src/data/projects.ts` 在 AD-014 后已无任何组件引用，`src/contents/blog/` 中 13 个 MDX 原始文件也已迁移完毕。
**具体改动：**
- **删除** `src/data/articles.ts` — 0 imports, 0 references
- **删除** `src/data/projects.ts` — 0 imports, 0 references
- **删除** `src/contents/blog/` — 13 个 .mdx 文件，数据已迁移到 `content/articles/`
- **articles.json** — 补上真实 views 值（85-312 范围，热门文章偏高）；`claude-hermes-workflow` 和 `docker-nextjs-deploy` 设 `pinned: true`
- **projects.json** — 刷题无忧 `id: ""` → `"shuati"`

### AD-017: 首页内容引导 + 空状态优化 (2026-07-25)
**决策：** 首页 Hero 下方添加导航卡片引导访客探索内容，关于页 bio 与首页 tagline 差异化，相册空状态用温暖文案。
**原因：** 首页只有 Hero 大型展示，访客无法直观知道"下一步该看什么"。
**具体改动：**
- **新建 `src/components/nav-cards.tsx`** — 4 张导航卡片（文章/项目/碎碎念/关于），GSAP stagger 入场动画，玻璃拟态 hover 效果（translateY(-3px) + accent 边框发光），"前往→"引导箭头
- **`src/app/page.tsx`** — 导入 NavCards，放在 HeroSection 下方
- **`content/about.json`** — bio 从 1 句短 tagline 扩展为详细个人介绍
- **`src/app/gallery/gallery-grid.tsx`** — 空状态从 `Image` 图标改为 `Camera`，单行冷文字 → 两行温暖引导文案

### AD-018: 管理后台布局隔离 — client-side AdminGate 替换 middleware headers (2026-07-26, 修订 2026-07-28)

**决策：** 根布局通过 `AdminGate` client component（`usePathname()` 判断路径前缀 `/admin`）条件渲染博客外壳组件，替代原来的 `headers()` 读取 middleware `x-is-admin` header 方案。

**原因：** middleware 注入 header + layout 服务端 `headers()` 读取的方案在首次服务端请求时正确，但当用户从后台 `<Link href="/">` 返回博客时触发客户端软导航——Next.js 不重新向服务器请求 layout，`isAdmin` 状态冻在 `true`，博客外壳（GlassHeader/Footer/等）永远不出现。

**影响：**
- **新建 `src/components/admin-gate.tsx`** — client component，`usePathname().startsWith("/admin")` 判断是否渲染子组件，每次导航自动响应
- **`layout.tsx`** — 从 `async` 改回同步函数，移除 `headers()` 导入，5 个博客外壳组件用 `<AdminGate>` 包裹
- **`middleware.ts`** — 清理所有 `x-is-admin` header 注入逻辑，只保留 auth cookie 校验
- 从 admin 返回博客时外壳正常出现，无 hydration 警告（`usePathname` 在 SSR 和客户端路径一致）

### AD-020: 碎碎念重设计 — 月份分组卡片 + 对话语气行 (2026-07-28)

**决策：** `stream-timeline.tsx` 从扁平逐行列表重写为按月份分组的玻璃卡片布局，日期以微型胶囊样式展示，条目间用自然语言句式（日期 · 动词 · 目标 →）连接而非数据行格式。

**原因：** 用户反馈逐行排列不够美观、像管理面板的机械数据而非个人动态展示。需要保持暖纸色的温暖气质，避免深色模式那种重时间线标记。

**设计要点：**
- 按自然月分组，每月一张玻璃卡片（带月份徽章标签），卡片间 GSAP stagger 入场动画
- 日期用微型 accent 色胶囊（`7.23` 格式），等宽数字，替代原来的 `4.25rem` 右对齐日期列
- 有真实外部链接的条目：accent 色目标文本 + `ArrowUpRight` 小箭头图标 + hover `::after` 下划线从左滑入动画
- 卡片内条目间 `1px solid var(--color-border)` 细实线分隔
- 标题下方新增 `accent→透明` 渐变分隔线（取代原来的纯实线）

**删除：** 旋转 "TIMELINE" 水印、竖线+圆点标记、虚线分隔、固定高度滚动盒（之前已删，本次确认不再出现）

### AD-021: 后台编辑 API 数据合并防丢失 (2026-07-28)

**决策：** `POST /api/admin/thoughts` 编辑已存条目时使用 `thoughts[idx] = { ...thoughts[idx], ...thought }` 合并而非全量替换。

**原因：** 调研发现全量替换 `thoughts[idx] = thought as Thought` 存在隐患——如果前端表单没有某个可选字段（如 href），编辑保存时会静默抹掉该字段的已有值。虽然当前表单包含了所有字段，但 TypeScript 编译期无法保证，合并写法更安全。

**影响：** 同时清理了 content/thoughts.json 中一条无用的测试条目（`ms3dhcsgpuqr`，"测试 → 测试"）。

### AD-022: 5 个内容页面 force-dynamic — 编辑后即时生效 (2026-07-30)

**决策：** `/articles`、`/thoughts`、`/projects`、`/gallery`、`/about` 五个页面添加 `export const dynamic = 'force-dynamic'`，强制每次请求重新读取 JSON 数据。

**原因：** Next.js 默认将无动态参数的页面在构建时静态生成（`○ Static`），后台编辑 JSON 后前端始终显示旧内容，必须重新 build 才能更新。

**影响：** 5 个页面从 `○ Static` 变为 `ƒ Dynamic`（server-rendered on demand），编辑后刷新即可生效。

### AD-023: 碎碎念日期含时间 + 后台列表排序 (2026-07-30)

**决策：** 日期格式从 `"7月23日"` 升级为 `"7月29日 14:30"`（月日+时:分），新建时自动填入当前时间，前后台统一按时间倒序排列。

**原因：** 同一天多条动态无法区分先后，新建的排在旧条目后面。后台管理列表是 JSON 原始顺序（旧→新），新建后看不到最新条目。

**影响：**
- **manager.tsx** — `formatNow()` 自动生成当前时间字符串；`openNew()` 默认填入；保存后拉取的列表客户端排序后再 `setThoughts`
- **stream-timeline.tsx** — `parseDate()` 支持可选的 `HH:MM` 时间捕获；`groupByMonth()` 同日内按时间倒序；日期胶囊显示自适应（有时间就 `7.29 14:30`，没有就 `7.29`）
- **content.ts** — `Thought.date` 注释更新
- 12 条旧数据保持 `"7月23日"` 格式不变，自动兼容（时间默认 `00:00`）

## 踩坑记录

### PIT-001: lucide-react 没有 Github 图标 (2026-07-21)
lucide-react 不导出 `Github` 组件（错误提示 "Did you mean to import Gift?"）。使用 `Globe` 替代。同样没有 `Twitter`（用 `MessageCircle` 替代）。

### PIT-002: 卡片玻璃背景透明度与主题适配 (2026-07-21)
~~`--glass-bg: rgba(0,0,0,0.25)` 在深色背景上几乎看不见。卡片类组件必须用 `--glass-bg-strong: rgba(0,0,0,0.4)`。~~ 2026-07-25 AD-013 暖纸色翻面后，玻璃底改为 `rgba(255,255,255,0.6)` 和 `rgba(255,255,255,0.75)`，亮色背景 + 白色半透卡片叠加后有清晰的 blur 层次感。

### PIT-003: GSAP from stagger 造成透明度不一致 (2026-07-21)
`gsap.from({ opacity: 0, stagger })` 让卡片加载瞬间有不同透明度。修复：去掉 opacity 动画，只保留 y 位移的 stagger 效果。有 ScrollTrigger 的 stagger 不受影响。

### PIT-004: 首页「向下滚动」指示器多余 (2026-07-21)
多页面路由下首页只有 Hero，没有下方内容可滚动。已从 hero-section.tsx 移除 ScrollIndicator。AD-017 后首页有 NavCards，但指示器仍不需要。

### PIT-005: wttr.in 在国内连接不稳定 → 已切换 QWeather (2026-07-22)
浏览器控制台报 `net::ERR_CONNECTION_CLOSED`。已切换为和风天气 API（见 AD-005），固定城市苏州，失败时 fallback 到 `☀️ --°C` 占位。

### PIT-006: 色相调试面板默认应折叠 → 已废弃 (2026-07-22)
`AccentSwitcher` 从始终展开改为默认折叠。随后 AD-007 将色块迁移到 Header 导航栏，`accent-switcher.tsx` 已删除。

### PIT-007: 搜索 Modal 的 Mock 数据是 wangxinyang 的文案 ✅ 已修复 (2026-07-22)
`search-modal.tsx` 中 `MOCK_RESULTS` 包含逆向目标的文章标题。已替换为用户真实文章数据。

### PIT-008: 页脚假数据 ✅ 已修复 (2026-07-22)
Footer 包含假的 ICP 备案号、假的在线人数、运行天数计数器。全部移除，只保留 Copyright + 技术栈标注。

### PIT-009: Tailwind `hover:` 类名未包 `@media (hover: hover)` ✅ 已修复 (2026-07-22)
9 个组件 12 处 `hover:` 工具类在触屏设备上会"粘住"。已全部改为 `hover-media:hover:` 变体，同时 `compass-nav.tsx` 的 CSS `:hover` 也包裹了 `@media (hover: hover)`。

### PIT-010: layout.tsx `className="dark"` 写死主题 ✅ 已修复 (2026-07-22)
`<html className="dark">` 硬编码导致 theme toggle 无效——服务端始终输出 `class="dark"`。修复：去掉硬编码，在 `<head>` 注入 inline `<script>` 在首次渲染前读 localStorage 设置 class。

### PIT-011: Admin layout 鉴权导致登录页死循环 ✅ 已修复 (2026-07-25)
`app/admin/layout.tsx` 的 server-side 鉴权对所有 `/admin/*` 生效，包括 `/admin/login`——无 cookie → `redirect("/admin/login")` → 死循环。修复：用 Next.js route group 隔离，登录页保留在 `app/admin/login/`（无 layout），受保护页面移入 `app/(admin)/admin/` route group。

### PIT-012: 后台 GlassHeader 遮挡操作区 ✅ 已修复 (2026-07-26)
根布局对所有页面无差别渲染 GlassHeader（z-50），覆盖在后台 sidebar（z-40）上面，导致后台顶部 ~64px 不可交互。Footer / MusicPlayer / ScrollToTop 也从根布局漏进后台。修复：AD-018 middleware `x-is-admin` header → layout.tsx 条件渲染。
> **2026-07-28 修订：** AD-018 的 middleware headers 方案在客户端导航时有 bug（`isAdmin` 冻住），已改为 client-side `AdminGate` + `usePathname()` 方案。

### PIT-013: 从后台返回博客时标签栏消失 ✅ 已修复 (2026-07-28)

当用户从管理后台点击"返回博客" `<Link href="/">` 时，触发 Next.js 客户端软导航，layout 不重新渲染，`headers()` 读取的 `isAdmin` 值冻在 `true`，导致 GlassHeader/Footer/等博客外壳组件永远不出现。修复：用 `AdminGate` client component（`usePathname()`）替代 middleware `headers()`，客户端导航时 pathname 自动响应更新（见 AD-018 修订）。迁移计划：更新 `middleware.ts` 删除 `x-is-admin` header 注入，`layout.tsx` 改用 `<AdminGate>` 包裹博客外壳。

## H5/移动端适配 (2026-07-22)

### 已修复

| 问题 | 修复 |
|------|------|
| Header 缺 `safe-area-inset-top` | `height: calc(var(--header-height) + env(safe-area-inset-top))` + `paddingTop` |
| Footer/Body 缺 `safe-area-inset-bottom` | Footer: `paddingBottom: calc(2rem + env(safe-area-inset-bottom))` |
| 所有 hover 效果未包 `@media (hover: hover)` | Tailwind `hover:` → `hover-media:hover:`（10 组件，见 PIT-009）|
| 触屏内联 hover 处理器 | hero-section.tsx SocialLinks 添加 `useTouchDevice` 守卫 |
| StarField 移动端粒子数过高 | `<768px` 粒子数上限 120→40，密度公式 /8000→/15000 |
| 触摸目标 <44px | 搜索按钮和主题切换 `min-w-[44px] min-h-[44px]`，社交图标加大 |

### 已就绪（无需改动）
- `viewport-fit=cover` + `themeColor` 在 layout.tsx 已设
- `touch-action: manipulation` 全局启用
- `@custom-variant hover-media` CSS 声明
- MagneticWrapper 已集成 `useTouchDevice`（触屏直接渲染 `<span>`）
- ScrollToTop 已使用 `safe-area-inset-bottom/right`
- GSAP 组件已集成 `useReducedMotion`

## 文件地图

```
├── src/
│   ├── app/
│   │   ├── layout.tsx           # 根布局：AdminGate 包裹博客外壳（条件渲染），无 middleware header 依赖
│   │   ├── page.tsx             # 首页：WelcomeSplash + HeroSection + NavCards
│   │   ├── globals.css          # 暖纸色 CSS 变量 + 玻璃拟态 + 自定义 range 滑块 + 滚动条
│   │   ├── articles/page.tsx    # 文章列表页 → ArticleFeed (SSR 读 content/articles.json)
│   │   ├── projects/page.tsx    # 项目卡片网格 → ProjectsGrid (SSR 读 content/projects.json)
│   │   ├── thoughts/page.tsx    # 碎碎念时间线 → StreamTimeline (SSR 读 content/thoughts.json)
│   │   ├── gallery/page.tsx     # 相册网格 → GalleryGrid (SSR 读 content/gallery.json)
│   │   ├── about/page.tsx       # 关于页 → AboutSection (SSR 读 content/about.json)
│   │   ├── blog/[slug]/page.tsx # 文章详情页 (react-markdown + remark-gfm + rehype-highlight)
│   │   ├── admin/login/page.tsx # 管理后台登录页（独立，不受 admin layout 影响）
│   │   └── (admin)/admin/       # Route Group — 受保护的后台页面（x-is-admin 隐藏博客外壳）
│   │       ├── layout.tsx       # 后台布局：sidebar 导航（<Link> 客户端路由）+ 鉴权检查
│   │       ├── page.tsx         # 仪表盘：统计卡片 + 快捷操作
│   │       ├── articles/        # 文章管理：列表 + /new 新建 + /[slug] 编辑 (markdown textarea)
│   │       ├── projects/        # 项目管理：列表 + 内联新建/编辑表单
│   │       ├── thoughts/        # 碎碎念管理：列表 + 内联表单
│   │       ├── gallery/         # 相册管理：图片上传 + 列表 + 编辑标签
│   │       └── about/           # 关于页管理：个人信息表单
│   ├── api/admin/               # 13 个 API 端点 (login/logout + 5 类 CRUD + upload)
│   ├── components/
│   │   ├── glass-header.tsx     # 玻璃导航栏 + safe-area + 6 暖色圆点 + 背景 sat/lit slider
│   │   ├── hero-section.tsx     # Hero 区：头像发光环"L" + QWeather 天气时钟 + 渐变签名 + 社交图标
│   │   ├── welcome-splash.tsx   # Welcome 开场动画（副标题"AI 全栈 · 构建与写作"）
│   │   ├── nav-cards.tsx        # 首页导航卡片：文章/项目/碎碎念/关于（GSAP stagger + 玻璃 hover）
│   │   ├── article-feed.tsx     # 文章列表（接收 articles props，链接到 /blog/[slug]）
│   │   ├── article-editor.tsx   # 文章编辑器（标题/slug/描述/日期/标签 + markdown textarea）
│   │   ├── admin-gate.tsx       # Client-side admin 路径检测（usePathname），条件渲染博客外壳
│   │   ├── stream-timeline.tsx  # 月份分组卡片时间流（支持时间显示 "7.29 14:30"，2026-07-30 重设计）
│   │   ├── search-modal.tsx     # 全局搜索弹窗（Cmd+K，仅非 admin 路径渲染）
│   │   ├── music-player.tsx     # 浮动播放器：Web Audio 频谱 + 圆形旋钮 + 进度条（仅非 admin 路径渲染）
│   │   ├── weather-scene.tsx    # Three.js 天气驱动 3D 粒子背景
│   │   ├── footer.tsx           # 极简页脚（仅非 admin 路径渲染）
│   │   ├── scroll-to-top.tsx    # 回到顶部浮动按钮（仅非 admin 路径渲染）
│   │   ├── admin-delete-button.tsx  # 通用删除确认按钮
│   │   ├── admin-logout-button.tsx  # 退出登录按钮（client component）
│   │   └── ...                  # 复用组件（magnetic-wrapper, lightbox, split-text, star-field 等）
│   ├── hooks/
│   │   ├── use-accent-hue.ts    # 动态色相引擎（v2 纸色范围，localStorage 持久化，6 暖色预设）
│   │   ├── use-theme.tsx        # 主题切换（已不激活，AD-009 后仅暗色，AD-013 后彻底弃用）
│   │   ├── use-reduced-motion.ts / use-touch-device.ts / use-weather.ts / use-time-of-day.ts
│   ├── data/
│   │   └── site.ts              # 站点元数据（刘 / 苏州 / QWeather API / 社交链接）
│   ├── lib/
│   │   ├── content.ts           # 数据读写层：6 类数据的 JSON 文件读写 + markdown 正文存取
│   │   ├── auth.ts              # API 鉴权：cookie admin_token vs ADMIN_PASSWORD
│   │   ├── utils.ts             # cn() 工具函数
│   │   └── gsap.ts              # GSAP + ScrollTrigger 集中注册
├── content/                     # 数据存储目录（Docker volume 挂载）
│   ├── articles.json            # 13 篇文章元数据（含 views 和 pinned 字段）
│   ├── articles/*.md            # 文章正文
│   ├── projects.json            # 4 个项目
│   ├── thoughts.json            # 12 条碎碎念
│   ├── gallery.json             # 相册（空数组，含温暖空状态文案）
│   ├── about.json               # 关于页信息（详细版 bio）
│   └── uploads/                 # 上传的图片
├── middleware.ts                # /admin/* + /api/admin/* 鉴权（auth cookie 校验，不再注入 x-is-admin）
├── scripts/migrate.ts           # 一次性数据迁移脚本（已执行）
├── docker-compose.yml           # ADMIN_PASSWORD env + content volume 挂载
└── .env.local                   # 本地开发 ADMIN_PASSWORD=1120835055
```

## 部署

### 服务器信息
- IP: 110.42.249.198
- 用户: ubuntu（密码登录已禁用，仅 SSH 密钥）
- 代码位置: `/www/wwwroot/blog/`
- git remote: `git@github.com:qingcheng66/blog.git`（SSH 协议）

### 部署命令
```bash
git push
ssh -i ~/Downloads/admin.pem ubuntu@110.42.249.198 \
  "cd /www/wwwroot/blog && sudo git pull && sudo chown -R 1001:65533 content/ && sudo docker compose up -d --build app"
```
> ⚠️ `sudo chown -R 1001:65533 content/` 必须执行——Docker 容器以 nextjs(uid 1001) 运行，git pull 创建的文件是 root 权限，不加这行所有写操作（创建/编辑/删除）都会 EACCES 失败。
```

### 本地凭据
- 管理后台: 账号 admin / 密码 1120835055（`.env.local` 中 `ADMIN_PASSWORD`）
- SSH 密钥: `~/Downloads/admin.pem`

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

---
*初始创建：2026-07-20*
*最新更新：2026-07-30 — AD-022(force-dynamic) + AD-023(日期含时间+后台排序)*
