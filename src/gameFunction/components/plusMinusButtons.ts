import spriteConstructor from "../spriteConstructor";
import { Container, Texture } from "pixi.js";

export default function plusMinusButtons(mapContainer: Container){
  const buttonContainer = new Container();
  buttonContainer.x = 0;
  buttonContainer.y = 0;
  buttonContainer.width = 100;
  buttonContainer.height = 100;
  const plusButton = spriteConstructor(
    Texture.WHITE,
    100,
    0,
    25,
    25,
    "static",
    1,
    "#6bad63"
  );
  plusButton.on("click", () => {
    mapContainer.scale.set(
      mapContainer.scale._x + 0.2,
      mapContainer.scale._y + 0.2
    );
  });
  const minusButton = spriteConstructor(Texture.WHITE, 150, 0, 25, 25, "static", 1, "#ad6363");
  minusButton.on("click", () => {
    console.log("banana");
    mapContainer.scale.set(
      mapContainer.scale._x - 0.2,
      mapContainer.scale._y - 0.2
    );


  });
  buttonContainer.addChild(plusButton);
  buttonContainer.addChild(minusButton);
  return buttonContainer;
}