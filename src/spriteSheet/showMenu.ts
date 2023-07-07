import {
  Container,
  Text,
  Spritesheet,
  AnimatedSprite,
  BitmapText,
  TextStyle,
  Texture,
  Sprite,
  BitmapFont,
  Assets,
} from "pixi.js";
import unitData from "./unitData";

export default async function showMenu(
  spriteSheet: Spritesheet,
  type: string,
  slot: number,
  x: number,
  y: number
) {
  //TODO: Gotta add a "funds" value to our parameters
  // from there, include it here and any unit above our funds,
  // will be darkened out.

  //The big container holding everything
  //set its eventmode to static for interactivity and sortable for zIndex
  const menuContainer = new Container();
  menuContainer.eventMode = "static";
  menuContainer.sortableChildren = true;

  //unitInfo brings back an array with all the data we need (such as infantry name, cost, etc).
  const unitInfo = await unitData(-1, type);

  //lets load our font
  await Assets.load("/aw2Font.fnt");

  //lets loop through every unit we can produce.
  unitInfo.forEach((unit, index) => {
    //child container to hold all the text and sprite into one place
    const menuElement = new Container();
    menuElement.eventMode = "static";

    const yValue = index * 14;

    //our unit image
    const unitSprite = new AnimatedSprite(spriteSheet.animations[unit.name]);
    unitSprite.y = yValue;
    unitSprite.width = 8;
    unitSprite.height = 8;
    unitSprite.animationSpeed = 0.07;
    // try to make it "centered"
    unitSprite.anchor.set(-0.2, -0.2);
    unitSprite.tint = "rgb(255,255,255)";

    unitSprite.play();

    const unitName = new BitmapText(`${unit.menuName}`, {
      fontName: "awFont",
      fontSize: 14,
    });
    unitName.y = yValue;
    unitName.x = 15;
    unitName.anchor.set(0, -0.1);

    const unitCost = new BitmapText(`${unit.cost}`, {
      fontName: "awFont",
      fontSize: 12,
    });
    unitCost.y = yValue;
    unitCost.x = 60;
    unitCost.anchor.set(0, -0.25);

    //the grey rectangle we see
    const unitBG = new Sprite(Texture.WHITE);
    unitBG.x = 0;
    unitBG.y = yValue;
    unitBG.width = 90;
    unitBG.height = 12;
    unitBG.eventMode = "static";
    unitBG.tint = "#d3d3d3";

    //This will make ALL unitBGs change tint, even the ones on another menuElement
    menuElement.on("pointerenter", () => {
      unitBG.tint = "#ffffff";
      unitSprite.tint = "rgb(215,215,215)";
    });

    menuElement.on("pointerleave", () => {
      unitBG.tint = "#d3d3d3";
      unitSprite.tint = "rgb(255,255,255)";
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
  outerBorder.width = 94;
  outerBorder.height = (unitInfo.length - 1) * 15.5;
  outerBorder.zIndex = -1;
  menuContainer.addChild(outerBorder);
  menuContainer.x = x * 16 + 24;
  menuContainer.y = y * 16;
  menuContainer.name = "menu";
  return menuContainer;
}
