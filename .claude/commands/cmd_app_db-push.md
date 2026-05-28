# Apply Database Migrations

Push database schema changes to Supabase.

## MCP

- **Supabase** — list_migrations, execute_sql, get_logs, get_advisors

## Before Pushing

```
□ Verify correct environment (check NEXT_PUBLIC_SUPABASE_URL)
□ Review migration SQL
□ Test in development first
□ If financial tables (credit_*) — EXTRA CAUTION
```

## Command

```bash
npx supabase db push
```

## If Migration Fails

Check for:
- Schema conflicts (duplicate columns, tables)
- RLS policy syntax errors
- Foreign key constraint violations

Use **Supabase MCP** `get_logs` to see detailed errors.

## After Success

```
□ Verify RLS: SELECT * FROM pg_policies
□ Test affected API endpoints
□ Check Supabase logs for errors
□ Run /verify-idempotency if financial tables touched
```

## DO NOT

- Push to production without testing in dev first
- Modify financial tables without reviewing idempotency
- Skip RLS policy verification
- Ignore migration errors — fix before continuing