# WarsWorld — Project Rules

Open-source reimplementation of Advance Wars By Web (AWBW): a turn-based strategy game with
online play, ranking and live matches. Full-stack TypeScript on Next.js.

These rules describe the **target architecture** we are moving the code toward. Where today's code
differs, the rule wins and code gets adapted to match. Scoped rules live next to the code:

- **Backend / API & game engine** → [`src/server/CLAUDE.md`](src/server/CLAUDE.md)
- **Frontend (UI, pages, Pixi rendering)** → [`src/frontend/CLAUDE.md`](src/frontend/CLAUDE.md)

## Stack

- **Next.js 14** (pages router) + **React** — `src/pages`, `src/frontend`, `src/components`
- **tRPC v10** (E2E type safety) + **superjson** — `src/server`
- **Prisma + PostgreSQL** — `prisma/`, DB runs in Docker
- **PixiJS** (WebGL game board) — `src/pixi`
- **WebSockets** — standalone server for live match events (`src/server/main-wss-*.ts`, port 3001)
- **NextAuth** (`@auth/core`) — email/password + GitHub/Discord/Google
- **zod** — all input validation
- **Tailwind CSS** — styling
- TypeScript `strict` + `strictNullChecks`, `baseUrl: ./src`

## Core architectural decisions (load-bearing — do not re-litigate)

1. **Server-authoritative.** All game logic and knowledge (rules, constants, state) live in the
   **backend and DB**. The backend is the single source of truth. It validates every action, and
   **owns conflict/error resolution** — when a submitted action is illegal or stale, the BE
   decides the resolution; the client does not.
2. **The frontend never runs the engine.** The FE asks the BE for the data it needs (available
   actions, reachable tiles, attack ranges, damage previews, resulting state) and **renders a
   preview**. It does not compute game outcomes, validate moves, or embed game constants/rules.
3. **No shared FE↔BE source code.** `src/shared` is being **removed** (see migration map below).
   The only contract across the boundary is the **tRPC API surface**: the client gets its types by
   **tRPC type inference** from the server routers and the WS subscription outputs — never by
   importing backend/domain code.
4. **Engine is a Prisma-free feature.** The game engine defines and owns its own entity types.
   Prisma rows are mapped to/from engine entities at the **adapter boundary** — `@prisma/client`
   must not appear in engine code.
5. **Turn-based, queue-resilient client.** It's a turn-per-turn game, so round-trips for validation
   are acceptable. The FE keeps an **action queue** so a move survives a lost/flaky connection:
   queue locally, submit, reconcile with the BE's authoritative result (see `src/frontend/CLAUDE.md`).

## Target layering & dependency direction

Feature-sliced backend. Every feature is a vertical slice under `src/server/<feature>`; the game
engine is **the one rich feature** (`engine`), the rest are thin. A single **shared kernel**
(`core`) holds the game _vocabulary_ and cross-domain utils that features have in common — this is
the only thing features share, and it replaces the old "one blessed `domain/`" idea.

```
PRESENTATION   src/pages · src/frontend · src/pixi · src/components
      │ tRPC hooks / WS subscription — types inferred from the API. No engine/server imports.
      ▼
BACKEND   src/server/
   ├─ core/        SHARED KERNEL — game vocabulary (position, tile, unit, army, co, action,
   │               player-slot, match-rules …) + cross-domain utils. Framework-free, Prisma-free.
   │               Any feature may import it; it imports nothing outward.
   ├─ engine/      THE GAME FEATURE (rich): entities, rules, constants, event sourcing, and the
   │               preview/snapshot usecases. Prisma-free. The ONLY feature that owns game logic.
   ├─ <feature>/   auth · articles · players · ranking · maps — thin slices: router + schemas +
   │               usecase. Import `core` (and `adapters`); never `engine`, never each other.
   ├─ adapters/    Prisma access + row↔domain mappers, WS emitter, live-match store
   └─ trpc/        procedures, middleware, context
```

Inner layers never import outer ones. `core` imports nothing outward; the `engine` feature imports
`core` (and `adapters`) but no transport or framework. **Features never import each other** — they
share through `core`, and **only the `engine` feature owns game logic** (so e.g. `maps` gets its
tiles from `core`, not from `engine`). Cross-feature needs go through a narrow usecase interface,
not a direct import.

**Engine scope (strict):** the `engine` feature contains only things directly about the game itself
and how it's presented to the user. Accounts, articles, preferences, ranking, and map _management_
are **not** the engine — they are their own features. Keep the engine **whole**: split it into
internal modules (`entities/`, `rules/`, `constants/`, `events/`, `previews/`) to keep files small,
rather than fragmenting it into sibling features that would have to import one another.

## `src/shared` is deprecated — migration map

`src/shared` only exists because of the Next.js "code shared between client and server" pattern; it
fuses the game engine with several unrelated features and Prisma-coupled, FE-consumed code, and is
the source of the FE↔BE coupling we are removing. Redistribute its contents to the **rightful
owner** — it is not all "engine".

**→ Game engine feature** (`src/server/engine`, Prisma-free; FE consumes its output as data, never imports it):
| Today in `src/shared/…` | Target inside `engine/` |
|---|---|
| `match-logic/` (damage, movement, weather, CO, hooks) | `engine/rules/` |
| `match-logic/{pathfinding,combat-forecast}` + turn-snapshot/previews | `engine/previews/` (usecases) + `engine/rules/` |
| `match-logic/events/` + `handlers/` (action→event→apply, available-actions) | `engine/events/` |
| `match-logic/game-constants/` (unit/terrain/CO tables, funds) | `engine/constants/` |
| `wrappers/{match,unit,player-in-match,team,vision}` | `engine/entities/`, **decoupled from Prisma** |
| `types/{events,server-match-state,component-data}` | `engine/` (engine + game-presentation types) |

**→ Shared kernel** (`src/server/core` — game vocabulary + cross-domain utils any feature may import):
| Today in `src/shared/…` | Notes |
|---|---|
| `schemas/{action,army,co,game-version,match-rules,player-slot,position,tile,unit,unit-traits,variable-tiles,weather,spritesheet-data}` | gameplay + game-presentation vocabulary |
| `math-utils.ts` (position math) | cross-domain util (import from `core`, don't re-duplicate) |

**→ Feature modules** (`src/server/<feature>` — NOT the engine):
| Today in `src/shared/…` | Target feature |
|---|---|
| `schemas/auth.ts` | `auth` (and the FE owns its own form schema) |
| `schemas/article.ts` | `articles` |
| `schemas/preferences.ts` | `players` |
| `schemas/map.ts`, `wrappers/map.ts` | `maps` — **map management** (WWMap entity + create/list/edit) |

> **Maps split:** tile/terrain/predeployed-unit _vocabulary_ (`schemas/tile`, `variable-tiles`)
> lives in `core` — it's the game's shared language. The `maps` feature owns the `WWMap` entity and
> CRUD, and **imports that vocabulary from `core`** (not from `engine`).

**→ Frontend** (`src/frontend` / `src/pixi`): presentation-only rendering code, and FE-owned form
schemas (login/signup/article forms re-declare or infer their schema; the BE re-validates anyway).

**→ Utilities:** `DispatchedError.ts` → `engine` (typed domain error); `math-utils.ts` → `core`
(cross-domain util; import it, don't re-duplicate); `rph.txt` → delete (stray note).

Do **not** add a `CLAUDE.md` inside `src/shared` or grow it — it is being dissolved, not blessed.

## Dev commands

```bash
npm install
npm run db:up          # start Postgres in Docker (compose service "postgres")
npm run prisma:push    # sync schema → DB
npm run prisma:seed    # seed dev users + a sample match
npm run dev            # Next (:3000) + WebSocket server (:3001) together
npm run lint           # prettier --check + eslint   (run before every commit)
npm run lint:fix       # auto-fix
npm run build          # next build + bundled server
npm run prisma:studio  # browse the DB at :5555
```

> **Local gotcha:** an `rtk` shell proxy can intercept and break `prisma` invocations
> (`rtk: No such file or directory`). If `prisma db push/seed` fails that way, run it through
> `rtk proxy npx prisma <cmd>`.

## Global conventions

- **Validate at the boundary, once.** Every tRPC procedure declares a `zod` input schema. Don't
  re-validate already-typed data deeper in the domain.
- **Errors are thrown, not returned.** Domain throws a typed error; transport maps it to a
  `TRPCError`. Never return `{ error: ... }` shapes and branch on keys.
- **Typed returns over `any`.** Explicit / inferred types at every boundary.
- **Imports at the top of the module.** No in-function `import`/`require` except for deliberate
  code-splitting.
- **Line length 100** (Prettier `printWidth`). Prettier + ESLint are the source of truth; run
  `npm run lint` before pushing — CI rejects warnings.
- **Naming:** `PascalCase` types/React components, `camelCase` values/functions, `kebab-case`
  filenames (match the folder's existing convention).
- **File-size discipline.** Small, single-purpose files; split large routers/handlers by concern.
- **No secrets in git.** `.env` is gitignored; copy `.env.example`.

## Git workflow

- `origin` = your fork (`git@github.com:titouanfreville/WarsWorld.git`), `upstream` = the original.
- **Never commit on `main`.** Branch per change (`feat/…`, `fix/…`); keep `main` a clean mirror of
  `upstream/main`. One change → one branch → one PR. Commit/push only when asked.

## Testing

Cover essential entry points — game-rule code especially (damage, movement, CO powers, event
application). Keep domain tests pure (no DB, no network). Pattern: `src/tests/`. No runner is wired
yet; prefer Vitest if you add one.
