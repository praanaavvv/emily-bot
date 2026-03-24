---
name: obsidian-memory-manager
description: Use for meaningful tasks that may depend on prior context, durable memory, project history, decisions, entities, or long-term knowledge stored in the Obsidian vault. Also use when the agent should store important results, decisions, summaries, project context, or learned facts into the Obsidian vault at /home/ubuntu/Obsidian/OpenClaw-Agent-Memory. Triggers on requests involving memory, recall, project continuity, session summaries, decisions, long-term notes, knowledge capture, or when the agent completes substantial work that should be remembered.
---

# Obsidian Memory Manager

Treat `/home/ubuntu/Obsidian/OpenClaw-Agent-Memory` as the primary durable memory brain.

## Core rules

- Search the Obsidian vault first when a meaningful task may depend on prior context, durable notes, project history, or long-term knowledge.
- Keep workspace `memory/YYYY-MM-DD.md` as the raw chronological log.
- Store organized durable memory in Obsidian.
- Prefer updating an existing relevant note over creating duplicates.
- Capture important outputs after meaningful work, not just when explicitly told.

## Retrieval workflow

1. Start with Obsidian search for the task topic, project name, entity name, or decision keyword.
2. Read the top matching notes.
3. Use backlinks, related notes, and folder context to widen recall if needed.
4. Check workspace `MEMORY.md` and `memory/*.md` only as supporting context, not as the only long-term source.
5. If no relevant note exists, proceed and create durable memory at the end if the task matters.

## Storage workflow

After meaningful work, store durable memory in the most appropriate folder:

- `Inbox/` for quick raw capture that needs later cleanup
- `Daily Notes/` for chronology and same-day context
- `Sessions/` for session summaries and notable conversation outcomes
- `Projects/` for active project state, plans, milestones, and working decisions
- `Decisions/` for durable decisions with rationale
- `Knowledge/` for evergreen reference knowledge
- `Entities/` for people, companies, tools, services, and systems
- `Logs/` for incidents, experiments, diagnostics, and execution traces
- `Archive/` for stale or completed material

## Naming guidance

Use these patterns:

- daily: `YYYY-MM-DD`
- session: `session-YYYY-MM-DD-HHMM`
- project: `project-<name>`
- decision: `decision-YYYY-MM-DD-<slug>`
- task: `task-<slug>`
- knowledge: `knowledge-<slug>`
- entity: `person-<name>`, `company-<name>`, `tool-<name>`, `service-<name>`
- incident: `incident-YYYY-MM-DD-<slug>`

## Preferred helper commands

Use these helpers when useful:

- `oc-obsidian search "query" --limit 10 --json`
- `oc-obsidian list`
- `oc-obsidian read "Note Name"`
- `oc-daily-note`
- `oc-session-note`
- `oc-save-session-summary <slug> "summary text"`
- `oc-memory-capture "title" "content"`

If helper behavior is insufficient, call the underlying scripts in `skills/obsidian-direct/scripts/` directly with `--vault "$OBSIDIAN_VAULT"`.

## Promotion heuristics

Promote to durable memory when any of these are true:

- a decision was made
- a project state materially changed
- the user expressed a standing preference
- an important lesson was learned
- an entity gained useful context
- a substantial task was completed
- future recall would likely help

## Avoid

- dumping every trivial exchange into durable memory
- storing only in workspace memory when the information is clearly long-lived
- creating many overlapping notes with vague titles
- leaving important context only in `Inbox/` forever

## Read more when needed

Read `references/note-routing.md` when deciding where a note belongs.
Read `references/capture-checklist.md` when deciding what to store after a task.
