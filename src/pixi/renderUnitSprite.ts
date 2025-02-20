import { baseTileSize } from "components/client-only/MatchRenderer";
import type { FrontendUnit } from "frontend/components/match/FrontendUnit";
import { AnimatedSprite, Container, Sprite } from "pixi.js";
import type { Position } from "shared/schemas/position";
import type { UnitWrapper } from "../shared/wrappers/unit";
import type { LoadedSpriteSheet } from "./load-spritesheet";

type UnitType = FrontendUnit | UnitWrapper;
type SpritePosition = { x: number; y: number };

function calculatePosition(position: Position, offset = 8): SpritePosition {
  return {
    x: position[0] * baseTileSize + offset,
    y: position[1] * baseTileSize + offset,
  };
}

function createIcon(spriteSheet: LoadedSpriteSheet, pos: Position, texture: string): Sprite {
  const icon = new Sprite(spriteSheet.icons?.textures[texture]);
  icon.x = pos[0];
  icon.y = pos[1];
  icon.width = 8;
  icon.height = 8;
  icon.eventMode = "static";
  icon.zIndex = 999;
  return icon;
}

export function renderUnitSprite(
  unit: UnitType,
  spriteSheets: LoadedSpriteSheet,
  newPosition?: Position | null,
): Container {
  const position = newPosition ?? unit.data.position;
  const spritePosition = calculatePosition(position);

  // Create unit container and sprite
  const unitContainer = new Container();
  const armySpriteSheet = spriteSheets[`${unit.player.data.army}`];
  const unitSprite = new AnimatedSprite(armySpriteSheet.animations[unit.data.type]);

  // Configure unit sprite
  unitSprite.x = spritePosition.x;
  unitSprite.y = spritePosition.y;
  unitSprite.animationSpeed = 0.07;

  if (!unit.data.isReady) {
    unitSprite.tint = "#bbbbbb";
  }

  unitSprite.play();
  unitContainer.name = newPosition ? "tempUnit" : `unit-${position[0]}-${position[1]}`;
  unitContainer.addChild(unitSprite);

  // Add capture points icon if applicable
  if ("currentCapturePoints" in unit.data && unit.data.currentCapturePoints !== undefined) {
    const captureIcon = createIcon(
      spriteSheets,
      [spritePosition.x, spritePosition.y + 8],
      "capturing.png",
    );
    unitContainer.addChild(captureIcon);
  }

  // Add HP icon if not at full health
  const visualHP = unit.getVisualHP();

  if (visualHP !== 10) {
    const healthIcon = createIcon(
      spriteSheets,
      [spritePosition.x + 8, spritePosition.y + 8],
      `health-${visualHP}.png`,
    );
    unitContainer.addChild(healthIcon);
  }

  return unitContainer;
}
