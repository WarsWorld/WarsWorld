// pixiEventHandlers.ts
import { FederatedPointerEvent, Container } from "pixi.js";
import type { Position } from "shared/schemas/position";
import type { MatchWrapper } from "shared/wrappers/match";
import { renderUnitSprite } from "./renderUnitSprite";
import { getAccessibleNodes, showPassableTiles, getShortestPathToPosition } from "./show-pathing";
import subActionMenu from "./subActionMenu";
import { PathNode } from "./show-pathing";
import { renderedTileSize } from "../components/client-only/MatchRenderer";
import buildUnitMenu from "./buildUnitMenu";
import { PlayerInMatchWrapper } from "../shared/wrappers/player-in-match";
import type { LoadedSpriteSheet } from "./load-spritesheet";
import type { FrontendUnit } from "../frontend/components/match/FrontendUnit";
import { UnitWrapper } from "../shared/wrappers/unit";
import { MutableRefObject } from "react";

export const handleClick = async (
  event: FederatedPointerEvent,
  match: MatchWrapper,
  mapContainer: Container,
  unitContainer: Container,
  currentUnitRef: MutableRefObject<UnitWrapper | null>,
  pathQueue: MutableRefObject<Map<Position, PathNode> | null>,
  player: PlayerInMatchWrapper,
  spriteSheets: LoadedSpriteSheet,
  actionMutation: any
) => {


  // Handle click events like in your original function
  // ...

  if (match.getCurrentTurnPlayer().data.id !== player.data.id) {
    return;
  }
  //removes the menu if we click anywhere, still lets the menu work
  unitContainer.getChildByName("unitMenu")?.destroy();
  unitContainer.getChildByName("subMenu")?.destroy();
  unitContainer.getChildByName("unit-ghost")?.destroy();



  const x = Math.floor((event.global.x - renderedTileSize / 2) / renderedTileSize);
  const y = Math.floor((event.global.y - renderedTileSize / 2) / renderedTileSize);

  const clickPosition: Position = [x, y];


  // UNIT MOVING HANDLING

  //Handle clicking on path
  if ( pathQueue.current && currentUnitRef.current) {
    for (const [pos] of pathQueue.current) {
      if (clickPosition[0] === pos[0] && clickPosition[1] === pos[1]) {

        pathQueue.current = null;

        mapContainer.getChildByName("path")?.destroy();


        // 1 - dissapear current sprite
        unitContainer.getChildByName(`unit-${currentUnitRef.current.data.position[0]}-${currentUnitRef.current.data.position[1]}`)?.destroy()

        //2 - create new sprite in position
        unitContainer.addChild(renderUnitSprite(currentUnitRef.current,spriteSheets[match.getCurrentTurnPlayer().data.army], clickPosition))

        const newPath = getShortestPathToPosition(match,currentUnitRef.current,pos)
        if (newPath === null) break;


        //4 - display subactio menu next to unit in new position
        const subMenu = await subActionMenu(match, player, currentUnitRef.current,pos, actionMutation, newPath)

        unitContainer.addChild(subMenu)
        break;

      }
    }
    //handle if we didnt click on the path
  } else if (currentUnitRef.current) {
      mapContainer.getChildByName("path")?.destroy();
      //lets add the original unit back to its original position only if the original doesnt exist
      if (match.getUnit(currentUnitRef.current.data.position) && !unitContainer.getChildByName(`unit-${currentUnitRef.current.data.position[0]}-${currentUnitRef.current.data.position[1]}`)) {
        unitContainer.addChild(renderUnitSprite(currentUnitRef.current, spriteSheets[match.getCurrentTurnPlayer().data.army]));
      }
      pathQueue.current = null;
      currentUnitRef.current = null;
    }




  const unit = match.getUnit(clickPosition);
  if (unit !== undefined) {
    //todo: ts hates this,
    //@ts-ignore
    if (player.owns(unit.data) && unit.data.isReady) {
      currentUnitRef.current = unit;
      const showPath = showPassableTiles(match,unit);
      pathQueue.current = getAccessibleNodes(match,unit)
      mapContainer.getChildByName("path")?.destroy();
      mapContainer.addChild(showPath);

    }

    return;
  }

  const changeableTile = match.getTile(clickPosition);

  if (changeableTile !== undefined) {
    //TODO: How to manage silo/show different menu
    if (player.owns(changeableTile)) {
      //this assumes the tile is a building and not a silo
      let unitMenu = await buildUnitMenu(spriteSheets[player.data.army], match,player, clickPosition, actionMutation )

      //The menu is added to the unitContainer because units are ALWAYS above terrain (so unitContainer.zIndex > mapContainer.zIndex, and we need the menu to be ALWAYS above units so it has to be in the unitContainer
      unitContainer.addChild(unitMenu)

    }
  }


};
