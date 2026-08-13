# Frontend Rules

Scope: `src/frontend/**`, and the same conventions apply to `src/pages/**`, `src/components/**`,
and the Pixi rendering layer `src/pixi/**`. Read the root [`/CLAUDE.md`](../../CLAUDE.md) first
(core decisions + the `src/shared` migration map).

## The frontend is a thin, server-authoritative client

The backend owns all rules, knowledge, and state. The FE **renders previews and submits intent** —
it decides nothing.

- **Never run the engine on the client.** No damage math, no move/attack validation, no event
  application, no embedded game constants. If you're importing rules/wrappers to compute an
  outcome, stop — ask the BE instead.
- **Get previews from the BE.** Available actions, reachable tiles, attack ranges, damage previews
  and resulting state come from tRPC queries / the WS subscription. The FE draws what the BE sends.
- **No backend/domain imports.** The only contract across the boundary is the tRPC API. Client
  types come from **tRPC type inference** (and subscription outputs) — never `import … from
"shared/…"` or from `src/server`. `src/shared` is being removed; don't add new references to it.

## Action buffer & reconciliation (locked design)

The FE never stores authoritative game state (that's what makes it drift and desync). It stores
exactly two things and rebases on the BE:

1. **Turn snapshot** — handed over by the BE at the _start of the player's turn_. It carries
   everything needed to buffer simple actions with **zero rules knowledge** on the client:
   - per owned unit: its **reachable move tiles**. Computed over the player's **visible** state —
     a fog-hidden enemy must **not** shrink the reachable set (that would leak its position). The
     real block is discovered only at execution (see fog-failure below).
   - **capture**: which units can capture (infantry/mech only), their current capture points + rate.
   - **production**: current **funds** and the **unit price table** (which base builds what).
   - vision / fog state.
2. **Action buffer** — the ordered stack of the player's intent, applied optimistically on top of
   the snapshot as **pure presentation deltas** (no engine, no rules):
   - **move** → slide the sprite to a tile in that unit's snapshot reachable set.
   - **capture** → mark capturing, tick points at the unit's known rate.
   - **production** → place the unit, subtract the price-table cost from local funds.

**Attack is never resolved on the client** — combat (damage, luck, counterattack) is BE-only. Buffer
the attack, submit it, and **serialize on attacks**: an unresolved attack blocks the _next attack_
until the BE returns its resolution, but moves / captures / production keep buffering optimistically
alongside it.

**Reconciliation** (the FE stack is the source of truth for _intent_; the BE for _rules_):

- Replay the buffered stack against authoritative BE state; the BE rules each action.
- **Fog move failure**: when a buffered move fails (a hidden enemy was in the way), apply moves up
  to **and including** the first one that fails, then **cancel every buffered action after it**.
- **Reachability staleness**: validate buffered moves against the **turn-start snapshot only**; let
  the BE reconcile within-turn conflicts (occupied tile, blocked path) via the fog-failure rule —
  don't re-run pathfinding on the client.
- **BE-wins cutover**: when the player can't submit their turn (hard disconnect, or — later — the
  turn timer elapses), **discard the buffer and show BE state**. The opponent already moved against
  state only the BE knew, so replaying local intent is meaningless. Structure the reconciliation so
  a **per-turn timer** can drive this cutover; do not implement the timer yet.

This makes desync impossible by construction: the client is always `BE snapshot + pending intent`,
never a second authoritative copy. See `src/frontend/utils/action-queue.ts` for the buffer reducer.

## Layout

```
src/pages/**            Next.js routes (match, match2, home, players, articles, leaderboard, …)
src/frontend/components feature-grouped UI (auth, match, navbar, modals, leaderboards, news, …)
src/frontend/context    React context providers (cross-cutting client state)
src/frontend/utils      shared client helpers — home for cross-cutting client logic
src/frontend/styles     global styles / Tailwind layers
src/components          generic/shared + client-only components
src/pixi                PixiJS game board (WebGL) — rendering & input only
```

- Group components by **feature/domain**, mirroring existing folders. Promote to `src/components`
  only when genuinely shared. Match existing file-naming per folder.

## Pixi rendering boundary

- `src/pixi` owns the canvas: rendering BE-provided state and previews, sprites, input. Keep it
  **decoupled from React** (data in, events out) — and decoupled from the engine: it renders the
  available-actions/range/preview data the BE computed, it doesn't compute them.
- Board actions go through the same tRPC action endpoints as the rest of the app — the board is a
  view, not a second source of truth.

## Styling

- **Tailwind, classes inline.** No CSS-in-JS. Share repeated patterns via components. Global
  tokens/layers live in `src/frontend/styles`.

## Cross-cutting helpers (centralise, don't inline)

- Put shared formatting/derivation in `src/frontend/utils` and reuse it; don't re-inline.
- **Date/time is deterministic and centralised.** Don't sprinkle `new Date(...)` /
  `toLocaleString(...)` through components; route timestamp formatting through one helper module.
  Treat wire timestamps as the source of truth and format at the edge.

## Config

- Only `NEXT_PUBLIC_*` env vars are available in the browser (`NEXT_PUBLIC_WS_URL`,
  `NEXT_PUBLIC_APP_URL`). Never read non-public env in client code; never embed secrets.

## Testing

- Test pure client logic — reducers, formatters, the action queue/reconciliation — in isolation.
- For any date/time helper, **pin `process.env.TZ`** in setup so assertions are deterministic.
  Prefer Vitest if/when a runner is wired up (none yet — see root CLAUDE.md).
