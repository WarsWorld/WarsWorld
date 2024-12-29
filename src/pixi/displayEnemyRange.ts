import { getAccessibleNodes, getAttackableTiles } from "./show-pathing";
import { createTileContainer } from "./interactiveTileFunctions";
import type { MatchWrapper } from "../shared/wrappers/match";
import type { UnitWrapper } from "../shared/wrappers/unit";
import type { MutableRefObject } from "react";
import { Container } from "pixi.js";

export function displayEnemyRange(
  match: MatchWrapper,
  unitClicked: UnitWrapper,
  unitRangeShowRef: MutableRefObject<"attack" | "vision" | "movement">,
) {
  if (unitRangeShowRef.current === "movement") {
    const passablePositions = getAccessibleNodes(match, unitClicked);
    const displayedPassableTiles = createTileContainer(
      Array.from(passablePositions.keys()),
      "#43d9e4",
      999,
      "path",
    );
    unitRangeShowRef.current = "attack";

    return displayedPassableTiles;
  } else if (unitRangeShowRef.current === "attack") {
    const attackablePositions = getAttackableTiles(match, unitClicked);
    const displayedPassableTiles = createTileContainer(attackablePositions, "#be1919", 999, "path");

    if (match.leagueType === "fog") {
      unitRangeShowRef.current = "vision";
    } else {
      unitRangeShowRef.current = "movement";
    }

    return displayedPassableTiles;
  }

  //TODO: Show vision
  /*else if (unitRangeShowRef.current === "vision" && match.leagueType === "fog") {
    
    unitRangeShowRef.current = "movement";
  }*/
  return new Container();
}
