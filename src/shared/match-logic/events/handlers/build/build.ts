import { DispatchableError } from "shared/DispatchedError";
import type { BuildAction } from "shared/schemas/action";
import { unitPropertiesMap } from "../../../buildable-unit";

import type { WWUnit } from "shared/schemas/unit";
import type { BuildEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";
import type { PlayerSlot } from "shared/schemas/player-slot";
import type { MainActionToEvent } from "../../handler-types";

export const buildActionToEvent: MainActionToEvent<BuildAction> = (
  match,
  action
) => {
  const player = match.players.getCurrentTurnPlayer();

  const { cost, facility } = unitPropertiesMap[action.unitType];
  const effectiveCost = player
    .getCOHooksWithUnit(action.position)
    .onBuildCost(cost);

  if (effectiveCost > player.data.funds) {
    throw new DispatchableError(
      "You don't have enough funds to build this unit"
    );
  }

  if (match.units.hasUnit(action.position)) {
    throw new DispatchableError("Can't build where there's a unit already");
  }

  const tile = match.getTile(action.position);

  if (!("ownerSlot" in tile) || tile.ownerSlot !== player.data.slot) {
    throw new DispatchableError(
      "You don't own this tile or this tile cannot be owned"
    );
  }

  const hachiScopLandUnit =
    facility == "base" &&
    player.data.co === "hachi" &&
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

const createNewUnitFromBuildEvent = (
  playerSlot: PlayerSlot,
  event: BuildEvent
): WWUnit => {
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
  } satisfies Partial<WWUnit>;

  if ("initialAmmo" in unitProperties) {
    const partialUnitWithAmmo = {
      ...partialUnit,
      stats: {
        ...partialUnit.stats,
        ammo: unitProperties.initialAmmo,
      },
    } satisfies Partial<WWUnit>;

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
      //should never happen
      return {
        type: "infantry",
        ...partialUnit,
      };
  }
};

export const applyBuildEvent = (match: MatchWrapper, event: BuildEvent) => {
  match.addUnwrappedUnit(
    createNewUnitFromBuildEvent(
      match.players.getCurrentTurnPlayer().data.slot,
      event
    )
  );
};
