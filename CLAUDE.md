@AGENTS.md

# Serenity Lab — blog.084623224.xyz

> Next.js 16 暖纸色个人博客 · JSON 文件 CMS · Docker + Cloudflare Tunnel 部署

---

## 🔴 协作协议（know-each-other）

1. 每轮开始前读 `.collab/board.md`，认领 ⏳ 任务 → 标记 🔄
2. 任务开始/结束时 → 追加 `.collab/state.md`
3. 改动影响其他模块时 → ⚠️ 前缀标注
4. 完成任务 → board.md 移到 ✅，标注 commit hash
5. 只维护 `.claude/project-memory.md` 记架构决策和踩坑

---

## 设计 Token（暖纸色）

```css
--color-accent:     #E87830;           /* 暖橙 */
--color-bg:         hsl(30, 20%, 95%); /* 暖白书页 */
--color-bg-soft:    hsl(30, 16%, 92%);
--color-text:       #2d2a25;           /* 深褐灰 */
--glass-bg:         rgba(255,255,255,0.6);
--glass-bg-strong:  rgba(255,255,255,0.75);
```

6 暖色预设：暖橙 / 琥珀 / 桃粉 / 青苔 / 暖紫 / 棕褐。单主题，无亮暗切换。

---

## 部署

```bash
# 日常更新
git push
ssh -i ~/Downloads/admin.pem ubuntu@110.42.249.198 \
  "cd /www/wwwroot/blog && sudo git pull origin master && sudo chown -R 1001:65533 content/ && sudo docker compose up -d --build app"
```

### 常见故障

| 故障 | 原因 | 处理 |
|------|------|------|
| API 写操作 EACCES | content/ 文件归 root，容器用 uid 1001 | `chown -R 1001:65533 content/` |
| git pull 冲突 | 后台编辑产生本地修改 | `git stash && git pull origin master && git stash drop` |
| 构建超时 | Docker Hub 被墙 | DaoCloud mirror + 国际代理 |

### 调试命令

```bash
ssh ... "sudo docker logs blog-app-1 --tail 50"
ssh ... "ls -la /www/wwwroot/blog/content/"
ssh ... "sudo docker exec blog-app-1 id"
```

---

## 架构速查

| 层 | 关键文件 | 说明 |
|----|---------|------|
| 根布局 | `src/app/layout.tsx` | AdminGate 包裹博客外壳（/admin 路径隐藏） |
| 数据层 | `src/lib/content.ts` | 6 类数据 JSON 读写 |
| 鉴权 | `src/lib/auth.ts` + `middleware.ts` | cookie admin_token |
| 色相引擎 | `src/hooks/use-accent-hue.ts` | 6 预设 + sat/lit slider，localStorage 持久化 |
| 后台 UI | `src/app/(admin)/admin/` | Route Group，sidebar + 6 管理页 |
| API | `src/api/admin/` | 13 端点 (login/logout + 5 类 CRUD + upload) |
| 数据存储 | `content/` | Docker volume 挂载，不进入 git |
| 架构决策 | `.claude/project-memory.md` | AD-001 ~ AD-023 |

---

## 当前任务

（无）

---

## 任务历史（已完成）

| 日期 | 任务 | Commit |
|------|------|--------|
| 7/30 | REQ-001(stream-timeline年份硬编码) — 已在AD-023修复 | a52a167 |
| 7/30 | AD-022(force-dynamic) + AD-023(日期含时间+排序) | a52a167 |
| 7/28 | AD-018修订(AdminGate) + AD-020(碎碎念重设计) + AD-021(编辑合并) + NavCards移除 | 505218c |
| 7/26 | AD-018(后台布局隔离) + sidebar Link 客户端路由 | - |
| 7/25 | AD-013(暖纸色翻面) + AD-014(JSON CMS后台) + AD-015~017(去占位化/死代码清理/NavCards) | - |
| 7/22 | AD-005(QWeather) + AD-007~009(色相Header/Slider/移除亮暗) + AD-010(关于页) + AD-012(音乐播放器) | - |
| 7/21 | AD-001~004(骨架/色相hook/移除shadcn/多页面路由) | - |
