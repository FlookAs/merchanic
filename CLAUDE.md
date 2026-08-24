# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Monorepo for **Merchanic** — an industrial services platform (water treatment, leak repair, welding). Replaces a WordPress site with a full-stack system: NestJS API + React frontend + quote request engine. See [docs/CLAUDE.md](docs/CLAUDE.md) for the full Thai-language blueprint.

## Commands

### Root
```bash
# No root-level build — run commands inside each app
```

### Backend (`apps/backend`)
```bash
npm run start:dev       # watch mode
npm run build           # compile to dist/
npm run lint            # ESLint --fix
npm test                # Jest unit tests
npm run test:e2e        # end-to-end tests
npm run test:cov        # coverage report
npm run db:migrate      # prisma migrate dev (creates migration + applies)
npm run db:seed         # seed dev data via tsx
npm run db:reset        # wipe DB and re-run all migrations + seed
```

### Frontend (`apps/frontend`)
```bash
npm run dev             # Vite dev server
npm run build           # tsc + vite build
npm run lint            # oxlint
npm run preview         # preview production build
```

### Docker (from repo root)
```bash
docker compose up -d postgres   # start DB only (port 5433)
docker compose up -d            # start DB + backend
docker compose down -v          # stop and delete volumes
```

## Architecture

### Stack
- **Backend:** NestJS 11, Prisma 7, PostgreSQL via `@prisma/adapter-pg` (driver adapter required by Prisma 7)
- **Frontend:** React 19, Vite 8, oxlint
- **Auth:** JWT + bcrypt, staff-only (no customer accounts)
- **PDF:** Puppeteer (QuoteDocument generation)
- **File storage:** Cloudflare R2 (images, PDFs) — keys stored in DB, files on R2
- **Hosting:** Render (backend Docker), Netlify (frontend), Neon (PostgreSQL)

### Prisma 7 — important differences from Prisma 6
Prisma 7 requires a **driver adapter** — `new PrismaClient()` without arguments is a type error.

```typescript
import { PrismaPg } from '@prisma/adapter-pg';
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
```

The generated client lives at `generated/prisma/` (gitignored). Run `prisma generate` after schema changes. Schema has no `url` in datasource — URL is injected via `prisma.config.ts` (reads `DATABASE_URL` from env) and at runtime via the adapter.

For seed scripts, use `tsx` (not `ts-node`) — the generated client uses ESM and `ts-node` CommonJS mode breaks. A separate `tsconfig.seed.json` exists but `tsx` doesn't need it.

### Module resolution
Backend `tsconfig.json` uses `"module": "nodenext"`. Within NestJS `src/`, this works fine. For standalone scripts (seed, future CLI tools), use `tsx`.

### Database schema (7 models)
```
Category → Product (one-to-many)
Category ← Portfolio.relatedService (optional FK)
StaffUser ← QuoteRequest.assignedTo (optional FK)
QuoteRequest → QuoteRequestItem → Product
QuoteRequest → QuoteDocument
```
All PKs are UUIDs. Pricing fields use `Decimal @db.Decimal(12,2)`. `unitPriceSnapshot` on `QuoteRequestItem` is frozen at submission time — never updated when `Product.unitPrice` changes.

### Environment variables
| Variable | Used by |
|----------|---------|
| `DATABASE_URL` | Prisma adapter, seed script |
| `PORT` | NestJS listen port (default 3000) |
| `JWT_SECRET` | Auth module (Phase 2+) |
| `NODE_ENV` | `development` / `production` |

Copy `.env.example` → `.env` to get started. Local DB is at `localhost:5433` (Docker maps host 5433 → container 5432 to avoid conflict with any native PostgreSQL).

### Branch strategy
- `main` — production, merge via PR only
- `develop` — integration branch, all features merge here first
- `feature/*` — individual feature branches
