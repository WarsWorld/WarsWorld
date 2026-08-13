import { DispatchableError } from "server/engine/DispatchedError";
import type { BuildAction } from "server/core/schemas/action";
import type { BuildEvent } from "server/engine/types/events";
import type { MatchWrapper } from "server/engine/entities/match";
import type { PlayerSlot } from "server/core/schemas/player-slot";
import type { UnitWithVisibleStats } from "server/core/schemas/unit";
import { unitPropertiesMap } from "server/engine/constants/unit-properties";
import type { MainActionToEvent } from "server/engine/events/handler-types";

export const buildActionToEvent: MainActionToEvent<BuildAction> = (match, action) => {
  const player = match.getCurrentTurnPlayer();

  if (match.rules.bannedUnitTypes.includes(action.unitType)) {
    throw new DispatchableError("Trying to build a banned unit type");
  }

  if (match.rules.labUnitTypes.includes(action.unitType) && !player.hasLab()) {
    throw new DispatchableError(
      "Trying to build a unit type that requires a lab, but no lab is owned",
    );
  }

  // TODO discuss how we handle "existing unit types" for each version

  if (player.getUnits().length >= match.rules.unitCapPerPlayer) {
    throw new DispatchableError("Unit cap alreaedy reached");
  }

  const { cost, facility } = unitPropertiesMap[action.unitType];
  const modifiedCost = player.getHook("buildCost")?.(cost, match);
  const effectiveCost = modifiedCost ?? cost;

  if (effectiveCost > player.data.funds) {
    throw new DispatchableError("You don't have enough funds to build this unit");
  }

  if (match.getUnit(action.position) !== undefined) {
    throw new DispatchableError("Can't build where there's a unit already");
  }

  const tile = match.getTile(action.position);

  if (!player.owns(tile)) {
    throw new DispatchableError("You don't own this tile or this tile cannot be owned");
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
    position: action.position,
  };
};

const createUnitFromBuildEvent = (
  playerSlot: PlayerSlot,
  event: BuildEvent,
): UnitWithVisibleStats => {
  const { unitType } = event;

  const unitProperties = unitPropertiesMap[unitType];

  const partialUnit = {
    playerSlot,
    position: event.position,
    stats: {
      fuel: unitProperties.initialFuel,
      hp: 100,
    },
    isReady: false,
  } satisfies Partial<UnitWithVisibleStats>;

  if ("initialAmmo" in unitProperties) {
    const partialUnitWithAmmo = {
      ...partialUnit,
      stats: {
        ...partialUnit.stats,
        ammo: unitProperties.initialAmmo,
      },
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
          ...partialUnitWithAmmo,
        };
      case "stealth":
      case "sub":
        return {
          type: unitType,
          ...partialUnitWithAmmo,
          hidden: false,
        };
      case "carrier":
      case "cruiser":
        return {
          type: unitType,
          ...partialUnitWithAmmo,
          loadedUnit: null,
          loadedUnit2: null,
        };
    }
  }

  switch (unitType) {
    case "infantry":
    case "recon":
    case "blackBomb":
      return {
        type: unitType,
        ...partialUnit,
      };
    case "apc":
    case "transportCopter":
      return {
        type: unitType,
        ...partialUnit,
        loadedUnit: null,
      };
    case "blackBoat":
    case "lander":
      return {
        type: unitType,
        ...partialUnit,
        loadedUnit: null,
        loadedUnit2: null,
      };
    default:
      /** TODO only so that typescript doesn't error / break CI, but still a TODO */
      throw new Error("TODO :)");
  }
};

export const applyBuildEvent = (match: MatchWrapper, event: BuildEvent) => {
  const player = match.getCurrentTurnPlayer();

  // Deduct the SAME price the action validated against: the base cost run through the player's
  // `buildCost` hook (CO discounts/surcharges). Charging the raw base cost here while validating the
  // modified cost let a discounted build overspend and drive funds negative — which must never
  // happen (see buildActionToEvent's funds check).
  const { cost } = unitPropertiesMap[event.unitType];
  const effectiveCost = player.getHook("buildCost")?.(cost, match) ?? cost;

  player.data.funds -= effectiveCost;
  player.addUnwrappedUnit(createUnitFromBuildEvent(player.data.slot, event));
  // Mark that this player has produced a unit — this arms the "no units left = defeat" rule at the
  // turn boundary (see applyPassTurnEvent). Before the first build, an empty board isn't a loss.
  player.data.hasBuiltUnit = true;
};
