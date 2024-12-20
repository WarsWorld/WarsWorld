// pixiEventHandlers.ts
import type { FederatedPointerEvent } from "pixi.js";
import { Container } from "pixi.js";
import type { Position } from "shared/schemas/position";
import { isSamePosition } from "shared/schemas/position";
import type { MatchWrapper } from "shared/wrappers/match";
import { renderUnitSprite } from "./renderUnitSprite";
import type { PathNode } from "./show-pathing";
import { getAccessibleNodes, getAttackTargetTiles, updatePath } from "./show-pathing";
import subActionMenu from "./subActionMenu";
import { renderedTileSize } from "../components/client-only/MatchRenderer";
import buildUnitMenu from "./buildUnitMenu";
import type { PlayerInMatchWrapper } from "../shared/wrappers/player-in-match";
import type { LoadedSpriteSheet } from "./load-spritesheet";
import type { UnitWrapper } from "../shared/wrappers/unit";
import type { MutableRefObject } from "react";
import { isUnitProducingProperty } from "../shared/schemas/tile";
import { createTileContainer } from "./interactiveTileFunctions";
import { tileConstructor } from "./sprite-constructor";

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
  unitRangeShowRef: "attack" | "movement" | "vision",
  pathRef: MutableRefObject<Position[] | null>,
) => {
  const x = Math.floor((event.global.x - renderedTileSize / 2) / renderedTileSize);
  const y = Math.floor((event.global.y - renderedTileSize / 2) / renderedTileSize);

  const clickPosition: Position = [x, y];

  //Check if there is a unit in the tile/position clicked
  const unitClicked = match.getUnit(clickPosition);

  //Check what tile is in the tile/position clicked
  const tileClicked = match.getTile(clickPosition);

  //TODO: Sometimes match.units will get bugged and units will seemingly dissapear
  //console logs to check when units "stop" existing
  /*  console.log(unitClicked);

  console.log(clickPosition);

  console.log(match.units);*/

  //did we click a facily AND we own that facility AND its our turn?
  if (
    !unitClicked &&
    player.owns(tileClicked) &&
    /*TODO: Check property can produce units (for example, Hachi SCOP) */ isUnitProducingProperty(
      tileClicked,
    ) &&
    match.getCurrentTurnPlayer().data.id === player.data.id
  ) {
    resetScreen();
    const buildMenu = await buildUnitMenu(
      spriteSheets[player.data.army],
      match,
      player,
      clickPosition,
      actionMutation,
    );

    unitContainer.addChild(buildMenu);
  }
  //are we in attack mode? (meaning, our unit is attacking)
  else if (pathRef.current && currentUnitClickedRef.current) {
    console.log("clicked on attack mode!");

    //It extracts the path in the format the backend wants it (just an array of positions)

    renderAttackTiles(match, currentUnitClickedRef.current, pathRef.current);
    pathRef.current = null;
  }

  //there is an savedUnit and a path, meaning the user has already clicked on a unit beforehand
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
          //remove path and add sprite of unit in possible "new" position
          mapContainer.getChildByName("path")?.destroy();
          unitContainer.getChildByName("preAttackBox")?.destroy();
          unitContainer
            .getChildByName(
              `unit-${currentUnitClickedRef.current.data.position[0]}-${currentUnitClickedRef.current.data.position[1]}`,
            )
            ?.destroy();

          //create new temporary sprite in selected position
          const tempUnit = renderUnitSprite(
            currentUnitClickedRef.current,
            spriteSheets[match.getCurrentTurnPlayer().data.army],
            spriteSheets.icons,
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
          const subMenu = await subActionMenu(
            match,
            player,
            pos,
            actionMutation,
            currentUnitClickedRef,
            pathRef,
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

  //Is there an unit where clicked?
  else if (unitClicked) {
    resetScreen();

    if (player.owns(unitClicked) && match.getCurrentTurnPlayer().data.id === player.data.id) {
      if (unitClicked.data.isReady) {
        currentUnitClickedRef.current = unitClicked;

        const passablePositions = getAccessibleNodes(match, unitClicked);
        const displayedPassableTiles = createTileContainer(
          Array.from(passablePositions.keys()),
          "#43d9e4",
          999,
          "path",
        );
        moveTilesRef.current = getAccessibleNodes(match, unitClicked);
        mapContainer.addChild(displayedPassableTiles);

        renderAttackTiles(match, currentUnitClickedRef.current, null);
      }
      //todo: handle logic for clicking a transport that is loaded and NOT ready (so it can drop off units)
      else if (unitClicked.isTransport() /*TODO && isLoaded*/) {
        //Show subaction menu of transport to drop off units
      }
    }
    //TODO: We clicked on a unit we do not own OR its not our turn. Display unit movement/attack range/vision
    else {
      //show unit path/move/stuff
    }
  } else {
    resetScreen();
  }

  function resetScreen() {
    //removes all temporary sprites (menus, paths, tempunit)
    unitContainer.getChildByName("buildMenu")?.destroy();
    unitContainer.getChildByName("preAttackBox")?.destroy();
    unitContainer.getChildByName("subMenu")?.destroy();
    unitContainer.getChildByName("tempUnit")?.destroy();
    mapContainer.getChildByName("path")?.destroy();

    if (currentUnitClickedRef.current) {
      //lets add the original unit back to its original position only if the original doesnt exist
      if (
        match.getUnit(currentUnitClickedRef.current.data.position) &&
        !unitContainer.getChildByName(
          `unit-${currentUnitClickedRef.current.data.position[0]}-${currentUnitClickedRef.current.data.position[1]}`,
        )
      ) {
        unitContainer.addChild(
          renderUnitSprite(
            currentUnitClickedRef.current,
            spriteSheets[match.getCurrentTurnPlayer().data.army],
            spriteSheets.icons,
          ),
        );
      }
    }

    moveTilesRef.current = null;
    currentUnitClickedRef.current = null;
    pathRef.current = null;
  }

  function renderAttackTiles(match: MatchWrapper, unit: UnitWrapper, path: Position[] | null) {
    unitContainer.getChildByName("preAttackBox")?.destroy();

    let attackTiles;

    if (path) {
      attackTiles = getAttackTargetTiles(match, unit, path[path.length - 1]);
      console.log(attackTiles);
    } else {
      attackTiles = getAttackTargetTiles(match, unit);
    }

    const attackTileContainer = new Container();
    attackTileContainer.name = "preAttackBox";
    attackTileContainer.x = renderedTileSize / 4;
    attackTileContainer.y = renderedTileSize / 4;
    attackTiles.forEach((tile) => {
      const attackTile = tileConstructor(tile, "#be1919");
      attackTileContainer.addChild(attackTile);

      //todo: add onpointer down attack mutation then reset screen
      attackTile.eventMode = "static";

      if (path) {
        attackTile.on("pointerdown", () => {
          actionMutation.mutateAsync({
            type: "move",
            subAction: {
              type: "attack",
              defenderPosition: tile,
            },
            path: path,
            playerId: player.data.id,
            matchId: match.id,
          });
          //The currentUnitClicked has changed (moved, attacked, died), therefore, we delete the previous information as it is not accurate anymore
          //this also helps so when the screen resets, we dont have two copies of a unit
          currentUnitClickedRef.current = null;
        });
      }
    });
    unitContainer.addChild(attackTileContainer);
  }
};
