import { DispatchableError } from "shared/DispatchedError";
import type { BuildAction } from "shared/schemas/action";
import { unitPropertiesMap } from "../../game-constants/unit-properties";
import type { BuildEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";
import type { MainActionToEvent } from "../handler-types";
import type { PlayerSlot } from "../../../schemas/player-slot";
import type { UnitWithVisibleStats } from "../../../schemas/unit";

export const buildActionToEvent: MainActionToEvent<BuildAction> = (
  match,
  action
) => {
  const player = match.getCurrentTurnPlayer();

  if (player.getUnits().length >= match.rules.unitCapPerPlayer) {
    throw new DispatchableError("Unit cap alreaedy reached");
  }

  const { cost, facility } = unitPropertiesMap[action.unitType];
  const modifiedCost = player.getHook("buildCost")?.(cost, match);
  const effectiveCost = modifiedCost ?? cost;

  if (effectiveCost > player.data.funds) {
    throw new DispatchableError(
      "You don't have enough funds to build this unit"
    );
  }

  if (match.hasUnit(action.position)) {
    throw new DispatchableError("Can't build where there's a unit already");
  }

  const tile = match.getTile(action.position);

  if (!player.owns(tile)) {
    throw new DispatchableError(
      "You don't own this tile or this tile cannot be owned"
    );
  }

  const hachiScopLandUnit =
    facility === "base" &&
    player.data.coId.name === "hachi" &&
    player.data.COPowerState === "super-co-power";

  if (tile.type !== facility && !(hachiScopLandUnit && tile.type === "city")) {
    throw new DispatchableError("You can't build this unit in this facility");
  }

  return {
    type: "build",
    unitType: action.unitType,
    position: action.position
  };
};

const createUnitFromBuildEvent = (
  playerSlot: PlayerSlot,
  event: BuildEvent
): UnitWithVisibleStats => {
  const { unitType } = event;

  const unitProperties = unitPropertiesMap[unitType];

  const partialUnit = {
    playerSlot,
    position: event.position,
    stats: {
      fuel: unitProperties.initialFuel,
      hp: 100
    },
    isReady: false
  } satisfies Partial<UnitWithVisibleStats>;

  if ("initialAmmo" in unitProperties) {
    const partialUnitWithAmmo = {
      ...partialUnit,
      stats: {
        ...partialUnit.stats,
        ammo: unitProperties.initialAmmo
      }
    } satisfies Partial<UnitWithVisibleStats>;

    switch (unitType) {
      case "artillery":
      case "mech":
      case "tank":
      case "missile":
      case "rocket":
      case "mediumTank":
      case "neoTank":
      case "megaTank":
      case "battleCopter":
      case "bomber":
      case "fighter":
      case "battleship":
      case "pipeRunner":
      case "antiAir":
        return {
          type: unitType,
          ...partialUnitWithAmmo
        };
      case "stealth":
      case "sub":
        return {
          type: unitType,
          ...partialUnitWithAmmo,
          hidden: false
        };
      case "carrier":
      case "cruiser":
        return {
          type: unitType,
          ...partialUnitWithAmmo,
          loadedUnit: null,
          loadedUnit2: null
        };
    }
  }

  switch (unitType) {
    case "infantry":
    case "recon":
    case "blackBomb":
      return {
        type: unitType,
        ...partialUnit
      };
    case "apc":
    case "transportCopter":
      return {
        type: unitType,
        ...partialUnit,
        loadedUnit: null
      };
    case "blackBoat":
    case "lander":
      return {
        type: unitType,
        ...partialUnit,
        loadedUnit: null,
        loadedUnit2: null
      };
    default:
      /** TODO only so that typescript doesn't error / break CI, but still a TODO */
      throw new Error("TODO :)");
  }
};

export const applyBuildEvent = (match: MatchWrapper, event: BuildEvent) => {
  const player = match.getCurrentTurnPlayer();

  return player.addUnwrappedUnit(
    createUnitFromBuildEvent(player.data.slot, event)
  );
};
