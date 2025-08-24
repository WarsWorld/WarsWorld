import type { MatchWrapper } from "shared/wrappers/match";
import type { UnitWrapper } from "shared/wrappers/unit";
import type {
  AIGameState,
  AIPlayer,
  AIUnit,
  AITile,
  AIPosition,
  AIWeather,
} from "./types";

/**
 * Converts between the game engine's MatchWrapper representation
 * and the AI's simplified state representation.
 */
export class StateConverter {
  /**
   * Convert a MatchWrapper to an AIGameState
   */
  static toAIState(match: MatchWrapper): AIGameState {
    const currentPlayer = match.getCurrentTurnPlayer();
    const currentPlayerIndex = match.getAllPlayers().findIndex((p) => p.data.id === currentPlayer?.data.id);

    return {
      currentPlayerIndex: currentPlayerIndex >= 0 ? currentPlayerIndex : 0,
      players: this.extractPlayers(match),
      units: this.extractUnits(match),
      tiles: this.extractTiles(match),
      mapSize: {
        width: match.map.width,
        height: match.map.height,
      },
      turn: match.turn,
      weather: this.extractWeather(match),
      fogOfWar: match.isFogOfWar(),
    };
  }

  /**
   * Extract player information from match
   */
  private static extractPlayers(match: MatchWrapper): AIPlayer[] {
    return match.getAllPlayers().map((player, index) => ({
      id: player.data.id,
      index,
      teamIndex: player.team?.index ?? index,
      funds: player.data.funds,
      isAI: player.data.type === "ai",
      coName: player.data.co?.name,
      coPowerCharge: player.data.co?.powerCharge,
      coPowerActive: player.data.co?.activePower !== undefined,
    }));
  }

  /**
   * Extract unit information from match
   */
  private static extractUnits(match: MatchWrapper): AIUnit[] {
    return match.units.map((unit) => {
      const aiUnit: AIUnit = {
        id: this.getUnitId(unit),
        type: unit.data.type,
        playerIndex: this.getPlayerIndex(match, unit),
        position: [unit.data.position[0], unit.data.position[1]] as AIPosition,
        hp: this.getUnitHp(unit),
        fuel: unit.getFuel(),
        isReady: unit.data.isReady ?? true,
        captureProgress: this.getCaptureProgress(unit),
      };

      // Add ammo if unit has it
      const ammo = unit.getAmmo();
      if (ammo !== null) {
        aiUnit.ammo = ammo;
      }

      // Add loaded units for transports
      const loadedUnits = this.getLoadedUnits(unit);
      if (loadedUnits.length > 0) {
        aiUnit.loadedUnits = loadedUnits;
      }

      return aiUnit;
    });
  }

  /**
   * Extract tile information from match
   */
  private static extractTiles(match: MatchWrapper): AITile[] {
    const tiles: AITile[] = [];

    // Extract changeable tiles (capturable properties, silos, etc.)
    for (const changeableTile of match.changeableTiles) {
      const tile: AITile = {
        position: [changeableTile.position[0], changeableTile.position[1]] as AIPosition,
        type: changeableTile.type,
      };

      // Add owner for capturable tiles
      if ("playerSlot" in changeableTile && changeableTile.playerSlot !== undefined) {
        const owner = match.getPlayerBySlot(changeableTile.playerSlot);
        if (owner) {
          const ownerIndex = match.getAllPlayers().findIndex((p) => p.data.id === owner.data.id);
          if (ownerIndex >= 0) {
            tile.ownerIndex = ownerIndex;
          }
        }
      }

      // Add capture points for capturable tiles
      if ("capturePoints" in changeableTile) {
        tile.capturePoints = changeableTile.capturePoints;
      }

      // Add variant for tiles with visual variants
      if ("variant" in changeableTile) {
        tile.variant = changeableTile.variant;
      }

      tiles.push(tile);
    }

    // Also extract important terrain features from the map if available
    // Note: The base MapWrapper doesn't provide direct tile access,
    // so we'll only extract changeable tiles for now.
    // In a real implementation, we'd need to extend MapWrapper
    // or access the tiles data directly from match.map.data.tiles

    return tiles;
  }

  /**
   * Extract weather information from match
   */
  private static extractWeather(match: MatchWrapper): AIWeather | undefined {
    const weather = match.getCurrentWeather();
    if (weather === "clear") {
      return undefined;
    }

    return {
      type: weather,
      daysRemaining: match.weatherDaysLeft,
    };
  }

  /**
   * Get a unique ID for a unit
   */
  private static getUnitId(unit: UnitWrapper): string {
    // Use position and type as a simple ID
    // In a real implementation, units might have actual IDs
    return `${unit.data.type}-${unit.data.position[0]}-${unit.data.position[1]}`;
  }

  /**
   * Get the player index for a unit
   */
  private static getPlayerIndex(match: MatchWrapper, unit: UnitWrapper): number {
    const players = match.getAllPlayers();
    const unitPlayer = unit.player;
    return players.findIndex((p) => p.data.id === unitPlayer.data.id);
  }

  /**
   * Get the HP of a unit
   */
  private static getUnitHp(unit: UnitWrapper): number {
    if (unit.data.stats === "hidden") {
      // Hidden units show full HP to AI (we assume AI can see everything for now)
      return 100;
    }
    return unit.data.stats.hp;
  }

  /**
   * Get capture progress for a unit
   */
  private static getCaptureProgress(unit: UnitWrapper): number | undefined {
    if (unit.data.stats === "hidden" || !("capturing" in unit.data.stats)) {
      return undefined;
    }

    if (unit.data.stats.capturing) {
      const tile = unit.match.changeableTiles.find((t) =>
        t.position[0] === unit.data.position[0] && t.position[1] === unit.data.position[1]
      );
      
      if (tile && "capturePoints" in tile) {
        // Return how much capture progress has been made
        return 20 - tile.capturePoints;
      }
    }

    return undefined;
  }

  /**
   * Get IDs of units loaded in a transport
   */
  private static getLoadedUnits(unit: UnitWrapper): string[] {
    const loadedUnits: string[] = [];
    
    if ("loadedUnit" in unit.data && unit.data.loadedUnit) {
      loadedUnits.push(
        this.getUnitId({
          data: unit.data.loadedUnit,
          // Create a minimal wrapper for ID generation
        } as UnitWrapper)
      );
    }

    if ("loadedUnit2" in unit.data && unit.data.loadedUnit2) {
      loadedUnits.push(
        this.getUnitId({
          data: unit.data.loadedUnit2,
        } as UnitWrapper)
      );
    }

    return loadedUnits;
  }
}