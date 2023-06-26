import { Sprite, Container, Text, Spritesheet, AnimatedSprite, Graphics, TextStyle } from "pixijs";
import unitData from "./unitData";

export default async function showMenu(spriteSheet: Spritesheet, type: string, slot: number) {
  console.log(spriteSheet);
  console.log(type);
  console.log(slot);
  const menuContainer = new Container();
  const unitInfo = await unitData(-1, type);

  const style = new TextStyle({
    fontSize: 8,
    fontFamily: "Helvetica",
    fontWeight: 600,
    fill:"#000000"
  })
  unitInfo.forEach((unit, index) => {
    const unitName = new Text(`${unit.menuName}`, style);
    unitName.y = index * 16;
    unitName.x =  26;
    //Anchor so text is "centered"
    unitName.anchor.set(0,-0.25)
    const unitCost = new Text(`${unit.cost}`, style);
    unitCost.y = index * 16;
    unitCost.x = 80;
    unitCost.anchor.set(0,-0.25)
    const unitSprite = new AnimatedSprite(spriteSheet.animations[unit.name]);
    unitSprite.y = index * 16;
    unitSprite.width = 16;
    unitSprite.height = 16;
    unitSprite.animationSpeed = 0.05;
    unitSprite.play();

    const background = new Graphics();
    background.beginFill(0xd3d3d3);
    background.drawRect(0, index * 16, 110, 16);
    background.endFill();

    menuContainer.addChild(background);
    menuContainer.addChild(unitName);
    menuContainer.addChild(unitCost);
    menuContainer.addChild(unitSprite);

  });

  return menuContainer;
}
