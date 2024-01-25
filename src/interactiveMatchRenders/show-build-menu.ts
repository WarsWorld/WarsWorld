import type { ISpritesheetData, Spritesheet } from "pixi.js";
import {
  AnimatedSprite, Assets, BitmapText, Container, Sprite, Texture
} from "pixi.js";
import type {
  Facility, UnitProperties, UnitPropertiesWithoutWeapon
} from "../shared/match-logic/game-constants/unit-properties";
import { unitPropertiesMap,
} from "../shared/match-logic/game-constants/unit-properties";
import type { PlayerInMatch } from "../shared/types/server-match-state";
import { MatchWrapper } from "../shared/wrappers/match";
import {Army} from "../shared/schemas/army";
import { UnitType } from "shared/schemas/unit";

export type OurSpriteSheetData = ISpritesheetData & {
  animations: Record<string, string[]>; countries: Record<string, string[]>;
};

type Props = {
  player: PlayerInMatch,
  match: MatchWrapper,
  spriteSheet: Spritesheet;
  facility: Facility;
  x: number;
  y: number;
  mapHeight: number;
  mapWidth: number;
  buildMutation: (input: {
    unitType: UnitType;
    position: [number, number];
    playerId: string;
    matchId: string;
}) => void;
}

export default async function showBuildMenu(
  { spriteSheet, facility, x,y,mapWidth,mapHeight,buildMutation, player, match }: Props) {

  const positionX = x;
  const positionY = y;


  //The big container holding everything
  const menuContainer = new Container();
  //set its eventmode to static for interactivity and sortable for zIndex
  menuContainer.eventMode = "static";
  menuContainer.sortableChildren = true;

  //lets check if we are past the middle, if so, lets move our menu
  if (x >= mapWidth / 2) {
    menuContainer.x = x * 16 - 87;
  } else {
    menuContainer.x = x * 16 + 18;
  }

  //the name lets us find the menu easily with getChildByName for easy removal
  menuContainer.name = "buildMenu";

  //unitInfo brings back an array with all the data we need (such as infantry name, cost, etc).

  // TODO also need to check for banned units in match and exclude those
  const unitBanned = false;

  const unitInfo: UnitPropertiesWithoutWeapon[] = [];
  const unitNames: string[] = []


  //lets loop through our units and only get the ones that can be built in this facility
  Object.keys(unitPropertiesMap).forEach((key) => {
    const childObject: UnitPropertiesWithoutWeapon = unitPropertiesMap[key];

    if (childObject.facility === facility && !unitBanned ) {
      unitNames.push(key)
      unitInfo.push(childObject)

    }

  });

  //if our menu would appear below the middle of the map, we need to bring it up!
  // Otherwise, our user will have to scroll down to see all the units, which is a poor experience
  if (y > mapHeight / 2 && mapHeight - y < unitInfo.length * 0.675) {
    const spaceLeft = mapHeight - y;
    //now if you wonder about 0.675, it basically means the
    // menu element is 67.5% of a tile, so we only move that much
    y = y - Math.abs(spaceLeft - unitInfo.length * 0.675);
  }

  menuContainer.y = y * 16;

  //lets load our font
  await Assets.load("/aw2Font.fnt");

  //lets loop through every unit we can produce.
  unitInfo.forEach((unit: UnitProperties, index) => {
    //child container to hold all the text and sprite into one place
    const menuElement = new Container();
    menuElement.eventMode = "static";

    const yValue = index * 12;


    //our unit image
    const unitSprite = new AnimatedSprite(spriteSheet.animations[unit.displayName.toLowerCase()]);
    unitSprite.y = yValue;
    unitSprite.width = 8;
    unitSprite.height = 8;
    unitSprite.animationSpeed = 0.07;
    // try to make it "centered"
    unitSprite.anchor.set(-0.2, -0.2);

    unitSprite.play();

    const unitName = new BitmapText(`${unit.displayName}`, {
      fontName: "awFont", fontSize: 12,

    });
    unitName.y = yValue;
    unitName.x = 15;
    unitName.anchor.set(0, -0.1);

    const unitCost = new BitmapText(`${unit.cost}`, {
      fontName: "awFont", fontSize: 10
    });
    unitCost.y = yValue;
    unitCost.x = 60;
    unitCost.anchor.set(0, -0.25);

    //the grey rectangle we see
    const unitBG = new Sprite(Texture.WHITE);
    unitBG.x = 0;
    unitBG.y = yValue;
    unitBG.width = 85;
    unitBG.height = 10;

    //if the player can't afford it, darken the unit
    if (player.funds < unit.cost) {
      unitBG.tint = "#9f9f9f";
      unitSprite.alpha = 0.5
      unitSprite.stop()
      unitName.alpha = 0.6
      unitCost.alpha = 0.6
      menuElement.eventMode = "none";
    }
    //player can afford it
    else {
      unitBG.eventMode = "static";
      unitBG.tint = "#d0d0d0";
      //TODO: Actually use playerId and matchId
      menuElement.on("pointerdown", () => {
        buildMutation({
          unitType: unitNames[index] as UnitType,
          position: [positionX, positionY],
          playerId: player.id,
          matchId: match.id
        })
      });
    }

    //lets add a hover effect to our elements
    menuElement.on("pointerenter", () => {
      unitBG.tint = "#f9f9f9";
    });

    menuElement.on("pointerleave", () => {
      unitBG.tint = "#d0d0d0";
    });

    menuElement.addChild(unitBG);
    menuElement.addChild(unitName);
    menuElement.addChild(unitCost);
    menuElement.addChild(unitSprite);
    menuContainer.addChild(menuElement);
  });
  //The extra border we see around the menu
  //TODO: Change outerborder color depending on country/army color
  const outerBorder = new Sprite(Texture.WHITE);
  outerBorder.tint = "#737373";
  outerBorder.x = -2;
  outerBorder.y = -2;
  outerBorder.width = 89;
  outerBorder.height = (unitInfo.length - 1) * 12 + 14;
  outerBorder.zIndex = -1;
  outerBorder.alpha = 1;
  menuContainer.addChild(outerBorder);
  return menuContainer;
}
