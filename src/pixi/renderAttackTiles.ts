import type { MatchWrapper } from "../shared/wrappers/match";
import type { UnitWrapper } from "../shared/wrappers/unit";
import type { Position } from "../shared/schemas/position";
import { getAttackTargetTiles } from "./show-pathing";
import type { DisplayObject } from "pixi.js";
import { Text } from "pixi.js";
import { Assets, BitmapText } from "pixi.js";
import { Sprite, Texture } from "pixi.js";
import { Container } from "pixi.js";
import { renderedTileSize } from "../components/client-only/MatchRenderer";
import { tileConstructor } from "./sprite-constructor";
import type { PlayerInMatchWrapper } from "../shared/wrappers/player-in-match";
import type { MutableRefObject } from "react";
import type { BattleForecast } from "./interactiveTileFunctions";
import { getBattleForecast } from "./interactiveTileFunctions";
import { renderUnitSprite } from "./renderUnitSprite";
import type { LoadedSpriteSheet } from "./load-spritesheet";

export function renderAttackTiles(
  unitContainer: Container<DisplayObject>,
  match: MatchWrapper,
  player: PlayerInMatchWrapper,
  currentUnitClickedRef: MutableRefObject<UnitWrapper | null>,
  actionMutation: any,
  spriteSheets: LoadedSpriteSheet,
  path: Position[] | null,
) {
  unitContainer.getChildByName("preAttackBox")?.destroy();

  let attackTiles;
  const attackTileContainer = new Container();
  attackTileContainer.name = "preAttackBox";
  attackTileContainer.x = renderedTileSize / 4;
  attackTileContainer.y = renderedTileSize / 4;

  if (currentUnitClickedRef.current === null) {
    return attackTileContainer;
  }

  if (path) {
    attackTiles = getAttackTargetTiles(match, currentUnitClickedRef.current, path[path.length - 1]);
  } else {
    attackTiles = getAttackTargetTiles(match, currentUnitClickedRef.current);
  }

  attackTiles.forEach((pos) => {
    const attackTile = tileConstructor(pos, "#be1919");
    attackTile.eventMode = "static";

    //lets add a hover effect to the unitBG when you hover over the menu
    attackTile.on("pointerenter", () => {
      attackTileContainer.getChildByName("probabilities")?.destroy();
      attackTileContainer.addChild(
        renderProbabilities(currentUnitClickedRef.current, match.getUnit(pos)),
      );
    });

    //when you stop hovering the menu
    attackTile.on("pointerleave", () => {
      attackTileContainer.getChildByName("probabilities")?.destroy();
    });

    if (path) {
      attackTile.on("pointerdown", () => {
        actionMutation.mutateAsync({
          type: "move",
          subAction: {
            type: "attack",
            defenderPosition: pos,
          },
          path: path,
          playerId: player.data.id,
          matchId: match.id,
        });
        //The currentUnitClicked has changed (moved, attacked, died), therefore, we delete the previous information as it is not accurate anymore
        //this also helps so when the screen resets, we dont have two copies of a unit
        currentUnitClickedRef.current = null;
      });
    }

    attackTileContainer.addChild(attackTile);
  });

  //todo: at some point maybe refactor all the numbers that are over the place here
  //into somethinc clean and consistent
  function renderProbabilities(attacker: UnitWrapper, defender: UnitWrapper) {
    const defenderPosition = defender.data.position;
    const probabilitiesContainer = new Container();
    probabilitiesContainer.name = "probabilities";
    probabilitiesContainer.x = ((defenderPosition[0] + 2.5) * renderedTileSize) / 2;
    probabilitiesContainer.y = (defenderPosition[1] * renderedTileSize) / 2;

    if (attacker === null) {
      return probabilitiesContainer;
    }

    const attackingPos = path !== null ? path[path.length - 1] : attacker.data.position;
    const { attackerDamage, defenderDamage }: BattleForecast = getBattleForecast(
      match,
      attacker,
      attackingPos,
      defenderPosition,
    );

    const background = new Sprite(Texture.WHITE);
    background.anchor.set(1, 1); //?
    background.width = renderedTileSize * 2;
    background.height = renderedTileSize * 1.25;
    background.eventMode = "static";
    background.tint = "#eaeaea";
    probabilitiesContainer.addChild(background);

    const attackerText = new BitmapText(`${attackerDamage.min}% - ${attackerDamage.max}%`, {
      fontName: "awFont",
      fontSize: 12,
    });
    attackerText.x = -renderedTileSize * 1.25 - 1;
    attackerText.y = -renderedTileSize * 1.25 + 8;
    probabilitiesContainer.addChild(attackerText);

    const defenderText = new BitmapText(`${defenderDamage.min}% - ${defenderDamage.max}%`, {
      fontName: "awFont",
      fontSize: 12,
    });
    defenderText.x = -renderedTileSize * 2 + 4;
    defenderText.y = -renderedTileSize / 2 + 2;
    probabilitiesContainer.addChild(defenderText);

    const attackerSprite = renderUnitSprite(attacker, spriteSheets, [-4.25, -2.75]);
    probabilitiesContainer.addChild(attackerSprite);

    const defenderSprite = renderUnitSprite(defender, spriteSheets, [-1.75, -1.75]);
    probabilitiesContainer.addChild(defenderSprite);

    return probabilitiesContainer;
  }

  attackTileContainer.zIndex = 999;
  return attackTileContainer;
}