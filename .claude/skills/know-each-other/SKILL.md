---
name: know-each-other
description: Hermes + Claude Code 协作协议 v2.0。通过 .collab/ 共享文件实现任务分配、状态同步和并发会话隔离（文件域锁 + 会话注册 + 认领原子化）。每轮开始读 board.md 认领任务，结束时更新 state.md 记录进度。
version: 2.0.0
user-invocable: true
---

# Know Each Other — Hermes ↔ Claude Code 协作协议 v2.0

通过 `.collab/` 目录下的文件实现 Agent 间任务交接与**并发隔离**，不需要 API、数据库或中心调度。

## 核心变更（v2.0）

v1.x 假设同一时刻只有一个 Agent 活跃。v2.0 支持**两个 Claude Code 会话并行开发**，新增三个强制机制：

1. **文件域锁**（`locks/`）— 用 `mkdir` 原子性实现互斥，动文件前必须申请对应域的锁
2. **会话注册表**（`sessions/`）— 会话启动/结束必须注册，其他会话可看到谁活着、占着什么
3. **认领原子化** — board.md 变更必须跟一次 git commit，防止互相覆盖

### v2.0 升级背景（2026-08-01 实际触发案例）

用户同时开两个 Claude Code 会话并行开发时发现竞争风险，升级 v2.0。当时观察到的实际情况：

- **board 认领竞态**：REQ-013~019 六个任务被同一时间戳（22:28）全部标记 🔄，无会话归属——无法判断哪个会话在干什么
- **文件冲突热点**：REQ-018（草叶装饰）和 REQ-019（动效分级）都要改 `globals.css` + `layout.tsx`，谁后保存谁覆盖谁；REQ-014（lint 清理）碰全仓，与任何并行任务都可能撞
- **git 提交互相卷入**：两个会话各自 commit/push，第二个 push 被拒（non-fast-forward），或一个 commit 把另一个的未提交改动卷进去
- **.collab 无锁**：两会话同时写 state.md / board.md，Markdown 无锁，后者覆盖前者且不可见

**教训**：给任务标"归属"（claude-a 做这个、claude-b 做那个）只是计划，LLM 会话不保证遵守——会话崩了、任务边界模糊、没读 board 都会让计划失效。所以 v2.0 用**机制强制**（mkdir 锁）替代计划约定，锁失败直接挡在门外。

## 文件结构

```
.collab/
├── state.md      ← 运行日志（双方追加，永远插当天区块末尾）
├── board.md      ← 任务公告栏（Hermes 发布，Claude Code 认领）
├── locks/        ← 文件域锁（目录即锁，mkdir 原子）
│   └── <domain>.lock/owner
└── sessions/     ← 会话注册表
    └── <session>.md
```

## 文件域定义（按目录划分，不按任务）

| 域 | 覆盖文件 | 典型任务 |
|----|---------|---------|
| `styles` | globals.css、tailwind 配置 | REQ-018、REQ-019 |
| `layout` | layout.tsx、根组件 | REQ-018、REQ-019 |
| `content-data` | content.ts、content/*.json | REQ-013、REQ-017 |
| `components` | src/components/ 各组件 | REQ-016、REQ-013 |
| `pages` | src/app/ 页面 | REQ-017 |
| `admin` | 后台 + API | — |
| `infra` | Dockerfile、CLAUDE.md、配置 | — |
| `collab` | .collab/ 自身 | 协议维护 |

## 每轮工作流

### 0. 会话启动 — 注册（v2.0 强制）

```bash
# 1. 看谁活着：读 .collab/sessions/，看有无 .md 及占用的域
# 2. 读 .collab/locks/，看哪些域被锁
# 3. 写自己的注册文件
mkdir -p .collab/sessions
echo "- $(date '+%m-%d %H:%M') claude-a, 计划域: components pages" > .collab/sessions/claude-a.md
```

会话名由用户指定（claude-a / claude-b），写进注册文件。

### 1. 认领任务 — 读 board

读 `.collab/board.md`，找 ⏳ 待认领任务。如果有且你有能力完成：
- 把任务状态从 ⏳ 改为 🔄，注明会话名
- **board 变更必须跟一次 commit**（v2.0 强制，防止双会话覆盖）：
```bash
git add .collab/board.md
git commit -m "board: 认领 REQ-016 (claude-a)"
```

### 2. 动文件前 — 申请文件域锁（v2.0 强制）

```bash
mkdir .collab/locks/<domain>.lock        # 成功 = 拿到锁
echo "claude-a $(date '+%m-%d %H:%M')" > .collab/locks/<domain>.lock/owner

# mkdir 失败 = 锁被占（输出 mkdir: File exists）→ 换别的域做，或等对方释放
```

释放：
```bash
rm -rf .collab/locks/<domain>.lock
```

**只碰自己锁的域。没锁的域不碰。** 锁用完立即释放，会话结束必须清空自己所有锁。

### 3. 任务开始 — 记 state

追加一行到 `.collab/state.md`（先 `date "+%m-%d %H:%M"` 拿真实时间，插当天区块末尾）：
```
[HH:MM] claude-a — 🔄 开始 {任务简述}，涉及 {文件列表}
```

### 4. 任务进行中 — 有影响时标注

如果改动可能影响其他模块（非当前任务范围的文件），追加：
```
[HH:MM] claude-a — ⚠️ {影响描述}
```

### 5. 任务完成 — 更新 board + state

- board.md：任务从 🔄 移到 ✅，标注 commit hash
- state.md：追加完成日志
- **释放所有锁 + 删掉会话注册文件**

```
[HH:MM] claude-a — 完成 {任务简述}，commit {hash}
```

## 格式约定

- 每条一行，简洁可 grep
- 日志前缀用**会话名**（claude-a / claude-b / Hermes），便于区分谁写的
- 状态标记：🔄 进行中 | ⚠️ 跨模块影响 | ✅ 完成

## ⚠️ 时间戳规则（强制）

**写入 state.md 或 board.md 前，必须执行以下命令获取真实时间，禁止写 `[--:--]` 占位符：**

```bash
date "+%m-%d %H:%M"
```

1. 先跑 `date` 拿到真实月日和时间，再追加日志
2. 追加位置：**永远插到当天 `## YYYY-MM-DD` 区块的末尾**（日期标题后面），不要新建 `(later)`/`(earlier)` 之类重复区块
3. 若跨天（本地凌晨 00:00-06:00），用 `date` 返回的当前日期建新区块，标题格式 `## YYYY-MM-DD`（补零，如 `2026-08-01`）
4. board.md 里标注时间处同样用 `date` 的真实时间，如 `(claude-a, 08-01 22:40)`

> 原因：日志时间用于 handoff 时判断活动顺序，`[--:--]` 和乱序区块会让同步报告失去参考价值。

## board.md 格式

```markdown
# 任务公告栏

> Hermes 分配 → Claude Code 认领 → 做完移 ✅
> 状态：⏳ 待认领 | 🔄 进行中 | ✅ 完成 | ❌ 放弃

## 🔄 进行中
- REQ-004 前端登录页面 (claude-a, 15:45)

## ⏳ 待认领
- REQ-005 文章搜索功能

## ✅ 最近完成
- REQ-003 登录 API (claude-a, a1b2c3d, 7/28)
```

## 双会话提交纪律（v2.0 强制）

1. **开工前 `git status` 必须干净** — 有别人未提交的改动先停下，问用户
2. 动文件前查 `.collab/locks/` — 被锁的域不碰
3. **push 前必 `git pull --rebase`** — 避免 push 被拒 / 提交互相卷入
4. **一个会话一个端口** — 第一个 dev 3000，第二个 dev 3001（`npm run dev -- -p 3001`）；或约定只一个跑 dev，另一个 build 验证
5. 别同时 `npm run build` — .next 目录会被踩
6. 会话结束：释放锁 + 删注册 + 带会话名写 state

## 边界

- 不自动每轮触发 — Claude Code 启动时手动执行步骤 0-1
- 不写详细需求规格 — board 中只写一句话摘要
- 不修改 Hermes 的文件（CLAUDE.md 外的所有代码文件由 Claude Code 维护）
- 架构决策和踩坑记在 `.claude/project-memory.md`
