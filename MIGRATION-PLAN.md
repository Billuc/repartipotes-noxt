# Migration plan

## Context

I want to rewrite a project of mine to use my framework called Noxt. The original project is located here: https://github.com/Billuc/split-the-bob and is written in Rust. You can find information about Noxt here: https://github.com/Billuc/noxt.

The original app uses server-side rendering (Axum + Askama templates) with HTMZ for HTML-over-the-wire partial updates. Noxt is a build-time prerendering framework with an islands architecture. The key shift is from SSR to prerendered pages + client-hydrated islands + a JSON API layer.

## Phase 1: Project Setup (already done)

Project exists with Noxt template, HTM, and routes-based Bun.serve. No changes needed.

## Phase 2: Database Layer — lib/db.ts

- Use bun:sqlite (built into Bun, no extra dependency)
- Create DB file from DATABASE_URL env var
- Run CREATE TABLE on first connection (port both migrations exactly)
- Export functions: getSplit, createSplit, updateSplit, getExpenses, createExpense, updateExpense, deleteExpense, getAllCurrencies
- Settlements and balances computed in-memory (not stored)

## Phase 3: Core Logic (line-by-line Rust → TS port)

| File | Rust Source | What it does
| lib/keys.ts | src/keys/keys.rs + CSVs | Generates adj-noun-adj-noun keys from French word lists (512 nouns, 512 adjectives with gender \| agreement) |
| lib/balances.ts | src/balances/balance.rs | Greedy debt-settling algorithm — port with same variable names, same 12 test cases |
| lib/currencies.ts | src/currencies/currency.rs + CSV | Loads 153 currencies from embedded CSV, exchange rate via ExchangeRate-API |
| lib/expenses.ts | src/expenses/expense_service.rs | Split method logic: Evenly (equal split) / Amounts (custom per-participant), currency conversion |

## Phase 4: API Handlers — api/

api/
├── index.ts # Router: dispatches based on method + path
├── splits.ts # POST /api/splits, GET/PUT /api/splits/:id
├── expenses.ts # POST /api/expenses, PUT/DELETE /api/expenses/:id
└── currencies.ts # GET /api/currencies

All return JSON. Handlers import from lib/ for business logic and lib/db.ts for persistence.

The apiHandler function (exported from api/index.ts) inspects request.method and URL, dispatches to the right handler, and catches errors into JSON responses.

## Phase 5: Noxt Pages (HTM, no JSX)

| File | Route | Content |
| pages/index.ts | / | Homepage: app description + CreateSplit island + JoinSplit island + RecentSplits island |
| pages/split.ts | /split | Shell page: reads ?split_id from URL via island, renders SplitView island |

Pages use prepareIsland() and render with html tagged templates (same pattern as template's existing pages/index.ts).

## Phase 6: Islands

Replace template demo islands with app-specific ones:

| Island | Purpose | Replaces these original JS files |
| islands/CreateSplit.ts | Form: description, participants, currency | new-split.js, htmz.js |
| islands/JoinSplit.ts | Input split code → loads split | split-storage.js |
| islands/SplitView.ts | Full split: expenses table, participants, balances (colored ±), settlements, share button | split-link.js, split-storage.js, htmz.js |
| islands/ExpenseForm.ts | Add/edit expense popover: amount, currency, payer, pay-for, date, split method toggle | expense-date.js, expense-split-method.js, htmz.js |
| islands/CurrencySelect.ts | Custom <currency-select> that fetches /api/currencies and renders flag+name dropdown | currency-select.js |

All islands:

- Use defineIsland(Component, import.meta.path) + useFetch from noxt/runtime
- State management via useState/useEffect from preact/hooks
- No HTMZ — interactions are API calls → state update → re-render

## Phase 7: Entry Point — index.ts

```ts
import { prepareRoutes } from "noxt" with { type: "macro" };
import { apiHandler } from "./api";

const PORT = process.env.PORT ?? "2101";
const noxtRoutes = (await import(prepareRoutes())).default;

Bun.serve({
  port: PORT,
  routes: {
    ...noxtRoutes,
    "/api/*": apiHandler,
  },
  development: process.env.MODE === "development",
});
```

Noxt prerendered pages served by Bun's built-in routes handler. API requests dispatched to apiHandler via wildcard route.

## Phase 8: Static Assets

- Port original static/css/style.css → replace assets/styles.css (keep original's theme: --primary: #fca311, --secondary: #14213d, popover styles, etc.)
- Copy favicons from original → assets/
- Remove template assets (prism.css, prism.js)
- No separate JS files needed — all interactivity lives in islands

## Phase 9: Cleanup

- Remove template demo files:
  - islands/Counter.ts, islands/Hello.ts
  - components/Button.ts, components/FeatureCard.ts, components/DemoSection.ts
- Add .env.example with DATABASE_URL, EXCHANGE_RATE_API_KEY
- Create data/currencies.csv (from original)
- Update .gitignore for \*.data (SQLite)
- Add lib/ and api/ directories

## Plan Summary — 9 phases, ~20 files to create/modify:

| Phase | What | Key files |
| 1 | Setup | Already done |
| 2 | DB layer | lib/db.ts |
| 3 | Core logic port | lib/keys.ts, lib/balances.ts, lib/currencies.ts, lib/expenses.ts |
| 4 | API handlers | api/index.ts, api/splits.ts, api/expenses.ts, api/currencies.ts |
| 5 | Noxt pages | pages/index.ts (rewrite), pages/split.ts (new) |
| 6 | Islands | CreateSplit.ts, JoinSplit.ts, SplitView.ts, ExpenseForm.ts, CurrencySelect.ts |
| 7 | Entry point | index.ts — merge noxtRoutes + /api/\* handler |
| 8 | Static assets Port | style.css → assets/styles.css, copy favicons |
| 9 | Cleanup | Remove demo files, add .env.example, data/ dir, currencies.csv |

Live template inheritance from original (like base.html with header/footer) becomes a shared component (e.g. components/Layout.ts) used by each page. The original's HTMZ-driven partial HTML swaps become island state updates via useFetch.
