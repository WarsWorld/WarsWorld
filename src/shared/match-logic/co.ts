import type { CO, COID } from "shared/schemas/co";
import type { GameVersion } from "shared/schemas/game-version";
import type { Position } from "shared/schemas/position";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import type { Hooks } from "./co-hooks";
import { adderAW2 } from "./game-constants/cos/adder/adder-aw2";
import { adderAWDS } from "./game-constants/cos/adder/adder-awds";
import { andyAW1 } from "./game-constants/cos/andy/andy-aw1";
import { andyAW2 } from "./game-constants/cos/andy/andy-aw2";
import { andyAWDS } from "./game-constants/cos/andy/andy-awds";
import { colinAW2 } from "./game-constants/cos/colin/colin-aw2";
import { colinAWDS } from "./game-constants/cos/colin/colin-awds";
import { drakeAW1 } from "./game-constants/cos/drake/drake-aw1";
import { drakeAW2 } from "./game-constants/cos/drake/drake-aw2";
import { drakeAWDS } from "./game-constants/cos/drake/drake-awds";
import { eagleAW1 } from "./game-constants/cos/eagle/eagle-aw1";
import { eagleAW2 } from "./game-constants/cos/eagle/eagle-aw2";
import { eagleAWDS } from "./game-constants/cos/eagle/eagle-awds";
import { flakAW2 } from "./game-constants/cos/flak/flak-aw2";
import { flakAWDS } from "./game-constants/cos/flak/flak-awds";
import { grimmAWDS } from "./game-constants/cos/grimm/grimm-awds";
import { gritAW1 } from "./game-constants/cos/grit/grit-aw1";
import { gritAW2 } from "./game-constants/cos/grit/grit-aw2";
import { gritAWDS } from "./game-constants/cos/grit/grit-awds";
import { hachiAW2 } from "./game-constants/cos/hachi/hachi-aw2";
import { hachiAWDS } from "./game-constants/cos/hachi/hachi-awds";
import { hawkeAWDS } from "./game-constants/cos/hawke/hawke-awds";
import { jakeAWDS } from "./game-constants/cos/jake/jake-awds";
import { javierAWDS } from "./game-constants/cos/javier/javier-awds";
import { jessAW2 } from "./game-constants/cos/jess/jess-aw2";
import { jessAWDS } from "./game-constants/cos/jess/jess-awds";
import { juggerAWDS } from "./game-constants/cos/jugger/jugger-awds";
import { kanbeiAW1 } from "./game-constants/cos/kanbei/kanbei-aw1";
import { kanbeiAW2 } from "./game-constants/cos/kanbei/kanbei-aw2";
import { kanbeiAWDS } from "./game-constants/cos/kanbei/kanbei-awds";
import { kindleAWDS } from "./game-constants/cos/kindle/kindle-awds";
import { koalAWDS } from "./game-constants/cos/koal/koal-awds";
import { lashAW2 } from "./game-constants/cos/lash/lash-aw2";
import { lashAWDS } from "./game-constants/cos/lash/lash-awds";
import { maxAW1 } from "./game-constants/cos/max/max-aw1";
import { maxAW2 } from "./game-constants/cos/max/max-aw2";
import { maxAWDS } from "./game-constants/cos/max/max-awds";
import { nellAW1 } from "./game-constants/cos/nell/nell-aw1";
import { nellAW2 } from "./game-constants/cos/nell/nell-aw2";
import { nellAWDS } from "./game-constants/cos/nell/nell-awds";
import { olafAW1 } from "./game-constants/cos/olaf/olaf-aw1";
import { olafAW2 } from "./game-constants/cos/olaf/olaf-aw2";
import { olafAWDS } from "./game-constants/cos/olaf/olaf-awds";
import { rachelAWDS } from "./game-constants/cos/rachel/rachel";
import { samiAW1 } from "./game-constants/cos/sami/sami-aw1";
import { samiAW2 } from "./game-constants/cos/sami/sami-aw2";
import { samiAWDS } from "./game-constants/cos/sami/sami-awds";
import { sashaAWDS } from "./game-constants/cos/sasha/sasha-awds";
import { senseiAW2 } from "./game-constants/cos/sensei/sensei-aw2";
import { senseiAWDS } from "./game-constants/cos/sensei/sensei-awds";
import { sonjaAW1 } from "./game-constants/cos/sonja/sonja-aw1";
import { sonjaAW2 } from "./game-constants/cos/sonja/sonja-aw2";
import { sonjaAWDS } from "./game-constants/cos/sonja/sonja-awds";
import { sturmAW1Versus } from "./game-constants/cos/sturm/sturm-aw1-versus";
import { sturmAW2 } from "./game-constants/cos/sturm/sturm-aw2";
import { vonBoltAWDS } from "./game-constants/cos/von-bolt/von-bolt-awds";

export type COPowerState = "no-power" | "co-power" | "super-co-power";

type COPower = {
  name: string;
  description: string;
  stars: number; //Stars are 9k value for AW2 and AWDS, 10k value for AW1
  instantEffect?: (player: PlayerInMatchWrapper, positions?: Position[]) => void;
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

// we're using these indexes / maps instead of just using a big array
// and calling .find on it every time getCOProperties is called,
// because getCOProperties gets called VERY often.

const COIndex: Record<GameVersion, Map<CO, COProperties>> = {
  AW1: new Map<CO, COProperties>([
    ["andy", andyAW1],
    ["max", maxAW1],
    ["sami", samiAW1],
    ["nell", nellAW1],
    ["olaf", olafAW1],
    ["grit", gritAW1],
    ["eagle", eagleAW1],
    ["drake", drakeAW1],
    ["kanbei", kanbeiAW1],
    ["sonja", sonjaAW1],
    ["sturm", sturmAW1Versus],
  ]),
  AW2: new Map<CO, COProperties>([
    ["andy", andyAW2],
    ["max", maxAW2],
    ["sami", samiAW2],
    ["nell", nellAW2],
    ["hachi", hachiAW2],
    ["olaf", olafAW2],
    ["grit", gritAW2],
    ["colin", colinAW2],
    ["eagle", eagleAW2],
    ["drake", drakeAW2],
    ["jess", jessAW2],
    ["kanbei", kanbeiAW2],
    ["sonja", sonjaAW2],
    ["sensei", senseiAW2],
    ["sturm", sturmAW2],
    ["hawke", hachiAW2],
    ["adder", adderAW2],
    ["lash", lashAW2],
    ["flak", flakAW2],
  ]),
  AWDS: new Map<CO, COProperties>([
    ["andy", andyAWDS],
    ["max", maxAWDS],
    ["sami", samiAWDS],
    ["nell", nellAWDS],
    ["hachi", hachiAWDS],
    ["jake", jakeAWDS],
    ["rachel", rachelAWDS],
    ["olaf", olafAWDS],
    ["grit", gritAWDS],
    ["colin", colinAWDS],
    ["sasha", sashaAWDS],
    ["eagle", eagleAWDS],
    ["drake", drakeAWDS],
    ["jess", jessAWDS],
    ["javier", javierAWDS],
    ["kanbei", kanbeiAWDS],
    ["sonja", sonjaAWDS],
    ["sensei", senseiAWDS],
    ["grimm", grimmAWDS],
    ["hawke", hawkeAWDS],
    ["adder", adderAWDS],
    ["lash", lashAWDS],
    ["flak", flakAWDS],
    ["jugger", juggerAWDS],
    ["koal", koalAWDS],
    ["kindle", kindleAWDS],
    ["von-bolt", vonBoltAWDS],
  ]),
};

export function getCOProperties(id: COID): COProperties {
  const map = COIndex[id.version];

  const coProperties = map.get(id.name);

  if (coProperties === undefined) {
    throw new Error(`CO ${JSON.stringify(id)} is not in the COIndex. (e.g. not implemented/added)`);
  }

  return coProperties;
}
