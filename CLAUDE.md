# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:8080
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # ESLint
npm run test         # Run all tests (vitest)
npm run test:watch   # Watch mode
npm run preview      # Preview production build
```

To run a single test file:
```bash
npx vitest run src/path/to/file.test.ts
```

## Architecture

**Stack:** React 18 + TypeScript + Vite, styled with Tailwind CSS + shadcn/ui (Radix UI), state managed by TanStack React Query, routed with React Router v6, with Supabase as the database backend and an AWS Lambda for schedule data.

**Data sources:**
- `src/lib/supabase.ts` — Supabase client, credentials from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars
- `src/hooks/use-volunteers.ts` — queries `volunteers` table with nested `volunteer_sectors` + `sectors` relations
- `src/hooks/use-schedules.ts` — **legacy**: fetches from AWS Lambda endpoint; returns typed `ScheduleData`. This will be replaced by a native Supabase query joining `event` + `scales` + `volunteers` + `sectors`.

**Routing (src/App.tsx):**
- `/` → `Index` — weekly and monthly schedule views
- `/equipe` → `Team` — volunteer directory grid
- `/equipe/:id` → `VolunteerProfile` — individual volunteer detail
- `*` → `NotFound`

All routes share the `Layout` wrapper which includes `AppSidebar` and a sticky header.

**Type definitions:** `src/types/database.ts` defines all data models (`Volunteer`, `Sector`, `VolunteerSector`, `VolunteerWithSectors`, `Event`, `Shift`, `Scale`, `ScheduleData`, etc.). Proficiency levels are `apprentice | knowledgeable | master`.

**UI components:** shadcn/ui components live in `src/components/ui/`. Use the `cn()` util from `src/lib/utils.ts` for className merging. Import path alias `@/` maps to `src/`.

**Theme:** Custom Tailwind theme with a gold accent color for master-level volunteers. Dark mode is class-based. Sidebar uses a distinct color set defined under `sidebar` in `tailwind.config.ts`.

**Animations:** Framer Motion is used for card entry animations (staggered delays in `VolunteerCard`).

## Database Schema

Migration: `supabase/migrations/20260414004938_initial_tables.sql`  
Seed (Abril–Junho 2026): `supabase/seed.sql`

### Tables

| Table | PK | Key fields |
|---|---|---|
| `volunteers` | uuid | `name`, `nickname`, `ministry_entry_date`, `contact_phone`, `avatar_url` |
| `sectors` | uuid | `name`, `slug`, `url_icon` (ícone geral), `url_icon_apprentice`, `url_icon_knowledgeable`, `url_icon_master` |
| `volunteer_sectors` | uuid | `volunteer_id → volunteers`, `sector_id → sectors`, `proficiency_status`, `is_active_in_sector` |
| `event` | uuid | `name`, `date`, `type` (text, e.g. `'culto'`) |
| `shifts` | uuid | `event_id → event` (CASCADE delete), `lider_id → volunteers` (nullable), `scheduled_time` (TIME) |
| `scales` | uuid | `shift_id → shifts` (CASCADE delete), `volunteer_id → volunteers`, `sector_id → sectors` |

### Relationships
```
event ──< shifts ──< scales >── volunteers
                           >── sectors
shifts >── volunteers  (lider_id, optional)
```

### Business rules
- One volunteer can belong to multiple sectors (e.g. PA and Live sound). Use `is_active_in_sector` to mark the main one.
- `event.type` is a free-text field. Current values: `'culto'`. Future values may include `'ensaio'`, `'reuniao'`, etc.
- A single event (one date) can have multiple shifts (e.g. manhã 09:00 and noite 19:00). Each shift is its own scheduling unit.
- `shifts.lider_id` is nullable — a shift may not have a designated leader yet.
- `shifts.scheduled_time` stores the start time (PostgreSQL `time` type, e.g. `'09:00'`, `'19:00'`).
- A scale entry = one volunteer assigned to one sector in one shift. The `scales` table is the join between shift + volunteer + sector.
- Deleting an event cascades to its shifts, which cascade to their scales. Deleting a volunteer or sector is restricted if they have existing scales.
- The volunteer `id = 00000000-0000-0000-0001-000000000000` ("A definir") is a placeholder used when a sector slot is needed but the actual volunteer is not yet chosen. It has `master` proficiency in all sectors.
- RLS: `authenticated` has full CRUD on all tables; `public` (unauthenticated) has read-only access.

### Seed data (from planilha)
- **21 volunteers** (20 reais + "A definir" placeholder), **6 sectors** (Projeção, Transmissão, Sonoplastia PA, Sonoplastia Live, Fotografia, Stories)
- **30 volunteer_sectors** — all `proficiency_status = 'master'`; "A definir" covers all 6 sectors
- **11 events** (Abril–Junho 2026, one per Sunday date)
- **22 shifts** (two per event: manhã 09:00 and noite 19:00), each with a `lider_id` from the original spreadsheet
- **110 scale entries** — Fotografia omitted (no one assigned in the spreadsheet)

## Deployment

**Target:** Apache shared hosting on a subdomain, uploaded via FTP.

`npm run build` produces a static `dist/` folder. Upload its contents to the subdomain root. No Node.js runtime on the server — all data fetching happens client-side via Supabase and the Lambda API.

**SPA routing:** `public/.htaccess` is committed and copied to `dist/` on every build. It rewrites all non-file requests to `index.html` so that React Router's `BrowserRouter` handles client-side navigation correctly (direct access to `/equipe` or page refresh won't 404).

Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SCHEDULES_API_URL`) are inlined at build time — set them in `.env` before running `npm run build`.

## TypeScript

`strictNullChecks` and `noImplicitAny` are disabled. `skipLibCheck` is enabled. Keep this in mind — the codebase does not enforce strict null safety.

## Testing

Tests use Vitest with jsdom and `@testing-library/react`. Setup file is `src/test/setup.ts`. Test files match `src/**/*.{test,spec}.{ts,tsx}`.
