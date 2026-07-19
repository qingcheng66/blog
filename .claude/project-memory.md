# 项目记忆 — 由 Claude Code 维护

> 记录你对这个项目的理解、决策、坑位。每次启动先读，关会话前追加新发现。
> 只记**跨会话还有价值**的信息，不记执行日志。

---

## 架构理解

*（待填充：你对项目路由、组件关系、数据流的理解）*

---

## 关键决策

| 时间 | 决策 | 原因 |
|------|------|------|
| 2026-07-19 | 使用 GSAP RAF 循环驱动 3D 视差 | requestAnimationFrame 比 scroll 事件更流畅 |
| 2026-07-19 | Split Text 手动实现而非 GSAP SplitText 插件 | SplitText 是 premium 插件，手动 split 足够且无额外费用 |
| 2026-07-19 | 主题切换使用 CSS transition + 辉光 overlay | next-themes 的 disableTransitionOnChange 防止闪白，叠加 overlay 提供视觉反馈 |

---

## 已知坑位

- **Next.js 16 有 breaking changes**，参考 `node_modules/next/dist/docs/` 而非在线文档
- **shadcn 组件用 @base-ui/react**，不是传统 Radix UI，所有组件用 `data-slot` 属性而非 className
- **Docker 部署用 standalone output**，凭证在 cloudflared/*.json（已 gitignore）

---

## 正在做 / 下一步

Phase 1-3 全部完成。如有需求可继续深入优化性能或添加新功能。

---

## 相关资源

- Wiki 项目文档: `~/knowledge/projects/blog/blog.md`
- 部署: Docker + Cloudflare Tunnel → `blog.084623224.xyz`
