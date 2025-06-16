import type { ArmySpritesheetData } from "frontend/components/match/getSpritesheetData";
import type { Spritesheet } from "pixi.js";
import { AnimatedSprite, BitmapText, Container, Sprite, Texture } from "pixi.js";
import { unitPropertiesMap } from "shared/match-logic/game-constants/unit-properties";
import type { MainAction } from "shared/schemas/action";
import type { Position } from "shared/schemas/position";
import type { UnitType } from "shared/schemas/unit";
import { unitTypes } from "shared/schemas/unit";
import { baseTileSize } from "../../components/client-only/MatchRenderer";
import type { MatchWrapper } from "../../shared/wrappers/match";
import type { PlayerInMatchWrapper } from "../../shared/wrappers/player-in-match";
import { createInGameMenu } from "./menuTemplate";

/**
 * Creates menu of units, without applying any behaviour on click/pointerdown (must be implemented afterwards)
 */
export const createMenuElementsForUnits = (
  spriteSheet: Spritesheet<ArmySpritesheetData>,
  //num property can be any number. For example, cost for building, and hp for unloading
  unitsInMenu: { unitType: UnitType; selectable: boolean; num: number }[],
): { menuElements: Container[]; yValue: number } => {
  //this is the value we have applied to units (half a tile)
  const unitSize = baseTileSize / 2;

  //This makes the menu elements be each below each other, it starts at 0 then gets plussed, so elements keep going down and down.
  // yValue is not the best name for it but effectively it is that, a y value
  let yValue = 0;

  const menuElements: Container[] = [];

  //lets loop through each unit and build the build menu
  for (const { unitType, selectable, num } of unitsInMenu) {
    //child container to hold all the text and sprite into one place
    const menuElement = new Container();
    menuElement.eventMode = "static";

    //the grey rectangle bg that each unit has
    const unitBG = new Sprite(Texture.WHITE);
    unitBG.x = 0;
    unitBG.y = yValue;
    //TODO: Standardize these sizes
    unitBG.width = baseTileSize * 5.7;
    unitBG.height = unitSize * 1.35;
    unitBG.eventMode = "static";
    unitBG.tint = "#ffffff";
    unitBG.alpha = 0.5;
    menuElement.addChild(unitBG);

    //the unit sprite we see on the menu
    const unitSprite = new AnimatedSprite(spriteSheet.animations[unitType]);
    unitSprite.y = yValue;
    unitSprite.width = unitSize;
    unitSprite.height = unitSize;
    unitSprite.animationSpeed = 0.06;
    // try to make it "centered"
    unitSprite.anchor.set(-0.2, -0.2);
    unitSprite.play();
    menuElement.addChild(unitSprite);

    //name of the unit
    //TODO display hp in unit sprite
    const unitNameText = new BitmapText(`${unitType.toUpperCase()}`, {
      fontName: "awFont",
      fontSize: 10,
    });
    unitNameText.y = yValue;
    unitNameText.x = baseTileSize;
    //trying to line it up nicely wiht the unit icon
    unitNameText.anchor.set(0, -0.3);
    menuElement.addChild(unitNameText);

    //cost/hp/any_number displayed
    const unitCostText = new BitmapText(`${num}`, {
      fontName: "awFont",
      fontSize: 10,
    });
    unitCostText.y = yValue;
    //TODO: Standardize this size
    unitCostText.x = baseTileSize * 4;
    unitCostText.anchor.set(0, -0.25);
    menuElement.addChild(unitCostText);

    if (selectable) {
      //hover effect to the unitBG when you hover over the menu
      menuElement.on("pointerenter", () => {
        unitBG.alpha = 1;
      });

      //when you stop hovering the menu
      menuElement.on("pointerleave", () => {
        unitBG.alpha = 0.5;
      });
    }
    //can't afford units
    else {
      unitBG.tint = "#555555";
      unitSprite.tint = "#979797";
      unitSprite.stop();
      unitNameText.alpha = 0.75;
      unitCostText.alpha = 0.75;
    }

    yValue += unitSize * 2;
    menuElements.push(menuElement);
  }

  return { menuElements, yValue };
};

//only called if player has current turn
export const buildUnitMenu = (
  spriteSheet: Spritesheet<ArmySpritesheetData>,
  match: MatchWrapper,
  player: PlayerInMatchWrapper,
  [x, y]: Position,
  sendAction: (action: MainAction) => Promise<void>,
) => {
  const allowedUnits = unitTypes.filter((t) => !match.rules.bannedUnitTypes.includes(t));

  const facility = match.getTile([x, y]).type;

  // Filter allowed units based on facility type and then sort by cost
  const buildableUnitTypes = allowedUnits
    .filter((type) => unitPropertiesMap[type].facility === facility)
    .sort((a, b) => unitPropertiesMap[a].cost - unitPropertiesMap[b].cost);

  const { menuElements, yValue } = createMenuElementsForUnits(
    spriteSheet,
    buildableUnitTypes.map((type) => {
      const unitCost =
        player.getHook("buildCost")?.(unitPropertiesMap[type].cost, player.match) ??
        unitPropertiesMap[type].cost;
      return {
        unitType: type,
        selectable: player.data.funds >= unitCost,
        num: unitCost,
      };
    }),
  );

  for (let i = 0; i < menuElements.length; i++) {
    if (!(player.data.funds >= unitPropertiesMap[buildableUnitTypes[i]].cost)) {
      continue; //if not selectable because no funds, don't implement click behaviour
    }

    menuElements[i].on("pointerdown", () => {
      void sendAction({
        type: "build",
        position: [x, y],
        unitType: buildableUnitTypes[i],
      });
      //as soon a selection is done, destroy/erase the menu
      menuElements[i].parent.destroy();
    });
  }

  const buildMenu = createInGameMenu(match, [x, y], yValue, 6, menuElements);
  buildMenu.name = "buildMenu";
  return buildMenu;
};

// TODO: unused yet
const _createCaptureOption = (match: MatchWrapper, onCapture: () => void): Container => {
  const menuElement = new Container();
  menuElement.eventMode = "static";
  //TODO: missing action icons

  const actionText = new BitmapText("Capture", {
    fontName: "awFont",
    fontSize: 10,
  });
  actionText.y = 0;
  actionText.x = 60;
  actionText.anchor.set(0, -0.25);

  //the grey rectangle we see
  const menuBG = new Sprite(Texture.WHITE);
  menuBG.x = 0;
  menuBG.y = 0;
  menuBG.width = 85;
  menuBG.height = 10;
  menuBG.eventMode = "static";
  menuBG.tint = "#ffffff";
  menuBG.alpha = 0.5;

  //lets add a hover effect to our elements
  menuElement.on("pointerenter", () => {
    menuBG.alpha = 1;
  });

  menuElement.on("pointerdown", onCapture);

  menuElement.on("pointerleave", () => {
    menuBG.alpha = 0.5;
  });

  menuElement.addChild(menuBG);
  menuElement.addChild(actionText);

  return menuElement;
};
