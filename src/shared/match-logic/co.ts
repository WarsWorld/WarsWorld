import type { CO } from "shared/schemas/co";
import type { MatchWrapper } from "shared/wrappers/match";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import type { Hooks } from "./co-hooks";
type InstantEffectProps = {
  match: MatchWrapper; // TODO remove match because it can be accessed through player
  player: PlayerInMatchWrapper;
};

const GameVersions = ["AW1", "AW2", "AWDS"] as const;

type COPower = {
  name: string;
  description: string;
  stars: number; //Stars are 9k value for AW2 and AWDS, 10k value for AW1
  instantEffect?: (props: InstantEffectProps) => void;
  hooks?: Partial<Hooks>;
};

// TODO general CO description, likes, dislikes, etc.
export type COProperties = {
  displayName: string;
  gameVersion: typeof GameVersions[number];
  dayToDay?: {
    description: string;
    hooks: Partial<Hooks>;
  };
  powers: {
    COPower?: COPower;
    superCOPower?: COPower;
  };
};

const COPropertiesMap = {
  /*andy,
  drake,
  eagle,
  grit,
  hawke,
  javier,
  lash,
  colin*/
} satisfies Partial<Record<CO, COProperties>>;

export function getCOProperties(co: CO): COProperties {
  if (co in COPropertiesMap) {
    return COPropertiesMap[co as keyof typeof COPropertiesMap];
  }

  throw new Error(
    `CO ${co} is not in the COPropertiesMap. (e.g. not implemented)`
  );
}
