# Backend / API & Game Engine Rules

Scope: `src/server/**`. This is where the **game engine lives** in the target architecture — the
backend is server-authoritative and owns all rules, knowledge, and state. Read the root
[`/CLAUDE.md`](../../CLAUDE.md) first (core decisions + the `src/shared` migration map).

## Layers

Feature-sliced, with one narrow shared domain — the game engine.

```
src/server/<feature>  FEATURE   router + schemas + logic per feature: auth, articles, players,
                                ranking, maps, matches. Thin vertical slices.
src/server/domain     DOMAIN    THE GAME ENGINE only: gameplay rules, match state, event sourcing,
                                game-presentation vocabulary. Framework-free, Prisma-free.
src/server/trpc       TRANSPORT procedures, middleware (auth/player/match), context
src/server/adapters   INFRA     Prisma access + row↔domain mappers, WS emitter, live-match store
src/server/prisma     INFRA     Prisma client
```

**Engine scope is strict.** `domain` holds only what is directly about the game and how it's
presented to the user. Accounts, articles, preferences, ranking, and **map management** are
features, not engine. (The `maps` feature owns the `WWMap` entity + CRUD and _depends on_ the
engine's tile/terrain vocabulary; the vocabulary itself stays in `domain`.)

**Feature modules** are thin: a router, its `zod` schemas, and its logic. Only the game has a rich
domain (the engine). A feature may depend on `domain` (e.g. `maps`, `matches`) and on `adapters`,
but **features never import each other** — cross-feature needs go through a narrow interface.

> Today the engine + every feature's schema still live in `src/shared`, and engine entities import
> `@prisma/client`. Target: engine → `src/server/domain` (Prisma-free), each feature's schema →
> `src/server/<feature>`. New/edited code follows the target, not the current coupling. See the
> root migration map.

## Module anatomy (mirrors our Python backend)

Every module under `src/server/<module>/` is a vertical slice with a **Usecase as its entry point**
— the same shape as our Python services (`<domain>/<domain>.py` + optional `dbo.py`/validators).
The **game engine is one such domain module** (the richest one); features are leaner modules.

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
- **Features never import each other** — only `domain` (the engine) and `adapters`, plus other
  features through their usecase interface.

### The game engine as a domain module

- It is **pure**: gameplay rules + state + event sourcing, Prisma-free, no `dbo` (it does no I/O).
  Its usecase is the engine's public API (apply an action → events, compute available actions /
  previews, derive state).
- **Persistence of engine output lives in the `matches` module's `dbo`** (load/append the `Event`
  log, hydrate state), not in the engine. The engine computes; the feature persists.
- The engine usually has **no router of its own** — it's consumed by the `matches` (and `maps`)
  usecases. Expose engine results to the client through those features' routers.

**Dependency direction (load-bearing):**

- **Domain imports nothing outward** — no `src/server/routers`, no `src/pages/frontend/pixi`, no
  `@prisma/client`, no framework. It defines the entity types it needs; adapters map persistence to
  them.
- Inner layers never import outer ones. Transport may import domain + infra; domain imports neither.
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

- Log around I/O and meaningful domain transitions: identify the operation + key ids, log success
  on the happy path, **warn** on expected failures (validation, not-found, illegal action),
  **error** on unexpected ones (DB down, unhandled). Don't log secrets or full request bodies; no
  stray `console.log` in committed code.

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
