import { baseTileSize } from "components/client-only/MatchRenderer";
import { Container } from "pixi.js";
import type { MutableRefObject } from "react";
import { getUnloadablePositions } from "shared/match-logic/events/handlers/unload/checkUnloadTiles";
import { getDirection, isSamePosition, type Position } from "shared/schemas/position";
import type { UnitWrapper } from "shared/wrappers/unit";
import type { MainAction } from "../shared/schemas/action";
import type { MatchWrapper } from "../shared/wrappers/match";
import type { PlayerInMatchWrapper } from "../shared/wrappers/player-in-match";
import { createMenuElementsForUnits } from "./buildUnitMenu";
import type { LoadedSpriteSheet } from "./load-spritesheet";
import { createInGameMenu } from "./menuTemplate";
import { tileConstructor } from "./sprite-constructor";
import { createSubActionMenuElement } from "./subActionMenu";

export const createUnloadMenu = (
  match: MatchWrapper,
  player: PlayerInMatchWrapper,
  newPosition: Position,
  unit: UnitWrapper,
  currentUnitClickedRef: React.MutableRefObject<UnitWrapper | null>,
  pathRef: MutableRefObject<Position[] | null>,
  interactiveContainer: Container,
  spriteSheets: LoadedSpriteSheet,
  sendAction: (action: MainAction) => Promise<void>,
  /**
   * Function can be called as 2nd unload. In this case, this variable will have the info of the first unload
   */
  firstUnloadInfo?: { unloadedPosition: Position; isFirstUnit: boolean },
) => {
  if (!unit.isTransport() || unit.data.loadedUnit === null) {
    throw new Error("Asked to create unlaod menu for unit without loaded units");
  }

  let unloadPositions1: Position[] | undefined = undefined;
  let unloadPositions2: Position[] | undefined = undefined;
  let menuInfo1 = undefined;
  let menuInfo2 = undefined;
  const infosForMenu = [];

  if (firstUnloadInfo === undefined || !firstUnloadInfo.isFirstUnit) {
    unloadPositions1 = getUnloadablePositions(unit, unit.data.loadedUnit, newPosition);

    if (firstUnloadInfo !== undefined) {
      unloadPositions1.filter((pos) => {
        return !isSamePosition(pos, firstUnloadInfo.unloadedPosition);
      });
    }

    menuInfo1 = {
      unitType: unit.data.loadedUnit.type,
      selectable: unloadPositions1.length > 0,
      num: Math.ceil(unit.data.loadedUnit.stats.hp / 10),
    };
    infosForMenu.push(menuInfo1);
  }

  if (
    "loadedUnit2" in unit.data &&
    unit.data.loadedUnit2 !== null &&
    (firstUnloadInfo === undefined || firstUnloadInfo.isFirstUnit)
  ) {
    unloadPositions2 = getUnloadablePositions(unit, unit.data.loadedUnit2, newPosition);

    if (firstUnloadInfo !== undefined) {
      unloadPositions2.filter((pos) => {
        return !isSamePosition(pos, firstUnloadInfo.unloadedPosition);
      });
    }

    menuInfo2 = {
      unitType: unit.data.loadedUnit2.type,
      selectable: unloadPositions2.length > 0,
      num: Math.ceil(unit.data.loadedUnit2.stats.hp / 10), //visual hp
    };
    infosForMenu.push(menuInfo2);
  }

  const { menuElements, yValue } = createMenuElementsForUnits(
    spriteSheets[player.data.army],
    infosForMenu,
  );

  if (unloadPositions1 !== undefined && unloadPositions1.length > 0) {
    menuElements[0].on("pointerdown", () => {
      const unloadTilesContainer = new Container();
      unloadTilesContainer.name = "unloadUnitsBox";

      for (const unloadPos of unloadPositions1) {
        const unloadTile = tileConstructor(unloadPos, "#43d9e4");
        unloadTile.eventMode = "static";

        unloadTile.on("pointerdown", () => {
          if (
            infosForMenu.length === 1 ||
            unloadPositions2?.every((pos) => {
              return isSamePosition(pos, unloadPos);
            }) === true
          ) {
            //there were no other options (or the only unloadable position for the other unit was this one), commit the unload action
            if (currentUnitClickedRef.current !== null) {
              const path = pathRef.current
                ? pathRef.current
                : [currentUnitClickedRef.current.data.position];

              const unloads = [
                { isSecondUnit: false, direction: getDirection(newPosition, unloadPos) },
              ];

              if (firstUnloadInfo !== undefined) {
                unloads.push({
                  isSecondUnit: true,
                  direction: getDirection(newPosition, firstUnloadInfo.unloadedPosition),
                });
              }

              void sendAction({
                type: "move",
                subAction: {
                  type: "unloadWait",
                  unloads: unloads,
                },
                path: path,
              });

              currentUnitClickedRef.current = null;
            }
          } else {
            unloadTilesContainer.visible = false;

            const unitSize = baseTileSize / 2;

            const unload2Option = createSubActionMenuElement("UNLOAD", 0);
            unload2Option.on("pointerdown", () => {
              const step2Menu = createUnloadMenu(
                match,
                player,
                newPosition,
                unit,
                currentUnitClickedRef,
                pathRef,
                interactiveContainer,
                spriteSheets,
                sendAction,
                { unloadedPosition: unloadPos, isFirstUnit: true },
              );

              step2Menu.zIndex = 999;
              interactiveContainer.addChild(step2Menu);
              unload2Option.parent.destroy();
            });

            const waitOption = createSubActionMenuElement("WAIT", 1);
            waitOption.on("pointerdown", () => {
              void sendAction({
                type: "move",
                subAction: {
                  type: "unloadWait",
                  unloads: [
                    { isSecondUnit: false, direction: getDirection(newPosition, unloadPos) },
                  ],
                },
                path: pathRef.current ?? [newPosition],
              });

              currentUnitClickedRef.current = null;
              waitOption.parent.destroy();
            });

            const unload2OrWaitMenu = createInGameMenu(match, newPosition, 2 * unitSize * 2, 3, [
              unload2Option,
              waitOption,
            ]);
            unload2OrWaitMenu.name = "unloadStep2ActionMenu";
            interactiveContainer.addChild(unload2OrWaitMenu);
          }

          unloadTilesContainer.destroy();
        });

        unloadTilesContainer.addChild(unloadTile);
      }

      unloadTilesContainer.zIndex = 999;
      interactiveContainer.addChild(unloadTilesContainer);
      //as soon a selection is done, destroy/erase the menu
      menuElements[0].parent.destroy();
    });
  }

  if (unloadPositions2 !== undefined && unloadPositions2.length > 0) {
    const meIndex = unloadPositions1 === undefined ? 0 : 1; //if unit1 wasnt unloadable, the index will be 0
    menuElements[meIndex].on("pointerdown", () => {
      const unloadTilesContainer = new Container();
      unloadTilesContainer.name = "unloadUnitsBox";

      for (const unloadPos of unloadPositions2) {
        const unloadTile = tileConstructor(unloadPos, "#43d9e4");
        unloadTile.eventMode = "static";

        unloadTile.on("pointerdown", () => {
          if (
            infosForMenu.length === 1 ||
            unloadPositions1?.every((pos) => {
              return isSamePosition(pos, unloadPos);
            }) === true
          ) {
            //there were no other options (or the only unloadable position for the other unit was this one), commit the unload action
            if (currentUnitClickedRef.current !== null) {
              const path = pathRef.current
                ? pathRef.current
                : [currentUnitClickedRef.current.data.position];

              const unloads = [
                { isSecondUnit: true, direction: getDirection(newPosition, unloadPos) },
              ];

              if (firstUnloadInfo !== undefined) {
                unloads.push({
                  isSecondUnit: false,
                  direction: getDirection(newPosition, firstUnloadInfo.unloadedPosition),
                });
              }

              void sendAction({
                type: "move",
                subAction: {
                  type: "unloadWait",
                  unloads: unloads,
                },
                path: path,
              });

              currentUnitClickedRef.current = null;
            }
          } else {
            unloadTilesContainer.visible = false;

            const unitSize = baseTileSize / 2;

            const unload2Option = createSubActionMenuElement("UNLOAD", 0);
            unload2Option.on("pointerdown", () => {
              const step2Menu = createUnloadMenu(
                match,
                player,
                newPosition,
                unit,
                currentUnitClickedRef,
                pathRef,
                interactiveContainer,
                spriteSheets,
                sendAction,
                { unloadedPosition: unloadPos, isFirstUnit: true },
              );

              step2Menu.zIndex = 999;
              interactiveContainer.addChild(step2Menu);
              unload2Option.parent.destroy();
            });

            const waitOption = createSubActionMenuElement("WAIT", 1);
            waitOption.on("pointerdown", () => {
              void sendAction({
                type: "move",
                subAction: {
                  type: "unloadWait",
                  unloads: [
                    { isSecondUnit: true, direction: getDirection(newPosition, unloadPos) },
                  ],
                },
                path: pathRef.current ?? [newPosition],
              });

              currentUnitClickedRef.current = null;
              waitOption.parent.destroy();
            });

            const unload2OrWaitMenu = createInGameMenu(match, newPosition, 2 * unitSize * 2, 3, [
              unload2Option,
              waitOption,
            ]);
            unload2OrWaitMenu.name = "unloadStep2ActionMenu";
            interactiveContainer.addChild(unload2OrWaitMenu);
          }

          unloadTilesContainer.destroy();
        });

        unloadTilesContainer.addChild(unloadTile);
      }

      unloadTilesContainer.zIndex = 999;
      interactiveContainer.addChild(unloadTilesContainer);
      //as soon a selection is done, destroy/erase the menu
      menuElements[0].parent.destroy();
    });
  }

  const unloadUnitSelectMenu = createInGameMenu(match, newPosition, yValue, 6, menuElements);
  unloadUnitSelectMenu.name = "unloadUnitSelect";
  return unloadUnitSelectMenu;
};
