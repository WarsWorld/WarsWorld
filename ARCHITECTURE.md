# WarsWorld Architecture Documentation

## Overview

WarsWorld is a modern web-based implementation of the Advance Wars turn-based strategy game series. It features real-time multiplayer gameplay, comprehensive unit mechanics, and support for multiple game versions (AW1, AW2, AWDS).

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                          │
├─────────────────────────┬───────────────────────────────────────┤
│      Next.js App        │        WebSocket Client               │
│    (React + Pixi.js)    │      (Real-time Events)              │
└───────────┬─────────────┴──────────────┬────────────────────────┘
            │                            │
            │ tRPC/HTTP                 │ WebSocket
            │                            │
┌───────────▼─────────────┬──────────────▼────────────────────────┐
│   Next.js API Routes    │     WebSocket Server (WSS)            │
│    (tRPC Endpoints)     │   (Game State Broadcasting)           │
├─────────────────────────┴───────────────────────────────────────┤
│                     Business Logic Layer                        │
│   (Game Rules, Unit Mechanics, CO Powers, Pathfinding)         │
├──────────────────────────────────────────────────────────────────┤
│                    Prisma ORM + PostgreSQL                      │
│         (Players, Matches, Maps, Events, Chat, MMR)            │
└──────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
WarsWorld/
├── prisma/                 # Database schema and migrations
│   ├── schema.prisma      # Database models
│   └── seed.ts            # Seed data scripts
├── public/                # Static assets (images, fonts)
├── src/
│   ├── components/        # React components
│   │   ├── client-only/   # Pixi.js-dependent components
│   │   └── ...           # Shared UI components
│   ├── frontend/         # Frontend-specific logic
│   │   ├── commands/     # User input commands
│   │   ├── hooks/        # React hooks
│   │   └── theme/        # Theme configuration
│   ├── pages/            # Next.js pages (routes)
│   │   ├── api/         # API routes
│   │   ├── auth/        # Authentication pages
│   │   ├── match/       # Game match pages
│   │   └── ...          # Other pages
│   ├── pixi/            # Pixi.js game rendering
│   │   ├── classes/     # Game object classes
│   │   ├── show-*.ts    # Rendering functions
│   │   └── textures/    # Texture management
│   ├── server/          # Backend logic
│   │   ├── routers/     # tRPC API routers
│   │   ├── emitter/     # Event emitter system
│   │   └── prisma/      # Database utilities
│   ├── shared/          # Shared game logic
│   │   ├── COs/         # Commanding Officers
│   │   ├── match-logic/ # Core game mechanics
│   │   ├── schemas/     # Zod validation schemas
│   │   └── types/       # TypeScript type definitions
│   └── tests/           # Test files
├── styles/              # Global styles
└── bundleServer.mjs     # Server bundling config
```

### Module Boundaries and Responsibilities

#### Frontend Modules (`src/frontend/`, `src/components/`, `src/pages/`)
- **Responsibility**: User interface, game rendering, user input handling
- **Dependencies**: Can import from `shared/` for game logic
- **Restrictions**: Cannot import server-side code

#### Server Modules (`src/server/`)
- **Responsibility**: API endpoints, database operations, authentication, WebSocket handling
- **Dependencies**: Full access to database via Prisma
- **Restrictions**: Cannot import frontend-specific code or Pixi.js

#### Shared Modules (`src/shared/`)
- **Responsibility**: Core game logic, type definitions, validation schemas
- **Dependencies**: Must be isomorphic (work on both client and server)
- **Restrictions**: 
  - Cannot import from server or frontend folders
  - No Prisma runtime imports (type-only imports allowed)
  - No Pixi.js imports

#### Pixi Modules (`src/pixi/`)
- **Responsibility**: WebGL rendering, sprite management, visual effects
- **Dependencies**: Can use Pixi.js and shared game logic
- **Restrictions**: Must be client-side only

### Data Flow

1. **User Action** → React Component → tRPC Client → HTTP Request
2. **API Processing** → tRPC Router → Business Logic → Prisma → PostgreSQL
3. **Real-time Updates** → WebSocket Server → Broadcast to Clients
4. **Game State Sync** → Event Store Pattern → Replay Events for State

## Key Components

### Critical Models and Relationships

```typescript
// Core Domain Models
User (1) ─────── (∞) Player (identity/profile)
Player (∞) ───── (∞) Match (many-to-many)
Match (1) ────── (∞) Event (game actions)
Match (1) ────── (1) WWMap (game board)
Match (1) ────── (∞) ChatMessage
Player (1) ───── (∞) MMR (per league type)
```

### Core Services

#### Game Engine (`src/shared/match-logic/`)
- **game-entity-wrapper.ts**: Base wrapper for all game entities
- **unit-wrapper.ts**: Unit state management and actions
- **player-wrapper.ts**: Player state and resources
- **match-wrapper.ts**: Match state coordination
- **calculate-damage.ts**: Combat calculations
- **pathfinding.ts**: Movement path calculation

#### API Routers (`src/server/routers/`)
- **match.ts**: Match creation, joining, leaving
- **action.ts**: Game action processing
- **map.ts**: Map CRUD operations
- **user.ts**: User profile management
- **article.ts**: News/blog system

#### WebSocket Server (`src/server/`)
- **main-wss-development.ts**: Development WebSocket server
- **main-production.ts**: Production server setup
- **match-store.ts**: In-memory match state cache

#### Event System
- **Event Store Pattern**: All game actions stored as events
- **Event Replay**: Reconstruct game state from event history
- **Real-time Broadcasting**: WebSocket events to all match participants

### API Endpoints (tRPC Procedures)

#### Match Router
- `match.create` - Create new match
- `match.join` - Join existing match
- `match.leave` - Leave match
- `match.getById` - Get match details
- `match.list` - List available matches
- `match.updateRules` - Update match settings

#### Action Router
- `action.performAction` - Execute game action
- `action.validateAction` - Check if action is legal
- `action.getAvailableActions` - Get possible actions

#### Map Router
- `map.create` - Create custom map
- `map.getById` - Get map details
- `map.list` - List available maps

## Database Design

### Schema Overview

```sql
-- Core Tables
User                 -- Authentication and account
Player               -- Game identity/profile
Match                -- Game instance
Event                -- Game action history
WWMap                -- Game board definition
ChatMessage          -- In-game communication
MMR                  -- Matchmaking rating

-- Relationships
ArticleAuthors       -- Many-to-many for articles
Notes                -- Player notes per match
Clan                 -- Player groups

-- Enums
MatchStatus          -- setup|playing|finished
LeagueType           -- standard|fog|highFunds|etc
UserState            -- active|disabled|banned
Role                 -- admin|moderator
```

### Key Tables and Associations

#### Match Table
- **playerState**: JSON column storing complete game state
- **rules**: JSON column with match configuration
- **status**: Enum tracking match lifecycle
- **Events**: Ordered list of all game actions

#### Event Table
- **index**: Sequential order within match
- **content**: JSON-encoded game action
- **Composite key**: (matchId, index)

#### WWMap Table
- **tiles**: JSON 2D array of terrain
- **predeployedUnits**: JSON array of initial units
- **Immutable**: Maps are versioned, not edited

### Migration Strategy

- **Prisma Migrate**: Schema migrations via `prisma migrate`
- **Push for Development**: `prisma db push` for rapid iteration
- **Seed Data**: `prisma db seed` for test data
- **JSON Types**: Custom generator for TypeScript types from JSON columns