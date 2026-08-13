# Backend / API & Game Engine Rules

Scope: `src/server/**`. This is where the **game engine lives** in the target architecture — the
backend is server-authoritative and owns all rules, knowledge, and state. Read the root
[`/CLAUDE.md`](../../CLAUDE.md) first (core decisions + the `src/shared` migration map).

## Layers

Feature-sliced, with a small **shared kernel** (`core`) for common game vocabulary. The game engine
is one feature — the rich one — not a blessed shared `domain/`.

```
src/server/core       KERNEL    game vocabulary (position, tile, unit, army, co, action, …) +
                                cross-domain utils. Framework-free, Prisma-free. Imports nothing.
src/server/engine     FEATURE   THE GAME ENGINE: entities, rules, constants, event sourcing, and
                                preview/snapshot usecases. Rich, Prisma-free. Owns all game logic.
src/server/<feature>  FEATURE   router + schemas + usecase per feature: auth, articles, players,
                                ranking, maps. Thin vertical slices; import `core`, never `engine`.
src/server/trpc       TRANSPORT procedures, middleware (auth/player/match), context
src/server/adapters   INFRA     Prisma access + row↔domain mappers, WS emitter, live-match store
src/server/prisma     INFRA     Prisma client
```

**Engine scope is strict.** `engine` holds only what is directly about the game and how it's
presented to the user. Accounts, articles, preferences, ranking, and **map management** are
features, not engine. (The `maps` feature owns the `WWMap` entity + CRUD and imports the
tile/terrain _vocabulary_ from `core` — not from `engine`.) Keep the engine **whole**: split it into
internal modules (`entities/`, `rules/`, `constants/`, `events/`, `previews/`) rather than into
sibling features that would import one another.

**Feature modules** are thin: a router, its `zod` schemas, and its usecase. Only the game engine is
rich. Every feature may import `core` and `adapters`, but **features never import each other**, and
**only `engine` owns game logic** — cross-feature needs go through a narrow usecase interface.

> Today the engine + every feature's schema still live in `src/shared`, and engine entities import
> `@prisma/client`. Target: engine logic → `src/server/engine` (Prisma-free), game vocabulary →
> `src/server/core`, each feature's own schema → `src/server/<feature>`. New/edited code follows the
> target, not the current coupling. See the root migration map.

## Module anatomy (mirrors our Python backend)

Every module under `src/server/<module>/` is a vertical slice with a **Usecase as its entry point**
— the same shape as our Python services (`<domain>/<domain>.py` + optional `dbo.py`/validators).
The **`engine` feature is one such module** (the richest one); the other features are leaner
modules, and `core` is a plain kernel (schemas + utils, no usecase).

```
src/server/<module>/
  <module>.usecase.ts   ENTRY POINT. A class whose public methods ARE the module's contract.
                        Each method reads top-to-bottom as intent: validate → fetch → apply →
                        persist → return. Dependencies (dbo, engine, logger) arrive via the
                        constructor.
  schemas.ts            the module's zod schemas (input/validation contracts).
  router.ts             TRANSPORT. Binds tRPC procedures to usecase methods. No logic of its own.
  dbo.ts                OPTIONAL. Abstracts non-trivial Prisma access. Add only when the usecase's
                        DB work stops being a one-liner; trivial CRUD stays inline.
  validators.ts         OPTIONAL. Validation / FK checks, extracted when the usecase grows.
  build.ts              OPTIONAL. Entity construction / normalization / stamping.
```

Rules (ported from the Python/Go skeletons):

- **The usecase is the only entry point.** Routers and other modules call a module _through its
  usecase methods_ — never reach into its `dbo`/`validators` directly.
- **Keep the entry point readable.** Public usecase methods are short and named for intent (someone
  non-technical should follow the flow). Push DB complexity behind `dbo.ts`, validation behind
  `validators.ts`. **Abstract only the complex parts** — a trivial module needs neither.
- **Explicit wiring, no DI framework.** Usecases receive deps via constructor; compose them once at
  a startup composition root and hand each router its usecase. Don't fetch deps from a global or
  stash module singletons on shared mutable state. (Request-scoped values — db handle, `player`,
  `match` — ride on the tRPC `ctx`; that's the sanctioned channel, not a service locator.)
- **`dbo.ts` owns Prisma complexity; the usecase owns the flow.** No multi-step query building
  interleaved with business logic in a usecase method.
- **Features never import each other** — only `core` (the kernel) and `adapters`. `engine` is the
  one feature that owns game logic; other features reach engine results through transport, not by
  importing `engine`.

### The game engine feature

- It is **pure**: gameplay rules + state + event sourcing, Prisma-free, no `dbo` (it does no I/O).
  Its usecase is the engine's public API (apply an action → events, compute available actions /
  previews, derive state).
- **Persistence of engine output lives in the engine feature's own `dbo`/adapter seam** (load/append
  the `Event` log, hydrate state) — kept apart from the pure rule modules. The rules compute; the
  seam persists.
- The engine **owns its own router** (the transport binding for match play). It imports `core` for
  vocabulary; other features do **not** import `engine`.

**Dependency direction (load-bearing):**

- **`core` imports nothing outward**, and the **`engine` feature imports only `core` + `adapters`** —
  no `src/server/routers`, no `src/pages/frontend/pixi`, no `@prisma/client`, no framework. The
  engine defines the entity types it needs; adapters map persistence to them.
- Inner layers never import outer ones. Transport may import `core`/`engine` + infra; `core` imports
  neither.
- **No cross-handler imports.** Action handlers (attack, move, build, capture, coPower, unload, …)
  must not import one another. Shared behaviour goes through common domain helpers.

## Server-authoritative contract

The backend is the single source of truth. The frontend renders previews but decides nothing.

- **Validate every action server-side.** Never trust a client-submitted action; re-check legality
  against authoritative state even if the FE "previewed" it as legal.
- **Expose what the FE needs to preview** — available actions, reachable tiles, attack ranges,
  damage previews, resulting state — as **query/subscription outputs**, computed from the engine.
  The FE consumes these; it does not recompute them. (`available-sub-actions`, `vision-update`
  already exist as the basis for this.)
- **Own conflict/error resolution.** When a submitted action is illegal, stale, or arrives out of
  order, the **BE chooses the resolution** and returns the authoritative outcome. Don't push the
  decision back to the client.

## Routers (transport)

A module's `router.ts` is the `register(usecase)` equivalent: it binds tRPC procedures to usecase
methods and does **nothing else** — validate input, call the usecase, map errors, return.

- **No business logic in a router.** If a procedure grows past input → usecase call → error mapping,
  the logic belongs in the usecase (or its `dbo`/`validators`).
- Build on the layered base procedures in `src/server/trpc/trpc-setup.ts`:
  `publicBaseProcedure` → `playerBaseProcedure` (auth+player) → `matchBaseProcedure` (+match) →
  `playerInMatchBaseProcedure` (+turn/ownership). Pick the **most specific** one that fits; don't
  re-implement auth/match/turn checks in a procedure. Auth must be _enforced_ by the procedure, not
  merely documented.
- Input is **always** a `zod` schema on `.input(...)`. The client's types come from inferring the
  router — keep inputs/outputs typed so inference stays accurate; never hand-parse `unknown`.
- One router per module; mount them once at the composition root (version/prefix applied there,
  not per-router).

## Event sourcing (the match core)

Match state is **derived from an ordered event log**, never mutated directly.

- Pipeline: `action → action-to-event → apply-event-to-match`. A validated action becomes an
  **event**; events are appended to the `Event` table (unique `index` per match) and applied to
  rebuild state.
- **All match mutations ship as events.** A new game action = new handler + its `action-to-event`
  mapping + its `apply-event-to-match` case + its `available-sub-actions` entry. No side-channel
  state writes.
- Fog-of-war: filter events per player via `vision-update` / `event-to-emittable` before emitting.
  Never emit raw events that leak hidden information.
- The event log is the source of truth and append-only; treat `index`/`createdAt` ordering as
  invariant.

## Errors

- Domain raises a **typed error** (`DispatchableError`) for expected, classifiable failures
  (illegal move, not your turn, validation). Transport catches and maps to `TRPCError` with the
  right code.
- Each procedure owns the errors it can classify and maps them itself; don't lean on a catch-all
  for failures you could name. Unexpected errors → generic 500; never leak stack traces or internal
  state.

## Infrastructure

- **DB access via Prisma only**, behind `src/server/adapters` (+ `src/server/prisma`). Keep
  persistence logic out of resolvers and out of the domain. **Map Prisma rows ↔ domain entities at
  this boundary** — domain never sees `@prisma/client`.
- **WebSocket emission** goes through `src/server/emitter` — don't reach into socket internals from
  a resolver.
- **Live-match state** lives in `match-store` / `*-match-index`; treat it as the in-memory cache of
  the event log, rebuilt on boot.
- **Config from env only** (`.env`). No hardcoded secrets, hosts, or ports.

## Logging

- **Use the shared logger, never `console.*`.** Import `logger` (or `createLogger("prefix")`) from
  `shared/utils/logger` — it's level-gated and isomorphic (the engine runs on the FE too). No stray
  `console.log` in committed code.
- **Pick the level by intent:** `debug` for per-action/per-move hot-path traces (silent in prod),
  `info` for lifecycle transitions (boot, rebuild, shutdown), **`warn`** for expected failures
  (validation, not-found, illegal action), **`error`** for unexpected ones (DB down, unhandled).
- **Configurable via env:** `LOG_LEVEL` (server/engine) and `NEXT_PUBLIC_LOG_LEVEL` (browser).
  Default is `warn` in production, `debug` otherwise, so prod views stay quiet unless opted in.
- Log around I/O and meaningful domain transitions: identify the operation + key ids. Don't log
  secrets or full request bodies.

## Adding a feature (the standard flow)

1. Create/extend the module folder `src/server/<feature>/`.
2. Define the feature's `zod` schemas in `schemas.ts`.
3. Implement the entry point in `<feature>.usecase.ts` — deps via constructor; methods read as
   intent.
4. Only if needed: add `dbo.ts` for non-trivial Prisma access, `validators.ts` for heavy
   validation, `build.ts` for entity construction.
5. Bind transport in `router.ts` (thin: validate → call usecase → map errors → return).
6. Wire the usecase and mount the router at the composition root.
7. Add tests — usecase logic where it carries weight, engine logic pure (no DB/network).

## Testing

- The engine is the priority to test, and (in the target) it's pure: damage, movement, weather, CO
  hooks/powers, and **event application**. Feed plain domain state in, assert derived state /
  emitted events out — **no DB, no network**. Pattern: `src/tests/calculate-damage-test.ts`.
- Cover each new action handler's event mapping and its apply case.
