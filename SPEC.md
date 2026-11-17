# SPEC — AI Visibility Dashboard (portfolio POC)

> A mock of an Answer Engine Optimization (AEO) product: how a brand appears in
> AI-generated answers (ChatGPT, Perplexity, Gemini, Claude, Google AI Overviews).
> Fake typed data, no real APIs. Built to be demoed and defended in a Senior
> Frontend interview.

**Budget:** 8 milestones, roughly 7–9 working days, plus 1 optional.
**Principle:** boring, explainable choices. Every decision below has a trade-off
you can say out loud.

---

## 1. Product scope

One fictional brand, **"Northwind Coffee"**, tracked across 5 AI engines and
~120 prompts ("best coffee subscription in Argentina", "café de especialidad
online", and so on).

| Page | Route | What it shows |
|---|---|---|
| Landing | `/[locale]` | Marketing hero (GSAP), 3 value props, CTA → dashboard |
| Overview | `/[locale]/dashboard` | KPI cards (Visibility Score, Share of Voice, Avg. Position, Sentiment), 30-day trend chart, per-engine breakdown |
| Prompts | `/[locale]/dashboard/prompts` | Table of tracked prompts: filters (engine, topic, mentioned yes/no), pagination, "Run scan" with live status (polling), ★ track/untrack (optimistic) |
| Prompt detail | `/[locale]/dashboard/prompts/[promptId]` | Per-engine answer cards: mentioned?, position, sentiment, citations, expandable answer excerpt |

**Out of scope (say it in the interview):** auth, multi-tenancy, a real
database, real LLM calls, charts with tooltips or zoom.

---

## 2. Stack

| Concern | Choice | Trade-off you can state |
|---|---|---|
| Framework | **Next.js 16.x**, App Router, **Cache Components on** (`cacheComponents: true`) | This is the current default for new apps, so it's what a 2026 codebase looks like. Cost: the docs and Stack Overflow answers are still mostly about the older `revalidate` / `fetch` caching model, so I have to explain the mapping (§3). |
| Language | TypeScript `strict` + `noUncheckedIndexedAccess` | Catches undefined-index bugs in the mock data. Cost: more `?.` and guards. |
| Styling | **Tailwind v4**, tokens in `@theme` (CSS-first) | Tokens are CSS variables, so they're themeable at runtime with no JS. Cost: no `tailwind.config.ts` autocomplete for teammates used to v3. |
| Server state | **TanStack Query v5** | Gives cache, polling, optimistic updates and dedupe out of the box. Cost: a second cache next to Next's, so I need a clear rule for which one owns what (§4). |
| i18n | **next-intl**, `/en` + `/es`, native `Intl` for numbers and dates | Standard for the App Router, and it supports static rendering. Cost: every layout and page must call `setRequestLocale` to stay static. |
| Charts | **Hand-written SVG in a Server Component** | Ships zero JS and is pixel-controllable. Cost: no tooltips or interactivity. A chart library would add about 40–90 KB. |
| Animation | CSS first; **GSAP** only in the hero (lazy client leaf) | CSS covers 90% at zero JS cost. GSAP is justified only for a timeline sequence. |
| Tests | **Vitest** (pure functions only) + manual checklist | Fast and cheap. Cost: no E2E. Playwright is the next step if there's time. |
| Tooling | pnpm, ESLint (flat config, `next/core-web-vitals` + `typescript-eslint` strict), Prettier + `prettier-plugin-tailwindcss` | Boring and standard. |
| Deploy | **Vercel** | Native support for ISR, tag invalidation and the edge CDN. Cost: vendor coupling. Self-hosting needs a shared cache handler (e.g. Redis). |
| 3D (optional) | React Three Fiber, lazy-loaded below the fold | Pure "wow" factor. Budget it as last. |

---

## 3. Rendering strategy per page

### How the classic terms map to Cache Components

Interviewers will use the old vocabulary. Map it explicitly:

| Classic term | In this codebase (Next 16, Cache Components) |
|---|---|
| **SSG** | Route has no uncached or runtime data, so it's fully prerendered at build. Locales come from `generateStaticParams`. |
| **ISR** (time-based) | Data function with `'use cache'` + `cacheLife('hours')`. Served stale, regenerated in the background. |
| **On-demand revalidation** | Data function with `cacheTag('metrics:northwind')`. A webhook calls `revalidateTag(tag, 'max')`. |
| **"Tagged fetch"** | `cacheTag()` on a cached function is the equivalent of `fetch(url, { next: { tags } })`. We don't `fetch` our own API from Server Components, because that's an extra network hop to ourselves (anti-pattern). |
| **SSR** | Uncached, request-time data (`searchParams`, `cookies`) rendered inside `<Suspense>`. The static shell streams first (Partial Prerendering). |
| Read-your-own-write | Server Action calls `updateTag(tag)`, so the user who made the change sees fresh data in the same request. |

### Per page

| Page | Strategy | Why | Trade-off |
|---|---|---|---|
| Landing `/[locale]` | **SSG** | Content changes only on deploy. Served straight from the CDN, best TTFB and LCP. | Copy changes need a redeploy (fine for marketing). |
| Overview `/[locale]/dashboard` | **Static shell + ISR data** (`cacheLife('hours')`, tag `metrics:northwind`) + **on-demand** via webhook | Metrics change when a scan batch finishes, not per request. The webhook is the "scan pipeline finished" signal. | Up to 1h stale if a webhook is missed. That's acceptable for analytics, and the webhook makes the normal case near-instant. |
| Prompts `/[locale]/dashboard/prompts` | **PPR**: static shell (header, filter bar skeleton) + **dynamic** table region driven by `searchParams`, **prefetched into React Query on the server** and hydrated on the client | Filters live in the URL, so it's shareable, SSR'd, and back/forward work. The client then owns pagination, polling and mutations. | Two caches (Next + React Query). Rule: Next owns the first paint, React Query owns everything after hydration. |
| Prompt detail `/[locale]/dashboard/prompts/[promptId]` | **SSG for the top 20 prompts** (`generateStaticParams`), the rest rendered on first request then cached (ISR), tag `prompt:{id}` | Popular pages are instant from the start. The long tail doesn't bloat build time. | The first visitor to a long-tail prompt pays the render cost. |
| `POST /api/revalidate` | Route Handler, **secret in header** (`x-revalidate-secret`), timing-safe compare, Zod-validated body `{ tags: string[] }`, allow-listed tag prefixes | Simulates the scan pipeline webhook. | Shared secret instead of HMAC signature: simpler, but no replay protection. Name HMAC + timestamp as the production upgrade. |
| `GET /api/prompts`, `GET /api/scans/[id]` | Route Handlers, `Cache-Control: private, no-store` | React Query's client-side reads. Tenant data must never land in a shared CDN cache. | No CDN help for these, so we rely on React Query's client cache. |

### Caching & CDN strategy (README section)

1. **Edge CDN** caches only public, tenant-agnostic output: landing pages,
   `/_next/static/*` (immutable, content-hashed), images via `next/image`.
2. **Next data cache** (`'use cache'`) caches per-brand data on the server,
   keyed by arguments. That includes the brand id, so on a real multi-tenant
   product there's no cross-tenant leak.
3. **React Query** caches in the browser: `staleTime: 30s` for lists,
   `refetchInterval` only while a scan is running.
4. **Invalidation flow:** scan finishes → webhook → `revalidateTag('metrics:northwind', 'max')`
   → next request gets stale content, regeneration starts in the background,
   and Vercel propagates the update globally.
5. The global-scale talking point: static and ISR output is replicated across
   Vercel's edge regions, while dynamic work runs in a function region close
   to the data source. (State which region you'd pick and why: close to the
   DB, not close to the user.)

---

## 4. Data model (`src/features/*/types.ts`)

```ts
export type EngineId = 'chatgpt' | 'perplexity' | 'gemini' | 'claude' | 'ai-overviews';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type Topic = 'subscription' | 'specialty' | 'price' | 'delivery' | 'brand';

export interface Brand { id: string; name: string; domain: string; competitors: string[] }

export interface Prompt {
  id: string;                 // 'p_001'
  text: Record<Locale, string>;
  topic: Topic;
  tracked: boolean;           // ★ optimistic toggle
  createdAt: string;          // ISO
}

export interface Citation { url: string; domain: string; isOwnDomain: boolean }

export interface Answer {
  promptId: string;
  engine: EngineId;
  mentioned: boolean;
  position: number | null;    // rank among brands mentioned, null if absent
  sentiment: Sentiment | null;
  excerpt: string;            // ~600 chars, collapsible
  citations: Citation[];
  capturedAt: string;
}

export interface DailyMetric {
  date: string;               // YYYY-MM-DD
  engine: EngineId;
  visibilityScore: number;    // 0–100
  shareOfVoice: number;       // 0–1
  avgPosition: number | null;
}

export type ScanStatus = 'queued' | 'running' | 'done' | 'failed';
export interface Scan { id: string; status: ScanStatus; progress: number; startedAt: string }

export interface Paginated<T> { items: T[]; page: number; pageSize: number; total: number }
export interface PromptFilters { engine?: EngineId; topic?: Topic; mentioned?: boolean; page: number }
```

**Mock source:** a deterministic seeded generator (a small `mulberry32`, no
dependency) builds all data from a fixed seed, so screenshots and tests are
stable. `src/server/db.ts` holds an in-memory store (for `tracked` and scans)
with simulated latency (150–400 ms).

**Interview caveat to volunteer:** on Vercel, in-memory state isn't shared
between function instances or cold starts, so a toggle can "revert" after a
cold start. That's acceptable for a mock. In production it's a database.

---

## 5. Folder structure (feature-based)

```
src/
  app/
    [locale]/
      layout.tsx                 # html lang, fonts, NextIntlClientProvider, setRequestLocale
      page.tsx                   # landing (SSG)
      dashboard/
        layout.tsx               # sidebar + topbar (static)
        page.tsx                 # overview
        loading.tsx
        prompts/
          page.tsx               # prefetch + HydrationBoundary
          [promptId]/page.tsx
    api/
      revalidate/route.ts
      prompts/route.ts
      scans/[id]/route.ts
  features/
    visibility/                  # overview: KPIs, trend chart, engine breakdown
      components/  server/  types.ts
    prompts/                     # table, filters, pagination, track toggle, scan
      components/  server/  queries/  actions/  types.ts
    answers/                     # detail page cards, accordion
      components/  server/  types.ts
    marketing/                   # hero (GSAP), value props, optional R3F
      components/
  shared/
    ui/                          # Button, Card, Badge, Skeleton, Table primitives
    lib/                         # query-client.ts, format.ts (Intl), seed.ts, cn.ts
    config/cache-tags.ts         # single source of truth for tag strings
  server/
    db.ts                        # in-memory store + latency
  i18n/
    routing.ts  request.ts  navigation.ts
  messages/
    en.json  es.json
  styles/
    globals.css                  # @theme tokens
proxy.ts                         # next-intl locale routing (Next 16 name for middleware)
```

**Rules:**
- `features/*` never imports from another feature's internals, only from
  `shared/`. Cross-feature composition happens in `app/`.
- `server/` and `features/*/server/` start with `import 'server-only'`.
- `'use client'` only on leaves: `FiltersBar`, `PromptsTable`, `TrackToggle`,
  `ScanButton`, `LocaleSwitcher`, `Hero`, `AnswerAccordion` (only if CSS
  alone can't do it).

---

## 6. Design system & wireframe

**Tokens** (`@theme` in `globals.css`): color (surface/0–3, text/primary/muted,
accent, success/warning/danger, plus one color per engine), spacing on a 4 px
scale, radius (sm/md/lg), typography (2 families, 6 sizes, fixed line heights),
shadow (2 levels), motion (`--ease-out-quart`, durations 150/250/400 ms).

**Low-fi wireframe** (overview). The pixel-perfect target is a Figma frame
you'll make in M7. This is the structural contract.

```
┌──────────┬──────────────────────────────────────────────────────┐
│ LOGO     │  Overview                     [EN|ES]  [Last 30d ▾]  │
│          ├────────────┬────────────┬────────────┬───────────────┤
│ Overview │ Visibility │ Share of   │ Avg.       │ Sentiment     │
│ Prompts  │ 72  ▲4     │ Voice 31%  │ Position 2.4│ 68% positive │
│          ├────────────┴────────────┴────────────┴───────────────┤
│          │  Visibility over time (SVG line, 5 engine series)     │
│          │  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ │
│          ├──────────────────────────────────────────────────────┤
│          │  By engine: [ChatGPT ███████ 81] [Perplexity ████ 54]…│
└──────────┴──────────────────────────────────────────────────────┘
```

```
Prompts
[Engine ▾] [Topic ▾] [Mentioned ▾]                   [▶ Run scan  ◔ 40%]
┌──┬──────────────────────────────┬────────┬─────────┬───────┬──────┐
│★ │ Prompt                       │ Topic  │ Mention │ Pos.  │ Sent.│
├──┼──────────────────────────────┼────────┼─────────┼───────┼──────┤
│☆ │ best coffee subscription …   │ subscr │ 4/5     │ 2.1   │ ●    │
└──┴──────────────────────────────┴────────┴─────────┴───────┴──────┘
                         ‹ 1 2 3 … 12 ›
```

---

## 7. Milestones

Each milestone ends with `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
all green, plus its own acceptance criteria.

### M1 — Scaffold, tooling, tokens (0.5 day)
- Next 16 + TS strict, ESLint flat config, Prettier, Vitest, pnpm scripts.
- Tailwind v4 with the full token set. Folder skeleton from §5.
- **AC:** `pnpm build` passes. A dev-only `/tokens` page renders a token
  preview (colors, type scale, spacing). Locale routing arrives in M3, so the
  page can't live under `/en` yet; M3 moves it under `[locale]`.
  `pnpm check:tokens` finds no hard-coded hex or arbitrary px values in
  `src/features` or `src/shared`. `tsconfig` has `strict` and
  `noUncheckedIndexedAccess`.

### M2 — Data layer & mock (1 day)
- Types from §4, seeded generator, `server/db.ts`, data functions per feature
  (`getOverview`, `listPrompts`, `getPrompt`, `getAnswers`, `startScan`,
  `getScan`), `cache-tags.ts`.
- **AC:** Vitest proves the generator is deterministic (same seed, same data)
  and that `listPrompts` filters and paginates correctly, including empty
  results. All server modules import `server-only`. No `any`.

### M3 — i18n & formatting (0.5–1 day)
- next-intl routing (`/en`, `/es`, default `en`), `proxy.ts`,
  `setRequestLocale` in every layout and page, `LocaleSwitcher`,
  `shared/lib/format.ts` (`Intl.NumberFormat` for %, compact numbers;
  `Intl.DateTimeFormat`; `Intl.RelativeTimeFormat` for "2 hours ago").
- **AC:** `/` redirects to `/en`. Switching locale keeps the current path and
  query string. `/es` shows `31,4 %` and Spanish dates. `next build` output
  shows `/[locale]` as **static** (○ / ●), not dynamic. Unit tests for
  `format.ts` in both locales.

### M4 — Overview page: RSC, ISR, on-demand revalidation (1–1.5 days)
- KPI cards, SVG trend chart, engine breakdown. All Server Components, zero
  client JS in this feature.
- `getOverview` uses `'use cache'` + `cacheLife('hours')` + `cacheTag(tags.metrics(brandId))`.
- `POST /api/revalidate`: secret header, timing-safe compare, Zod body,
  tag allow-list, `revalidateTag(tag, 'max')`. Returns `{ revalidated, tags, now }`.
- Visible "Data generated at {time}" stamp to prove revalidation.
- **AC:**
  - `curl` without or with a wrong secret returns **401**. A tag outside the
    allow-list returns **400**.
  - With the correct secret, the next load shows stale content and the load
    after that shows a new timestamp. Documented in the README with `curl`
    commands.
  - The overview route ships no feature-specific client JS (check the build
    output and React DevTools).
  - `loading.tsx` skeleton matches the layout (no CLS).

### M5 — Prompts table: React Query end to end (1.5–2 days)
- Server: `queryClient.prefetchQuery` with the same key factory as the
  client → `<HydrationBoundary state={dehydrate(qc)}>`.
- Client: filters synced to the URL (`useSearchParams` + `router.replace`),
  `placeholderData: keepPreviousData` for pagination, query-key factory in
  `features/prompts/queries/keys.ts`.
- **Polling:** "Run scan" starts a scan. `useQuery(['scan', id])` with
  `refetchInterval: (q) => q.state.data?.status === 'running' ? 1500 : false`.
  When it finishes, invalidate the prompts list.
- **Optimistic ★:** `useMutation` whose `mutationFn` is a Server Action
  (`toggleTracked`) that calls `updateTag`. `onMutate` cancels queries,
  snapshots and patches the cache, `onError` rolls back + shows a toast,
  `onSettled` invalidates. The mock fails ~10% of the time on purpose so you
  can demo the rollback.
- **AC:**
  - First paint of `/en/dashboard/prompts?topic=price&page=2` shows the
    right rows **with no client fetch** (Network tab: no `/api/prompts`
    request on load).
  - Paginating keeps the old rows visible (no flash of empty table).
  - Polling stops by itself at `done`, then the table refreshes.
  - A forced failure rolls the ★ back and shows an error.
  - Keyboard: filters, pagination and ★ all reachable, with visible focus.

### M6 — Prompt detail: SSG + ISR + CSS motion (1 day)
- `generateStaticParams` returns the top 20 prompt ids × 2 locales. The rest
  render on demand. `cacheTag(tags.prompt(id))`.
- Answer cards per engine, with expand/collapse using
  `grid-template-rows: 0fr → 1fr` + `transition`, `aria-expanded`,
  `aria-controls`, and `@media (prefers-reduced-motion: reduce)` disabling
  transitions.
- Engine logos via `next/image` (local SVG/PNG, explicit sizes).
- `notFound()` for unknown ids.
- **AC:** the build lists 40 prerendered detail pages. An unknown id returns
  404. With reduced motion set in DevTools, expand is instant. Expanding
  causes no layout shift outside the card. Accordion works with keyboard and
  screen reader (announces expanded/collapsed).

### M7 — Pixel-perfect pass + landing + GSAP hero (1–1.5 days)
- Make the hi-fi frame (Figma) from the wireframe, then match it: spacing,
  type, colors **only via tokens**.
- Landing (SSG): hero with a GSAP timeline in a `next/dynamic` client leaf
  (`ssr: false` is fine because the text is server-rendered and GSAP only
  animates it), skipped entirely under `prefers-reduced-motion`.
- **AC:** side-by-side screenshot vs the frame at 1440 px and 390 px, with
  differences ≤ 2 px on key edges (document it in `docs/pixel-check.md`).
  GSAP is not in the dashboard bundles. Hero LCP element is server-rendered
  text, not animated-in (opacity starts at 1 or LCP is measured after
  paint; explain which).

### M8 — Performance, deploy, README (1 day)
- Deploy to Vercel with `REVALIDATE_SECRET` set. Run the webhook against
  production.
- `useReportWebVitals` → console (or `/api/vitals`). `@next/bundle-analyzer`.
  Lighthouse mobile on landing, overview and prompts.
- README sections: Architecture, Rendering table (§3), Caching & CDN,
  Perf notes (before/after numbers, what moved them), Trade-offs, "What I'd
  do next".
- **AC:** Lighthouse mobile Performance ≥ 90 on landing and overview.
  LCP < 2.5 s, CLS < 0.1, INP < 200 ms in the field or lab. Bundle-analyzer
  screenshot in `docs/`. Webhook verified on the production URL.

### M9 (optional) — React Three Fiber scene (0.5–1 day)
- A small "engine orbit" scene on the landing page, below the fold, loaded
  through `next/dynamic` + `IntersectionObserver`, static poster fallback,
  disabled under reduced motion.
- **AC:** landing Lighthouse stays ≥ 90. three.js is absent from the initial
  JS (bundle analyzer proof).

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| next-intl + Cache Components friction (locale must not be read from headers inside `'use cache'`) | Pass `locale` as an argument to cached functions. If it blocks M3 for more than 2 hours, fall back to `cacheComponents: false` + classic `export const revalidate` + `unstable_cache` tags, and document why. That's still a good interview story. |
| React Query and Next cache disagree after a mutation | Server Action does `updateTag` (Next side). `onSettled` invalidates (client side). Explain both. |
| Scope creep in M7 | Pixel-perfect only the overview and prompts. The landing page gets the hero only. |

---

## 9. Decisions I made by default (veto any)

1. Next 16 with Cache Components **on**, rather than the classic model (§8
   has the fallback).
2. Hand-written SVG chart instead of a chart library.
3. Server Action as the optimistic `mutationFn`. Route Handlers only for
   React Query GETs.
4. pnpm + Vitest. No E2E.
5. The hi-fi Figma frame is your job in M7 (it's the "built from a wireframe"
   story).
