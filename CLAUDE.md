@AGENTS.md

# Serenity Lab — blog.084623224.xyz

> Next.js 16 暖纸色个人博客 · JSON 文件 CMS · Docker + Cloudflare Tunnel 部署

---

## 🔴 协作协议（know-each-other v2.0 — 支持双 Claude 并发）

0. **启动**：读 `.collab/sessions/` + `.collab/locks/` 看谁活着、哪些文件域被锁；写自己的注册文件 `.collab/sessions/<会话名>.md`（会话名由用户指定，如 claude-a / claude-b）
1. 读 `.collab/board.md` 认领 ⏳ 任务 → 标记 🔄 + 会话名；**board 变更必须跟一次 git commit**（防双会话覆盖）
2. **动文件前申请文件域锁**（强制）：`mkdir .collab/locks/<文件域>.lock`（成功=拿到锁，`mkdir: File exists`=被占→换域做或等释放），写入 owner，用完 `rm -rf` 释放。**只碰自己锁的域**
3. 任务开始/结束时 → 追加 `.collab/state.md`（**会话名前缀** + 真实时间戳）
4. 改动影响其他模块时 → ⚠️ 前缀标注
5. 完成任务 → board.md 移到 ✅，标注 commit hash
6. **提交纪律**：开工前 `git status` 必须干净（有别人未提交的改动先停下）；push 前必 `git pull --rebase`；一个会话一个端口（第一个 dev 3000，第二个 `npm run dev -- -p 3001`）；别同时 `npm run build`（.next 会被踩）
7. 会话结束：释放自己所有锁 + 删除注册文件 + 带会话名写 state

文件域定义：`styles`(globals.css/tailwind) | `layout`(layout.tsx/根组件) | `content-data`(content.ts/content/*.json) | `components`(src/components/) | `pages`(src/app/) | `admin`(后台+API) | `infra`(Dockerfile/CLAUDE.md/配置) | `collab`(.collab/自身)

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

> 详见 `.collab/board.md`，以下为摘要。

| 编号 | 优先级 | 内容 |
|------|:------:|------|
| REQ-002 | P0 | 主题动效：修复 `--glass-blur`、纸纹噪点、玻璃光扫、卡片微悬浮、导航下划线流动 |
| REQ-003 | P1 | 音乐播放器后台管理：content/music.json、API、管理页、前端读数据源 |
| REQ-004 | P2 | 起始页优化：Welcome 点击任意处关闭+微粒子、Hero 下方最近动态预览 |

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
