# AGENTS.md — rules for coding agents (Codex) in this repo

You are working on **AI Visibility Dashboard**, a portfolio POC that mocks an
Answer Engine Optimization product. **`SPEC.md` is the source of truth.**
Read it before every session. If this file and SPEC.md disagree, stop and ask.

The owner (Jacobo) has to explain every line of this code in a Senior Frontend
interview. Optimize for **clarity and explainability**, not cleverness or
completeness.

---

## 1. Working rules (non-negotiable)

1. **One scope per session.** Only do what the kickoff prompt names (one
   milestone, or one session from SPEC §0). Don't start the next one, even if
   you finish early. SPEC §0 overrides the milestone list while it exists.
2. **Stop when the acceptance criteria pass.** No bonus features, no
   "while I was here" refactors. List ideas under *Follow-ups* in your report
   instead.
3. **Ask before adding any dependency** that isn't in the pre-approved list
   (§3). Ask before upgrading major versions or changing config outside the
   milestone's scope.
4. **Never edit `SPEC.md` or `AGENTS.md`.** If you think something in them is
   wrong, say so in your report.
5. **Don't guess APIs.** Next.js 16, next-intl, Tailwind v4 and TanStack Query
   v5 have changed recently. When unsure, read the installed package's types
   or docs in `node_modules` before writing code. Don't use patterns from
   Next 13/14 (`getServerSideProps`, `next lint`, `middleware.ts`,
   `unstable_cache` with Cache Components on, `revalidateTag(tag)` without a
   profile).
6. **Small, reviewable diffs.** Prefer several focused files over one
   generated mega-file. No dead code, no commented-out code, no TODOs without
   a matching Follow-up in the report.
7. **Don't leave long-running processes** (dev server, watchers) running when
   you finish.
8. **If blocked for more than ~3 attempts on the same error, stop** and report
   what you tried. Don't paper over it with `any`, `@ts-ignore` or
   `eslint-disable`.

---

## 2. Stack (pinned to the major version)

| Area | Package |
|---|---|
| Framework | `next@16`, `react@19`, `react-dom@19`, `cacheComponents: true` |
| Language | `typescript@5` (strict + `noUncheckedIndexedAccess`) |
| Styling | `tailwindcss@4`, `@tailwindcss/postcss` |
| Server state | `@tanstack/react-query@5`, `@tanstack/react-query-devtools@5` |
| i18n | `next-intl` (latest compatible with Next 16) |
| Validation | `zod` |
| Tests | `vitest` |
| Lint/format | `eslint@9` (flat config), `eslint-config-next`, `typescript-eslint`, `prettier`, `prettier-plugin-tailwindcss` |
| Package manager | **pnpm** only. Never commit `package-lock.json` or `yarn.lock`. |

---

## 3. Pre-approved dependencies by milestone

Anything not listed here needs explicit approval first.

| Milestone | Allowed |
|---|---|
| M1 | everything in §2 except react-query, next-intl, zod; `server-only`, `clsx`, `tailwind-merge` |
| M2 | `zod` |
| M3 | `next-intl` |
| M4 | (none new) |
| M5 | `@tanstack/react-query`, `@tanstack/react-query-devtools` |
| M6 | (none new) |
| M7 | `gsap`, `@gsap/react` |
| M8 | `@next/bundle-analyzer` |
| M9 | `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three` |

---

## 4. Commands

```bash
pnpm dev            # local dev
pnpm build          # production build; read the route table it prints
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint .   (next lint no longer exists in Next 16)
pnpm format         # prettier --write .
pnpm test           # vitest run
pnpm check:tokens   # fails on hard-coded hex / arbitrary px in src/features + src/shared
pnpm verify         # typecheck && lint && test && check:tokens && build
```

**`pnpm verify` must pass before you report a milestone as done.**

---

## 5. Code conventions

### Architecture
- Folder layout is in SPEC §5. Feature code lives in `src/features/<name>/`.
- A feature may import from `src/shared/*` and `src/server/*`, **never from
  another feature**. Cross-feature composition happens in `src/app/`.
- Files in `src/server/` and `src/features/*/server/` start with
  `import 'server-only';`.
- Cache tag strings come **only** from `src/shared/config/cache-tags.ts`.
  Never write a tag as a string literal anywhere else.
- Query keys come only from each feature's `queries/keys.ts` factory.

### React / Next
- Server Components by default. `'use client'` only on **interactive
  leaves**, never on layouts or pages. Push the boundary as far down the tree
  as possible and pass server-rendered children through.
- No `useEffect` for data fetching. Server data goes through Server Components
  or React Query.
- Data functions that are cacheable use `'use cache'` + `cacheLife(...)` +
  `cacheTag(...)`. Runtime APIs (`cookies`, `headers`, `searchParams`) are
  never read inside a `'use cache'` scope; pass values in as arguments.
- Dynamic regions are wrapped in `<Suspense>` with a skeleton that matches
  the final layout (no CLS).
- Route Handlers validate input with zod and return typed JSON.

### TypeScript
- No `any`, no non-null `!` assertions, no `as` casts except `as const` and
  narrowing after a runtime check.
- Export types from the feature's `types.ts`. Prefer `type` unions over
  `enum`.
- Named exports only (except where Next requires `default`: pages, layouts,
  route segment files).

### Styling
- Tailwind classes using **tokens only**: no raw hex, no arbitrary values
  like `p-[13px]` or `text-[#fff]` in `src/features` or `src/shared`.
  If a value is missing, add a token in `src/styles/globals.css` and mention it
  in the report.
- Use `cn()` from `src/shared/lib/cn.ts` to merge classes.
- Every animation respects `prefers-reduced-motion` (Tailwind `motion-safe:`
  / `motion-reduce:` or a CSS media query).

### i18n (from M3 on)
- No user-facing string literals in components. All copy goes in
  `src/messages/{en,es}.json`. Both files must have identical keys.
- Numbers and dates are formatted only through `src/shared/lib/format.ts`
  (native `Intl`).

### Accessibility
- Interactive elements are real `<button>` / `<a>` elements, reachable by
  keyboard, with a visible focus ring from the token set.
- Icons-only buttons have `aria-label`. Expand/collapse uses `aria-expanded`
  + `aria-controls`.

### Naming
- Components `PascalCase.tsx`, everything else `kebab-case.ts`.
- Hooks `use-*.ts`, Server Actions in `actions/*.ts` with `'use server'`.

---

## 6. Tests

- Vitest for **pure logic only**: generator, filters/pagination, formatters,
  query-key factory, webhook validation.
- Tests sit next to the code: `thing.test.ts`.
- Don't write snapshot tests of components.

---

## 7. Git

- Branch per milestone: `m1-scaffold`, `m2-data`, and so on.
- Conventional commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`).
  Several small commits are better than one huge one.
- Never commit `.env*` files except `.env.example`.

---

## 8. End-of-session report (required format)

When you stop, reply with exactly these sections:

```
## Milestone
M<n> — <name>: DONE | BLOCKED

## Acceptance criteria
- [x] <criterion from SPEC> — evidence: <command output / file / how verified>
- [ ] <criterion> — why not

## What changed
<files grouped by feature, one line each on why>

## Decisions & trade-offs
<each non-obvious choice: what you picked, the alternative, why>

## New dependencies
<name@version — reason>  (or "none")

## Follow-ups
<things you noticed but deliberately did not do>

## Questions for the owner
<anything ambiguous>
```

The *Decisions & trade-offs* section matters most: it becomes interview
material.