@AGENTS.md

# 项目知识库（Wiki）

本项目的完整文档和升级计划位于本地知识库：
~/knowledge/projects/blog/blog.md

启动后先读该文件获取最新上下文。

# 设计参考

## 参考项目: Cinematic Resume

详见 wiki「参考设计」章节。

## 参考项目: Bentofolio (Bento Grid)

Astro Bento Grid 作品集模板。布局亮点：不规则网格、紧凑 Profile 卡片、统计数字动画。
Demo: https://bento-grid-portfolio-beige.vercel.app/

仓库: `amirho3inh/cinematic-resume-nextjs`

暗色电影感简历模板。可借鉴：浮动玻璃导航、加载开场动画、Section 微视差、grain+grid 双层背景纹理。
详见 wiki `projects/blog/blog.md`「参考设计」章节。

## DESIGN.md 风格文件

从 `awesome-design-md` 仓库选一个喜欢的风格，把对应 DESIGN.md 放到项目根目录，告诉我「照着这个风格改」即可。

仓库: https://github.com/VoltAgent/awesome-design-md

## impeccable 命令（已安装）

设计完成后可用以下命令审查和打磨：
- `/impeccable critique` — UX 设计审查
- `/impeccable polish` — 最终打磨
- `/impeccable audit` — 可访问性/性能检查
- `/impeccable animate` — 添加动效建议

## 已安装的 skills

- `.agents/skills/design-taste-frontend/` — 反模板化前端设计
- `.claude/skills/gsap-core/` `gsap-timeline/` `gsap-scrolltrigger/` `gsap-react/` — GSAP 动画

# 项目记忆（Claude Code 自维护）

`.claude/project-memory.md` — 你在开发过程中形成的项目理解、架构决策、踩坑记录，**请自己维护到这个文件**。
每次启动先读它，关会话前把这一轮学到的新东西写进去。

注意：只需记录**跨会话还有价值**的信息（为什么这么设计、有什么坑、架构约束），不用记执行日志。
