# aibrium.cn (Frud's Blog) 调研报告

> 调研时间：2026-08-01 21:50 | 调研方式：HTML/CSS 代码层提取 + 浏览器视觉渲染双层分析
> 站点：https://www.aibrium.cn/ — 个人技术博客（AI/RL/LLM 方向，作者 Frud_）

---

## 一、一句话结论

**这是与本站（blog.084623224.xyz）视觉 DNA 高度同源的个人博客**——同样的暖纸色（cream）背景、暖橙 accent、玻璃拟态卡片，但它在「氛围动效」和「内容组织」上更进一步：全屏弹幕短语、草叶/樱花/萤火虫装饰、状态短语轮播，以及照片墙按城市分册的相册结构。**可直接借鉴的点：动态口号播放、弹幕短语、草叶装饰、照片墙分册、说说时间线。**

---

## 二、技术指纹

| 项 | 值 |
|----|-----|
| 框架 | Next.js（Turbopack 构建，App Router，`/_next/static/chunks/` 结构） |
| 样式 | Tailwind CSS（大量 utility class：`flex items-center rounded-2xl` 等） |
| 字体 | `Noto Serif SC`（衬线标题）/ `ZCOOL KuaiLe`（手写体装饰）/ system-ui 正文 |
| 动效 | 纯 CSS keyframes（无 GSAP），10 组：gradient-drift / firefly / sakura-fall / grass-sway / danmaku-travel |
| 玻璃拟态 | `backdrop-filter: blur() saturate()` + 半透明白色底 + 柔和阴影 |
| 性能分级 | `html.effects-high/low/static`（JS 检测 `prefers-reduced-motion` + 屏幕宽度 + CPU 核数，自动降级） |
| 图片托管 | Cloudflare imgbed（`a68b43cc.cloudflare-imgbed-9pz.pages.dev`） |
| 评论/登录 | 有「登录或注册」按钮（可能接第三方评论系统） |

---

## 三、设计 Token（代码提取 + 视觉纠正）

### 3.1 色彩体系（与本站暖纸色几乎同款！）

```css
:root {
  --bg-cream: #f7efe7;        /* 主背景 · 暖纸色 —— 本站 --color-bg 近似 */
  --bg-cream-soft: #fffaf4;   /* 更亮的暖白（卡片/区域底） */
  --bg-cream-warm: #ead8ca;   /* 深一点的暖杏色 */
  --bg-cream-dark: #241b17;   /* 暗色模式深棕 */
  --text-warm: #3f352e;       /* 正文暖棕黑 */
  --text-muted-warm: #82746a; /* 次要文字暖灰 */
  --accent-warm: #b86f2b;     /* 主 accent 暖橙棕（本站 #E87830 稍偏红，它更偏棕） */
  --accent-gold: #d68a3a;     /* 金色 accent */
  --surface-glass: #fffaf4ad;       /* 玻璃卡片底（约 68% 白） */
  --surface-glass-strong: #fffcf7cc;/* 强调玻璃底（约 80% 白） */
  --surface-border: #ffffffb8;      /* 玻璃描边 */
  --shadow-soft: 0 22px 70px #7e5b4024, inset 0 1px 0 #ffffff94;
  --theme-transition-duration: .64s;
}
```

### 3.2 玻璃拟态公式（三段式，可抄）

```css
/* 普通面板 */
.soft-glass-panel {
  background: var(--surface-glass);
  border: 1px solid var(--surface-border);
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(14px) saturate(120%);
}
/* 强调面板（搜索框等） */
.soft-glass-panel-strong {
  background: var(--surface-glass-strong);
  backdrop-filter: blur(22px) saturate(145%);
}
/* 暗色模式覆盖 */
html.dark .soft-glass-panel {
  background: #40342d75;
  border-color: #fff6eb24;
  box-shadow: 0 22px 70px #0000003d, inset 0 1px 0 #ffffff14;
}
```

### 3.3 氛围动效 keyframes（全部纯 CSS，可整体搬运）

| 动效 | 用法 | 关键代码 |
|------|------|----------|
| 弹幕短语 | 全屏 `fixed inset-0 z-[1]`，6 条短语从右向左飘 | `@keyframes site-danmaku-travel{0%{opacity:0;transform:translate(0)}12%,86%{opacity:.72}to{opacity:0;transform:translate(calc(-100vw - 100%))}}`，每条 `left:100vw; top:随机%; animation-duration:24-34s; delay:负值` |
| 草叶 | 底部 `fixed bottom-0 z-[5] h-24`，30 片 | `@keyframes site-grass-sway{0%,to{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}`，CSS 变量 `--grass-left/width/height/duration/delay` 随机 |
| 樱花 | 全屏飘落，14 片 | `@keyframes site-sakura-fall{0%{opacity:0;transform:translate3d(0,-20px,0) rotate(var(--sakura-rotation))}10%,90%{opacity:.7}to{opacity:0;transform:translate3d(var(--sakura-drift),100vh,0) rotate(calc(var(--sakura-rotation) + 720deg))}}` |
| 渐变背景漂移 | `site-gradient-layer` fixed inset -8% z-index -8，30-48s 循环 | `@keyframes site-gradient-drift{0%,to{transform:translate(-2%,-1%)scale(1.04)}50%{transform:translate(2%,1%)scale(1.04)}}` |
| 萤火虫 | firefly-pulse + float-1~4（代码中存在，首页未触发大量） | `@keyframes site-firefly-pulse{0%,to{opacity:0;transform:scale(.3)}50%{opacity:1;transform:scale(1.2)}}` |

**动效分层容器（重要设计）：**
```html
<div class="effect-layer fixed inset-0 z-[-1] pointer-events-none overflow-hidden"><!-- 渐变层 --></div>
<div class="effect-layer fixed inset-0 z-[1] overflow-hidden pointer-events-none" aria-hidden="true"><!-- 弹幕层 --></div>
<div class="effect-layer fixed bottom-0 left-0 right-0 z-[5] h-24 overflow-hidden"><!-- 草叶层 --></div>
```

**性能降级（值得抄的设计）：**
```js
// effects-high / low / static / paused 四档
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const quality = reduced ? 'static' : (innerWidth < 768 || (navigator.hardwareConcurrency||4) <= 4 ? 'low' : 'high');
document.documentElement.classList.add('effects-' + quality);
// CSS 侧：.effects-static .effect-danmaku-track { animation: none }
//       .effects-static .effect-sakura-petal:nth-child(n+6) { display: none }（砍数量）
```

---

## 四、页面结构与组件清单

### 4.1 全局
- **顶部导航**：Logo + 首页/开源项目/归档/照片墙/音乐/说说/留言墙/友链/关于 + 登录按钮 + 夜间模式切换
- **音乐播放器**：右侧中央悬浮竖条（琥珀色半透明玻璃，可拖拽 `touch-none`），点击展开完整播放器（封面/进度条/播放/下一首），左侧另有全局播放/暂停悬浮圆钮
- **Canvas 波浪**：Hero 底部 126px 高的 canvas 波浪形切割（连接 Hero 与内容区）

### 4.2 首页 Hero
- 全宽背景图（68vh，二次元手绘少女插画，Cloudflare imgbed 托管）
- 覆盖：`linear-gradient(90deg, rgba(21,17,15,.48) 0%, rgba(42,32,26,.2) 42%, rgba(255,244,232,.12) 100%)` 暗化左侧 + `radial-gradient` 光晕
- 标题「Never Say Never」：衬线大粗体白字 + `text-shadow: 0 8px 34px rgba(30,22,18,.54)` + 入场动画（初始 `opacity:0 translateY(30px)`，JS 触发淡入）
- 副标题「穷则独善其身，达则兼善天下」小字
- **（关键）标题文案带 `opacity:0;transform:translateY(30px)` 内联样式 → 说明 Hero 标题是 JS 驱动入场动画**

### 4.3 弹幕短语层（页面全局）
```html
<div class="effect-layer fixed inset-0 z-[1] ...">
  <div class="effect-danmaku-track" style="left:100vw;top:36.5%;animation-duration:29.2s;animation-delay:-25.3s">在干嘛呢？</div>
  <div class="effect-danmaku-track" style="left:100vw;top:57.8%;animation-duration:33.6s;animation-delay:-0.3s">Tailwind CSS 真好用</div>
  <div class="effect-danmaku-track" style="...">BUG 修复进度 99%</div>
  <div class="effect-danmaku-track" style="...">前端开发中...</div>
  <div class="effect-danmaku-track" style="...">摸鱼中~</div>
</div>
```
- 共 6 条，`color:#82746a1c`（约 11% 透明暖灰，几乎隐形）、`font-weight:900` 粗体、`font-size:.875rem`
- 随机 top（36%-62%）、随机 duration（24-34s）、随机负 delay 错峰
- **这其实就是"动态播放的状态短语"——用户想要的 Hero 口号动态化可参考此实现**

### 4.4 内容区（首页）
- **搜索框**：玻璃强调面板 + 居中 `rounded-3xl`，placeholder「搜寻标题、描述或标签...」
- **侧边栏**：头像（戴圣诞帽挂件）+ 社交图标（github/email/qq/wechat/twitter/xiaohongshu）+ 导航 + 站点统计（运行天数 72 天、最后更新 22 小时前）
- **文章卡片**：横向卡片，标题 + 摘要 + 日期(2026.07.27) + 阅读量 + 分类标签（RL/Agent Memory/LLM 彩色胶囊）+ 缩略图（左右交替）
- **日历归档**：右侧 2026年8月 月历，日期上有文章热度标记
- **分页**：上一页/下一页

### 4.5 说说页 /moments（= 本站碎碎念）
- 标题「说说 / 碎碎念」+ 搜索框 + 月份筛选胶囊（全部/26年7月/26年6月/26年5月）+ 分页
- **内容 = 紫色渐变时间线 + 大圆角玻璃卡片**：日期（左上角蓝色）+ 心情标签（彩色胶囊：emo/大晴天/平静）+ emoji 文字内容
- 背景同样有草丛 + 花瓣飘落动效

### 4.6 照片墙 /photowall（= 本站相册）
- 标题 + 搜索框（搜索相册或照片）
- **按"城市印象"分册**：奉化印象 / 长沙印象 / 哈尔滨印象 / 沈阳印象 / 川西印象，每册一个可点击卡片组
- 相册封面 + 相册内照片 Lightbox

### 4.7 其他页面
- /timeline 归档、/projects 开源项目、/chatter 留言墙、/friends 友链、/about 关于

---

## 五、可借鉴点 → 本站落地映射

| # | aibrium 的做法 | 本站对应需求 | 落地建议 |
|---|---------------|-------------|---------|
| 1 | **Hero 口号动态播放**：JS 入场动画 + 弹幕短语 | REQ-016（Hero「用代码让想法成真」改动态播放） | 两种方案：a) 口号打字机轮播（保留方框）；b) 把「用代码让想法成真」等 2-4 句做成弹幕短语飘过页面。**推荐 a，克制不打扰** |
| 2 | **弹幕短语层**（6 条状态短语极淡色飘过） | 新功能候选 | 若用户喜欢氛围感，可加全局极淡弹幕层，`z-[1]` 位于内容之下、`pointer-events-none`，不影响阅读 |
| 3 | **草叶装饰**（底部 30 片摇摆，极淡绿） | 新功能候选 | 纯 CSS 零依赖，暖纸色底配绿色渐变草叶很搭，可做 `z-[5]` 底部装饰 |
| 4 | **照片墙按城市/主题分册** | 本站相册（REQ-011 Lightbox 已完成） | 相册数据加 `album` 字段分组展示，比现在平铺更有序 |
| 5 | **说说时间线 + 心情标签** | REQ-015（碎碎念与文章合并 + 新排版） | 时间线形式可参考：紫色渐变线 + 圆点节点 + 玻璃卡片 + 彩色心情胶囊。但注意 task-brief skill 的教训：碎碎念适合"一行一条"极简流，卡片时间线是博客风格不是碎碎念风格 |
| 6 | **effects-high/low/static 性能分级** | 本站暂无 | 动效多了以后抄这套：reduced-motion + 移动端 + CPU 核数降级 |
| 7 | **Canvas 波浪切割** | 本站 Hero 底部 | 喜欢的话可加，但本站 Hero 是纯色底，波浪意义不大 |
| 8 | **站点统计侧栏**（运行天数/最后更新） | 本站没有 | 小功能，低成本可加 |

---

## 六、与本项目的差距对比

| 维度 | aibrium.cn | blog.084623224.xyz |
|------|-----------|-------------------|
| 背景 | 二次元插画 + 渐变漂移 | 暖纸纯色 + 可选背景图(Ken Burns) |
| 氛围动效 | 弹幕/草叶/樱花/萤火虫 4 类 | 纸纹/光扫/微悬浮/弥散光晕/微粒子 |
| Hero | 大图 + JS 入场动画 | 头像 + 静态口号 + 光晕 |
| 玻璃拟态 | blur(14-22px) + saturate | blur(12px) + 纸纹 |
| 音乐 | 右悬浮拖拽播放器 + 全局圆钮 | 右下角播放器（频谱/音量/进度条更高级） |
| 相册 | 城市分册 + 搜索 | 平铺 + Lightbox |
| 碎碎念 | 时间线卡片 + 心情标签 | 月份分组卡片 |
| 性能分级 | effects-high/low/static | 无（reduced-motion 部分禁用） |

**本站优势**：频谱播放器、Ken Burns 背景、玻璃纸纹质感、后台管理（aibrium 无后台，纯代码部署）。
**本站短板**：缺氛围动效分层、Hero 静态、相册无分组、无站点统计。

---

## 七、给用户的行动建议

1. **立即做**：REQ-016 Hero 口号动态播放——确认要打字机轮播还是弹幕式，本报告的 keyframes/JS 入场动画可整体参考
2. **顺手做**：REQ-015 碎碎念与文章合并的排版参考——aibrium 的说说时间线可参考但**克制版建议一行一条**（task-brief 教训：碎碎念不是博客文章）
3. **可选做**：草叶装饰层（纯 CSS 半小时）、照片墙分册、站点统计侧栏
4. **技术债**：本站动效渐多，建议抄 aibrium 的 effects-high/low/static 性能分级
