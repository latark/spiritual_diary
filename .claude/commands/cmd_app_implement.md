# Implement - Execute Plan

Load plan from `.claude/local/backlog/` and execute step by step.

## Find Plan

1. If argument provided → use that path
2. Otherwise → find most recent `.claude/local/backlog/*.md` file

## Before Starting

1. Read the full plan
2. If plan is long (>50 lines) → show summary only, offer to open file
3. Create TodoWrite items for each step
4. Confirm with user: "План верный, начинаю?"

## MCP for Implementation

- **Serena** — replace_symbol_body, insert_after_symbol for precise edits
- **Supabase** — apply_migration, execute_sql for DB changes via mcp
- **Upstash** — manage Redis keys if caching involved via mcp
- **Shadcn** — get_add_command_for_items to install components
- **Context7** — fetch docs if stuck on library API
- **Chrome DevTools** — verify UI changes in browser

> If needed MCP is not available, check `.mcp.json` — suggest user to enable it.

## Skills Reference

- API routes, validation → `api-endpoints/`
- DB schema, RLS → `database/`
- Payments, credits → `payment-flow/`
- Streaming, latency → `audio-video-sync/`
- New UI component → `shadcn-components/`
- Architecture questions → `architecture/`
- Code style, patterns → `code-conventions/`

## Execute Steps

For each step:
```
□ Mark todo as in_progress
□ Implement the change
□ Mark todo as completed
□ Brief progress report
```

## After Implementation

Run verification commands:
```
□ /check-build — types and build pass
□ /validate-fsd — if structure was modified
□ /verify-idempotency — if financial logic touched
```

## Update Plan Verification

After running verification, update the plan file:
1. Mark completed items: `- [ ]` → `- [x]`
2. If verification failed, add note: `- [ ] item — ❌ failed: reason`

Example:
```markdown
## Verification

- [x] `npm run lint` — без ошибок
- [x] `npm run build` — успешный билд
- [ ] Manual test — не выполнен (требует GPU)
```

## Move Plan to Released

If plan was from `.claude/local/backlog/`:
1. Update plan status: `**Статус:** ✅ Реализовано`
2. Move file: `mv .claude/local/backlog/{plan}.md .claude/local/released/`

Report to user: "Имплементация завершена. План перенесён в released/. Проверь изменения."

## DO NOT

- Start without confirming plan with user
- Skip TodoWrite progress tracking
- Commit without user approval
- Ignore failing checks — fix before continuing
- Deviate from plan without user consent

$ARGUMENTS