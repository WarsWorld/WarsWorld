# MapWrapper Data Format Specification

## Overview

The `MapWrapper` class encapsulates map data for WarsWorld, an Advance Wars-inspired strategy game. Maps are stored as JSON in PostgreSQL and loaded into memory for fast runtime access.

## Core Structure

### Database Schema
```typescript
model WWMap {
  id: String                 // CUID identifier
  name: String               // Map name (e.g., "Caustic Finale")
  tiles: Json                // 2D array of tile objects
  predeployedUnits: Json     // Array of units placed at start
  numberOfPlayers: Int       // 2-4 players
}
```

### MapWrapper Class
```typescript
class MapWrapper {
  data: WWMap               // Raw map data from database
  width: number            // Computed from tiles[0].length
  height: number           // Computed from tiles.length
}
```

## Data Format: JSON

All map data is stored as **JSON** in PostgreSQL's JSONB columns:
- **tiles**: 2D array `[row][column]` of tile objects
- **predeployedUnits**: Array of unit objects with positions

### Coordinate System
- **Position**: `[x, y]` tuple where:
  - `x` = column (0 to width-1)
  - `y` = row (0 to height-1)
  - Origin `[0,0]` is top-left corner

## Tile Types

### 1. Property Tiles (Capturable Buildings)

```json
{
  "type": "base|airport|port|hq|lab|commtower|city",
  "playerSlot": -1  // -1 = neutral, 0-3 = player owned
}
```

| Type | Description | Can Build Units | Special |
|------|-------------|-----------------|---------|
| `base` | Factory | Infantry, Mech, Vehicles | - |
| `airport` | Airport | Air units | - |
| `port` | Port | Naval units | - |
| `hq` | Headquarters | - | Lose if captured |
| `lab` | Laboratory | - | Victory condition |
| `city` | City | - | Income +1000/turn |
| `commtower` | Comm Tower | - | Attack boost |

### 2. Terrain Tiles

#### Basic Terrain
```json
{
  "type": "forest|mountain|shoal|sea|reef|usedSilo|unusedSilo"
}
```

| Type | Movement Cost | Defense Stars | Special |
|------|---------------|---------------|---------|
| `forest` | 2 (inf), 3 (vehicle) | 2 | Hides units in FoW |
| `mountain` | 4 (inf only) | 4 | Vision +3 |
| `shoal` | 1 | 0 | Land/sea border |
| `sea` | - (naval only) | 0 | - |
| `reef` | 2 (naval) | 1 | Hides naval units |
| `unusedSilo` | 1 | 0 | Can launch missile once |
| `usedSilo` | 1 | 0 | Already fired |

#### Plains (with variants)
```json
{
  "type": "plain",
  "variant": "normal|broken-pipe-right-left|broken-pipe-top-bottom"
}
```

### 3. Movement Tiles

#### Roads
```json
{
  "type": "road",
  "variant": "right-left|top-bottom|top-right|right-bottom|..."
}
```
- Variants describe connections: `"top-right-bottom"` = T-junction
- Movement cost: 1 for all ground units

#### Rivers
```json
{
  "type": "river",
  "variant": "right-left|top-bottom|top-right|right-bottom|..."
}
```
- Impassable for vehicles
- Infantry/Mech: movement cost 2

#### Bridges
```json
{
  "type": "bridge",
  "variant": "right-left|top-bottom"
}
```
- Allows ground units over water
- Naval units can pass under

#### Pipes
```json
{
  "type": "pipe",
  "variant": "top|right|bottom|left|top-right|right-bottom|..."
}
```
- Only Pipe Runner units can traverse
- Blocks other units

#### Pipe Seams (Destructible)
```json
{
  "type": "pipeSeam",
  "variant": "right-left|top-bottom",
  "hp": 99  // Can be destroyed
}
```

## Unit Data Format

### Basic Unit Structure
```json
{
  "type": "infantry",
  "playerSlot": 0,
  "position": [5, 10],
  "isReady": true,
  "hp": 100,
  "fuel": 99,
  "ammo": 99,
  "isCapturing": false,
  "carriedUnits": []
}
```

### Unit Types

#### Land Units
- **Infantry/Mech**: Can capture, 99 fuel
  ```json
  {
    "type": "infantry|mech",
    "hp": 100,
    "fuel": 99,
    "ammo": 99,  // Mech only
    "currentCapturePoints": 10  // Optional, when capturing
  }
  ```

- **Vehicles**: Tank, Artillery, Recon, Anti-Air, etc.
  ```json
  {
    "type": "tank|artillery|recon|antiAir|missile|rocket",
    "hp": 100,
    "fuel": 99,
    "ammo": 6  // Varies by unit
  }
  ```

- **Transport**: APC
  ```json
  {
    "type": "apc",
    "fuel": 99,
    "loadedUnit": {  // Optional
      "type": "infantry",
      "hp": 100,
      "fuel": 99
    }
  }
  ```

#### Air Units
- **Combat**: Fighter, Bomber, Battle Copter
  ```json
  {
    "type": "fighter|bomber|battleCopter",
    "hp": 100,
    "fuel": 99,
    "ammo": 9
  }
  ```

- **Stealth** (Special)
  ```json
  {
    "type": "stealth",
    "hp": 100,
    "fuel": 60,
    "ammo": 6,
    "hidden": true  // Invisible to enemies
  }
  ```

- **Transport Copter**
  ```json
  {
    "type": "transportCopter",
    "fuel": 99,
    "loadedUnit": null  // Can carry infantry/mech
  }
  ```

#### Naval Units
- **Combat**: Battleship, Cruiser, Sub
  ```json
  {
    "type": "battleship|cruiser|sub",
    "hp": 100,
    "fuel": 99,
    "ammo": 9,
    "hidden": true  // Sub only - when submerged
  }
  ```

- **Transport**: Lander, Black Boat
  ```json
  {
    "type": "lander",
    "fuel": 99,
    "loadedUnit": null,   // Can carry 2 ground units
    "loadedUnit2": null
  }
  ```

- **Carrier**
  ```json
  {
    "type": "carrier",
    "fuel": 99,
    "ammo": 9,
    "loadedUnit": null,   // Can carry 2 air units
    "loadedUnit2": null
  }
  ```

### Unit Attributes

| Attribute | Range | Description |
|-----------|-------|-------------|
| `hp` | 1-100 | Health points (visual HP = hp/10 rounded up) |
| `fuel` | 0-99 | Movement fuel, depletes daily |
| `ammo` | 0-99 | Ammunition for attacks |
| `isReady` | boolean | Can act this turn |
| `isCapturing` | boolean | Currently capturing property |
| `currentCapturePoints` | 1-20 | Progress capturing (HP/10 per turn) |
| `hidden` | boolean | Invisible (Stealth/Sub) |
| `playerSlot` | 0-3 | Owner player |

## Example Map Data

### Minimal 3x3 Map
```json
{
  "name": "Test Map",
  "tiles": [
    [
      {"type": "hq", "playerSlot": 0},
      {"type": "plain", "variant": "normal"},
      {"type": "city", "playerSlot": -1}
    ],
    [
      {"type": "road", "variant": "top-bottom"},
      {"type": "forest"},
      {"type": "mountain"}
    ],
    [
      {"type": "city", "playerSlot": -1},
      {"type": "plain", "variant": "normal"},
      {"type": "hq", "playerSlot": 1}
    ]
  ],
  "predeployedUnits": [
    {
      "type": "infantry",
      "playerSlot": 0,
      "position": [0, 0],
      "hp": 100,
      "fuel": 99,
      "isReady": false,
      "isCapturing": false,
      "carriedUnits": []
    }
  ],
  "numberOfPlayers": 2
}
```

## Runtime State Management

### MatchWrapper Integration
```typescript
class MatchWrapper {
  map: MapWrapper           // Map data
  units: UnitWrapper[]      // Active units (not in map)
  changeableTiles: []       // Properties that can change ownership
  
  getTile(position): Tile   // Get tile at position
  getUnit(position): Unit   // Get unit at position
}
```

### Important Notes

1. **Units are NOT stored in the map** - They're managed separately in `MatchWrapper.units`
2. **Changeable tiles** (properties) are extracted at match start and tracked separately
3. **Fog of War** affects unit visibility but not map structure
4. **Events** modify the runtime state, not the base map

## Map Validation Rules

1. **Size**: Maps should be rectangular (all rows same length)
2. **HQ**: Each player needs exactly one HQ
3. **Starting positions**: Should be balanced
4. **Properties**: Roughly equal access for fairness
5. **Connectivity**: All areas should be reachable

## Performance Considerations

- Maps are loaded once at server startup
- Tile lookups are O(1) using position indices
- JSON parsing happens only during initial load
- Runtime uses native JavaScript objects, not JSON

## File Format for Import/Export

Maps can be exported as `.json` files:
```json
{
  "version": "1.0",
  "name": "Map Name",
  "author": "Creator",
  "description": "Map description",
  "numberOfPlayers": 2,
  "tiles": [...],
  "predeployedUnits": [...]
}
```