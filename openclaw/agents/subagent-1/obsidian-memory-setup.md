# Obsidian Memory Setup Record

## Vault Path
`/home/ubuntu/Obsidian/OpenClaw-Agent-Memory`

## Environment
Configured via:
- `/home/ubuntu/.config/openclaw/obsidian-memory.env`
- sourced from `/home/ubuntu/.bashrc`

Exports:
- `OBSIDIAN_VAULT=/home/ubuntu/Obsidian/OpenClaw-Agent-Memory`
- prepends `~/.local/bin` to `PATH`

## Helper Commands
Installed to `~/.local/bin`:
- `oc-obsidian`
- `oc-daily-note`
- `oc-session-note`
- `oc-save-session-summary`
- `oc-memory-capture`

## Vault Design
Folders:
- Inbox
- Daily Notes
- Knowledge
- Decisions
- Tasks
- Sessions
- Projects
- Entities
- Logs
- Scratch
- Archive
- Templates

Templates created for:
- Daily Note
- Session Memory
- Decision Record
- Task Note
- Project Note
- Knowledge Note
- Entity Note
- Incident Log

## Notes
- The installed skill is `skills/obsidian-direct`.
- The wrapper uses the actual vault path on this machine.
- Daily/session helpers write clean single-frontmatter files.
- Search/read/edit/list were validated against the live vault.
