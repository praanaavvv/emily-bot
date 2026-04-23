# Agent System

This setup provisions two isolated git worktree subagents and a main coordinator.

## Layout

- Main repo: `/home/ubuntu/.openclaw/workspace`
- Subagent worktrees:
  - `/home/ubuntu/.openclaw/agents/subagent-1` on `subagent-1-branch`
  - `/home/ubuntu/.openclaw/agents/subagent-2` on `subagent-2-branch`
- Shared pipeline files:
  - `/home/ubuntu/.openclaw/workspace/pipeline/main_to_subagent_1.json`
  - `/home/ubuntu/.openclaw/workspace/pipeline/main_to_subagent_2.json`
  - `/home/ubuntu/.openclaw/workspace/pipeline/subagent_1_to_main.json`
  - `/home/ubuntu/.openclaw/workspace/pipeline/subagent_2_to_main.json`

## Per-subagent assets

Each subagent has:

- `config.json`
- `logs/`
- `task-queue.json`
- `vault/goals.md`
- `vault/tasks.md`
- `vault/memory.md`

## Runtime behavior

- `main-agent.mjs` seeds tasks, monitors outbound updates, evaluates results, and writes feedback into each subagent's `vault/memory.md`.
- `subagent.mjs` runs an isolated read -> process -> write -> sleep loop against its own queue and pipeline files.
- Subagents never read each other's files.

## Start

```bash
bash /home/ubuntu/.openclaw/workspace/agent-system/start-all.sh
```

## Extending

- Add more subagents by expanding `AGENTS` in `bootstrap.mjs` and `main-agent.mjs`.
- Swap `evaluateTask()` in `subagent.mjs` with domain-specific executors.
- Replace file polling with sockets or queues later without changing the agent contract.
