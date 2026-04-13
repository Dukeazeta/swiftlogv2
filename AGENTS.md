# SwiftLogNG — Agent Notes

## Project

AI-powered SIWES logbook for Nigerian IT students. Users write a weekly summary; AI generates 5 daily log entries (Mon–Fri) matched to their role, company, and department.

## Stack

- **Next.js 16** (App Router, RSC, Turbopack) · React 19 · TypeScript strict
- **Tailwind CSS v4** (via `@tailwindcss/postcss`, no `tailwind.config`)
- **Drizzle ORM** → **Turso** (LibSQL/SQLite). Dialect is `turso`, schema at `src/lib/schema.ts`
- **NextAuth v5 beta** (`next-auth@5.0.0-beta.25`), Google provider only, Drizzle adapter
- **Vercel AI SDK** (`ai@4`) with providers: Mistral, Groq, Gemini (at least one API key required)
- **shadcn/ui** (new-york style, RSC enabled). Add components via `npx shadcn@latest add <name>`
- **React Compiler** enabled (`babel-plugin-react-compiler` + `next.config.ts`)
- **pnpm** (lockfile: `pnpm-lock.yaml`)

## Commands

```bash
pnpm dev            # dev server with --turbopack
pnpm build          # production build
pnpm lint           # eslint (next core-web-vitals + typescript)
pnpm db:generate    # generate Drizzle migration from schema changes
pnpm db:migrate     # apply pending migrations
pnpm db:studio      # open Drizzle Studio
```

No test runner is configured. No CI workflows exist.

## Architecture

```
src/
  app/
    (auth)/          # login page, auth layout
    (dashboard)/     # protected routes with sidebar layout
                     #   layout.tsx calls auth() + getDashboardLayoutData()
    api/
      auth/[...nextauth]/  # NextAuth handler
      generate/route.ts    # POST — AI log generation
      logs/route.ts        # GET/POST — weekly log CRUD
      profile/route.ts     # PATCH — student profile updates
    layout.tsx       # root layout (Inter + Manrope + JetBrains Mono)
    page.tsx         # public landing page
  lib/
    schema.ts        # Drizzle schema (users, accounts, sessions, verificationTokens,
                     #   studentProfiles, weeklyLogs, dailyLogs, logVersions)
    db.ts            # Drizzle singleton (globalThis cache in dev)
    auth.ts          # NextAuth config (Google provider, Drizzle adapter)
    ai.ts            # AI generation logic (provider fallback, response parsing)
    ai-providers.ts  # provider ID registry (mistral, groq, gemini)
    data.ts          # all DB query functions (re-exports schema tables)
    validations.ts   # Zod schemas for forms and API payloads
    logbook.ts       # WorkDay types and helpers (MONDAY–FRIDAY)
    utils.ts         # cn(), SIWES week math, usage limiting
  components/
    ui/              # shadcn/ui primitives
    dashboard/       # sidebar, log-table, dashboard-editor
  middleware.ts      # cookie-based auth guard (lightweight; heavy checks in routes)
```

## Key Facts

- **Path alias**: `@/*` maps to `./src/*`
- **Database**: Turso (edge SQLite). `drizzle.config.ts` imports `dotenv/config` for CLI context. Env vars: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`
- **Schema changes**: edit `src/lib/schema.ts`, run `pnpm db:generate`, then `pnpm db:migrate`
- **AI generation**: `src/lib/ai.ts` → picks provider, builds prompt, parses JSON response through Zod (`generatedLogsResponseSchema`)
- **Log versioning**: `saveWeeklyLog` in `data.ts` snapshots the previous version into `logVersions` before overwriting
- **Auth flow**: middleware checks `authjs.session-token` cookie → redirects unauthenticated users to `/login`. Dashboard layout also calls `auth()` server-side
- **SIWES week math**: `getFirstWorkWeekStart()` snaps to Monday; week numbers are 1-indexed from the internship start date
- **Usage limiting**: 4 AI generations per month per user (checked in `hasExceededUsageLimit`)
- **`prisma/`** is empty — leftover from a previous stack, not in use
- **`DESIGN.md`** documents the Webflow-inspired design system (colors, typography, spacing)
- **React Compiler** is active — avoid `useMemo`/`useCallback` where the compiler handles it

## Env Vars

See `.env.example`. Required for dev:
- `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` — database
- `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — auth
- At least one of: `MISTRAL_API_KEY`, `GROQ_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY` — AI generation

## Lint/Build Check

After changes, run:
```bash
pnpm lint && pnpm build
```
