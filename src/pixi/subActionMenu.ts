import { Assets, BitmapText, Container, Sprite, Text, Texture } from "pixi.js";
import type { Position, Path } from "shared/schemas/position";
import type { MatchWrapper } from "../shared/wrappers/match";
import type { PlayerInMatchWrapper } from "../shared/wrappers/player-in-match";
import type { FrontendUnit } from "../frontend/components/match/FrontendUnit";
import type { SubAction } from "../shared/schemas/action";
import type { PropertyTileType } from "../shared/schemas/tile";
import { type Tile } from "../shared/schemas/tile";
import type { ChangeableTile } from "../shared/types/server-match-state";
import type { MutableRefObject } from "react";
import type { UnitWrapper } from "../shared/wrappers/unit";

export default async function subActionMenu(
  match: MatchWrapper,
  player: PlayerInMatchWrapper,
  newPosition: Position,
  //TODO: Whats the type for a mutation?
  mutation: any,
  currentUnitClickedRef: MutableRefObject<UnitWrapper | null>,
  newPath?: Path,
) {
  const menuOptions: SubAction[] = [];
  const tile = match.getTile(newPosition);
  console.log(tile.type);

  //the name will be displaying for each action
  let unit: UnitWrapper;

  if (currentUnitClickedRef.current !== null) {
    unit = currentUnitClickedRef.current;
  }

  if (unit.isInfantryOrMech()) {
    const tile: Tile | ChangeableTile = match.getTile(newPosition);
    console.log(tile);

    //check if in capturable property
    const capturableTile: PropertyTileType[] = [
      "base",
      "airport",
      "port",
      "hq",
      "lab",
      "commtower",
      "city",
    ];

    //TODO: fix this
    //@ts-ignore
    if (
      capturableTile.includes(tile.type as PropertyTileType) &&
      tile?.playerSlot !== player.data.slot
    ) {
      menuOptions.push({ type: "ability" });
    } else {
    }

    //check if silo
  }

  //check for possible attacks or next to pipeseam?
  if (unit.getNeighbouringUnits()) {
  }

  //check if indirect can attack
  if (unit.isIndirect()) {
  }

  //there's not a different unit on the tile we want to go to? then we can wait there
  if (
    match.getUnit(newPosition) === undefined ||
    (newPosition[0] === unit.data.position[0] && newPosition[1] === unit.data.position[1])
  ) {
    menuOptions.push({ type: "wait" });

    //check if new tile has a transport
  } else if (match.getUnit(newPosition)?.isTransport()) {
  }

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

  //lets load our font
  await Assets.load("/aw2Font.fnt");

  //This makes the menu elements be each below each other, it starts at 0 then gets plussed, so elements keep going down and down. yValue is not the best name for it but effectively it is that, a y value
  let yValue = 0;

  //lets loop through each unit and build the build menu
  for (const action of menuOptions) {
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

    /* //the unit sprite we see on the menu
    const actionIcon = new AnimatedSprite(spriteSheet.animations[unitType]);
    actionIcon.y = yValue;
    actionIcon.width = unitSize;
    actionIcon.height = unitSize;
    actionIcon.animationSpeed = 0.06;
    // try to make it "centered"
    actionIcon.anchor.set(-0.2, -0.2);
    actionIcon.play();
    menuElement.addChild(actionIcon);
*/
    //name of the unit

    const actionText = new BitmapText(`${action.type.toUpperCase()}`, {
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

    //TODO: WHEN CLICKING ON AN OPTION
    menuElement.on("pointerdown", () => {
      console.log(newPath);

      mutation.mutateAsync({
        type: "move",
        subAction: action,
        path: newPath,
        playerId: player.data.id,
        matchId: match.id,
      });

      //The currentUnitClicked has changed (moved, attacked, died), therefore, we delete the previous information as it is not accurate anymore
      //this also helps so when the screen resets, we dont have two copies of a unit
      currentUnitClickedRef.current = null;

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
