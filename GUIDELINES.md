# Project Guidelines

## Role
You are an expert full-stack developer specializing in frontend architecture and React ecosystem best practices. Follow all project-specific rules and architectural guidelines defined in `AGENTS.md`.

## Tech Stack
- **Frontend Framework:** React 19.x with TypeScript 5.8
- **Styling:** Tailwind CSS 4.x (atomic utility-first CSS)
- **Routing:** React Router 7.x
- **Local Database:** Dexie 4.x (IndexedDB abstraction)
- **State Management:** React Context API + useReducer (no external libraries)
- **Build Tool:** Vite 6.x
- **Backend:** Node.js + Express (for metadata or API endpoints if needed)
- **Icons:** Lucide React
- **Animation:** Motion (Framer Motion alternative)
- **Markdown Support:** react-markdown + remark-gfm
- **Development Language:** TypeScript, no JavaScript

## Project Structure
Follow the strict directory structure defined in `AGENTS.md` Section 2 (Workspace & Project Directory Structure) and Section 5 (Project-Specific Architecture). Key paths:
- `src/pages/` – Page-level orchestrators (Dashboard, Assets, Transactions, Reports, etc.)
- `src/components/` – Reusable UI components (with subdirectories for `calculators/` and `reports/`)
- `src/context/` – React Context providers (DatabaseContext, DataTableContext, SRVGlobalDialogContext)
- `src/db/` – Dexie database schema and operations layer
- `src/reports/` – Business logic for report generation (pure, testable functions)
- `src/lib/` – Utility functions (CNPJ parsing, math calculators, general helpers)
- `src/utils/` – Pure functional utilities and type helpers

## Naming Conventions
- **Variables & Functions:** camelCase (e.g., `handleSubmit`, `isFetching`, `calculateTax`)
- **Components & Types:** PascalCase (e.g., `AssetForm`, `TransactionTable`, `DatabaseContextType`)
- **Custom Hooks:** Prefix with 'use' (e.g., `useDatabase`, `useDataTable`, `useSRVGlobalDialog`)
- **Files:** Match component/export names (e.g., `AssetForm.tsx`, `database.types.ts`, `operations.ts`)
- **Context Files:** Suffix with `.types.ts` for type definitions (e.g., `DatabaseContext.types.ts`)

## Component Development Rules
- **Functional Components Only:** No class components. Prefer React 19 features (hooks, Server Components if applicable).
- **Semantic HTML:** Use proper HTML elements (`<button>`, `<input>`, `<table>`, `<nav>`, etc.) – never compose custom elements from `<div>`.
- **Accessibility (WCAG 2.1 AA):** All interactive components must support keyboard navigation, have proper ARIA labels, and announce state changes.
- **No window.alert/confirm:** Replace all browser dialogs with custom modal/dialog components (use `SRVGlobalDialogContext`).
- **Props as Pure Data:** Components accept only primitive types, object interfaces, or callback functions – never Redux or Context consume directly inside presentational components (pass data via props).
- **Prop Composition:** Use spread operators carefully. Document all expected props with explicit TypeScript interfaces.

## State Management
- **Local Component State:** Use `useState` for UI state (form inputs, visibility, etc.).
- **Complex State:** Use `useReducer` within hooks or Context for multi-step state transitions.
- **Global State:** Expose via `DatabaseContext`, `DataTableContext`, or `SRVGlobalDialogContext`. Never create ad-hoc contexts.
- **Side Effects:** Manage via `useEffect` with explicit dependency arrays. Avoid infinite loops.
- **Immutability:** All state transitions must produce new objects/arrays—never mutate directly.

## Database & Data Flow
- **Dexie First:** Use `AppDatabase` instance for all local persistence. Query via `src/db/operations.ts` functions.
- **Context Refresh:** The `DatabaseContext` automatically re-fetches and refreshes state when mutations occur. Never manually manipulate context state.
- **Type Safety:** Always define full TypeScript types for database records (see `src/db/database.types.ts`).
- **Async Handling:** Use `async/await` in operation layers. Wrap with `try/catch` for error handling in pages.

## Styling & Layout
- **Tailwind Utilities:** Compose styles using Tailwind's utility classes (e.g., `flex`, `gap-4`, `text-lg`, `hover:bg-blue-500`).
- **Class Composition:** Use the `cn()` helper from `src/lib/utils` (powered by clsx) to conditionally merge Tailwind classes.
- **Responsive Design:** Leverage Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, etc.). Test on multiple breakpoints.
- **Dark Mode:** If applicable, use Tailwind's dark mode utilities.
- **No Inline Styles:** Avoid inline style objects—use Tailwind only.
- **Component Wrappers:** For frequently used style combinations, create wrapper components (e.g., `<Card>`, `<Button>`).

## Testing
- **Jest Only:** Write unit tests for isolated business logic, hooks, and state reducers.
- **No E2E Tests:** Focus on high-value Jest unit tests only (no Cypress, Playwright, etc.).
- **Mocking:** Mock Dexie calls, context providers, and external APIs. Test logic output, not side effects.
- **Test Placement:** Co-locate tests with their source files (e.g., `calculatorMath.test.ts` alongside `calculatorMath.ts`).

## Code Quality & Linting
- **TypeScript Strict Mode:** Enable `strict: true` in `tsconfig.json`. Resolve all type errors—no `any` types.
- **Imports:** Use absolute paths with `@/src/` scheme (configured in Vite). Avoid relative `../` paths.
- **Dead Code:** Remove unused imports, variables, and functions before committing.
- **Formatting:** Format code consistently (Prettier recommended). Use ESLint if available.
- **No Console Logs:** Remove debug `console.log()` calls from production code. Use proper error handling.
- **Documentation is Part of Done:** Every code change (new, modified, or deleted functionality, UI refactors, flow changes) **requires** corresponding documentation updates in `src/data/manualContent.ts`. See AGENTS.md Section 5 for detailed documentation requirements and Section 7 for the documentation sync protocol.

## Development Workflow
- **Start Dev Server:** `npm run dev` (runs Vite on port 3000)
- **Build:** `npm run build` (outputs to `dist/`)
- **Type Check:** `npm run lint` (runs TypeScript compiler check)
- **Preview:** `npm run preview` (preview built dist locally)
- **Clean:** `npm run clean` (remove dist/)
- **Documentation Updates:** Whenever you create, modify, or delete features; refactor UI/flows; or change business logic, **update `src/data/manualContent.ts`** with corresponding changes. Documentation updates must be committed together with code changes. Use the documentation sync checklist in AGENTS.md Section 7. Changes are automatically reflected in the Manual route (`/Manual`).

## Common Patterns & Best Practices
- **Form Handling:** Use `useState` for form data, validate on submit, display errors via `SRVGlobalDialogContext`.
- **Loading States:** Track `isLoading`, `isError`, and `error` explicitly—never infer from falsy data.
- **Empty States:** Always render meaningful empty state messages (not blank screens).
- **Error Boundaries:** Consider React Error Boundaries for catastrophic failures. Prefer try/catch in async code.
- **Performance:** Use `useMemo` and `useCallback` judiciously (measure first, don't optimize prematurely).
- **Dates:** Use native `Date` objects or a small library (avoid moment.js if possible). Format consistently for reporting.

## File Organization & Imports
```
src/
├── pages/Dashboard.tsx         – Route page, orchestrates state & child components
├── components/DashboardTable.tsx – Presentational, consumes props only
├── context/DatabaseContext.tsx  – Provider, manages global data
├── db/operations.ts            – Queries, typed
├── reports/taxReport.ts        – Business logic, pure function
├── lib/utils.ts               – Utility helpers
└── utils/calculatorMath.ts    – Pure math functions
```

**Import Order:** Separate imports into groups:
1. External libraries (React, third-party)
2. Internal contexts/hooks
3. Internal components
4. Internal utilities/types
5. Relative files (if any)
