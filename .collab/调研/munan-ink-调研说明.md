# munan.ink 调研说明

> 调研日期：2026-08-01
> 方式：代码层（curl 抓取 HTML/CSS/JS 解析）+ 视觉层（Playwright 1440×900 / 390×844 渲染 + 视觉分析）双层验证

---

## 一、站点概览

- **站点名**：Munan Blog
- **一句话定位**：把个人网站做成一个可以点图标、开窗口的**桌面操作系统**，而非传统博客（站点作者自述）。
- **核心概念**：Web Desktop（网页桌面）—— 顶部 macOS 风菜单栏 + 视频壁纸桌面 + 左侧 macOS 风桌面图标 + 底部 Windows 11 风任务栏 + 可弹出/拖拽/缩放/最小化的应用窗口。
- **内容模块**：文章、随笔（Markdown）、项目、关于、友链、邮箱、此电脑、回收站、GitHub、Bilibili、小红书（共 11 个桌面图标）。
- **目标人群/氛围**：二次元审美 + 硬核前端技术感，深蓝青色调，静谧空灵。

---

## 二、技术指纹（代码层证据）

| 维度 | 结论 | 证据 |
|------|------|------|
| 框架 | **Next.js 14.2.35（App Router）** | `__next_f` RSC payload、`_next/static/chunks/app/page-*.js`、buildId |
| 渲染模式 | **纯静态导出**（`output: export` → `out/`） | 页面正文自述 + 无动态 API |
| 样式 | **Tailwind CSS 3.4**（原子化） | CSS 大量 `--tw-*` 变量、工具类 |
| 动画 | **framer-motion 12.x**（spring 弹簧动画） | `transition:{type:"spring",stiffness:400,damping:25}` 反复出现 |
| 内容渲染 | **react-markdown + remark-gfm + react-syntax-highlighter** | 随笔窗口 Markdown 渲染 + 代码高亮 |
| 语言 | TypeScript | 页面正文自述 |
| 字体 | 自托管 **Geist** | 页面正文自述 + 字体文件 |
| 静态资源 | 视频壁纸 `yasuo.mp4` + `poster.jpg` + 头像 `touxiang.jpg` | HTML `src` 直取 |
| 额外 | `desktop-noise` 全屏噪点纹理（SVG fractalNoise，opacity 0.03） | CSS `:before` |

> 注意：站点实际用的不是 GSAP 而是 **framer-motion**。所有窗口/图标/任务栏动画均为手写 React 状态管理 + framer-motion，不用现成桌面 UI 库（作者明确自述：市面上桌面模拟库要么太重、要么定制性差）。

---

## 三、设计 Token（CSS 变量 + 视觉纠正后的真实值）

### 3.1 CSS 变量（`:root` 提取）

| 变量 | 值 | 用途 |
|------|----|----|
| `--desktop-bg` | `#e8e0d5` | 桌面背景色（浅米色，实际被视频壁纸盖住） |
| `--menu-bar-bg` | `#1a1a1a` | 顶部菜单栏背景（黑色） |
| `--menu-bar-text` | `#fff` | 菜单栏文字 |
| `--cta-orange` | `#f54e00` | CTA 橙色（未在首屏明显出现） |
| `--cta-orange-hover` | `#e04d00` | CTA hover |
| `--icon-text` | `#1a1a1a` | 图标文字 |
| `--icon-label-bg` | `hsla(0,0%,100%,.85)` | 图标标签背景（85% 白） |
| `--icon-selected-bg` | `#3b82f6` | 图标选中背景（Tailwind blue-500） |

### 3.2 视觉层真实配色（代码 vs 渲染对比）

- 桌面背景实际为**深蓝青色调**（`#1a1a2e` 底色 + 视频壁纸），CSS 里的 `--desktop-bg: #e8e0d5` 浅米色被视频完全覆盖。
- 背景光效三层（z-index 1/2/3）：
  1. **大范围径向渐变**：`rgba(0,120,212,0.18)`、`rgba(0,200,224,0.14)`、`rgba(59,130,246,0.10)` + `blur(20px)` 的蓝青色氛围光。
  2. **圆形光晕**：10 个 `radial-gradient` 圆（180/140/200/120/160/100px…）分布在桌面各位置，蓝青色 `blur(8px)`，模拟壁纸的动态光斑。
  3. **星点层**：一个 0×0 元素用 `box-shadow` 多重阴影（约 50 个 `92vw 99vh 0 1px rgba(255,255,255,0.63)` 样式点）生成白色星点/光点，带 `5px 2px` 发光。
- 顶栏文字 `text-gray-300`（浅灰），hover 变白；顶栏底色透明 + `border-bottom: 1px solid rgba(0,0,0,0.08)`。

### 3.3 玻璃拟态（视觉验证）

- **底部任务栏**：玻璃感最强 —— `background: rgba(232,234,240,0.88)` + `backdrop-filter: blur(10px)` + 顶部 `1px rgba(0,0,0,0.08)` 描边，磨砂白玻璃。
- **应用窗口**：玻璃感**较低**，接近纯白/极浅灰高不透明度，优先保证正文可读性，靠投影与壁纸区分。
- **顶栏**：透明无玻璃，靠文字颜色区分。

### 3.4 图标设计（手绘 SVG）

11 个桌面图标全部为**手写 SVG**（`viewBox="0 0 48 48"`），共用设计公式：
- 每个图标带 `linearGradient`/`radialGradient` 渐变（如 `#ffffff → #d4e6fa` 页面白、`#54c0ff → #0a72cc` 强调蓝）。
- 底部统一 `ellipse` 投影（`#14223d` 不透明度 0.38→0 的径向渐变）。
- 40×40px（移动端 44px）`drop-shadow-md`，下方白色文字标签 + `text-shadow: 0 1px 3px rgba(0,0,0,0.6)`。

---

## 四、组件清单（代码层 class + 功能）

| 组件 | class / 位置 | 功能 |
|------|-------------|------|
| 顶部菜单栏 | `header.fixed top-0 h-10 z-50` | 左侧头像+titile，居中 5 个导航（文章/随笔/项目/关于/友链），分隔线 `w-px` |
| 桌面背景 | `div.fixed inset-0`（`#1a1a2e`） | `video`（yasuo.mp4，`scaleX(1.12)`）+ poster + 三层光效 + 噪点 |
| 桌面图标 | `desktop-icon`（75px 宽，`flex-col`） | 11 个，`tabindex=0` 可键盘操作，点击弹窗口 |
| 底部任务栏 | `div.fixed bottom-0 h-9 z-50` | Windows 11 风格：开始按钮、搜索框、任务区（flex-1）、托盘（显示隐藏/网络/音量/时间） |
| 应用窗口 | framer-motion + AnimatePresence | 标题栏（左图标+标题，右侧手绘 SVG 最小化/最大化/关闭按钮）、可拖拽、spring 弹出（`scale 0.8→1, opacity 0→1`） |
| 文章窗口 | 时间轴模式 | 大标题 + 「日/周/月/年/分类」胶囊切换 + 按月分组文章卡片（日期+标题+`#标签`） |
| 随笔窗口 | Markdown | react-markdown 渲染 + 代码高亮 |
| 关于窗口 | 长文 | 含「从零搭建个人数字桌面」完整技术分享 |
| 友链窗口 | `friends-scroll` | 绿色滚动条（`rgba(76,175,80,.3)`），友链卡片（头像/名字/描述） |

---

## 五、交互细节（视觉 + 代码验证）

1. **窗口系统**：点击桌面图标 → 窗口 spring 弹出（`initial:{scale:0.8,opacity:0}` → `animate:{scale:1,opacity:1}`，stiffness 400 / damping 25）；关闭走 AnimatePresence exit（反向）。
2. **窗口拖拽**：framer-motion 可拖拽（`draggable` 相关代码 3 处），窗口位置自管理。
3. **图标交互**：`whileHover:{scale:1.05}`、`whileTap:{scale:0.95}`，选中图标标题栏 `animate:{width:12,opacity:1}`（蓝条指示）。
4. **任务栏**：开始按钮、搜索框（`w-28` 输入框）、托盘按钮 hover `bg-black/5`；时间用 `toLocale` 实时显示（截图显示「22:02, 8月1日」）。
5. **时间轴筛选**：文章窗口支持日/周/月/年/分类五种时间维度切换（选中项蓝色背景），数据驱动。
6. **键盘可达**：桌面图标 `tabindex=0`。

---

## 六、内容组织方式

- **文章**：按月份分组的卡片流，每条 = 日期 + 标题 + 灰色 `#标签`（如 `#Next.js`、`#前端`）。文章主题偏技术：数字桌面搭建、端侧模型、MediaPipe、PID/卡尔曼滤波、AI Agent、Vibe Coding、Hexo→Next.js 迁移等。
- **随笔**：短篇 Markdown 直接渲染（如「数字桌面」2026-06-28 一条）。
- **关于**：作者技术长文（从 0 到 1 搭桌面博客全过程）。
- **项目**：代码窗口图标（终端风 SVG），含 PureEdgeVLM 阶段记录系列。
- **友链**：卡片列表（头像+名字+描述）。

---

## 七、移动端适配（390×844 验证）

- **坚持桌面概念**：不做传统移动列表布局，把整个"桌面"压缩进手机屏幕。
- 图标两列排布（第一列 8 个、第二列 3 个），宽度 75px。
- 顶栏与任务栏完整保留；顶栏导航文字在窄屏上**略显拥挤/重叠**（已知体验瑕疵）。
- 任务栏搜索框、托盘、时间均保留。

---

## 八、技术层 vs 素材层划分

| 层 | 内容 |
|----|------|
| **技术层（可逆向）** | 窗口系统（React 状态 + framer-motion spring）、手绘 SVG 图标公式、三层光效（渐变+光晕+box-shadow 星点）、任务栏玻璃公式 `rgba(232,234,240,.88)+blur(10px)`、时间轴筛选组件、噪点纹理、静态导出配置 |
| **素材层（需自备）** | 视频壁纸（动漫水下世界场景）、poster、头像、友链图 |

---

## 九、与本博客（暖纸色主题 blog.084623224.xyz）的对比

| 维度 | munan.ink | 本博客 |
|------|-----------|--------|
| 核心概念 | 桌面 OS 模拟（窗口/图标/任务栏） | 暖纸色极简博客（玻璃卡片 + GSAP + 天气粒子） |
| 框架 | Next.js 14 App Router + framer-motion | Next.js 16 App Router + GSAP |
| 配色 | 深蓝青 + 白 + 玻璃白 | 暖橙 `#E87830` + 暖白书页背景 |
| 动画库 | framer-motion（spring） | GSAP（ScrollTrigger） |
| 内容 | 数据硬编码在 page.js（静态导出） | JSON 文件 CMS + 管理后台 cookie 鉴权 |
| 背景 | 视频壁纸 + 三层光效 | Three.js 天气粒子 |
| 复杂度 | 高（窗口系统） | 中（内容 + 动效） |

**与本博客契合的借鉴点**（按价值排序）：
1. **窗口弹出弹簧动画手感** — framer-motion `spring stiffness 400 / damping 25` 的参数可直接移植到 GSAP（`gsap.to(..., {scale:0.8→1, opacity:0→1, ease:"back.out(1.7)"})` 近似）。
2. **三层光效公式** — 径向渐变氛围光 + 圆形光晕 + box-shadow 星点，可替换/增强本博客 Three.js 粒子的氛围层。
3. **玻璃拟态分层原则** — 正文容器玻璃低不透明度保可读性，功能条（任务栏/导航）玻璃高不透明度加强"质感对比"，与本博客暗色玻璃校准经验一致。
4. **手绘 SVG 图标公式** — 渐变 + 底部投影椭圆 + 高光，风格统一成本低。
5. **「桌面概念」差异化思路** — 值得参考：不随大流的形态创新是最大记忆点（本博客已有天气粒子和口号动效，可继续强化独特性）。

---

## 十、可复用资产清单

- 窗口弹簧动画参数：`spring stiffness 400 / damping 25~30`（framer-motion → GSAP 需换算）
- 任务栏玻璃公式：`rgba(232,234,240,0.88) + backdrop-filter: blur(10px) + border-top 1px rgba(0,0,0,0.08)`
- 图标选中指示：`animate width 12px 蓝条`（对应本博客可用 `#E87830` 暖橙条）
- 星点层：`box-shadow` 多重阴影单元素生成，零 JS 成本
- 噪点纹理：SVG fractalNoise `opacity 0.03` 全屏叠加，增加质感
- 时间轴筛选：日/周/月/年/分类数据驱动切换模式
