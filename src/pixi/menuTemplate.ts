import { Container, Sprite, Texture } from "pixi.js";
import type { Position } from "shared/schemas/position";
import { baseTileSize } from "../components/client-only/MatchRenderer";
import type { MatchWrapper } from "../shared/wrappers/match";

export const createInGameMenu = (
  match: MatchWrapper,
  [x, y]: Position,
  menuHeight: number, //must match given Y values for elements
  widthInTiles: number,
  menuElements: Container[],
) => {
  //The big container holding everything
  //set its eventmode to static for interactivity and sortable for zIndex
  const menuContainer = new Container();
  menuContainer.eventMode = "static";
  menuContainer.sortableChildren = true;
  menuContainer.zIndex = 999;

  // if we are over half the map. invert menu placement
  if (x > match.map.width / 2) {
    menuContainer.x = x * baseTileSize - baseTileSize * widthInTiles; //the menu width is widthInTiles * baseTileSize
  }
  //we are not over half the map, menu is placed next to factory
  else {
    menuContainer.x = x * baseTileSize + baseTileSize;
  }

  //if our menu would appear below the middle of the map, we need to bring it up!
  if (y >= match.map.height / 2 && match.map.height - y < menuElements.length) {
    const spaceLeft = match.map.height - y;
    menuContainer.y = (y - Math.abs(spaceLeft - menuElements.length)) * baseTileSize;
  } else {
    menuContainer.y = y * baseTileSize;
  }

  //lets loop through each unit and build the build menu
  for (const menuElement of menuElements) {
    menuContainer.addChild(menuElement);
  }

  //The extra border we see around the menu
  //TODO: Change outerborder color depending on country/army color
  const menuBG = new Sprite(Texture.WHITE);
  menuBG.tint = "#cacaca";
  menuBG.x = -2;
  menuBG.y = -2;
  menuBG.width = baseTileSize * widthInTiles; //expands widthInTiles tiles worth of space
  menuBG.height = menuHeight;
  menuBG.zIndex = -1;
  menuBG.alpha = 1;
  menuContainer.addChild(menuBG);
  return menuContainer;
};
