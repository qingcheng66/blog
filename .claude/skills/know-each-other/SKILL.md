---
name: know-each-other
description: Hermes + Claude Code 协作协议。通过 .collab/ 共享文件实现任务分配和状态同步。每轮开始读 board.md 认领任务，结束时更新 state.md 记录进度。
version: 1.0.0
user-invocable: true
---

# Know Each Other — Hermes ↔ Claude Code 协作协议

通过 `.collab/` 目录下的两个 Markdown 文件实现 Agent 间任务交接，不需要 API、数据库或中心调度。

## 文件结构

```
.collab/
├── state.md    ← 运行日志（双方追加）
└── board.md    ← 任务公告栏（Hermes 发布，Claude Code 认领）
```

## 每轮工作流

### 1. 启动时 — 读 board

读 `.collab/board.md`，找 ⏳ 待认领任务。如果有且你有能力完成：
- 把任务状态从 ⏳ 改为 🔄
- 在 board.md 中注明你的名字和开始时间

### 2. 任务开始 — 记 state

追加一行到 `.collab/state.md`：
```
[HH:MM] Claude Code — 🔄 开始 {任务简述}，涉及 {文件列表}
```

### 3. 任务进行中 — 有影响时标注

如果改动可能影响其他模块（非当前任务范围的文件），追加：
```
[HH:MM] Claude Code — ⚠️ {影响描述}
```

### 4. 任务完成 — 更新 board + state

- board.md：任务从 🔄 移到 ✅，标注 commit hash
- state.md：追加完成日志

```
[HH:MM] Claude Code — 完成 {任务简述}，commit {hash}
```

## 格式约定

- 每条一行，简洁可 grep
- 时间格式 `[HH:MM]`
- 状态标记：🔄 进行中 | ⚠️ 跨模块影响 | ✅ 完成

## board.md 格式

```markdown
# 任务公告栏

> Hermes 分配 → Claude Code 认领 → 做完移 ✅
> 状态：⏳ 待认领 | 🔄 进行中 | ✅ 完成 | ❌ 放弃

## 🔄 进行中
- REQ-004 前端登录页面 (Claude Code, 15:45)

## ⏳ 待认领
- REQ-005 文章搜索功能

## ✅ 最近完成
- REQ-003 登录 API (Claude Code, a1b2c3d, 7/28)
```

## 边界

- 不自动每轮触发 — Claude Code 启动时手动执行步骤 1
- 不写详细需求规格 — board 中只写一句话摘要
- 不修改 Hermes 的文件（CLAUDE.md 外的所有代码文件由 Claude Code 维护）
- 架构决策和踩坑记在 `.claude/project-memory.md`
