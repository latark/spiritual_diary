# Check Types and Build

Run TypeScript type checking and verify production build succeeds.

## Commands

```bash
npx tsc --noEmit    # TypeScript type check (standalone)
npm run build       # Production build (includes type check)
npm run lint        # Biome linting
```

## On Success

Report: "✅ Types and build pass"

## On Errors

For each error:
```
□ File path and line number
□ Error message
□ Suggested fix
```

Use **Serena** to navigate to symbols if fix is non-trivial.

## Common Fixes

- `Type 'X' is not assignable to 'Y'` → Check prop types, add type assertion if needed
- `Cannot find module` → Check import path, run `npm install`
- `Property does not exist` → Add to interface or use optional chaining
- `Unused variable` → Remove or prefix with `_`

## DO NOT

- Commit with failing checks
- Suppress errors with `@ts-ignore` without good reason
- Skip build check (type check alone is not enough)