import { Assets, BitmapText, Container, Sprite, Texture } from "pixi.js";
import {
  createPipeSeamUnitEquivalent,
  getBaseDamage,
} from "shared/match-logic/game-constants/base-damage";
import { unitPropertiesMap } from "shared/match-logic/game-constants/unit-properties";
import { getBaseMovementCost } from "shared/match-logic/movement-cost";
import { getWeatherSpecialMovement } from "shared/match-logic/weather";
import {
  getDistance,
  getNeighbourPositions,
  type Path,
  type Position,
} from "shared/schemas/position";
import type { UnitWrapper } from "shared/wrappers/unit";
import type { FrontendUnit } from "../frontend/components/match/FrontendUnit";
import type { MatchWrapper } from "../shared/wrappers/match";
import type { PlayerInMatchWrapper } from "../shared/wrappers/player-in-match";

export enum AvailableSubActions {
  "Wait",
  "Join",
  "Load",
  "Capture",
  "Launch",
  "Supply",
  "Explode",
  "Hide",
  "Show",
  "Unload",
  "Repair",
  "Attack",
}

export const getAvailableSubActions = (
  match: MatchWrapper,
  player: PlayerInMatchWrapper,
  unit: UnitWrapper,
  newPosition: Position,
) => {
  const menuOptions: AvailableSubActions[] = [];
  const tile = match.getTile(newPosition);

  //check for wait / join / load (move validity already checked somewhere else)
  //if loading / joining, there is only one menu option
  if (
    match.getUnit(newPosition) === undefined ||
    (newPosition[0] === unit.data.position[0] && newPosition[1] === unit.data.position[1])
  ) {
    menuOptions.push(AvailableSubActions.Wait);
  } else if (match.getUnit(newPosition)?.data.type === unit.data.type) {
    menuOptions.push(AvailableSubActions.Join);
    return menuOptions;
  } else {
    menuOptions.push(AvailableSubActions.Load);
    return menuOptions;
  }

  //check for attack, including pipeseams
  if (!unit.isTransport()) {
    let addAttackSubaction = false;

    const pipeSeamUnitEquivalent = createPipeSeamUnitEquivalent(match, unit);
    const canAttackPipeseams = getBaseDamage(unit, pipeSeamUnitEquivalent) !== null;

    if (unit.isIndirect()) {
      for (let x = 0; x < match.map.width && !addAttackSubaction; x++) {
        for (let y = 0; y < match.map.height && !addAttackSubaction; y++) {
          const distance = getDistance([x, y], unit.data.position);

          if (
            distance <= unit.properties.attackRange[1] &&
            distance >= unit.properties.attackRange[0]
          ) {
            if (
              canAttackPipeseams &&
              !match.map.isOutOfBounds([x, y]) &&
              match.getTile([x, y]).type === "pipeSeam"
            ) {
              addAttackSubaction = true;
            }

            const attackableUnit = match.getUnit([x, y]);

            if (
              attackableUnit &&
              attackableUnit.player.team !== unit.player.team &&
              getBaseDamage(unit, attackableUnit) !== null
            ) {
              addAttackSubaction = true;
            }
          }
        }
      }
    } else {
      if (canAttackPipeseams) {
        for (const adjacentPos of getNeighbourPositions(newPosition)) {
          if (addAttackSubaction) {
            break;
          }

          if (
            !match.map.isOutOfBounds(adjacentPos) &&
            match.getTile(adjacentPos).type === "pipeSeam"
          ) {
            addAttackSubaction = true;
          }
        }
      }

      for (const adjacentUnit of unit.getNeighbouringUnits()) {
        if (addAttackSubaction) {
          break;
        }

        if (
          adjacentUnit.player.team !== unit.player.team &&
          getBaseDamage(unit, adjacentUnit) !== null
        ) {
          addAttackSubaction = true;
        }
      }
    }

    if (addAttackSubaction) {
      menuOptions.push(AvailableSubActions.Attack);
    }
  }

  //check for capture / launch
  if (unit.isInfantryOrMech()) {
    if ("playerSlot" in tile && tile.playerSlot !== player.data.slot) {
      menuOptions.push(AvailableSubActions.Capture);
    }

    if (tile.type === "unusedSilo") {
      menuOptions.push(AvailableSubActions.Launch);
    }
  }

  //check for supply
  if (unit.data.type === "apc") {
    for (const adjacentUnit of unit.getNeighbouringUnits()) {
      if (adjacentUnit.player === unit.player) {
        menuOptions.push(AvailableSubActions.Supply);
        break;
      }
    }
  }

  //check for explode
  if (unit.data.type === "blackBomb") {
    menuOptions.push(AvailableSubActions.Explode);
  }

  //check for hide / show
  if ("hidden" in unit.data) {
    if (unit.data.hidden) {
      menuOptions.push(AvailableSubActions.Show);
    } else {
      menuOptions.push(AvailableSubActions.Hide);
    }
  }

  //check for unload
  if (unit.isTransport()) {
    let addUnloadSubaction = false;

    if (unit.data.loadedUnit !== null) {
      const baseMovementCost = getBaseMovementCost(
        unitPropertiesMap[unit.data.loadedUnit.type].movementType,
        getWeatherSpecialMovement(unit.player),
        tile.type,
        match.rules.gameVersion ?? unit.player.data.coId.version,
      );

      if (baseMovementCost !== null) {
        for (const adjacentPosition of getNeighbourPositions(newPosition)) {
          if (!match.map.isOutOfBounds(adjacentPosition)) {
            const adjacentBaseMovementCost = getBaseMovementCost(
              unitPropertiesMap[unit.data.loadedUnit.type].movementType,
              getWeatherSpecialMovement(unit.player),
              match.getTile(adjacentPosition).type,
              match.rules.gameVersion ?? unit.player.data.coId.version,
            );

            if (adjacentBaseMovementCost !== null) {
              addUnloadSubaction = true;
              break;
            }
          }
        }
      }
    }

    if (!addUnloadSubaction && "loadedUnit2" in unit.data && unit.data.loadedUnit2 !== null) {
      //duplicated code for loadedUnit2
      const baseMovementCost = getBaseMovementCost(
        unitPropertiesMap[unit.data.loadedUnit2.type].movementType,
        getWeatherSpecialMovement(unit.player),
        tile.type,
        match.rules.gameVersion ?? unit.player.data.coId.version,
      );

      if (baseMovementCost !== null) {
        for (const adjacentPosition of getNeighbourPositions(newPosition)) {
          if (!match.map.isOutOfBounds(adjacentPosition)) {
            const adjacentBaseMovementCost = getBaseMovementCost(
              unitPropertiesMap[unit.data.loadedUnit2.type].movementType,
              getWeatherSpecialMovement(unit.player),
              match.getTile(adjacentPosition).type,
              match.rules.gameVersion ?? unit.player.data.coId.version,
            );

            if (adjacentBaseMovementCost !== null) {
              addUnloadSubaction = true;
              break;
            }
          }
        }
      }
    }

    if (addUnloadSubaction) {
      menuOptions.push(AvailableSubActions.Unload);
    }
  }

  //check for repair
  if (unit.data.type === "blackBoat") {
    for (const adjacentUnit of unit.getNeighbouringUnits()) {
      if (adjacentUnit.player === unit.player) {
        menuOptions.push(AvailableSubActions.Repair);
        break;
      }
    }
  }

  return menuOptions;
};

export default async function subActionMenu(
  match: MatchWrapper,
  player: PlayerInMatchWrapper,
  unit: FrontendUnit,
  newPosition: Position,
  //TODO: Whats the type for a mutation?
  mutation: any,
  newPath?: Path,
) {
  const menuOptions = getAvailableSubActions(match, player, unit, newPosition);

  const [x, y] = newPosition;

  //The big container holding everything
  //set its eventmode to static for interactivity and sortable for zIndex
  const menuContainer = new Container();
  menuContainer.eventMode = "static";
  menuContainer.sortableChildren = true;
  menuContainer.zIndex = 999;

  const tileSize = 16;
  //this is the value we have applied to units (half a tile)
  const unitSize = tileSize / 2;

  //the name lets us find the menu easily with getChildByName for easy removal
  menuContainer.name = "subMenu";

  //TODO: Modify these two x and y conditions so that menu is onlu moved if it would ever be out of bounds, so it should check not if we are halfway but just about to cross off the map

  // if we are over half the map. invert menu placement
  if (x > match.map.width / 2) {
    menuContainer.x = x * tileSize - tileSize * 3; //the menu width is about 6 * tileSize
  }
  //we are not over half the map, menu is placed next to factory
  else {
    menuContainer.x = x * tileSize + tileSize;
  }

  //if our menu would appear below the middle of the map, we need to bring it up!
  if (y >= match.map.height / 2 && match.map.height - y < menuOptions.length) {
    const spaceLeft = match.map.height - y;
    menuContainer.y = (y - Math.abs(spaceLeft - menuOptions.length)) * tileSize;
  } else {
    menuContainer.y = y * tileSize;
  }

  //TODO: Fix border
  menuContainer.x += 8;
  menuContainer.y += 8;

  await Assets.load("/aw2Font.fnt");

  //This makes the menu elements be each below each other, it starts at 0 then gets plussed, so elements keep going down and down. yValue is not the best name for it but effectively it is that, a y value
  let yValue = 0;

  for (const subAction of menuOptions) {
    //child container to hold all the text and sprite into one place
    const menuElement = new Container();
    menuElement.eventMode = "static";

    //the grey rectangle bg that each unit has
    const actionBG = new Sprite(Texture.WHITE);
    actionBG.x = 0;
    actionBG.y = yValue;
    //TODO: Standardize these sizes
    actionBG.width = tileSize * 2.8;
    actionBG.height = unitSize * 1.35;
    actionBG.eventMode = "static";
    actionBG.tint = "#ffffff";
    actionBG.alpha = 0.5;
    menuElement.addChild(actionBG);

    const actionText = new BitmapText(`${AvailableSubActions[subAction].toUpperCase()}`, {
      fontName: "awFont",
      fontSize: 10,
    });
    actionText.y = yValue;
    actionText.x = tileSize;
    //trying to line it up nicely wiht the unit icon
    actionText.anchor.set(0, -0.3);
    menuElement.addChild(actionText);

    //lets add a hover effect to the actionBG when you hover over the menu
    menuElement.on("pointerenter", () => {
      actionBG.alpha = 1;
    });

    //when you stop hovering the menu
    menuElement.on("pointerleave", () => {
      actionBG.alpha = 0.5;
    });

    //TODO: WHEN CLICKING
    menuElement.on("pointerdown", () => {
      console.log(newPath);

      mutation.mutateAsync({
        type: "move",
        subAction: subAction,
        path: newPath,
        playerId: player.data.id,
        matchId: match.id,
      });
      //as soon a selection is done, destroy/erase the menu
      menuContainer.destroy();
    });

    yValue += unitSize * 2;
    menuContainer.addChild(menuElement);
  }

  //The extra border we see around the menu
  //TODO: Change outerborder color depending on country/army color
  const menuBG = new Sprite(Texture.WHITE);
  menuBG.tint = "#cacaca";
  menuBG.x = -2;
  menuBG.y = -2;
  menuBG.width = tileSize * 3; //expands 3 tiles worth of space
  menuBG.height = yValue;
  menuBG.zIndex = -1;
  menuBG.alpha = 1;
  menuContainer.addChild(menuBG);
  return menuContainer;
}
