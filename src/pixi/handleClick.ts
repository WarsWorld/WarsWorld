// pixiEventHandlers.ts
import type { FederatedPointerEvent, Container } from "pixi.js";
import type { Position } from "shared/schemas/position";
import type { MatchWrapper } from "shared/wrappers/match";
import { renderUnitSprite } from "./renderUnitSprite";
import { getAccessibleNodes, updatePath } from "./show-pathing";
import subActionMenu from "./subActionMenu";
import type { PathNode } from "./show-pathing";
import { renderedTileSize } from "../components/client-only/MatchRenderer";
import buildUnitMenu from "./buildUnitMenu";
import type { PlayerInMatchWrapper } from "../shared/wrappers/player-in-match";
import type { LoadedSpriteSheet } from "./load-spritesheet";
import type { UnitWrapper } from "../shared/wrappers/unit";
import type { MutableRefObject } from "react";
import { isUnitProducingProperty } from "../shared/schemas/tile";
import { createTileContainer } from "./interactiveTileFunctions";

export const handleClick = async (
  event: FederatedPointerEvent,
  match: MatchWrapper,
  mapContainer: Container,
  unitContainer: Container,
  currentUnitClickedRef: MutableRefObject<UnitWrapper | null>,
  pathQueueRef: MutableRefObject<Map<Position, PathNode> | null>,
  player: PlayerInMatchWrapper,
  spriteSheets: LoadedSpriteSheet,
  actionMutation: any,
  unitRangeShowRef: "attack" | "movement" | "vision",
  thirdClickRef: MutableRefObject<boolean>,
) => {
  const x = Math.floor((event.global.x - renderedTileSize / 2) / renderedTileSize);
  const y = Math.floor((event.global.y - renderedTileSize / 2) / renderedTileSize);

  const clickPosition: Position = [x, y];

  //Check if there is a unit in the tile/position clicked
  const unitClicked = match.getUnit(clickPosition);

  //Check what tile is in the tile/position clicked
  const tileClicked = match.getTile(clickPosition);

  //the third click is basically when a unit is displaying a submenu, the submenu has its own event listeners so, we want to make sure no matter what the user does, they will either click on an option or not and reset the screen back to original
  if (thirdClickRef.current) {
    thirdClickRef.current = false;
    resetScreen();
  }

  //there is an savedUnit and a path, meaning the user has already clicked on a unit beforehand
  else if (currentUnitClickedRef.current && pathQueueRef.current) {
    const currentUnitClickedPosition = currentUnitClickedRef.current.data.position;

    //flag to determine if we clicked on path
    let clickedOnPathFlag = false;

    for (const [pos] of pathQueueRef.current) {
      //we found the path / user clicked on a legal path
      if (clickPosition[0] === pos[0] && clickPosition[1] === pos[1]) {
        const unitInTile = match.getUnit(clickPosition);

        //TODO: Logic to handle user clicking an unit (we show its path) and then clicking a transport unit (meaning user is trying to transport that unit
        if (unitInTile?.isTransport()) {
          //show action menu next to transport?
          //Handle logic to see if currentUnitClicked can be transported, if not, initiate cleanup
        }
        //No unit in tile / tile is empty OR we clicked on the same position unit is already in
        else if (
          !unitInTile ||
          (currentUnitClickedPosition[0] === pos[0] && currentUnitClickedPosition[1] === pos[1])
        ) {
          thirdClickRef.current = true;

          // Remove Path
          mapContainer.getChildByName("path")?.destroy();

          //Remove current sprite of unit clicked
          unitContainer
            .getChildByName(
              `unit-${currentUnitClickedRef.current.data.position[0]}-${currentUnitClickedRef.current.data.position[1]}`,
            )
            ?.destroy();

          //create new temporary sprite in selected position
          const tempUnit = renderUnitSprite(
            currentUnitClickedRef.current,
            spriteSheets[match.getCurrentTurnPlayer().data.army],
            clickPosition,
          );
          tempUnit.name = "tempUnit";
          unitContainer.addChild(tempUnit);

          console.log("accessible nodes");
          const accessibleNodes = getAccessibleNodes(match, currentUnitClickedRef.current);
          console.log("newPath");
          const newPath = updatePath(currentUnitClickedRef.current, accessibleNodes, undefined, pos);
          console.log("newPath!!!!!");

     /*     //TODO: User neeeds to be able to select their own path, below just gets the fastest/most efficient path which will not work for fog
          const efficientPath = getShortestPathToPosition(
            match,
            currentUnitClickedRef.current,
            pos,
          );*/

          // display subaction menu next to unit in new position
          const subMenu = await subActionMenu(
            match,
            player,
            pos,
            actionMutation,
            currentUnitClickedRef,
            newPath,
          );

          unitContainer.addChild(subMenu);
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
    //Do we own this unit AND is it our turn?
    if (player.owns(unitClicked) && match.getCurrentTurnPlayer().data.id === player.data.id) {
      //is the unit ready?
      if (unitClicked.data.isReady) {
        currentUnitClickedRef.current = unitClicked;


//NEW CHANGES
        const passablePositions = getAccessibleNodes(match, unitClicked);
        console.log(passablePositions);
        const displayedPassableTiles = createTileContainer(
      Array.from(passablePositions.keys()),
      "#43d9e4",
      999,
      "path",
    );
    pathQueueRef.current = getAccessibleNodes(match, unitClicked);
    mapContainer.addChild(displayedPassableTiles);



        /*//Show its path
        const showPath = showPassableTiles(match, unitClicked);
        pathQueueRef.current = getAccessibleNodes(match, unitClicked);
        mapContainer.addChild(showPath);*/
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

    return;
  }
  //we did NOT click on a unit
  //did we click a facily AND we own that facility AND its our turn?
  else if (
    /*TODO: Check property can produce units (for example, Hachi SCOP) */ player.owns(
      tileClicked,
    ) &&
    isUnitProducingProperty(tileClicked) &&
    match.getCurrentTurnPlayer().data.id === player.data.id
  ) {
    const buildMenu = await buildUnitMenu(
      spriteSheets[player.data.army],
      match,
      player,
      clickPosition,
      actionMutation,
    );

    //The menu is added to the unitContainer because units are ALWAYS above terrain (so unitContainer.zIndex > mapContainer.zIndex, and we need the menu to be ALWAYS above units so it has to be in the unitContainer
    unitContainer.addChild(buildMenu);
  } else {
    resetScreen();
  }

  function resetScreen() {
    //removes the menu if we click anywhere, still lets the menu work
    unitContainer.getChildByName("buildMenu")?.destroy();
    unitContainer.getChildByName("subMenu")?.destroy();
    unitContainer.getChildByName("tempUnit")?.destroy();
    mapContainer.getChildByName("path")?.destroy();

    //handle if we didnt click on the path
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
          ),
        );
      }
    }

    pathQueueRef.current = null;
    currentUnitClickedRef.current = null;
  }
};
