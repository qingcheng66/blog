@AGENTS.md

# Reverse — Serenity 主题逆向实验场

## 一句话目标

从 wangxinyang.top 提取设计系统的**技术层**，在 Next.js 上做最小可验证原型。验证通过后移植到主博客 blog.084623224.xyz。素材层（背景图/Live2D）用户自己提供。

---

## 逆向分析结论（代码 + Playwright 视觉）

### 两层拆解

| 层 | 内容 | 可逆向？ | 
|----|------|---------|
| **技术层** | 动态色相系统、玻璃拟态、Welcome 动画、天气时钟、Ctrl+K 搜索 | ✅ |
| **素材层** | 全屏动漫插画背景、Live2D 角色模型、定制图标 | ❌ 用户自备 |

### 核心发现（Playwright 截图纠正了代码分析的误判）

代码分析看到的是 CSS 变量 `--color-accent: #c084fc`（紫色），但实际渲染是**品红 #FF79C6**，且是从背景图的高光中取色的。Serenity 的 accent 色是动态配置的，不同站点颜色不同。

视觉三要素：
1. **全屏背景图** — 动漫角色插画是页面的视觉灵魂，不是渐变
2. **玻璃拟态层** — 导航栏/气泡/卡片全部 `backdrop-filter: blur()` 半透明叠在背景上，透明度 20-40%
3. **accent 取色自背景** — UI 强调色从背景图中采样，保持整体视觉凝聚力

### 完整要素清单

```
导航栏: Header(64px fixed) → 左侧logo+链接(首页/文章/碎碎念/项目/相册/关于) | 右侧搜索(Ctrl+K)+主题切换
Hero:   头像(发光环) → 天气时钟条 → 渐变个性签名 → 简介 → 社交图标
背景:   全屏角色插画 + 飘落花瓣粒子 + glassmorphism UI 叠加
互动:   Live2D看板娘(时间感知对话) + Welcome开场动画
底部:   文章列表(编号索引+封面+摘要+阅读量)
```

### 设计 Token（从 base.css 提取，已纠正为实际值）

```css
:root {
  /* ---- 色彩（暗色模式默认）---- */
  --color-accent:        #FF79C6;           /* 品红主色（实际渲染值） */
  --color-accent-rgb:    255, 121, 198;
  --color-accent-secondary: hsl(accent-hue + 20°, ...);

  /* 背景：色相随 accent 自动偏移 */
  --color-bg:            hsl(H, 20%, 9%);   /* 暗色模式：色相可感知 */
  --color-bg-soft:       hsl(H+15, 16%, 7%);
  --color-bg-mute:       hsl(H+10, 14%, 14%);

  /* 文字 */
  --color-text:          #f5f5f5;
  --color-text-secondary: rgba(255,255,255, 0.6);
  --color-text-muted:    rgba(255,255,255, 0.4);

  /* 边框 + 玻璃 */
  --color-border:        rgba(255,255,255, 0.08);
  --color-border-hover:  rgba(255,255,255, 0.15);
  --glass-bg:            rgba(0,0,0, 0.2);     /* 玻璃底 */
  --glass-blur:          12px;                  /* 模糊量 */

  /* ---- 间距 ---- */
  --space-1: 4px;   --space-1-5: 6px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px;  --space-5: 24px;   --space-6: 32px; --space-8: 48px;
  --space-10: 64px; --space-12: 80px;

  /* ---- 圆角 ---- */
  --radius-sm: 6px;  --radius-md: 10px;  --radius-lg: 16px;
  --radius-xl: 24px; --radius-full: 9999px;

  /* ---- 动效 ---- */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 150ms;
  --duration-normal: 300ms;

  /* ---- 布局 ---- */
  --max-width: 1200px;
  --header-height: 64px;
}
```

### 玻璃拟态公式

Serenity 的玻璃效果模式：
```css
.glass {
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

---

## 技术栈

| 层面 | 选择 | 原因 |
|------|------|------|
| 框架 | Next.js 16 (App Router) | 与主博客一致 |
| 样式 | Tailwind CSS v4 + CSS 变量 | token 体系 |
| 动画 | GSAP ScrollTrigger | 已验证，替代 Lenis+AOS |
| 字体 | Noto Sans SC（自托管） | 避免 Google Fonts 被墙 |
| 图标 | Iconify SVG | 与 Serenity 一致 |
| 天气 | wttr.in（免费）或和风天气 | 无需 API Key |
| 组件 | 从零手写，不依赖 shadcn/ui | 玻璃拟态需要完全控制 CSS |

---

## Phase 1 ✅ 已完成 — 设计系统验证

5 个技术点全部验证通过：动态色相、玻璃导航、Hero 区、Welcome 动画、色相切换。

## Phase 2 — 扩展为完整站点（多页面路由）

**关键约束：必须用 Next.js App Router 多页面路由，禁止把所有内容塞进首页长滚动。**

### 页面清单

| 路由 | 标签 | 目录 | 内容 |
|------|------|------|------|
| `/` | 首页 | `src/app/page.tsx` | 只保留 Hero + Welcome + AccentSwitcher，**不要放其他页面的内容** |
| `/articles` | 文章 | `src/app/articles/page.tsx` | 文章列表：编号索引 + 封面 + 摘要 + 日期 + 阅读量 |
| `/thoughts` | 碎碎念 | `src/app/thoughts/page.tsx` | 短文本时间线 |
| `/projects` | 项目 | `src/app/projects/page.tsx` | 项目卡片网格 |
| `/gallery` | 相册 | `src/app/gallery/page.tsx` | 图片网格 + lightbox |
| `/about` | 关于 | `src/app/about/page.tsx` | 个人简介 + 技能标签 + 联系方式 |

### 设计要求

- 每个路由是**独立的 `page.tsx`**，不是塞进首页的组件
- 所有页面共用 `layout.tsx`（GlassHeader + StarField + Footer + SearchModal）
- 导航栏 `<Link href="/articles">` 等真实链接，当前页高亮
- 首页(`/`)只保留已有的 Hero + Welcome + AccentSwitcher，恢复为 v1 首页

### 数据：用你自己的真实信息

**绝对不要用 wangxinyang 的文章标题、项目名、或任何从逆向目标复制来的文案。** 数据从你的主博客 `~/Documents/blog/` 中提取：

- `site.ts` → 用你真实的名字/简介/社交链接（刘 / blog.084623224.xyz / GitHub: qingcheng66）
- `articles.ts` → 从 `~/Documents/blog/src/contents/blog/` 的 MDX 文件中提取 frontmatter（标题/日期/描述）
- `projects.ts` → 从 `~/Documents/blog/src/data/projects.ts` 复制
- `gallery.ts` → 先用占位符，后续你自己加图片

先读主博客的数据文件，再填充。

### 已有的单页组件处理

`ArticleFeed`、`StreamTimeline`、`CompassNav` 这些组件可以保留，但**必须移到对应路由的 page.tsx 中**，不要留在首页。首页恢复为只展示 Hero。导航栏的 href 改为 Next.js `<Link>` 指向真实路由。


---

## 架构决策

> 完整记录见 `.claude/project-memory.md`

### AD-008: 背景饱和度 + 亮度可调节 slider (2026-07-22)

在 Header 色相圆点旁新增 `SlidersHorizontal` 图标按钮，点击弹出玻璃拟态下拉面板，内含饱和度(5-60%)和亮度(3-40%)两个 range 滑块。值通过 `use-accent-hue` 管理并写入 localStorage 持久化。`applyAccent()` 签名扩展为 `(hex, bgSat, bgLit)`，背景三变量（`--color-bg` / `--color-bg-soft` / `--color-bg-mute`）使用动态值替代硬编码常量。

### AD-009: 移除亮/暗模式切换，项目仅暗色模式 (2026-07-22)

从 `glass-header.tsx` 移除主题切换按钮（桌面端 Sun/Moon + 移动端文字按钮），从 `use-accent-hue.ts` 移除 `useTheme` 依赖和 `isLight` 亮色分支逻辑。根因：`applyAccent()` 通过 `root.style.setProperty` 写内联样式，优先级高于 `html.light` CSS 规则，导致亮色模式背景色无法跟随主题切换。`globals.css` 中 `html.light` 块保留但不被激活。

---

## 主博客可复用资产

直接复制 `~/Documents/blog/` 中的这些文件，不改或微调：

| 文件 | 用途 |
|------|------|
| `hooks/use-theme.tsx` | 主题切换（比 next-themes 干净） |
| `hooks/use-reduced-motion.ts` | prefers-reduced-motion 检测 |
| `hooks/use-touch-device.ts` | 触屏设备检测 |
| `components/lightbox.tsx` | 图片灯箱 |
| `components/reading-progress.tsx` | 阅读进度条 |
| `components/star-field.tsx` | Canvas 粒子背景（暗色模式） |
| `components/split-text.tsx` | GSAP 字符拆分动画 |

---

## 已知坑位

- **Google Fonts 被墙**：Noto Sans SC 自托管，不走 googleapis
- **next-themes + React 19**：已用自实现 hook 替代，不装 next-themes
- **Safe area**：`env(safe-area-inset-*)` + `viewport-fit=cover`
- **触屏**：pointer 组件用 `useTouchDevice` 检测，触屏自动降级
- **backdrop-filter**：Safari 需 `-webkit-backdrop-filter`
- **RAF**：`visibilitychange` 时暂停动画循环

---

## Claude Code 工作流

启动时：读本文件 + `.claude/project-memory.md`
开发中：自己维护 `.claude/project-memory.md`，记架构决策和踩坑
提交：Hermes 负责 git

---

## 边界

- 不复制 HTML/CSS/图片/文案
- 不引入 Halo 生态
- 不修改 `~/Documents/blog/` 的文件

---

## 2026-07-23 Hermes 改动记录

### 移动端主题色 + 背景调节修复

**文件：** `src/components/glass-header.tsx`

**问题：** 色相色块和饱和度/亮度滑块只在桌面端 `hidden md:flex` 导航栏中可见，手机端完全无法调节。

**改动：** 在移动端抽屉菜单 `<nav>` 中添加了：
- 6 个主题色色块（24px，`PRESET_COLORS`，带白色选中边框+发光）
- 背景饱和度滑块（5-60%，`useAccentHue` 管理，localStorage 持久化）
- 背景亮度滑块（3-40%，同上）

### 部署方式变更

服务器 SSH 密码登录已不可用，改用密钥：

```bash
# 部署命令（在项目根目录执行）
git push
ssh -i ~/Downloads/admin.pem ubuntu@110.42.249.198 \
  "cd /www/wwwroot/blog && sudo git pull && sudo docker compose up -d --build app"
```

- 服务器代码位置：`/www/wwwroot/blog/`
- git remote：`git@github.com:qingcheng66/blog.git`（SSH 协议）
- 服务器 GitHub SSH key 已配置
- Docker 容器用 `sudo` 操作（ubuntu 用户有 sudo 权限）

### 简历

`public/resume.pdf` 已更新为最新版本。

---

## 2026-07-23 开发任务

> Hermes 分析 → 用户确认 → Claude Code 执行

### Task 1 [P0] 文章/碎碎念内容打通

**问题：** 目前 `src/data/articles.ts` 硬编码数据，`ArticleFeed` 链接全是 `#`，文章详情页路由已删除（`src/app/blog/[slug]/` 不存在），碎碎念也是假数据不可达。

**目标：**

1. 恢复文章详情路由 `src/app/blog/[slug]/page.tsx`，渲染 `src/contents/blog/` 中的 MDX 文件
2. 写 `src/lib/blog.ts`：自动读取 MDX frontmatter 生成 `Article[]`，替代 `articles.ts` 中硬编码的数组
3. `ArticleFeed` 中的 href 改为真实路由 `/blog/${article.slug}`
4. `StreamTimeline` 中的 `streamItems` 也从 MDX 自动生成，按日期倒序排列
5. 封面图机制：放在 `public/images/covers/`，MDX frontmatter 写 `cover: /images/covers/xxx.jpg`

**边界：** 不要改动 MDX 文章内容，只打通数据流和路由。

---

### Task 2 [P1] 移动端适配优化

**问题：** 手机端抽屉里的色相色块+饱和/亮度滑块太紧凑，操作精度差；背景动态范围偏窄；StarField 粒子 40 太稀疏；底部多个浮动元素拥挤。

**目标：**

1. 抽屉控件改为**底部 Sheet**：色相色块 28px + 两个 slider 间距加大，从底部弹出独立面板，不与导航混合
2. 背景饱和度范围 5-60% → **8-80%**，亮度 3-40% → **2-50%**（`use-accent-hue.ts` 中改 min/max）
3. StarField 移动端粒子上限 40 → **80**（`star-field.tsx` 中密度公式 `/15000` → `/8000`）
4. 底部浮动元素统一间距，加 `safe-area-inset-bottom`

**边界：** 不改桌面端行为。

---

### Task 3 [P2] 音乐播放器样式优化

**问题：** 音量用 `rotate(-90deg)` hack；只有旋转动画太单调；默认 opacity 0.45 太低用户注意不到。

**目标：**

1. 音量改为**圆形旋钮**：CSS 实现的拖动旋转，替代 hack 式 range input
2. 播放时用 Web Audio API `AnalyserNode` 做**音频频谱可视化**（柱子跳动）
3. 展开面板加曲目名称 + 播放进度条
4. 默认 opacity 0.45 → **0.7**
5. 移动端位置底部居中，不和回到顶部按钮重叠

**边界：** 不改音频源文件。

---

### Task 4 [P3] 天气驱动 3D 背景

**问题：** QWeather API 只显示温度，背景是静态 GIF，无动态响应。

**目标：**

1. 新建 `src/components/weather-scene.tsx`：Three.js 粒子系统，挂载到 `layout.tsx` 最底层
2. 天气→视觉效果映射：

| QWeather 天气 | 粒子效果 |
|--------------|---------|
| 晴 | 暖金色光粒子 + 柔光射线 |
| 多云 | 白色柔雾 + 粒子减半 |
| 阴 | 灰色调、低饱和度 |
| 雨 | 蓝调垂直雨丝 + 随机涟漪 |
| 雪 | 白色慢飘雪花 |

3. 夜间自动加深底色（根据 Hero 中已有的时钟判断）
4. 从 `site.ts` 读取 QWeather API 配置，用 `data.now.text` 切换场景

**依赖：** `npm install three @types/three`

**边界：** 不影响现有 StarField，两者叠加（天气场景在底层，StarField 在上层）。
