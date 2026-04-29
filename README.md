# Milagros Fitness

A "Netflix for fitness" — recorded classes (flexibility, mobility, strength, training) behind a recurring subscription.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind v4 · Prisma 7 + PostgreSQL · Auth.js v5 · Mercado Pago (recurring) · Bunny Stream (HLS) · Resend.

This README is for the developer (James). For day-to-day operations, see [OPERATIONS.md](./OPERATIONS.md). For the client UAT walkthrough, see [UAT_CHECKLIST.md](./UAT_CHECKLIST.md).

---

## What's in here

```
src/
  app/
    (public)/           — Marketing pages: home, /membresia, legal
    (auth)/             — Login, register, forgot/reset, verify email
    (member)/app/       — Dashboard, library, class detail, favorites,
                          playlists, profile, subscription
    (admin)/admin/      — Dashboard, members, subs, payments,
                          classes, categories, plans, settings
    checkout/           — /checkout, /checkout/exito|error|manual
    api/                — auth, progress, playlists, webhooks
    layout.tsx          — Root: fonts, toaster, cookie banner, SEO meta
    error.tsx           — Root error boundary
    not-found.tsx       — Branded 404
    robots.ts           — robots.txt
    sitemap.ts          — sitemap.xml
  proxy.ts              — Auth route gates (Next 16 renamed middleware)
  components/           — UI (shadcn/base-ui), classes, layout
  lib/                  — auth, prisma, bunny, mercadopago, email,
                          tokens, format, slug, access, validators,
                          actions/*
  generated/prisma/     — Prisma 7 client output (gitignored)
prisma/
  schema.prisma         — All tables
  migrations/           — Committed migration history
  seed.ts               — Admin + plans + categories + sample classes
scripts/
  backup-db.sh          — pg_dump + retention (called from cron)
  smoke-day*.ts         — Per-day E2E smokes
  smoke-day10-e2e.sh    — Real Auth.js cookie-based flow test
DEVELOPMENT_PLAN.md     — The 10-day plan
TEST_PLAN.md            — Test strategy
UAT_CHECKLIST.md        — Client testing checklist (Spanish)
OPERATIONS.md           — Runbook, env vars, restore drill
```

---

## Local dev setup

Assumes you're starting from scratch on a fresh Ubuntu 24 box. If you're on the existing VPS, skip to **Run**.

```bash
# 1. System deps
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs postgresql
npm install -g pnpm

# 2. Database
sudo -u postgres psql <<EOF
CREATE ROLE milagros WITH LOGIN PASSWORD 'CHOOSE_ONE' CREATEDB;
CREATE DATABASE milagros_dev OWNER milagros;
EOF

# 3. Repo
git clone <repo-url> Fitness
cd Fitness
pnpm install

# 4. Env
cp .env.example .env
# Edit .env — see OPERATIONS.md §2 for the full list. At minimum set
# DATABASE_URL and AUTH_SECRET. Other services can stay empty in dev.

# 5. Migrate + seed
pnpm db:migrate
pnpm db:seed

# 6. Run
pnpm dev    # http://localhost:3000
```

Seed credentials (change before going live):
- **Admin:** `admin@milagros.local` / `admin1234`

---

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Dev server on `0.0.0.0:3000` (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Run prod build on `0.0.0.0:3000` |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm db:migrate` | Prisma migrate dev |
| `pnpm db:generate` | Regenerate Prisma client |
| `pnpm db:studio` | Prisma Studio on `0.0.0.0:5555` (dev only) |
| `pnpm db:reset` | Drop + recreate DB (destructive) |
| `pnpm db:seed` | Run `prisma/seed.ts` |
| `scripts/smoke-day10-e2e.sh` | Real Auth.js login + protected-page round trip |

---

## Architecture decisions

### Why Prisma 7 + driver adapter

Prisma 7 removed the `url = env(...)` shorthand from `schema.prisma`. The connection string lives in `prisma.config.ts`; the runtime client uses `@prisma/adapter-pg` (the `pg` driver). This is the pattern in [src/lib/prisma.ts](src/lib/prisma.ts).

### Why `proxy.ts` instead of `middleware.ts`

Next 16 renamed the middleware file convention to `proxy.ts`. Same matcher config. Same Edge runtime. Just a different filename + function name (`export const proxy = ...`).

### Why iframe player instead of HLS.js

Bunny's iframe gives a fully-featured polished player for free (mobile-friendly, fullscreen, picture-in-picture). The trade-off is no fine-grained playback events — progress is wall-clock estimated. Acceptable for a "continue watching" UX. Phase 2 swaps to HLS.js for accurate analytics if ever needed.

### Why ILIKE search

Postgres `ILIKE` on title + description is fine at <100 classes. When the catalog grows, add a `tsvector` generated column + GIN index — the query interface from `lib/actions` doesn't need to change.

### Why `requireActiveAccess()` per-page (not in proxy.ts)

The active-subscription check needs Prisma. Proxy runs in Edge runtime → no Prisma access. So the check lives in pages that need it ([src/lib/access.ts](src/lib/access.ts)). Profile + Subscription pages are *deliberately* not gated — members must manage their account regardless of state.

### Why server actions everywhere

The forms are 90% server actions instead of API routes. Less boilerplate, better type-safety, automatic CSRF, progressive enhancement. API routes only exist when (a) external systems POST to us (webhooks), (b) we need a JSON response (`/api/playlists`, `/api/progress`).

---

## What's wired but not yet active

These light up automatically once the corresponding env vars are set — no code changes needed:

- **Mercado Pago recurring billing** — set `MP_ACCESS_TOKEN` and `MP_WEBHOOK_SECRET`
- **Bunny Stream video uploads + playback** — set `BUNNY_STREAM_*` and `BUNNY_WEBHOOK_SECRET`
- **Resend transactional email** — set `RESEND_API_KEY`. Without it, emails are logged to the server console (dev-friendly).

The admin manual-grant + manual-mark-paid flows let you operate the platform end-to-end *without* MP/Bunny while you wait for the client to provision them.

---

## Going to production

See [OPERATIONS.md §6](./OPERATIONS.md#6-going-to-production-when-domain--creds-land) for the step-by-step.

---

## Project status

End of Day 10:
- 10 commits on `main`, every day green, every day shippable
- Production build clean (`pnpm build` → 30 routes, 0 errors)
- Backups running daily on the VPS, restore drill verified
- E2E member flow verified via real Auth.js cookie round-trip
- All non-payment, non-video flows fully testable today via the manual-grant admin path

Blockers for going live (all client-side):
- Domain + DNS
- Mercado Pago production credentials + webhook URL registered
- Bunny Stream library + webhook URL registered
- Resend domain verified (SPF/DKIM)

---

## License

Proprietary. © Milagros (client) + James (developer). See contract for terms.
