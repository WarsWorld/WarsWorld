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

## Importing AWBW Move Planner Maps

WarsWorld supports importing maps from AWBW (Advance Wars By Web) by combining map exports and Move Planner JSON exports. This allows you to bring existing AWBW maps with complete terrain and units into WarsWorld.

### How to Export from AWBW

You need **two exports** from AWBW:

1. **Map Export** (terrain data):
   - Open your map in AWBW Map Editor
   - Export the map as text/CSV format
   - This contains all terrain tiles (forests, mountains, water, roads, etc.)

2. **Move Planner Export** (units and buildings):
   - Open the same map in AWBW Move Planner
   - Set up units and initial game state
   - Export as JSON (this creates a game state snapshot with units and building ownership)

### Import Command

Use the provided task script with both files to import and create a playable match:

```bash
npx tsx src/server/tasks/import-and-play-awbw-map.ts <map-export-path> <move-planner-export-path>
```

Example:
```bash
npx tsx src/server/tasks/import-and-play-awbw-map.ts /tmp/map-terrain.txt /tmp/move-planner.json
```

### What Gets Imported

- **Map tiles**: Complete terrain from map export (forests, mountains, water, roads, bridges, etc.)
- **Building ownership**: Property ownership from move planner (who owns which cities/bases/HQs)
- **Units**: All predeployed units with:
  - Correct positions
  - HP (converted from AWBW 1-10 to WW 1-100 scale)
  - Fuel and ammo values
  - Player ownership
- **Player setup**: Automatically creates a PvC (Player vs Computer) match

### Why Two Files?

The AWBW Move Planner export only contains buildings and units, not base terrain (forests, mountains, water, etc.). The map export provides the complete terrain data. Combining both gives you a fully playable map with proper terrain and units.

### Player Remapping

Since AWBW maps can have 2-4+ players but PvC matches need exactly 2:

- **2-player maps**: Direct mapping (player 0 → human, player 1 → computer)
- **3+ player maps**: Automatic remapping
  - First half of players → human (slot 0)
  - Second half → computer (slot 1)
  - Example: 4-player map remaps as `0,1→0 (human)` and `2,3→1 (computer)`

### AWBW Move Planner JSON Format

The Move Planner export includes:
```json
{
  "plannerName": "Map Name",
  "buildingsState": { /* terrain and buildings */ },
  "unitsState": {
    "0": {
      "units_name": "Infantry",
      "units_x": 5,
      "units_y": 10,
      "units_players_id": 0,
      "units_hit_points": 10,  // 1-10 scale
      "units_fuel": 99,
      "units_ammo": -1  // -1 for unlimited
    }
  },
  "playersState": { /* player info */ }
}
```

### After Import

The script will:
1. Create a new WWMap in the database
2. Create a playable match with human vs computer
3. Display the match ID for immediate play
4. Output: `🚀 You can now log in and play the match!`