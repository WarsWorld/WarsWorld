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
import { renderAttackTiles } from "./renderAttackTiles";
import { tileConstructor } from "./sprite-constructor";

export default function subActionMenu(
  match: MatchWrapper,
  player: PlayerInMatchWrapper,
  newPosition: Position,
  unit: UnitWrapper,
  currentUnitClickedRef: React.MutableRefObject<UnitWrapper | null>,
  pathRef: MutableRefObject<Position[] | null>,
  interactiveContainer: Container,
  spriteSheets: LoadedSpriteSheet,
  sendAction: (action: MainAction) => Promise<void>,
) {
  const menuOptions = getAvailableSubActions(match, player, unit, newPosition);

  //check if we can add "delete" (not subaction) to menuOptions, which is available if unit hasn't moved
  if (
    !pathRef.current ||
    pathRef.current.length == 0 ||
    (pathRef.current.length == 1 && isSamePosition(pathRef.current[0], newPosition))
  ) {
    menuOptions.set(AvailableSubActions.Delete, { type: "wait" });
  }

  const [x, y] = newPosition;

  //The big container holding everything
  //set its eventmode to static for interactivity and sortable for zIndex
  const menuContainer = new Container();
  menuContainer.eventMode = "static";
  menuContainer.sortableChildren = true;
  menuContainer.zIndex = 999;

  //this is the value we have applied to units (half a tile)
  const unitSize = baseTileSize / 2;

  //the name lets us find the menu easily with getChildByName for easy removal
  menuContainer.name = "subMenu";

  // if we are over half the map. invert menu placement
  if (x > match.map.width / 2) {
    menuContainer.x = x * baseTileSize - baseTileSize * 3; //the menu width is about 6 * baseTileSize
  }
  //we are not over half the map, menu is placed next to factory
  else {
    menuContainer.x = x * baseTileSize + baseTileSize;
  }

  //if our menu would appear below the middle of the map, we need to bring it up!
  if (y >= match.map.height / 2 && match.map.height - y <= menuOptions.size + 1) {
    const spaceLeft = match.map.height - y;
    menuContainer.y = (y - Math.abs(spaceLeft - menuOptions.size)) * baseTileSize;
  } else {
    menuContainer.y = y * baseTileSize;
  }

  //This makes the menu elements be each below each other, it starts at 0 then gets plussed, so elements keep going down and down.
  // yValue is not the best name for it but effectively it is that, a y value
  let yValue = 0;

  for (const [name, subAction] of menuOptions) {
    //child container to hold all the text and sprite into one place
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

    const actionText = new BitmapText(`${AvailableSubActions[name].toUpperCase()}`, {
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
            const unitToRepair = match.getUnit(addDirection(unit.data.position, dir));

            if (unitToRepair && unitToRepair.player.data.slot === unit.player.data.slot) {
              const repairTile = tileConstructor(addDirection(unit.data.position, dir), "#be1919");
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
  menuBG.width = baseTileSize * 3; //expands 3 tiles worth of space
  menuBG.height = yValue;
  menuBG.zIndex = -1;
  menuBG.alpha = 1;
  menuContainer.addChild(menuBG);
  return menuContainer;
}
