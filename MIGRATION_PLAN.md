# Migration Plan: split-the-bob (Rust) → Noxt (Bun)

## TL;DR

Replace Rust backend with Bun/TypeScript. Build pages in `.ts` files with `htm` templates. Use Noxt's `ServerComponent` island (HTML-over-wire, no JSON APIs). Query parameters (`?id=`) instead of slugs. Phase 1 = data models + pages + server handlers; Phase 2 = balance algorithm.

## Steps

### Phase 1: Foundation

1. **Data Layer** — Adapt SQLite schema, create TypeScript types (Expense, Split, Balance), write DB functions
2. **Page Scaffolding** — `/src/pages/index.ts` (home), `/src/pages/split.ts` (detail `?id=`), `/src/pages/add-expense.ts`; use `htm`
3. **UI Components with ServerComponent** — `ExpenseForm.ts`, `SplitList.ts` (`.ts` not `.tsx`); wrap forms in `ServerComponent` island
4. **Server Action Handlers** — POST handlers in `/lib/server.ts` → FormData → DB ops → return HTML (not JSON)

### Phase 2: Core Logic

5. **Balance Algorithm** — Port Rust to `/lib/balance.ts` (debtor/creditor matching)
6. **Split Strategies** — Evenly/Amounts support
7. **Test Data** — Seed script

### Key Changes

- Components: `.ts` + `htm` (no `.tsx`)
- Interactivity: `ServerComponent` → form → server action → HTML → innerHTML
- Routing: Filesystem + query params

## Decisions

- Full Bun migration
- Bun's native sql API for SQLite
- `.ts` files with `htm` templates
- `ServerComponent` for form interactions
- Query params for routing (`?id=<splitId>`)

## Reference Files

- Old: https://github.com/Billuc/split-the-bob
- New: `/src/pages/`, `/src/components/Counter.ts`, `/lib/server.ts`
