#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/ubuntu/.openclaw/workspace/agent-system"
LOG_DIR="$ROOT/logs"
mkdir -p "$LOG_DIR"

node "$ROOT/bootstrap.mjs"

nohup node "$ROOT/main-agent.mjs" > "$LOG_DIR/main-agent.stdout.log" 2>&1 &
nohup node "$ROOT/subagent.mjs" subagent-1 > "$LOG_DIR/subagent-1.stdout.log" 2>&1 &
nohup node "$ROOT/subagent.mjs" subagent-2 > "$LOG_DIR/subagent-2.stdout.log" 2>&1 &

echo "Started main agent and subagents."
