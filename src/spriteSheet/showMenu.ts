import {
  Container,
  Text,
  Spritesheet,
  AnimatedSprite,
  Graphics,
  TextStyle,
  Texture,
  Sprite,
} from "pixi.js";
import unitData from "./unitData";

export default async function showMenu(
  spriteSheet: Spritesheet,
  type: string,
  slot: number,
  x: number,
  y: number
) {
  const menuContainer = new Container();
  menuContainer.eventMode = "static";
  menuContainer.sortableChildren = true;

  const menuElement = new Container();
  menuElement.eventMode = "static";

  const unitInfo = await unitData(-1, type);

  const style = new TextStyle({
    fontSize: 7,
    fontFamily: "Helvetica",
    fill: "#000000",
  });
  unitInfo.forEach((unit, index) => {
    const yValue = index * 14;

    const unitSprite = new AnimatedSprite(
      spriteSheet.animations[unit.name + "_mdown"]
    );
    unitSprite.y = yValue;
    unitSprite.width = 8;
    unitSprite.height = 8;
    unitSprite.animationSpeed = 0.07;
    unitSprite.anchor.set(-0.2, -0.2);
    unitSprite.play();

    const unitName = new Text(`${unit.menuName}`, style);
    unitName.y = yValue;
    unitName.x = 15;
    unitName.anchor.set(0, -0.1);

    const unitCost = new Text(`${unit.cost}`, style);
    unitCost.y = yValue;
    unitCost.x = 60;
    unitCost.anchor.set(0, -0.1);

    const unitBG = new Sprite(Texture.WHITE);
    unitBG.x = 0;
    unitBG.y = yValue;
    unitBG.width = 85;
    unitBG.height = 12;
    unitBG.eventMode = "static";
    unitBG.tint = 0xd3d3d3;

    //This will make ALL unitBGs change tint, even the ones on another menuElement
    menuElement.on("pointerenter", () => {
      unitBG.tint = 0xffffff;
    });

    menuElement.addChild(unitBG);
    menuElement.addChild(unitName);
    menuElement.addChild(unitCost);
    menuElement.addChild(unitSprite);

    menuContainer.addChild(menuElement);
  });
  const background = new Graphics();
  background.beginFill(0x9c9c9c);
  background.drawRect(-2, -2, 89, (unitInfo.length - 1) * 15.5);
  background.endFill();
  background.zIndex = -1;
  menuContainer.addChild(background);

  /*menuContainer.x = x * 16 + 28;*/
  menuContainer.x = x * 16 + 15;
  menuContainer.y = y * 16;
  return menuContainer;
}
