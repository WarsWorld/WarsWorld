// eslint-disable-next-line @typescript-eslint/ban-ts-comment// @ts-nocheckimport {  Container,  Text,  Spritesheet,  AnimatedSprite,  BitmapText,  TextStyle,  Texture,  Sprite,  BitmapFont,  Assets,} from "pixi.js";import unitData from "./unitData";export default async function showMenu(  spriteSheet: Spritesheet,  type: string,  slot: number,  x: number,  y: number) {  const menuContainer = new Container();  menuContainer.eventMode = "static";  menuContainer.sortableChildren = true;  const unitInfo = await unitData(-1, type);  console.log("ASSETS LOADING!");  await Assets.load("/wwFont.fnt").then( (asset) =>{    console.log(asset);    console.log("font data loaded!!!");    console.log("---------------------------");  });  console.log("now loading units!");  unitInfo.forEach((unit, index) => {    const menuElement = new Container();    menuElement.eventMode = "static";    const yValue = index * 13;    const unitSprite = new AnimatedSprite(spriteSheet.animations[unit.name]);    unitSprite.y = yValue;    unitSprite.width = 8;    unitSprite.height = 8;    unitSprite.animationSpeed = 0.07;    unitSprite.anchor.set(-0.2, -0.2);    unitSprite.play();    const unitName = new BitmapText(`${unit.menuName}`, {      fontName: "wwFont",      fontSize: 8,    });    unitName.y = yValue;    unitName.x = 15;    unitName.anchor.set(0, -0.1);    const unitCost = new BitmapText(`${unit.cost}`, {      fontName: "wwFont",      fontSize: 8,    });    unitCost.y = yValue;    unitCost.x = 60;    unitCost.anchor.set(0, -0.1);    const unitBG = new Sprite(Texture.WHITE);    unitBG.x = 0;    unitBG.y = yValue;    unitBG.width = 85;    unitBG.height = 12;    unitBG.eventMode = "static";    unitBG.tint = "#000000";    //This will make ALL unitBGs change tint, even the ones on another menuElement    menuElement.on("pointerenter", () => {      unitBG.tint = 0xffffff;      unitSprite.textures = spriteSheet.animations[unit.name + "_mdown"];      unitSprite.play();    });    menuElement.on("pointerleave", () => {      unitBG.tint = 0xd3d3d3;      unitSprite.textures = spriteSheet.animations[unit.name];      unitSprite.play();    });    menuElement.addChild(unitBG);    menuElement.addChild(unitName);    menuElement.addChild(unitCost);    menuElement.addChild(unitSprite);    menuContainer.addChild(menuElement);  });  const outerBorder = new Sprite(Texture.WHITE);  outerBorder.tint = "#d94a3b";  outerBorder.x = -2;  outerBorder.y = -2;  outerBorder.width = 89;  outerBorder.height = (unitInfo.length - 1) * 15.5;  outerBorder.zIndex = -1;  menuContainer.addChild(outerBorder);  /*menuContainer.x = x * 16 + 28;*/  menuContainer.x = x * 16 + 15;  menuContainer.y = y * 16;  return menuContainer;}