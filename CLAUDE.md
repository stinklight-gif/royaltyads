# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Next.js dev server
- `npm run build` — production build (also serves as type-check since `noEmit: true`)
- `npm run lint` — ESLint (next/core-web-vitals + next/typescript)
- No test framework is configured

## Architecture

RoyaltyAds is an Amazon KDP ads automation dashboard built with Next.js 16 (App Router), Supabase, and Tailwind CSS 4. It manages Sponsored Products campaigns via the Amazon Advertising API.

### Dual-mode data layer

`lib/amazon-ads/client.ts` is the central data layer. It checks Supabase for stored Amazon API credentials; if credentials exist, it calls the Amazon Advertising API. Otherwise, it falls back to in-memory mock data from `lib/mock-data.ts`. The layout shows a demo banner when in mock mode (`isDemoMode()`).

### Automation engine

The cron endpoint (`app/api/cron/route.ts`) runs hourly via Vercel Cron (`vercel.json`). It evaluates all ENABLED campaigns in batches of 50 against two rules:
- **Scale up**: budget utilization > 80% AND ACoS < target → increase budget
- **Scale down**: ACoS > threshold → decrease budget (respecting budget floor)

Three automation modes (stored in `ad_settings.automation_mode`):
- `off` — cron does nothing
- `auto` — applies budget changes immediately via Amazon API
- `approval` — creates pending entries; user approves/rejects via `POST /api/approve`

All actions are logged to the `automation_log` table. Settings are normalized through `lib/automation.ts`.

### Database

Supabase with three sequential migrations in `supabase/migrations/`:
- `001_init.sql` — `ad_settings`, `ad_campaigns`, `ad_keywords`
- `002_automation_engine.sql` — adds automation columns to `ad_settings`, creates `automation_log`
- `003_approval_mode.sql` — adds `automation_mode` to settings, `approved`/`approved_at` to log

### Pages

All pages are server components. The sidebar (`components/sidebar.tsx`) provides navigation. Pages: dashboard (`/`), campaigns, keywords, optimizer, activity log, settings.

### Key conventions

- Path alias: `@/*` maps to project root
- UI components in `components/ui/` are shadcn/ui (Radix + CVA + tailwind-merge)
- Types defined in `lib/types.ts`
- Supabase client is created per-call via `getSupabaseClient()` (no auth/session persistence)
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (defaults are hardcoded as fallback)
