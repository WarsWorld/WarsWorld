// pixiEventHandlers.ts
import type { Container, FederatedPointerEvent } from "pixi.js";
import { Assets } from "pixi.js";
import type { MutableRefObject } from "react";
import type { Position } from "shared/schemas/position";
import { isSamePosition } from "shared/schemas/position";
import type { MatchWrapper } from "shared/wrappers/match";
import { renderedTileSize } from "../components/client-only/MatchRenderer";
import { isUnitProducingProperty } from "../shared/schemas/tile";
import type { PlayerInMatchWrapper } from "../shared/wrappers/player-in-match";
import type { UnitWrapper } from "../shared/wrappers/unit";
import { buildUnitMenu } from "./buildUnitMenu";
import { displayEnemyRange } from "./displayEnemyRange";
import { createTileContainer } from "./interactiveTileFunctions";
import type { LoadedSpriteSheet } from "./load-spritesheet";
import { renderAttackTiles } from "./renderAttackTiles";
import { renderUnitSprite } from "./renderUnitSprite";
import type { PathNode } from "./show-pathing";
import { getAccessibleNodes, showPath, updatePath } from "./show-pathing";
import subActionMenu from "./subActionMenu";

export const handleClick = async (
  event: FederatedPointerEvent,
  match: MatchWrapper,
  mapContainer: Container,
  unitContainer: Container,
  currentUnitClickedRef: MutableRefObject<UnitWrapper | null>,
  moveTilesRef: MutableRefObject<Map<Position, PathNode> | null>,
  player: PlayerInMatchWrapper,
  spriteSheets: LoadedSpriteSheet,
  actionMutation: any,
  unitRangeShowRef: MutableRefObject<"attack" | "movement" | "vision">,
  pathRef: MutableRefObject<Position[] | null>,
) => {
  //lets load our font
  await Assets.load("/aw2Font.fnt");
  const x = Math.floor((event.global.x - renderedTileSize / 2) / renderedTileSize);
  const y = Math.floor((event.global.y - renderedTileSize / 2) / renderedTileSize);

  const clickPosition: Position = [x, y];

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
      actionMutation,
    );

    unitContainer.addChild(buildMenu);
  }

  //there is an currentUnitClickedRef and move tiles (the blue squares)
  // meaning the user has already clicked on a unit
  // so now we can process those movements
  else if (currentUnitClickedRef.current && moveTilesRef.current) {
    //flag to determine if we clicked on path
    let clickedOnPathFlag = false;

    for (const [pos] of moveTilesRef.current) {
      //we found the path / user clicked on a legal path
      if (isSamePosition(clickPosition, pos)) {
        const unitInTile = match.getUnit(clickPosition);

        //TODO: Logic to handle user clicking an unit (we show its path) and
        // then clicking a transport unit (meaning user is trying to transport that unit
        if (unitInTile?.isTransport() === true) {
          //show action menu next to transport?
          //Handle logic to see if currentUnitClicked can be transported, if not, initiate cleanup
        }
        //No unit in tile / tile is empty OR we clicked on the same position unit is already in
        else if (!unitInTile || isSamePosition(currentUnitClickedRef.current.data.position, pos)) {
          //clean game area and add sprite of unit in possible "new" position
          mapContainer.getChildByName("path")?.destroy();
          mapContainer.getChildByName("arrows")?.destroy();
          unitContainer.getChildByName("preAttackBox")?.destroy();
          unitContainer
            .getChildByName(
              `unit-${currentUnitClickedRef.current.data.position[0]}-${currentUnitClickedRef.current.data.position[1]}`,
            )
            ?.destroy();

          //create new temporary sprite in selected position
          const tempUnit = renderUnitSprite(
            currentUnitClickedRef.current,
            spriteSheets,
            clickPosition,
          );
          tempUnit.name = "tempUnit";
          unitContainer.addChild(tempUnit);

          //TODO: User neeeds to be able to select their own path, below just gets the fastest/most efficient path which will not work for fog
          const accessibleNodes = getAccessibleNodes(match, currentUnitClickedRef.current);
          const newPath = updatePath(
            currentUnitClickedRef.current,
            accessibleNodes,
            undefined,
            pos,
          );

          //It extracts the path in the format the backend wants it (just an array of positions)
          pathRef.current = newPath.map((node) => node.pos);

          // display subaction menu next to unit in new position
          const subMenu = subActionMenu(
            match,
            player,
            pos,
            actionMutation,
            currentUnitClickedRef,
            pathRef,
            unitContainer,
            spriteSheets,
          );

          unitContainer.addChild(subMenu);
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
      const displayedPassableTiles = createTileContainer(
        Array.from(passablePositions.keys()),
        "#43d9e4",
        999,
        "path",
      );

      for (const sprite of displayedPassableTiles.children) {
        //TODO: This needs to re-run even when going over itself, arrow right now does not support going "backwards"
        sprite.on("mouseover", () => {
          //TODO: This also needs to select the user's path, then if not possible, the most optimal route, right now it's only the latter
          const newPath = updatePath(unitClicked, passablePositions, undefined, [
            sprite.x / (renderedTileSize / 2) - 1,
            sprite.y / (renderedTileSize / 2) - 1,
          ]);
          const arrows = showPath(spriteSheets, newPath);
          mapContainer.getChildByName("arrows")?.destroy();
          mapContainer.addChild(arrows);
        });
      }

      //TODO:
      //Loop through container, on hover, reupdate arrow container
      moveTilesRef.current = getAccessibleNodes(match, unitClicked);
      mapContainer.addChild(displayedPassableTiles);

      unitContainer.addChild(
        renderAttackTiles(
          unitContainer,
          match,
          player,
          currentUnitClickedRef,
          actionMutation,
          spriteSheets,
          null,
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
    unitContainer.getChildByName("buildMenu")?.destroy();
    unitContainer.getChildByName("preAttackBox")?.destroy();
    unitContainer.getChildByName("subMenu")?.destroy();
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
