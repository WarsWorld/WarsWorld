### Critical analysis of PvC plan in context of this codebase

#### TL;DR

- **Overall fit**: Directionally solid. Reuse of existing action/event pipeline and server-side AI is correct. However, a few key integration points need rethinking to respect module boundaries and auth, and to avoid blocking/loops.
- **Biggest changes needed**: (1) Trigger AI from server router/service layer after a stored PassTurn event, not from shared handlers. (2) Provide an authenticated identity for the computer or a privileged server-only execution path for actions. (3) Extract pathfinding utilities from `src/pixi` to `src/shared` for reuse on server. (4) Consider a lightweight in-process turn worker/queue to prevent re-entrancy and runaway loops.

---

### 1) Does the plan fully address the user requirements?

- **End-to-end PvC with trivial AI v0**: Mostly yes. Building one Infantry per base, moving one Infantry randomly, then passing turn can be expressed using existing `build`/`move`/`passTurn` actions validated by shared logic.
- **Clean integration with rules/UI/persistence**: Reusing `validate*ToEvent`, `apply*Event`, and WebSocket emission in `actionRouter.send` aligns with the architecture. Frontend already reacts to backend-emitted events.
- **Determinism/auditability**: Events are persisted (`prisma.event.create`) and replayed in `matchStore.rebuild`. Storing the concrete move path and build choice in events is sufficient for replay. No extra decision logs are strictly required for determinism, though optional structured logs could help debugging.
- **Data model flags**: Adding `Match.mode` and `Player.kind` satisfies the explicit requirement, but it’s not strictly required for a v0 if you seed a computer `User`/`Player` and infer PvC from participants.

Gaps:

- **Where to run AI and how to invoke the pipeline** is underspecified. The current router enforces auth/turn ownership (`playerInMatchBaseProcedure`); an AI cannot call that path. The plan should define a server-internal execution path that mirrors `actionRouter.send` steps safely.
- **Trigger placement**: Hooking AI from `shared/match-logic/events/handlers/passTurn.ts` violates the project’s module boundary rules. This needs relocation to server layer.

### 2) Edge cases and risks not considered

- **Auth/identity for AI**:
  - Router requires an authenticated `currentPlayer` owning the turn. Options:
    - Seed a dedicated `User` + `Player` for the computer and bypass the router by invoking a server-side action executor function; or
    - Create a privileged server-only executor that reuses validation and emission without going through tRPC input/middleware.
- **Re-entrancy/infinite loops**:
  - AI generates actions, which may emit another `passTurn` and immediately trigger AI again. Guard with a per-match "AI turn in progress" lock and max-steps per AI turn.
  - Ensure AI runs async (non-blocking) after persisting/emit to avoid blocking client mutations.
- **Concurrency**:
  - Two clients or timers racing with AI actions could interleave. Use a per-match mutex/queue to serialize actions.
- **Fog of war/vision correctness**:
  - `getAccessibleNodes` (currently in `src/pixi`) considers all enemy units as blocking regardless of vision. For server-side legality this is fine, but if the AI needs to emulate imperfect information later, a vision-filtered variant will be needed. For v0, full-information is acceptable.
- **Movement/path reconstruction**:
  - `moveActionToEvent` requires a full `path` including the origin and validates fuel and movement points. The AI must reconstruct a legal path from accessible nodes; extracting that logic server-side is necessary.
- **Turn-state preconditions**:
  - `moveActionToEvent` checks `unit.data.isReady`. If AI selects a unit that has already moved, it will fail. AI must filter on `isReady`.
  - Joining/loading/attack subevents: AI should pick `subAction: { type: "wait" }` for simple moves or be prepared to accept auto-wait for joins/loads.
- **Build economics and placement**:
  - Must check funds and property ownership via shared wrappers. Ensure build tile is unoccupied and spawning rules are enforced by the existing `buildActionToEvent`.
- **Match setup flow**:
  - `match.join` is only for authenticated users. Adding the computer player at creation time requires server-side modification of `playerState` via `match.addUnwrappedPlayer` and persisting.
- **Spectator/event emission**:
  - Emission currently targets team players only when `teamIndex >= 0` in `actionRouter.send`. Spectators are not handled. Ensure AI-generated events follow the same path and do not regress spectator behavior (branch name hints recent fixes).
- **Timers/eliminations**:
  - Plan mentions timeout protection for AI loops, but not integration with existing or future turn timers/elimination events.

### 3) Technical approach optimality

- **Server-side AI execution**: Correct for security and consistency.
- **Reuse action/event pipeline**: Optimal. But instead of calling the tRPC mutation, factor out the core steps of `actionRouter.send` into a reusable server function (e.g., `performAction(match, action)`) used by both router and AI. This avoids duplicating the 10-step ordering and keeps one source of truth.
- **Trigger location**: Prefer triggering AI from the server layer after a persisted PassTurn event, not in shared handlers. Two practical choices:
  - In `actionRouter.send`, after step 10 (persist), if `mainEventWithoutSubEvent.type === "passTurn"`, schedule AI execution.
  - Or, register a small event bus in server emitting on stored events and subscribe an AI orchestrator.
- **Movement logic extraction**: Move `getAccessibleNodes` and minimal path reconstruction helpers from `src/pixi/show-pathing.ts` to `src/shared/match-logic/pathfinding.ts` and update imports. This reduces duplication and respects module rules.
- **Data model changes**:
  - Adding enums (`Match.mode`, `Player.kind`) is fine, but for v0 you can avoid migrations by seeding a `User`/`Player` named "Computer" and treating its presence as PvC. Migrations are slightly heavier operationally.
- **AI orchestration**:
  - Implement a per-match async worker (simple in-memory lock/queue in the WSS process) to serialize AI actions and enable retry/timeouts. This prevents overlapping server writes and event storms.

### 4) What could fail and how to mitigate

- **Deadlocks/re-entrancy**: AI triggers itself on consecutive PassTurn events leading to rapid loops. Mitigate with per-match lock and a max actions-per-turn guard.
- **Blocking the mutation response**: Doing AI work synchronously inside the mutation delays client UX. Offload to `setImmediate`/queue after persistence.
- **Auth failures**: Attempting to use `action.send` as AI will be rejected by `playerInMatchBaseProcedure`. Use an internal executor that bypasses that middleware.
- **Module boundary violations**: Triggering AI from `shared` would import server code into shared. Keep triggers in `src/server/**`.
- **Pathfinding mismatch**: If the AI keeps using the client-only `show-pathing.ts` implementation, server and client could diverge. Extract to shared and write a minimal test to validate `calculatePathDistance` and legality across weather/terrain.
- **Data migrations/regressions**: Adding enums requires backfilling. Ensure `Match.mode` defaults to `pvp` and `Player.kind` defaults to `human`. Write idempotent seed for computer `User`/`Player` if using that route.
- **Event emission shape**: Ensure AI-generated events still go through `mainEventToEmittables` and `fillDiscoveredUnitsAndProperties` so FoW stays consistent.

### Concrete recommendations (edits and files)

- **Do not trigger AI in `src/shared/match-logic/events/handlers/passTurn.ts`**. Instead:
  - Add `src/server/services/ai-service.ts` implementing `runAiTurn(matchId: string)` using shared validators/appliers.
  - Extract the common steps in `actionRouter.send` into a server utility (e.g., `src/server/services/perform-action.ts`) so AI can perform actions without tRPC auth.
  - In `src/server/routers/action.ts`, after persisting and emitting, if the main event is `passTurn`, schedule `runAiTurn` if `nextTurnPlayer` is computer.
- **Pathfinding**:
  - Move `getAccessibleNodes`, `calculatePathDistance`, and minimal path reconstruction from `src/pixi/show-pathing.ts` to `src/shared/match-logic/pathfinding.ts`. Update imports in Pixi and use the shared functions in AI.
- **Identity**:
  - Short-term: seed a `User` and `Player` for the computer; create/join it server-side during match creation (`src/server/routers/match/create.ts`) and set `hasCurrentTurn` appropriately when the match starts.
  - Longer-term: add `Player.kind` and `Match.mode` enums to Prisma with defaults and backfill.
- **Safety**:
  - Implement a per-match mutex (in `matchStore` or a small `Map<matchId, Promise>` lock) and a max step counter for each AI turn.
  - Log AI decisions server-side with matchId, action, and chosen positions to aid debugging.

### Verdict

- The plan is solid but needs key adjustments for auth, trigger placement, and code sharing to fit this repository’s boundaries and middleware. With those changes, v0 PvC can integrate cleanly with minimal risk and pave the way for future AI improvements.
