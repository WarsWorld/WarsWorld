import type { inferProcedureInput } from "@trpc/server";
import type { Spritesheet } from "pixi.js";
import {
  AnimatedSprite,
  Assets,
  BitmapText,
  Container,
  Sprite,
  Texture
} from "pixi.js";
import type { AppRouter } from "server/routers/app";
import unitData from "./unitData";

export default async function showMenu(
  spriteSheet: Spritesheet,
  type: string,
  slot: number,
  x: number,
  y: number,
  mapHeight: number,
  mapWidth: number,
  buildMutation: (
    input: inferProcedureInput<AppRouter["action"]["send"]>
  ) => void
) {
  //TODO: Gotta add a "funds" value to our parameters
  // from there, include it here and any unit above our funds,
  // will be darkened out.

  //The big container holding everything
  //set its eventmode to static for interactivity and sortable for zIndex
  const menuContainer = new Container();
  menuContainer.eventMode = "static";
  menuContainer.sortableChildren = true;

  if (x > mapWidth / 2) {
    console.log();
    menuContainer.x = x * 16 + 16 - 100;
  } else {
    menuContainer.x = x * 16 + 16;
  }

  //the name lets us find the menu easily with getChildByName for easy removal
  menuContainer.name = "menu";

  //unitInfo brings back an array with all the data we need (such as infantry name, cost, etc).
  const unitInfo = unitData(-1, type);

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
  unitInfo.forEach((unit, index) => {
    //child container to hold all the text and sprite into one place
    const menuElement = new Container();
    menuElement.eventMode = "static";

    const yValue = index * 12;

    //our unit image
    console.log(unit.name);
    const unitSprite = new AnimatedSprite(spriteSheet.animations[unit.name]);
    unitSprite.y = yValue;
    unitSprite.width = 8;
    unitSprite.height = 8;
    unitSprite.animationSpeed = 0.07;
    // try to make it "centered"
    unitSprite.anchor.set(-0.2, -0.2);

    unitSprite.play();

    const unitName = new BitmapText(`${unit.menuName}`, {
      fontName: "awFont",
      fontSize: 12
    });
    unitName.y = yValue;
    unitName.x = 15;
    unitName.anchor.set(0, -0.1);

    const unitCost = new BitmapText(`${unit.cost}`, {
      fontName: "awFont",
      fontSize: 10
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

    unitBG.eventMode = "static";
    unitBG.tint = "#ffffff";
    unitBG.alpha = 0.5;

    //lets add a hover effect to our elements
    menuElement.on("pointerenter", () => {
      unitBG.alpha = 1;
    });

    menuElement.on("pointerdown", () =>
      buildMutation({
        type: "build",
        unitType: "infantry",
        position: [x, y],
        playerId: "cljvrs6nc0002js2wl5g3jo5m",
        matchId: "cljw16lea0000jscweoeop1ct"
      })
    );

    menuElement.on("pointerleave", () => {
      unitBG.alpha = 0.5;
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
  outerBorder.tint = "#8c8c8c";
  outerBorder.x = -2;
  outerBorder.y = -2;
  outerBorder.width = 89;
  outerBorder.height = (unitInfo.length - 1) * 12 + 14;
  outerBorder.zIndex = -1;
  outerBorder.alpha = 0.8;
  menuContainer.addChild(outerBorder);
  return menuContainer;
}
