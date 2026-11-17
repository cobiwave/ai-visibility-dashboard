# AI Visibility Dashboard

Answer Engine Optimization (AEO) is SEO for AI answers: instead of ranking in
ten blue links, a brand wants to be **mentioned, ranked and cited** when people
ask ChatGPT, Perplexity, Gemini, Claude or Google's AI Overviews. This is a
portfolio mock of an AEO dashboard for one fictional brand, "Northwind Coffee",
with deterministic fake data and no real LLM calls.

**Production:** _URL pending_

Built with Next.js 16 (App Router, Cache Components), React 19, TypeScript
strict, Tailwind v4, TanStack Query v5, next-intl (`/en`, `/es`) and zod.

---

## Run locally

```bash
pnpm install
cp .env.example .env.local   # set REVALIDATE_SECRET to any string
pnpm dev                     # http://localhost:3000 → redirects to /en/dashboard
```

| Command                              | What it does                                                                                         |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `pnpm verify`                        | typecheck → lint → unit tests → token check → production build                                       |
| `pnpm test`                          | Vitest, pure logic only (generator, filters, pagination, formatters, query keys, webhook validation) |
| `pnpm check:tokens`                  | fails on raw hex or arbitrary px values in `src/features` and `src/shared`                           |
| `pnpm build && pnpm exec next start` | production build, served locally                                                                     |

---

## Architecture

```
src/
  app/          routes only: composes features, owns no business logic
  features/
    visibility/ overview: KPIs, SVG trend chart, engine breakdown
    prompts/    table, filters, pagination, ★ toggle, scan polling
    answers/    prompt detail: answer cards, expandable excerpt
  shared/       ui primitives, config (cache tags, engines), lib (format, cn, query client)
  server/       mock data store (seeded generator + in-memory state)
  i18n/  messages/  styles/
```

Rules the code follows (enforced by review, the folder layout and `server-only`):

- **A feature never imports another feature.** Anything two features need
  (engine ids, sentiment colors, cache tags) lives in `shared/`. Composition
  happens in `app/`.
- **Server Components by default; `'use client'` only on interactive
  leaves.** Server components render the data and pass it down as props or
  `children`. Client components are: `FiltersBar`, `PromptsTable`,
  `TrackToggle`, `ScanButton`, `SimulateFailures`, `ExcerptToggle`,
  `NavLink`, `LocaleSwitcher`, `Toast`, `QueryProvider`. The overview ships
  **no feature JS**; the detail page's only feature client component is the
  excerpt toggle, which receives the excerpt as server-rendered `children`.
- `src/server/**` and `features/*/server/**` start with `import 'server-only'`.
- Cache tag strings come only from `shared/config/cache-tags.ts`; React Query
  keys only from `features/prompts/queries/keys.ts`.
- No user-facing string literals: copy lives in `messages/{en,es}.json`
  (a type check fails if a key is missing in either). Numbers and dates go
  through `shared/lib/format.ts` (native `Intl`).

---

## Rendering per route

With Cache Components, "SSG / ISR / SSR" are not route-level switches any
more; they fall out of what each component reads. This is how the classic
terms map onto what was built (symbols are from `next build`):

| Route                                     | Build          | Strategy                                             | How                                                                                                                                                                                                |
| ----------------------------------------- | -------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/[locale]`                               | ○              | Redirect                                             | Landing was cut (SPEC §0); redirects to `/[locale]/dashboard`.                                                                                                                                     |
| `/[locale]/dashboard`                     | ○              | **Static shell + ISR data + on-demand revalidation** | `getOverview` is `'use cache'` + `cacheLife('hours')` + `cacheTag('metrics:northwind')`. Whole page is prerendered; the webhook invalidates the tag.                                               |
| `/[locale]/dashboard/prompts`             | ◐              | **PPR**: static shell + dynamic table                | Header, scan button and skeleton are the static shell. The table reads `searchParams` inside `<Suspense>`, prefetches into React Query on the server and hydrates. No client fetch on first paint. |
| `/[locale]/dashboard/prompts/[promptId]`  | ○ ×40, ◐ shell | **SSG top 20 + ISR long tail**                       | `generateStaticParams` returns the 20 most-mentioned prompts × 2 locales = 40 static pages. Other ids get the shell, render on first request and are cached. Tag `prompt:{id}`.                    |
| `/[locale]/tokens`                        | ○              | SSG                                                  | Dev-only design-token preview.                                                                                                                                                                     |
| `POST /api/revalidate`                    | ƒ              | Webhook                                              | Secret header, zod body, tag allow-list, `revalidateTag(tag, 'max')`.                                                                                                                              |
| `GET /api/prompts`, `GET /api/scans/[id]` | ƒ              | Dynamic, `private, no-store`                         | React Query's client reads. Tenant data never goes to a shared cache.                                                                                                                              |

Locale handling: the locale is read with `next/root-params` in
`i18n/request.ts`, not from headers, so every page stays statically
renderable without calling `setRequestLocale` in each layout and page.

---

## Caching & CDN

Three layers, each with one owner:

1. **Edge CDN (Vercel).** Only public, tenant-agnostic output: prerendered
   HTML (overview, detail pages, shells), `/_next/static/*` (content-hashed,
   immutable), and `public/` images.
2. **Next data cache (`'use cache'`).** Per-brand data on the server, keyed by
   the function's arguments. The brand id is an argument, so on a multi-tenant
   product one tenant's entry can never be served to another.
3. **React Query (browser).** Owns everything after hydration on the prompts
   page: `staleTime: 30s` for lists, `refetchInterval` only while a scan is
   running, optimistic ★ with rollback. **Next owns the first paint, React
   Query owns everything after.**

**Invalidation flow**

```
scan pipeline finishes
  → POST /api/revalidate { tags: ["metrics:northwind"] }
  → revalidateTag(tag, 'max')        entries marked stale, not deleted
  → next visitor: stale page, regeneration starts in the background
  → visitor after that: fresh page (Vercel propagates it to every region)
```

User writes take a different path: the ★ Server Action calls `updateTag()`
(read-your-own-writes: the next read waits for fresh data instead of serving
stale) for `prompts:northwind` and `prompt:{id}`, and the client's
`onSettled` invalidates the React Query lists. One call per cache.

At global scale, static and ISR output is replicated across Vercel's edge;
dynamic work (the table, the API routes) runs in one function region placed
**next to the database**, not next to the user, because a request makes
several DB round trips and only one round trip to the user.

---

## On-demand revalidation

```bash
URL=http://localhost:3000   # or the production URL

# 401: missing or wrong secret
curl -i -X POST "$URL/api/revalidate" -H 'content-type: application/json' \
  -d '{"tags":["metrics:northwind"]}'

# 400: tag outside the allow-list (metrics:, prompt:, prompts:)
curl -i -X POST "$URL/api/revalidate" -H 'content-type: application/json' \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" -d '{"tags":["users:all"]}'

# 200: { revalidated: true, tags: [...], now: "..." }
curl -i -X POST "$URL/api/revalidate" -H 'content-type: application/json' \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" -d '{"tags":["metrics:northwind"]}'
```

After the 200, reload `/en/dashboard` twice: the first load still shows the
old "Data generated at…" time (stale-while-revalidate), the second shows a new
one.

---

## Performance

Lighthouse, mobile, default settings (`npx lighthouse <url>`):

| Page                    | Performance | LCP | CLS | TBT |
| ----------------------- | ----------- | --- | --- | --- |
| `/en/dashboard`         | _pending_   |     |     |     |
| `/en/dashboard/prompts` | _pending_   |     |     |     |

What keeps these numbers good:

- **Static shells.** The overview and the 40 detail pages are prerendered
  HTML from the CDN; the prompts page streams its table into a prerendered
  shell, so the header and skeleton paint before any data.
- **Zero-JS overview.** KPI cards, chart and breakdown are Server Components.
- **Hand-written SVG chart** instead of a chart library (saves roughly
  40–90 KB of JS; the trade-off is no tooltips).
- **`zod/mini` on the client.** Filters and API responses are validated in the
  browser with the tree-shakable build. Prompts route JS went from
  **243.5 KB → 230.1 KB gzip** (zod's chunk from 46.6 KB to 32.8 KB). The
  server keeps full `zod`.
- **`next/image` with explicit `width`/`height`** for the engine marks, so
  space is reserved before they load (no CLS). They are SVGs, which Next
  serves as-is rather than through the optimizer.
- **Skeletons that match the final layout**, and the excerpt expands with a
  CSS grid transition instead of JS height measurement.

---

## Trade-offs

**History API instead of `router.replace` for filters.** `router.replace` is a
Next navigation: it re-renders the page on the server (re-running the
prefetch) and only updates `useSearchParams` once that response arrives, so
React Query never fetched and `keepPreviousData` never applied.
`history.pushState`, which Next syncs into `useSearchParams`, changes the URL with no
server round trip; the query key changes and React Query fetches
`/api/prompts` with the old rows still visible. It started as `replaceState`;
`pushState` was tested on a production build and kept: back/forward restore
the right filter/page state with **zero requests** (no RSC navigation, and
React Query answers from cache). Cost: every filter click is a history entry.

**Mutable mock state on `globalThis`.** Next bundles Route Handlers separately
from pages and Server Actions, so a module-level `Map` existed once per bundle
and a ★ written by the action was invisible to `GET /api/prompts`.
`globalThis` is shared by every bundle in the process. Still one copy per
server instance (see below).

**`connection()` in `listPrompts`.** The list is uncached on purpose (`tracked`
is live state). `connection()` tells Next it's request-time data, so
prerendering stops there instead of hitting the mock's random latency and
failing the build. The detail page's loader does the opposite: no
`connection()`, `'use cache'`, so it can be prerendered.

**Hashed, constant-time secret compare.** The webhook hashes both secrets with
SHA-256 before `timingSafeEqual`: equal lengths (it throws otherwise) and the
secret's length isn't leaked. A shared secret has no replay protection;
production would use an HMAC signature over the body plus a timestamp.

**Server Actions return error codes instead of throwing.** Production redacts
thrown messages, and the client has to translate the message anyway (the
locale isn't available inside actions). The React Query `mutationFn` turns
`{ ok: false }` into a throw so `onError` still runs the rollback.

**Deterministic failure switch.** The ★ used to fail randomly (~10%) to show
the rollback. A live demo can't depend on luck, so a "Simulate ★ failures"
switch now makes every toggle fail or none. It's context state, not URL state,
because it's a demo control and not part of a shareable view.

**Stateless scan ids.** `scan_1763380800000` carries its start time, and the
scan's state is a pure function of elapsed time. Any instance can answer a
poll without shared storage. Cost: ids are forgeable (harmless here); a
signed id is the upgrade.

**In-memory data on Vercel.** Each function instance has its own copy, so a ★
can "revert" after a cold start or when a request hits another instance.
Fine for a mock; in production this is a database.

**Detail-page 404 status.** Unknown ids render the translated not-found page
with `noindex`, but the HTTP status is `200`: with Cache Components the
prerendered shell starts streaming before the request-time `notFound()` runs,
and `dynamicParams = false` isn't available (and would 404 the long tail too).
A true `404` needs the check in Proxy.

**Grid-rows accordion over JS measurement.** `grid-template-rows:
minmax(2lh, 0fr) → minmax(2lh, 1fr)` animates to the content's real height
with no `scrollHeight` reads, keeps two lines visible when collapsed, and
`motion-reduce:` turns it into an instant toggle.

---

## Cut for time, and what I'd do next

- **Landing page + GSAP hero** (SSG, GSAP in a lazy client leaf, skipped under
  reduced motion) and the **R3F "engine orbit"** below the fold.
- **Figma hi-fi pass**: make the frame from the wireframe, then match spacing
  and type through tokens only, with a 1440/390 px screenshot diff.
- **E2E tests** (Playwright): first paint with no `/api/prompts` call,
  optimistic rollback, back/forward, keyboard paths.
- **Signed scan ids** (HMAC) and an HMAC + timestamp webhook signature.
- **A real database**, so ★ state survives instances and cold starts, and a
  shared cache handler if self-hosting.
- Real `404` status for unknown prompt ids via Proxy; translated answer
  excerpts (the mock generates them in English only).
