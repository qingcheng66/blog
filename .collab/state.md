# 运行日志

## 2026-07-30

[02:30] Hermes — 初始化 know-each-other 协作协议，创建 .collab/
[02:30] Hermes — handoff 同步：本地 a52a167，服务器同步，blog-app-1 Up 23h，所有 content/ 数据完整
[02:35] Hermes — 重写 CLAUDE.md：从 476 行精简到 102 行，移除逆向实验场旧内容，新增 know-each-other 协议 + 架构速查表 + REQ-001 当前任务
[02:40] Hermes — 创建 .claude/skills/know-each-other/SKILL.md + 更新 AGENTS.md 注册技能
[02:45] Hermes — 启用 Claude Code Agent Teams：settings.json 加 CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 + teammateMode=auto
[17:45] Claude Code — 🔄 认领 REQ-001，涉及 src/components/stream-timeline.tsx
[17:45] Claude Code — 检查确认 REQ-001 已在 a52a167 (AD-023) 中修复：parseDate 支持完整年份格式，groupByMonth 用动态年份。无需额外改动，更新 board/CLAUDE.md
[17:48] Claude Code — 📋 同步项目：board 已清空待认领，CLAUDE.md 移除 REQ-001，当前无待办。Hermes 遗留变更仍待提交
[23:31] Hermes — 提交 601dbc6 (know-each-other 协作协议) + 部署：git pull → docker build 21s → blog-app-1 重启 → 线上 200
[23:35] Hermes — 更新 wiki (~/knowledge/projects/blog/blog.md)：AD-023 附带修复 groupByMonth、新增 know-each-other + Team 模式章节、移除已知问题中的年份硬编码、更新部署命令+项目结构
[23:50] Hermes — 发布 3 个新任务到 board：REQ-002(主题动效-纸纹+光扫+微悬浮)、REQ-003(音乐播放器后台管理)、REQ-004(起始页优化+内容引导)

## 2026-07-30 (later)

[--:--] Claude Code — 🔄 开始临时任务：移除天气3D代码 + 修复文章功能
[--:--] Claude Code — ✅ 完成临时任务，变更文件见下
[--:--] Claude Code — 📋 项目状态同步 (7/30 会话末)，详见下方完整报告

## 2026-07-30 (earlier)

[--:--] Claude Code — AD-022: 5 页面 force-dynamic 即时生效，articles/thoughts/projects/gallery/about 从 ○ Static → ƒ Dynamic
[--:--] Claude Code — AD-023: 碎碎念日期含时间(7月29日 14:30) + 同日内倒序 + 后台自动填入当前时间 + 列表客户端排序

## 2026-07-28

[--:--] Claude Code — AD-018 修订: AdminGate 客户端路由方案替代 middleware headers，修复从后台返回博客时外壳消失 bug
[--:--] Claude Code — AD-020: 碎碎念月份分组卡片重设计（玻璃卡片 + 日期胶囊 + 自然语言句式）
[--:--] Claude Code — AD-021: 后台编辑 API 数据合并防丢失（spread 合并替代全量替换）
[--:--] Claude Code — NavCards 移除

## 2026-07-26

[--:--] Claude Code — AD-018: 管理后台布局隔离（middleware x-is-admin header → layout 条件渲染）
[--:--] Claude Code — Task 2: 后台 sidebar <a> → <Link> 客户端路由

## 2026-07-25

[--:--] Claude Code — AD-013: 全站暖纸色主题翻面（暗色→暖白纸色，删除 StarField+bg.gif+html.light）
[--:--] Claude Code — AD-014: 管理后台（JSON 文件 CMS + 13 API + 7 页面 + Route Group 隔离）
[--:--] Claude Code — AD-015: 个人元素替换（头像 L + 副标题 + Footer 文案）
[--:--] Claude Code — AD-016: 死代码清理（删除 articles.ts/projects.ts/contents/blog/）+ JSON 数据修复
[--:--] Claude Code — AD-017: 首页 NavCards 引导 + 关于页 bio 扩展 + 相册空状态文案

## 2026-07-22

[--:--] Claude Code — AD-005: QWeather API 替代 wttr.in（国内被墙，固定城市苏州）
[--:--] Claude Code — AD-007~009: 色相切换集成到 Header + 背景 sat/lit slider + 移除亮暗切换
[--:--] Claude Code — AD-010: 关于页联系方式更新 + 简历下载
[--:--] Claude Code — AD-012: 音乐播放器组件（Web Audio + 圆形旋钮 + 进度条）
[--:--] Claude Code — PIT 修复: hover-media 触屏适配 10 组件、safe-area-inset、触摸目标 ≥44px

## 2026-07-21

[--:--] Claude Code — AD-001~004: 项目骨架复制、色相 hook、移除 shadcn/ui、多页面路由
