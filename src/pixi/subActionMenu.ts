import { BitmapText, Container, Sprite, Texture } from "pixi.js";
import type { MutableRefObject } from "react";
import {
  AvailableSubActions,
  getAvailableSubActions,
} from "shared/match-logic/events/available-sub-actions";
import {
  addDirection,
  allDirections,
  isSamePosition,
  type Position,
} from "shared/schemas/position";
import type { UnitWrapper } from "shared/wrappers/unit";
import { baseTileSize } from "../components/client-only/MatchRenderer";
import type { MainAction } from "../shared/schemas/action";
import type { MatchWrapper } from "../shared/wrappers/match";
import type { PlayerInMatchWrapper } from "../shared/wrappers/player-in-match";
import type { LoadedSpriteSheet } from "./load-spritesheet";
import { createInGameMenu } from "./menuTemplate";
import { renderAttackTiles } from "./renderAttackTiles";
import { tileConstructor } from "./sprite-constructor";
import { createUnloadMenu } from "./unloadSubactionMenu";

export const createSubActionMenuElement = (subActionName: string, numberInList: number) => {
  const unitSize = baseTileSize / 2;
  const yValue = numberInList * unitSize * 2;

  const menuElement = new Container();
  menuElement.eventMode = "static";

  //the grey rectangle bg that each unit has
  const actionBG = new Sprite(Texture.WHITE);
  actionBG.x = 0;
  actionBG.y = yValue;
  //TODO: Standardize these sizes
  actionBG.width = baseTileSize * 2.8;
  actionBG.height = unitSize * 1.35;
  actionBG.eventMode = "static";
  actionBG.tint = "#ffffff";
  actionBG.alpha = 0.5;
  menuElement.addChild(actionBG);

  const actionText = new BitmapText(`${subActionName}`, {
    fontName: "awFont",
    fontSize: 10,
  });
  actionText.y = yValue;
  actionText.x = baseTileSize;
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

  return menuElement;
};

export default function subActionMenu(
  match: MatchWrapper,
  player: PlayerInMatchWrapper,
  newPosition: Position,
  unit: UnitWrapper,
  currentUnitClickedRef: React.MutableRefObject<UnitWrapper | null>,
  pathRef: MutableRefObject<Position[] | null>,
  mapContainer: Container,
  interactiveContainer: Container,
  spriteSheets: LoadedSpriteSheet,
  sendAction: (action: MainAction) => Promise<void>,
) {
  const hasMoved =
    pathRef.current !== null &&
    !(
      pathRef.current.length === 0 ||
      (pathRef.current.length === 1 && isSamePosition(pathRef.current[0], newPosition))
    );

  const menuOptions = getAvailableSubActions(match, player, unit, newPosition, hasMoved);

  const unitSize = baseTileSize / 2;

  let iter = 0;

  const menuElements: Container[] = [];

  for (const [name, subAction] of menuOptions) {
    //child container to hold all the text and sprite into one place
    const menuElement = createSubActionMenuElement(AvailableSubActions[name].toUpperCase(), iter);

    menuElement.on("pointerdown", () => {
      switch (name) {
        case AvailableSubActions.Attack: {
          interactiveContainer.addChild(
            renderAttackTiles(
              interactiveContainer,
              match,
              currentUnitClickedRef,
              spriteSheets,
              pathRef,
              mapContainer,
              sendAction,
              //either last path position or asuumes unit didn't move
              pathRef.current ? pathRef.current[pathRef.current.length - 1] : unit.data.position,
            ),
          );
          break;
        }

        case AvailableSubActions.Repair: {
          const repairTilesContainer = new Container();
          repairTilesContainer.name = "repairUnitsBox";

          for (const dir of allDirections) {
            if (match.map.isOutOfBounds(addDirection(unit.data.position, dir))) {
              continue;
            }

            const unitToRepair = match.getUnit(addDirection(unit.data.position, dir));

            if (unitToRepair && unitToRepair.player.data.slot === unit.player.data.slot) {
              const repairTile = tileConstructor(addDirection(unit.data.position, dir), "#43d9e4");
              repairTile.eventMode = "static";

              repairTile.on("pointerdown", () => {
                if (currentUnitClickedRef.current !== null) {
                  const path = pathRef.current
                    ? pathRef.current
                    : [currentUnitClickedRef.current.data.position];

                  void sendAction({
                    type: "move",
                    subAction: {
                      type: "repair",
                      direction: dir,
                    },
                    path: path,
                  });

                  currentUnitClickedRef.current = null;
                }
              });

              repairTilesContainer.addChild(repairTile);
            }
          }

          repairTilesContainer.zIndex = 999;
          interactiveContainer.addChild(repairTilesContainer);
          break;
        }

        case AvailableSubActions.Launch: {
          //TODO
        }

        case AvailableSubActions.Unload: {
          //TODO depends if unload = wait or not:
          //if unload != wait then just commit move+wait and open the unloadNoWait action menu
          //if unload = wait then open unit to unload, then choose location, then unit to unload 2, choose location.
          //if 2 unloading units, remember to mark 1st unloaded unit location as unaccessible
          const unloadMenu = createUnloadMenu(
            match,
            player,
            newPosition,
            unit,
            currentUnitClickedRef,
            pathRef,
            interactiveContainer,
            spriteSheets,
            sendAction,
          );

          unloadMenu.zIndex = 999;
          interactiveContainer.addChild(unloadMenu);
          break;
        }

        case AvailableSubActions.Delete: {
          void sendAction({
            type: "delete",
            position: newPosition,
          });

          currentUnitClickedRef.current = null;
          break;
        }

        default: {
          if (subAction === undefined) {
            throw new Error(
              "Received undefined subAction from menu option that doesn't require further interaction: " +
                name,
            );
          }

          void sendAction({
            type: "move",
            subAction: subAction,
            path: pathRef.current ?? [newPosition],
          });

          //The currentUnitClicked has changed (moved, attacked, died), therefore, we delete the previous information as it is not accurate anymore
          //this also helps so when the screen resets, we dont have two copies of a unit
          currentUnitClickedRef.current = null;
          break;
        }
      }

      //as soon a selection is done, destroy/erase the menu
      menuElement.parent.destroy();
    });

    iter++;
    menuElements.push(menuElement);
  }

  const menuContainer = createInGameMenu(match, newPosition, iter * unitSize * 2, 3, menuElements);
  menuContainer.name = "subActionMenu";
  return menuContainer;
}
