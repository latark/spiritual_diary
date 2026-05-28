# Go - Start Task

Quick start for any task. Route to appropriate workflow.

## Task Classification

First, classify the task:

- **Quick fix** (typo, small bug, single file) → Fix directly
- **Investigation** ("почему", "как работает", "найди") → Explore → Report
- **Feature/Refactor** (new code, multiple files) → `/cmd_app_draft-plan`
- **DB change** (schema, RLS, migrations) → Read `skill_app_database/` skill first
- **UI component** (new shadcn component) → Read `skill_app_shadcn-components/` skill
- **UI/UX design** (new page, layout, flow) → Apply best practices: accessibility, visual hierarchy, consistent spacing, clear feedback states
- **Architecture** (system design, data flow) → Apply best practices: SOLID, DRY, separation of concerns, clear boundaries, predictable data flow. Follow FSD layers: shared ← entities ← features ← widgets ← pages ← app

## Quick Start Checklist

```
□ Understand what user wants (ask if unclear)
□ Find relevant code (Serena: find_symbol, get_symbols_overview)
□ Check existing patterns (don't reinvent)
□ For 3+ file changes → use /cmd_app_draft-plan instead
```

## MCP Priority

1. **Serena** — ALWAYS first for code navigation
2. **Supabase** — for DB queries, schema checks, logs via mcp
3. **Upstash** — for Redis cache, rate limiting, queues via mcp
4. **Shadcn** — for UI components search and install
5. **Context7** — when using unfamiliar library API
6. **Chrome DevTools** — for UI debugging, network issues
7. **Sequential Thinking** — complex multi-step logic only

> If needed MCP is not available, check `.mcp.json` — if configured but disabled, suggest user to enable it for this task.

## Skill Quick Reference

- API routes, validation → `skill_app_api-endpoints/`
- DB schema, RLS → `skill_app_database/`
- Payments, credits → `skill_app_payment-flow/`
- Streaming, latency → `skill_app_audio-video-sync/`
- New UI component → `skill_app_shadcn-components/`
- Architecture questions → `skill_app_architecture/`
- Code style, patterns → `skill_app_code-conventions/`
- New API route → `skill_app_new-api-route/`
- Credit audit → `skill_app_verify-credits/`

## DO NOT

- Start coding before understanding existing patterns
- Create new files when editing existing would work
- Skip reading skills for domain-specific tasks
- Forget TodoWrite for multi-step work

$ARGUMENTS