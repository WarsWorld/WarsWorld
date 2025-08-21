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

### Technology Stack

- **Frontend**: Next.js 14 (Pages Router), React 18, TypeScript 5
- **Game Rendering**: Pixi.js 7 (WebGL-based 2D graphics)
- **Styling**: Tailwind CSS + SCSS modules
- **API Layer**: tRPC v10 (type-safe API), WebSocket (real-time events)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v4
- **Development**: Node.js 21+, tsx for TypeScript execution
- **Testing**: Custom tsx-based test scripts

### Key Dependencies

- **@headlessui/react**: Accessible UI components
- **@tanstack/react-query**: Server state management
- **bcrypt**: Password hashing
- **zod**: Runtime type validation and schemas
- **superjson**: JSON serialization with Date/BigInt support
- **ws**: WebSocket implementation

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

### Background Jobs and Queues

Currently, the system uses:
- **In-memory match store** for active games
- **WebSocket connections** for real-time updates
- **No traditional job queue** - all processing is synchronous or event-driven

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

## Infrastructure

### Deployment Architecture

```
Production:
├── Next.js App (Port 3000)
│   └── Serves React app and API routes
├── WebSocket Server (Port 3001)
│   └── Real-time game events
└── PostgreSQL Database
    └── Persistent storage

Development:
├── Next.js Dev Server (Port 3000)
├── WebSocket Dev Server (Port 3001)
├── Prisma Studio (Port 5555)
└── Docker PostgreSQL (Port 5432)
```

### External Services and Integrations

- **Authentication Providers**: OAuth support via NextAuth
- **Database**: PostgreSQL (local Docker or cloud)
- **No external APIs required** for core gameplay

### Environment Configurations

```env
# Required Environment Variables
DATABASE_URL=postgresql://user:pass@localhost:5432/warsworld
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Optional
NODE_ENV=development|production
PORT=3001  # WebSocket server port
```

## Development Workflow

### Local Setup Requirements

```bash
# Prerequisites
- Node.js 21+ (required)
- Docker (for PostgreSQL)
- Git

# Initial Setup
1. npm install
2. cp .env.example .env
3. npm run db:up          # Start PostgreSQL
4. npm run prisma:push    # Create schema
5. npm run prisma:seed    # Load test data
6. npm run dev           # Start everything
```

### Testing Strategy

- **Unit Tests**: Custom tsx scripts in `src/tests/`
  - Run individual: `tsx src/tests/calculate-damage-test.ts`
  - No test runner configured (no Jest/Vitest)
- **Type Safety**: TypeScript strict mode + tRPC ensures type safety
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier with consistent config

### Code Conventions

#### TypeScript
- **No `any`**: Enforced by ESLint
- **Prefer type aliases** over interfaces
- **Explicit return types** for public functions
- **Type-only imports** where possible

#### Naming
- **PascalCase**: React components, types, interfaces
- **camelCase**: Variables, functions, methods
- **UPPER_SNAKE_CASE**: Constants
- **kebab-case**: File names for pages/routes

#### Error Handling
- **Never throw strings**: Use Error objects
- **Custom errors**: Extend DispatchedError
- **Preserve error cause**: Include original error

#### React/Next.js
- **No prop-types**: TypeScript only
- **No React import**: Not needed in JSX files
- **Client components**: Mark with 'use client' when needed

## Common Tasks

### Adding a New Unit Type

1. **Define unit in** `src/shared/types/unit-type.ts`
2. **Add damage values** in `src/shared/data/damage-charts/`
3. **Create sprite assets** in `public/assets/`
4. **Update unit factory** in `src/shared/schemas/unit.ts`
5. **Add rendering logic** in `src/pixi/classes/Unit.ts`

### Adding a New CO (Commanding Officer)

1. **Create CO definition** in `src/shared/COs/[name]/`
2. **Define passive abilities** in day-to-day effects
3. **Implement powers** in power/super power functions
4. **Add to CO index** in `src/shared/COs/index.ts`
5. **Create portrait assets** in `public/assets/COs/`

### Adding a New Game Action

1. **Define action type** in `src/shared/types/action.ts`
2. **Create validation** in `src/shared/match-logic/validation/`
3. **Implement execution** in `src/shared/match-logic/events/`
4. **Add to action router** in `src/server/routers/action.ts`
5. **Create UI handler** in `src/frontend/commands/`

### Debugging Tips

#### Game State Issues
```typescript
// Check match state in browser console
window.__MATCH_STATE__ // If exposed
// Or use React DevTools to inspect MatchContext

// Server-side debugging
console.log(matchWrapper.serialize()) // Full state
console.log(matchWrapper.getCurrentPlayer()) // Active player
```

#### WebSocket Connection
```typescript
// Monitor WebSocket in browser DevTools
// Network tab → WS → Check frames

// Server logs
DEBUG=ws npm run dev:wss // Enable WebSocket debug logs
```

#### Database Queries
```bash
# Use Prisma Studio for visual debugging
npm run prisma:studio

# Enable query logging
# Set in Prisma client: log: ['query']
```

### Performance Considerations

#### Frontend Optimization
- **Pixi.js Batching**: Sprites are automatically batched
- **React Memoization**: Use React.memo for game components
- **Lazy Loading**: Dynamic imports for heavy components

#### Backend Optimization
- **Match Store**: In-memory cache for active games
- **Event Batching**: Group WebSocket broadcasts
- **Database Indexes**: Ensure proper indexes on frequently queried fields

#### Game Logic
- **Pathfinding Cache**: Reuse calculated paths
- **Damage Precalculation**: Cache damage charts
- **State Serialization**: Minimize JSON payload size

## Architecture Decisions

### Why Next.js Pages Router (not App Router)
- Stable WebSocket integration
- Simpler tRPC setup
- Better documented patterns for game applications

### Why Pixi.js for Rendering
- Hardware-accelerated 2D graphics
- Sprite batching for performance
- Rich ecosystem for game development

### Why Event Sourcing for Game State
- Complete audit trail of all actions
- Easy replay/spectator mode
- Simplified state synchronization

### Why tRPC over REST/GraphQL
- End-to-end type safety
- No code generation needed
- Seamless TypeScript integration

## Future Considerations

### Scalability Path
- **Redis** for match state caching
- **Horizontal scaling** with sticky sessions
- **CDN** for static assets
- **Database read replicas** for analytics

### Feature Roadmap Preparation
- **Replay System**: Already supported by event store
- **Spectator Mode**: WebSocket rooms structure supports it
- **Tournament System**: MMR and league types foundation exists
- **Mobile Support**: Pixi.js works on mobile, needs UI adaptation

## Getting Help

- **Documentation**: See `/docs` folder (if exists)
- **Type Definitions**: Explore via TypeScript LSP
- **Database Schema**: Run `npm run prisma:studio`
- **Real-time Debugging**: Browser DevTools + React DevTools
- **Community**: Check GitHub issues and discussions