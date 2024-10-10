// pixiEventHandlers.ts
import type { Container, FederatedPointerEvent } from "pixi.js";
import type { MutableRefObject } from "react";
import type { Position } from "shared/schemas/position";
import type { MatchWrapper } from "shared/wrappers/match";
import { renderedTileSize } from "../components/client-only/MatchRenderer";
import type { PlayerInMatchWrapper } from "../shared/wrappers/player-in-match";
import type { UnitWrapper } from "../shared/wrappers/unit";
import buildUnitMenu from "./buildUnitMenu";
import { createTileContainer } from "./interactiveTileFunctions";
import type { LoadedSpriteSheet } from "./load-spritesheet";
import { renderUnitSprite } from "./renderUnitSprite";
import type { PathNode } from "./show-pathing";
import { getAccessibleNodes, updatePath } from "./show-pathing";
import subActionMenu from "./subActionMenu";

export const handleClick = async (
  event: FederatedPointerEvent,
  match: MatchWrapper,
  mapContainer: Container,
  unitContainer: Container,
  currentUnitRef: MutableRefObject<UnitWrapper | null>,
  pathQueue: MutableRefObject<Map<Position, PathNode> | null>,
  player: PlayerInMatchWrapper,
  spriteSheets: LoadedSpriteSheet,
  actionMutation: any,
) => {
  if (match.getCurrentTurnPlayer().data.id !== player.data.id) {
    return;
  }

  const x = Math.floor((event.global.x - renderedTileSize / 2) / renderedTileSize);
  const y = Math.floor((event.global.y - renderedTileSize / 2) / renderedTileSize);

  const clickPosition: Position = [x, y];
  //STEPS WHEN CLICKING

  /*

so right now, everytime there is a click in the game, this function runs. Ergo, we need to be able to differ if this is the first time clicking an unit or base or if we are clicking again to select a path OR to select an action.

For example
Click #1, click on unit owned
  - now we need to show the path that unit can go to

    Click #2, clicked on a blue square of the path (we need a variable to determine if we've clicked on a path)
      -Show the unit moving to that tile
      -Display the actions menu

      Click #3, click on an action
      - perform the action, if its a transport, we need to display where can the unit go go to click #4

        Click#4,
        - show options for unit to be unloaded to


  If at any moment, the user clicks on something that doesnt do anything (such as an empty tile) then we need to clean up everything and re-render everything back to its original position.


  So having a system for click management (such as knowing if we clicked on an ally unit vs an enemy unit and showing their attack range or movement range and so on) is quite important.

 */

  //0 - is there a path active
  // if path active {}

  //if clicking on path

  //HANDLING TRANSPORT
  // if clicking on unit we OWN and its out TURN

  //else go below

  //1 - Check if it's an unit
  const unit = match.getUnit(clickPosition);

  if (unit) {
    //1.1 - Show its path
    const passablePositions = getAccessibleNodes(match, unit);
    const displayedPassableTiles = createTileContainer(
      Array.from(passablePositions.keys()),
      "#43d9e4",
      999,
      "path",
    );
    pathQueue.current = getAccessibleNodes(match, unit);
    mapContainer.addChild(displayedPassableTiles);
    //todo: ts hates this,

    if (player.owns(unit) && unit.data.isReady) {
      console.log("player owns unit");
      currentUnitRef.current = unit;
    }

    return;
  }

  //- Trigger something to understand we've clicked an unit and its path, now we follow this specific path

  //--- WAIT FOR THE NEXT CLICK ---

  //1.2 - If the player owns the unit AND has the turn AND clicks on the path

  // - Remove the original unit
  // - Show unit in new position
  // - Show subaction menu in new position

  //--- WAIT FOR NEXT CLICK ---

  //1.2.3 - If they click on action, do action, else, return to original state
  // if unit is a transport, sort out one last click to know where will units be dropped

  //1.3 - else not your turn or not your unit? Destroy the path, return to original state

  //2 - (No unit) Check if its a property AND its our turn AND we own it

  // 2.1 - Show unit building menu

  // - If click on menu, build unit on spot
  //- Else, return to original state

  // --- WAIT FOR THE NEXT CLICK ---

  //removes the menu if we click anywhere, still lets the menu work
  unitContainer.getChildByName("unitMenu")?.destroy();
  unitContainer.getChildByName("subMenu")?.destroy();
  unitContainer.getChildByName("unit-ghost")?.destroy();

  console.log(`pathQueue ${pathQueue.current}`);
  console.log(`currentUnitRef.current ${currentUnitRef.current}`);

  // UNIT MOVING HANDLING

  //Handle clicking on path
  if (pathQueue.current && currentUnitRef.current) {
    for (const [pos] of pathQueue.current) {
      if (clickPosition[0] === pos[0] && clickPosition[1] === pos[1]) {
        pathQueue.current = null;

        mapContainer.getChildByName("path")?.destroy();

        // 1 - dissapear current sprite
        unitContainer
          .getChildByName(
            `unit-${currentUnitRef.current.data.position[0]}-${currentUnitRef.current.data.position[1]}`,
          )
          ?.destroy();

        //2 - create new sprite in position
        unitContainer.addChild(
          renderUnitSprite(
            currentUnitRef.current,
            spriteSheets[match.getCurrentTurnPlayer().data.army],
            clickPosition,
          ),
        );

        const accessibleNodes = getAccessibleNodes(match, currentUnitRef.current);
        const newPath = updatePath(currentUnitRef.current, accessibleNodes, undefined, pos);

        if (newPath === null) {
          break;
        }

        //4 - display subactio menu next to unit in new position
        const subMenu = await subActionMenu(
          match,
          player,
          currentUnitRef.current,
          pos,
          actionMutation,
          newPath,
        );

        unitContainer.addChild(subMenu);
        break;
      }
    }
    //handle if we didnt click on the path
  } else if (currentUnitRef.current) {
    mapContainer.getChildByName("path")?.destroy();

    //lets add the original unit back to its original position only if the original doesnt exist
    if (
      match.getUnit(currentUnitRef.current.data.position) &&
      !unitContainer.getChildByName(
        `unit-${currentUnitRef.current.data.position[0]}-${currentUnitRef.current.data.position[1]}`,
      )
    ) {
      unitContainer.addChild(
        renderUnitSprite(
          currentUnitRef.current,
          spriteSheets[match.getCurrentTurnPlayer().data.army],
        ),
      );
    }

    pathQueue.current = null;
    currentUnitRef.current = null;
  }

  const changeableTile = match.getTile(clickPosition);

  if (changeableTile !== undefined) {
    //TODO: How to manage silo/show different menu
    if (player.owns(changeableTile)) {
      //this assumes the tile is a building and not a silo
      const unitMenu = await buildUnitMenu(
        spriteSheets[player.data.army],
        match,
        player,
        clickPosition,
        actionMutation,
      );

      //The menu is added to the unitContainer because units are ALWAYS above terrain (so unitContainer.zIndex > mapContainer.zIndex, and we need the menu to be ALWAYS above units so it has to be in the unitContainer
      unitContainer.addChild(unitMenu);
    }
  }
};
