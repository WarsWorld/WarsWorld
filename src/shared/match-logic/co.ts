import type { CO, COID } from "shared/schemas/co";
import type { MatchWrapper } from "shared/wrappers/match";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import type { Hooks } from "./co-hooks";
import { andyAW1 } from "./cos/andy/andy-aw1";
import { andyAW2 } from "./cos/andy/andy-aw2";
import { andyAWDS } from "./cos/andy/andy-awds";
import { maxAW1 } from "./cos/max/max-aw1";
import { maxAW2 } from "./cos/max/max-aw2";
import { maxAWDS } from "./cos/max/max-awds";
import { samiAW1 } from "./cos/sami/sami-aw1";
import { samiAW2 } from "./cos/sami/sami-aw2";
import { samiAWDS } from "./cos/sami/sami-awds";
import type { GameVersion } from "shared/schemas/game-version";
import type { Position } from "shared/schemas/position";

type InstantEffectProps = {
  match: MatchWrapper; // TODO remove match because it can be accessed through player
  player: PlayerInMatchWrapper;
};

type COPower = {
  name: string;
  description: string;
  stars: number; //Stars are 9k value for AW2 and AWDS, 10k value for AW1
  instantEffect?: (props: InstantEffectProps) => void; // TODO add positions from calculatePositions from event
  calculatePositions?: (player: PlayerInMatchWrapper) => Position[];
  hooks?: Partial<Hooks>;
};

// TODO general CO description, likes, dislikes, etc.
export type COProperties = {
  displayName: string;
  gameVersion: GameVersion;
  dayToDay?: {
    description: string;
    hooks: Partial<Hooks>;
  };
  powers: {
    COPower?: COPower;
    superCOPower?: COPower;
  };
};

// we're using this index instead of just using a big array
// and calling .find on it every time getCOProperties is called
// because that function get called very often.

const COIndex: Record<GameVersion, Map<CO, COProperties>> = {
  AW1: new Map<CO, COProperties>([
    ["andy", andyAW1], // TODO obviously
    ["sami", samiAW1],
    ["max", maxAW1]
  ]),
  AW2: new Map<CO, COProperties>([
    ["andy", andyAW2],
    ["sami", samiAW2],
    ["max", maxAW2]
  ]),
  AWDS: new Map<CO, COProperties>([
    ["andy", andyAWDS],
    ["sami", samiAWDS],
    ["max", maxAWDS]
  ])
};

export function getCOProperties(id: COID): COProperties {
  const map = COIndex[id.version];

  const coProps = map.get(id.name);

  if (coProps === undefined) {
    throw new Error(
      `CO ${JSON.stringify(
        id
      )} is not in the COIndex. (e.g. not implemented/added)`
    );
  }

  return coProps;
}
