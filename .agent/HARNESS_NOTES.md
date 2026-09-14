### Changed

- **OpenCode agents:** `.opencode/agents/*.md` are symlinks to `.agent/agents/{slug}/agent.md` (same as Cursor/Claude) — removes duplicate generated copies with `meridian-kit-generated`.
- **Agent frontmatter:** canonical `agent.md` uses `mode: subagent` + `permission:` instead of Cursor-only `tools:` string; `sync_kit.sh` no longer writes OpenCode agent files.
