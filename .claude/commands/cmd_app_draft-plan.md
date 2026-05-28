# Draft Plan - Design Implementation

Create detailed, executable implementation plan.

## Before Planning

1. Explore affected code areas
2. Check existing patterns — don't reinvent
3. Validate FSD placement — where does new code belong?

## MCP for Planning

- **Serena** — find_symbol, get_symbols_overview to understand current code
- **Supabase** — check schema, RLS policies if DB involved via mcp
- **Upstash** — check Redis keys, rate limits if caching involved via mcp
- **Shadcn** — check available components before planning UI
- **Context7** — fetch docs for unfamiliar library APIs
- **Sequential Thinking** — complex architectural decisions

> If needed MCP is not available, check `.mcp.json` — suggest user to enable it.

## Skills for Planning

- API routes, validation → `api-endpoints/`
- DB schema, RLS → `database/`
- Payments, credits → `payment-flow/`
- Streaming, latency → `audio-video-sync/`
- New UI component → `shadcn-components/`
- Architecture questions → `architecture/`
- Code style, patterns → `code-conventions/`

## Plan Template

Save to `.claude/local/backlog/{task-name}/{plan-name}.md`:

```markdown
## Task
What + Why (1-2 sentences)

## Affected Files
- `path/file.ts` — what changes and why

## New Files (if any)
- `path/new-file.ts` — purpose, which FSD layer

## Steps
1. [Create/Modify] `file.ts`: add X because Y
2. [Create/Modify] `file.ts`: update Z to handle W
...

## Verification
- [ ] Types pass (`npm run typecheck`)
- [ ] Build works (`npm run build`)
- [ ] Manual test: describe how to verify

## Risks
- Risk 1 → Mitigation
```

## Quality Checklist

Before saving, verify:

```
□ Each step is atomic (one logical change)
□ Steps are in correct order (dependencies respected)
□ File paths are exact (not "somewhere in features/")
□ New files follow FSD layer rules
□ No over-engineering (minimal changes for the task)
```

## After Saving

Report path to user and ask: "Продолжить с `/implement`?"

## DO NOT

- Plan without exploring existing code first
- Use vague file paths ("somewhere in features/")
- Over-engineer — plan minimal changes for the task
- Skip FSD layer validation for new files
- Forget to check skills for domain-specific tasks

$ARGUMENTS