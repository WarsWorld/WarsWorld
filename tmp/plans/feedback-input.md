# Player vs Computer Mode Implementation Plan

## Original User Request

Feature: Add "Player vs Computer" Mode to Advance Wars OSS

Read first: @ARCHITECTURE.md and any files it references that define the game loop, user/player models, command bus/event system, map/unit rules, and frontend event handling.

### Goals

Introduce a Player vs Computer (PvC) game mode that works end-to-end with a trivial AI (v0). The AI behavior for this first version is intentionally simple:

1. Each AI turn, if funds allow, build exactly one Infantry on each owned 'factory' on the map (production tiles)
2. Move one Infantry: pick one of the AI's infantry units and randomly move it to a legal tile (respecting movement rules/terrain/ownership/zone-of-control if implemented).
3. End turn when neither (1) nor (2) is possible.

This must integrate cleanly with the existing rules engine, UI update flow, and persistence. Do not implement a strong AI; focus on plumbing and correctness.

### Non-Goals (for v0)

- Pathfinding heuristics, combat evaluation, fog-of-war planning, multi-unit tactics.
- New unit types or rule changes.
- Multiplayer/Netcode changes beyond what is necessary to support PvC.
- UI design overhaul; only minimum additions to start a PvC match and to visualize the AI's actions.

### High-Level Requirements

- Add a new Match mode flag: Match.mode = :pvc | :pvp | :ai_vs_ai (prepare for :ai_vs_ai for testing).
- Introduce a Computer Player identity that plugs into existing Player/User logic with minimal branching.
- Ensure the turn engine can execute AI turns automatically without manual frontend input.
- Reuse existing rules/validators for: legal purchases, spawn rules, move range, occupancy, and end-turn legality.
- Frontend continues to react to backend-emitted events (no tight coupling to AI logic on the client).
- Deterministic, auditable AI decisions: log decisions as domain events for replay/debug.

### Data Model & Schema Changes

Player

- Add kind: :human | :computer (enum).

Match

- Add mode: :pvp | :pvc | :ai_vs_ai

Migrations

- Backfill existing matches with mode = :pvp, players.kind = :human.

### Focus Areas

We want to focus on:

- What changes needs to be done to the user/player models
- How to integrate this mode as smoothly as possible into the UI (idea: we could create a "computer" player, if we start a game with this player, it will automatically be a player VS computer)
- How the computer will take action? Currently the frontend waits for user input and request to the backend, we need the computer to take actions just as in Advance Wars player VS computer mode. The frontend can already respond to events emitted by the backend when a player takes an action to update the UI, we probably need to reuse this.
- How the computer will get available tiles when moving a unit? The UI is already displaying allowed tiles when we select a unit, so we probably need to re-use the part of the code that identifies allowed tiles for a given unit (and randomly pick one for now)
- Think about other aspects I could be missing

## Detailed Implementation Plan

### Overview

Add a Player vs Computer (PvC) mode with a simple AI that:

1. Builds one Infantry per factory when funds allow
2. Randomly moves one Infantry per turn
3. Ends turn when no actions possible

### Key Architecture Insights

**Current Flow:**

- Frontend sends actions via tRPC to backend (`action.send`)
- Backend validates, creates events, applies to match state
- Backend emits events to players via WebSocket
- Frontend subscribes to events and updates UI accordingly

**Key Components:**

- `getAccessibleNodes()` in `src/pixi/show-pathing.ts` calculates available movement tiles
- Build/move/passTurn actions are validated and converted to events
- Events are broadcast to players in real-time via WebSocket

### Implementation Strategy

#### 1. Database Schema Changes

- Add `PlayerKind` enum to Player model: `human | computer`
- Add `MatchMode` enum to Match model: `pvp | pvc | ai_vs_ai`
- Migration to backfill existing data as `human` and `pvp`

#### 2. Computer Player System

**Create special "Computer" player:**

- Fixed player ID (e.g., "computer-player-001")
- No associated User account
- Identifiable by `kind: computer` flag
- Can join matches like any player

#### 3. AI Turn Execution (Server-Side)

**Location:** New service `src/server/services/ai-service.ts`

- Triggered after PassTurn event when next player is computer
- Executes AI logic sequentially:
  1. Check factories, build Infantry if funds allow
  2. Find one Infantry, calculate movement options (reuse `getAccessibleNodes` logic)
  3. Randomly select valid tile and move
  4. Send PassTurn action
- Actions sent through existing action processing pipeline
- Events automatically broadcast to human players

#### 4. Match Creation Flow

**UI Changes:**

- Add "Play vs Computer" button on match creation
- When selected, automatically adds computer player to match
- Sets match mode to `pvc`

**Alternative approach (user's suggestion):**

- Show "Computer" as a selectable player in lobby
- Starting match with Computer player triggers PvC mode

#### 5. Frontend Updates

- No changes needed for event handling (already reactive)
- Computer actions appear like any other player's actions
- Consider adding visual indicator for computer player (e.g., "CPU" badge)

#### 6. Turn Management Integration

**Hook into PassTurn handler:**

- After applying PassTurn event, check if new current player is computer
- If yes, trigger AI service to execute turn
- AI actions generate events that flow through normal pipeline

### Technical Decisions and Trade-offs

1. **Server-side AI execution:**

   - Pro: No client computation, secure, consistent
   - Con: Server load increases with AI players
   - Decision: Server-side is correct for consistency and security

2. **Reusing existing action pipeline:**

   - Pro: No duplicate validation logic, automatic event generation
   - Con: AI must format actions like frontend would
   - Decision: Reuse pipeline for consistency

3. **Computer as special Player vs separate entity:**

   - Pro: Minimal code changes, works with existing systems
   - Con: Computer player needs special handling in some places
   - Decision: Computer as Player with `kind` flag

4. **Movement calculation:**
   - Pro: Can port `getAccessibleNodes` logic to server
   - Con: Code duplication between frontend and backend
   - Decision: Extract shared movement logic to `src/shared/`

### File Changes Required

1. `prisma/schema.prisma` - Add enums and fields
2. `src/server/routers/match.ts` - Handle computer player joining
3. `src/server/services/ai-service.ts` - New AI logic
4. `src/shared/match-logic/events/handlers/passTurn.ts` - Trigger AI
5. `src/components/MatchList.tsx` - Add PvC creation option
6. `src/shared/types/` - Update types for new enums
7. `src/shared/match-logic/pathfinding.ts` - Extract movement logic

### Potential Risks and Mitigations

1. **Risk:** AI turn processing blocks other matches

   - Mitigation: Use async processing, add timeout limits

2. **Risk:** AI gets stuck in infinite loop

   - Mitigation: Max actions per turn, timeout protection

3. **Risk:** Frontend doesn't update properly for AI moves

   - Mitigation: Test event flow thoroughly, add logging

4. **Risk:** Computer player breaks existing match logic
   - Mitigation: Minimal changes, extensive testing

### Benefits of This Approach

- Minimal changes to existing codebase
- Reuses all validation and event systems
- Computer actions are auditable via event log
- Frontend automatically handles computer moves
- Easy to extend AI complexity later
