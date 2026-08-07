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

## Action queue (connection resilience)

Because every action is validated on the BE, the FE must tolerate round-trips and dropped
connections:

- **Queue actions locally**, submit to the BE, and reconcile against the **authoritative result**.
  Show the move optimistically as a _preview_, but the BE's response is the truth — if it differs,
  reconcile to the BE state (the BE owns conflict resolution).
- On reconnect, **resync** from the authoritative event stream before accepting new local input.
  It's a turn-based game, so prefer correctness over hiding latency.

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
