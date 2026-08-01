# gyyra.cn 调研说明（深度版）

> 调研时间：2026-08-01 ｜ 方法：代码层（curl/HTML/CSS/JS 逆向）+ 视觉层（Playwright 桌面/移动/交互截图 + 视觉审查）+ **源码仓库取证**（GitHub: think-essay/gyyra-home 公开可查，完整揭示自动化机制）

---

## 一、站点定位

www.gyyra.cn 是个人导航起始页（Landing/Home Page），单屏展示头像、签名、语录、链接，分发到 5 个子站：

```
www.gyyra.cn    导航起始页（本调研对象，纯静态 HTML 7.6KB）
├── blog.gyyra.cn   Hexo 8.1.2 博客 "gyyra's blog"
├── cloud.gyyra.cn  私有云网盘 "My cloud"（头像图也托管于此，带签名 URL）
├── pic.gyyra.cn    简单图床（EasyImage）
└── tool.gyyra.cn   IT Tools（开发者工具合集）
```

- 主体：gyyra（GitHub: think-essay；500px / 知乎 / Email）
- 备案：晋ICP备2025054164号-1（山西），Copyright 2025-2026
- 上游：fork 自 dmego/home.github.io（dmego-home-page@1.0.11），致谢 Vno / Mno / 北岛向南

## 二、技术指纹

| 维度 | 值 |
|------|---|
| 页面形态 | 纯静态 HTML，无框架无构建；nginx + HTTP/2 + HSTS |
| 资源加载 | CSS×3 走 unpkg CDN（@latest=1.0.11）；JS×2 与 wakatime-theme.css 走本地 |
| 第三方 API | hitokoto（一言）、cn.bing.com（壁纸）、wakatime.com（编码统计）、models.github.ai（AI 周报） |
| 源码仓库 | **公开**：github.com/think-essay/gyyra-home（今天仍在自动提交） |
| 部署方式 | GitHub Actions → rsync → 云服务器 nginx reload |
| 更新频率 | 每天 3 个定时任务自动更新（详见第六节） |
| 防盗链 | 本地 /assets/ 静态资源校验 Referer，无 Referer 的 curl 直接 404（浏览器正常） |

## 三、页面结构（HTML 层）

```
header#panel.panel-cover（全屏）
  ├── 背景：JS 动态设置 Bing 每日壁纸（每次刷新轮换）
  ├── 内容区（垂直+水平居中）
  │    ├── 头像 .js-avatar（圆形动漫插画 + 呼吸发光环；hover 3D 翻转显示 "Be Brave / 2026 · 勇敢"）
  │    ├── h1：gyyra（链接到 blog.gyyra.cn）
  │    ├── 副标题：热爱是所有的理由和答案
  │    ├── 分隔线 <hr>（rgba(255,255,255,0.14)）
  │    ├── #description：hitokoto 动态语录（格式：内容 -「出处」）
  │    ├── 导航胶囊 ×5：首页 / 博客 / 网盘 / 图床 / 工具（幽灵按钮，白色描边）
  │    └── 社交图标 ×4：GitHub / 500px(PNG 图) / 知乎 / Email
  └── 底部：版权 + ICP（极小半透明弱化）
右下角 fixed：WakaTime 编码状态胶囊（毛玻璃，点击弹周报）
```

**与上游模板的 8+ 处差异（对比 unpkg 原版 index.html）：**
1. 导航从 4 项（首页/博客/简历/关于）改为 5 项（首页/博客/网盘/图床/工具）
2. 删除原版微信二维码弹窗（wechatModal + showWeChatModal）
3. 邮箱从 base64 加密跳转（decryptEmail）改为明文 mailto
4. 头像从 unpkg logo3.jpg 改为自建图床 cloud.gyyra.cn 签名 URL
5. 备案区启用（原版注释掉），填入真实 ICP 号
6. "Powered By GitHub Actions And Hitokoto" 页脚被注释删除
7. 500px 用自备 PNG 图标（200×200，非 iconfont）
8. 本地保留 vno.css/iconfont.css/favicon.ico 等文件但 HTML 不引用（冗余，未完成的本地化迁移）

## 四、前端交互细节（本地 JS 逆向）

### main.js（81 行，逻辑与 unpkg 等价但重写为更简洁风格）
- **iUp 入场动画**：所有 .iUp 元素按 150ms 间隔依次上浮淡入
- **Bing 壁纸**：`BING_IMAGE_URL_PATTERN = /^\/th\?id=OHR\.[a-zA-Z0-9_-]+\.jpg(&[a-zA-Z0-9=._-]+)*$/` 正则校验（防 CSS 注入）→ sessionStorage("bing-image-index") 记录索引，**每次刷新换一张**（index+1 % len）
- **hitokoto**：fetch v1.hitokoto.cn，replaceChildren + createTextNode（防 XSS），失败静默保留 HTML 默认文案
- **移动菜单**：汉堡按钮 toggle .visible + bounceInDown/bounceOutUp 动画，icon-list ↔ icon-angleup 切换

### theme-loader.js（本地为 103 行精简重写版，unpkg 为 413 行完整版）
本地版砍掉了：渐变背景注入（--bg-gradient）、粒子效果（intense/legendary 时的 20 个悬浮粒子）、SVG Catmull-Rom 平滑折线图、ai-badge 圆点。保留核心：
- 6 档主题色板（THEMES）：rest #a0c4ff / relaxed #80ed99 / productive #f5af19 / focused #ff4b2b / intense #8e2de2 / legendary #00c6ff，每档有 glow 尺寸(12→50px) + 脉冲速度(4s→.5s)
- applyTheme 注入 CSS 变量：--wakatime-theme-color / --glow-size / --pulse-speed，头像加 .glowing
- 状态胶囊：`🛌 休息日 · 0.00h`（emoji + 主题名 + 小时），hover 上浮发光，点击弹周报
- 周报弹窗：等宽字体终端风卡片（weekly-card），标题 = AI 塔罗牌名，正文 = AI 语录，TOTAL/AVG/PEAK 三格统计，7 天 div 柱状图（height = hours/max × 70px，title 显示日期+h）
- URL 调试参数：`?theme=focused&hours=6` 可强制覆盖主题

### wakatime-theme.css（本地 2.3KB 精简版，unpkg 9.8KB 完整版）
本地版只保留：头像 glow 呼吸动画（wakatime-pulse 50% scale 1.03 + 32px 光晕）、状态胶囊毛玻璃（rgba(12,12,18,.58) + blur(12px) + 22px 胶囊）、周报弹窗（rgba(0,0,0,.54) + blur(3px) 遮罩，weekly-card 深黑 #0b0b10 + #353540 边框 + 8px 圆角）。
砍掉了：导航按钮玻璃覆盖（.blog-button 的 blur）、粒子样式、SVG 图表样式、输入光标闪烁（typing-effect）、Hover 时按钮发光等。

**注意**：本地 theme-loader.js 与 unpkg 版 THEMES 结构不同（unpkg 版有 gradient/colors 三维色板，本地版只有单色 color）——本地版是作者按自己需求重构的，非单纯降级。

## 五、视觉层实测（Playwright 截图确认）

**桌面 1440px：**
- 全屏 Bing 壁纸（森林栈道航拍），overlay 黑色 55% 加深保证文字对比
- 头像：动漫少女插画，外圈淡蓝 #a0c4ff 呼吸光环（border 2px rgba(255,255,255,.25)）
- 文字纯白居中；导航幽灵按钮白色描边（vno.css 蓝色 #4e97d8 被 .panel-inverted 覆盖为白）
- 整页单屏无滚动

**头像 hover：** 3D 翻转（perspective 900px + right_to_left）→ 显示 "Be Brave / 2026 · 勇敢" 卡片

**周报弹窗（点击状态胶囊）：** 极简终端风 —— 深蓝黑底 + 淡蓝点缀 + 等宽字体；标题栏 🛌 The Hermit（AI 塔罗）+ 右上角 ×；正文 "代码写得少，Bug 自然少。"；TOTAL 0.2h / AVG 0.0h / PEAK 0.2h 三格；底部 7 根柱状图（第 5 天突出）；背景高斯模糊遮罩

**移动端 390px：** 导航收起为顶部居中汉堡；点击展开深色半透明遮罩（上 50%），5 个胶囊按钮垂直堆叠 + 社交图标横排，按钮变 ↑ 收起；状态胶囊缩至右下 14px 边距；备案文字极小几乎不可辨（有意弱化）

## 六、★ 自动化流水线（源码仓库取证 —— 本站最大技术价值）

三个 GitHub Actions 工作流，全部公开在 think-essay/gyyra-home：

### 1. auto-bing.yml（每日 UTC 01:00 = 北京 09:00）
```
node assets/js/bing.js → 抓 https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8
→ 取 8 张壁纸 URL 写 window.BING_IMAGES 到 assets/json/images.js
→ 提交 → 触发 deploy-server.yml
```

### 2. daily-theme-update.yml（每日 UTC 00:07 = 北京 08:07）
```
node .github/scripts/update-wakatime.js（TZ=Asia/Shanghai）
→ WakaTime API 取近 7 天 summaries
→ 主题分档：<1h rest / <3h relaxed / <5h productive / <7h focused / <9h intense / ≥9h legendary
→ GitHub Models（models.github.ai，gpt-4.1，temperature 0.8）生成 AI 周报 JSON：
   {title(2-6字), quote(≤60字中文点评), tarot(emoji+塔罗牌名), theme_color(#RRGGBB)}
→ 写 assets/json/config.js（昨日 hours + theme）和 weekly.js（7天数据 + AI 字段）
→ 提交 → 触发部署
```

**关键设计细节（update-wakatime.js 逆向）：**
- `permissions: models: read` —— 用 GitHub Models 免费推理（模型名由 vars.MODEL_NAME 配置）
- **fallbackAi 兜底**：AI 调用失败时按日均时长用模板文案（<1.5h "代码写得少，Bug 自然少。/ 🛌 The Hermit" / <4.5h "渐入佳境 / 🌱 The Empress" / <8h "火力全开 / 🪄 The Magician" / ≥8h "赛博飞升 / 🔮 The World"）
- normaliseAi 清洗：过滤 U+FFFD 乱码字符、截断长度、校验 theme_color 格式
- 主题取**昨日**编码时长（不是今天），周报取近 7 天
- 支持 workflow_dispatch 手动传 hours/theme 调试

### 3. deploy-server.yml（push main / 手动触发）
```
rsync -az --exclude='.git/' --exclude='.github/' --exclude='.well-known/' ./ → $SERVER_HOST:$SERVER_DEPLOY_PATH
→ ssh 'nginx -t && /etc/init.d/nginx reload'
```
需要 8 个 Secrets：GH_TOKEN / WAKATIME_TOKEN / SERVER_HOST / SERVER_PORT / SERVER_USER / SERVER_DEPLOY_PATH / SERVER_SSH_KEY / SERVER_KNOWN_HOSTS

**完整链路**：Bing/主题工作流生成数据 → 自动提交 → 自动触发部署 → rsync 上服务器 → nginx reload。**全程无人值守，站点每天"活着"。**

## 七、实测数据快照（2026-08-01）

```
config.js:  { date:"2026-07-31", hours:0, theme_name:"rest", theme_display:"休息日", updated_at:"2026-08-01T03:45:10Z" }
weekly.js:  { total_hours:0.22, daily_avg:0.03, trend:"rising", max_day:{2026-07-30, 0.22h, "12 mins"},
             days: 7 天数组（date/hours/text），ai:{ title:"休养生息", quote:"代码写得少，Bug 自然少。",
             tarot:"🛌 The Hermit", theme_color:"#a0c4ff" } }
images.js:  window.BING_IMAGES = ["/th?id=OHR.VirginiaTrail_...", "NavajoNation", "TigerFamily", "ChannelKelp", ...]（8 张）
```

## 八、可借鉴点（移植到 blog.084623224.xyz 的候选）

1. **「编码状态驱动主题」联动系统**（最值得抄）：当天投入时长 → 6 档主题 → emoji/发光色/脉冲节奏/周报文案全联动。比静态装饰有灵魂，和暖纸主题 + 玻璃拟态可结合
2. **AI 周报 + 塔罗牌隐喻**：枯燥编码数据变成"🛌 The Hermit + 幽默语录"的人格化表达，低成本高趣味
3. **GitHub Actions 全自动流水线**：数据生成 → 提交 → 自动部署 → nginx reload 一条链，无人值守
4. **防 XSS 正确姿势**：壁纸 URL 正则校验 + 语录 createTextNode，纯静态模板同样安全
5. **fallback 兜底设计**：AI 挂了自动降级模板文案，站点永不因第三方故障白屏
6. **幽灵按钮 + 毛玻璃胶囊**：透明描边不抢背景，毛玻璃悬浮组件固定右下角
7. **单屏起始页克制**：一屏收完所有信息，无滚动

## 九、已知问题/瑕疵

- "MY HOME" 标题 + "Dmego Home" title 属性是模板默认残留
- 邮箱地址异常：mailto:gyyra@everywhereyoupass@gmail.com（两个 @，疑似笔误）
- 头像 hover 文案写死在 HTML（Be Brave / 2026 · 勇敢），改年份需改代码
- 无 robots.txt（返回 404 页）、无 sitemap.xml、无 og/SEO meta
- 仓库与线上有冗余文件（本地 vno.css 等存在但不引用）；ActionNotes.md 是上游残留
- 社交 iconfont 走远程字体，CDN 挂掉图标变方块
- 移动端备案文字对比度过低

---
*调研产物：/tmp/gyyra/ 下存有全部原始文件（HTML/JS/CSS/config/weekly/images + 6 张截图）+ 克隆的源码仓库 /tmp/gyyra/repo/*
