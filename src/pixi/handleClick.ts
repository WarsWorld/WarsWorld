// pixiEventHandlers.ts
import type { Container } from "pixi.js";
import { Assets } from "pixi.js";
import type { MutableRefObject } from "react";
import { throwIfCantMoveIntoUnit } from "shared/match-logic/events/handlers/move";
import type { MainAction } from "shared/schemas/action";
import type { Position } from "shared/schemas/position";
import { isSamePosition } from "shared/schemas/position";
import type { MatchWrapper } from "shared/wrappers/match";
import { isUnitProducingProperty } from "../shared/schemas/tile";
import type { PlayerInMatchWrapper } from "../shared/wrappers/player-in-match";
import type { UnitWrapper } from "../shared/wrappers/unit";
import { buildUnitMenu } from "./buildUnitMenu";
import { displayEnemyRange } from "./displayEnemyRange";
import { createTilesContainer } from "./interactiveTileFunctions";
import type { LoadedSpriteSheet } from "./load-spritesheet";
import { renderAttackTiles } from "./renderAttackTiles";
import { renderUnitSprite } from "./renderUnitSprite";
import type { PathNode } from "./show-pathing";
import { getAccessibleNodes, showPath, updatePath } from "./show-pathing";
import subActionMenu from "./subActionMenu";

export const handleClick = async (
  clickPosition: Position,
  match: MatchWrapper,
  player: PlayerInMatchWrapper,
  mapContainer: Container,
  unitContainer: Container,
  interactiveContainer: Container,
  currentUnitClickedRef: MutableRefObject<UnitWrapper | null>,
  moveTilesRef: MutableRefObject<Map<Position, PathNode> | null>,
  unitRangeShowRef: MutableRefObject<"attack" | "movement" | "vision">,
  pathRef: MutableRefObject<Position[] | null>,
  spriteSheets: LoadedSpriteSheet,
  sendAction: (action: MainAction) => Promise<void>,
) => {
  //lets load our font
  await Assets.load("/aw2Font.fnt");

  //Check if there is a unit in the tile/position clicked
  const unitClicked = match.getUnit(clickPosition);

  //Check what tile is in the tile/position clicked
  const tileClicked = match.getTile(clickPosition);

  const isHachiSuperActive =
    player.data.COPowerState === "super-co-power" && player.data.coId.name === "hachi";
  const canTileBuildUnits =
    (tileClicked.type === "city" && isHachiSuperActive) || isUnitProducingProperty(tileClicked);

  //CHECK TO SEE IF WE CLICKED FACILITY
  if (
    !unitClicked &&
    player.owns(tileClicked) &&
    canTileBuildUnits &&
    match.getCurrentTurnPlayer().data.id === player.data.id &&
    currentUnitClickedRef.current === null
  ) {
    resetScreen();
    const buildMenu = buildUnitMenu(
      spriteSheets[player.data.army],
      match,
      player,
      clickPosition,
      sendAction,
    );

    interactiveContainer.addChild(buildMenu);
  }

  //there is an currentUnitClickedRef and move tiles (the blue squares)
  // meaning the user has already clicked on a unit
  // so now we can process those movements
  else if (currentUnitClickedRef.current && moveTilesRef.current) {
    const currentUnit = currentUnitClickedRef.current;
    //flag to determine if we clicked on path
    let clickedOnPathFlag = false;

    for (const [pos] of moveTilesRef.current) {
      //we found the path / user clicked on a legal path
      if (isSamePosition(clickPosition, pos)) {
        const unitInTile = match.getUnit(clickPosition);

        let canUnitMoveIntoOther = false;

        if (unitInTile) {
          try {
            throwIfCantMoveIntoUnit(currentUnit, unitInTile);
            canUnitMoveIntoOther = true;
          } catch (DispatchableError) {}
        }

        const canMoveToTile =
          unitInTile === undefined || //empty tile
          isSamePosition(currentUnit.data.position, pos) || //same position
          (unitInTile?.player.data.slot === currentUnit.player.data.slot && canUnitMoveIntoOther); //join or load

        if (canMoveToTile) {
          /*
          //clean game area and add sprite of unit in possible "new" position
          mapContainer.getChildByName("path")?.destroy();
          mapContainer.getChildByName("arrows")?.destroy();
          unitContainer.getChildByName("preAttackBox")?.destroy();
          unitContainer
            .getChildByName(`unit-${currentUnit.data.position[0]}-${currentUnit.data.position[1]}`)
            ?.destroy();

          //create new temporary sprite in selected position
          const tempUnit = renderUnitSprite(currentUnit, spriteSheets, clickPosition);
          tempUnit.name = "tempUnit";
          unitContainer.addChild(tempUnit);
          */

          // display subaction menu next to unit in new position
          const subMenu = subActionMenu(
            match,
            player,
            pos,
            currentUnit,
            currentUnitClickedRef,
            pathRef,
            unitContainer,
            interactiveContainer,
            spriteSheets,
            sendAction,
          );

          interactiveContainer.addChild(subMenu);
          moveTilesRef.current = null;
        } else {
          resetScreen();
        }

        clickedOnPathFlag = true;
        break;
      }
    }

    if (!clickedOnPathFlag) {
      //we clicked outside the path
      resetScreen();
    }
  }

  //DID WE CLICK ON A UNIT?
  else if (unitClicked) {
    resetScreen();

    //Do we own said unit and is it our turn?
    if (
      player.owns(unitClicked) &&
      match.getCurrentTurnPlayer().data.id === player.data.id &&
      unitClicked.data.isReady
    ) {
      currentUnitClickedRef.current = unitClicked;

      const passablePositions = getAccessibleNodes(match, unitClicked);
      const displayedPassableTiles = createTilesContainer(
        Array.from(passablePositions.keys()),
        "#43d9e4",
        999,
        "path",
      );

      moveTilesRef.current = passablePositions;
      mapContainer.addChild(displayedPassableTiles);

      interactiveContainer.addChild(
        renderAttackTiles(
          unitContainer,
          interactiveContainer,
          match,
          player,
          currentUnitClickedRef,
          spriteSheets,
          pathRef,
          sendAction,
        ),
      );
    }
    //todo: handle logic for clicking a transport that is loaded and NOT ready (so it can drop off units)
    else if (
      unitClicked.isTransport() /*TODO && isLoaded*/ &&
      player.owns(unitClicked) &&
      match.getCurrentTurnPlayer().data.id === player.data.id
    ) {
      //Show subaction menu of transport to drop off units
    }

    //TODO: We clicked on a unit we do not own OR its not our turn. Display unit movement/attack range/vision
    else {
      //show unit path/move/stuff

      mapContainer.addChild(displayEnemyRange(match, unitClicked, unitRangeShowRef));
    }
  }
  //we did not clicked on a facility nor a unit nor a path/move tiles, so we will do nothing other than ensure the state has been resetted clean
  else {
    resetScreen();
  }

  function resetScreen() {
    //removes all temporary sprites (menus, paths, tempunit)
    interactiveContainer.getChildByName("buildMenu")?.destroy();
    interactiveContainer.getChildByName("subMenu")?.destroy();
    interactiveContainer.getChildByName("preAttackBox")?.destroy(); //TODO ??
    unitContainer.getChildByName("tempUnit")?.destroy();
    mapContainer.getChildByName("path")?.destroy();
    mapContainer.getChildByName("arrows")?.destroy();

    if (currentUnitClickedRef.current) {
      //lets add the original unit back to its original position only if the original doesnt exist
      if (
        match.getUnit(currentUnitClickedRef.current.data.position) &&
        !unitContainer.getChildByName(
          `unit-${currentUnitClickedRef.current.data.position[0]}-${currentUnitClickedRef.current.data.position[1]}`,
        )
      ) {
        unitContainer.addChild(renderUnitSprite(currentUnitClickedRef.current, spriteSheets));
      }
    }

    moveTilesRef.current = null;
    currentUnitClickedRef.current = null;
    pathRef.current = null;
  }
};

export const handleHover = async (
  hoverPosition: Position,
  match: MatchWrapper,
  player: PlayerInMatchWrapper,
  mapContainer: Container,
  unitContainer: Container,
  interactiveContainer: Container,
  currentUnitClickedRef: MutableRefObject<UnitWrapper | null>,
  moveTilesRef: MutableRefObject<Map<Position, PathNode> | null>,
  unitRangeShowRef: MutableRefObject<"attack" | "movement" | "vision">,
  pathRef: MutableRefObject<Position[] | null>,
  spriteSheets: LoadedSpriteSheet,
  _sendAction: (action: MainAction) => Promise<void>, // TODO: unused yet
) => {
  await Assets.load("/aw2Font.fnt");

  const currentUnit = currentUnitClickedRef.current;
  const moveTiles = moveTilesRef.current;

  let hoveredMoveTile = false;

  if (moveTiles !== null) {
    for (const [key, _] of moveTiles) {
      if (isSamePosition(hoverPosition, key)) {
        hoveredMoveTile = true;
      }
    }
  }

  if (currentUnit != null && moveTiles != null && hoveredMoveTile) {
    const newPath = updatePath(
      currentUnit,
      moveTiles,
      pathRef.current ?? [currentUnit.data.position],
      hoverPosition,
    );
    pathRef.current = newPath;
    const arrows = showPath(spriteSheets, newPath);
    mapContainer.getChildByName("arrows")?.destroy();
    mapContainer.addChild(arrows);
  }
};
