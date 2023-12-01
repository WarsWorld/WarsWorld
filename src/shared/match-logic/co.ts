import type { CO, COID } from "shared/schemas/co";
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
import { nellAW1 } from "./cos/nell/nell-aw1";
import { olafAW1 } from "./cos/olaf/olaf-aw1";
import { gritAW2 } from "./cos/grit/grit-aw2";
import { gritAW1 } from "./cos/grit/grit-aw1";
import { eagleAW1 } from "./cos/eagle/eagle-aw1";
import { drakeAW1 } from "./cos/drake/drake-aw1";
import { kanbeiAW1 } from "./cos/kanbei/kanbei-aw1";
import { sonjaAW1 } from "./cos/sonja/sonja-aw1";
import { sturmAW1Versus } from "./cos/sturm/sturm-aw1-versus";
import { hachiAW2 } from "./cos/hachi/hachi-aw2";
import { nellAW2 } from "./cos/nell/nell-aw2";
import { colinAW2 } from "./cos/colin/colin-aw2";
import { olafAW2 } from "./cos/olaf/olaf-aw2";
import { drakeAW2 } from "./cos/drake/drake-aw2";
import { eagleAW2 } from "./cos/eagle/eagle-aw2";
import { jessAW2 } from "./cos/jess/jess-aw2";
import { kanbeiAW2 } from "./cos/kanbei/kanbei-aw2";
import { sonjaAW2 } from "./cos/sonja/sonja-aw2";
import { senseiAW2 } from "./cos/sensei/sensei-aw2";
import { sturmAW2 } from "./cos/sturm/sturm-aw2";
import { adderAW2 } from "./cos/adder/adder-aw2";
import { lashAW2 } from "./cos/lash/lash-aw2";
import { flakAW2 } from "./cos/flak/flak-aw2";
import { nellAWDS } from "./cos/nell/nell-awds";
import { hachiAWDS } from "./cos/hachi/hachi-awds";
import { jakeAWDS } from "./cos/jake/jake-awds";
import { rachelAWDS } from "./cos/rachel/rachel";
import { olafAWDS } from "./cos/olaf/olaf-awds";
import { gritAWDS } from "./cos/grit/grit-awds";
import { colinAWDS } from "./cos/colin/colin-awds";
import { sashaAWDS } from "./cos/sasha/sasha-awds";
import { eagleAWDS } from "./cos/eagle/eagle-awds";
import { drakeAWDS } from "./cos/drake/drake-awds";
import { jessAWDS } from "./cos/jess/jess-awds";
import { javierAWDS } from "./cos/javier/javier-awds";
import { kanbeiAWDS } from "./cos/kanbei/kanbei-awds";
import { sonjaAWDS } from "./cos/sonja/sonja-awds";
import { senseiAWDS } from "./cos/sensei/sensei-awds";
import { grimmAWDS } from "./cos/grimm/grimm-awds";
import { adderAWDS } from "./cos/adder/adder-awds";
import { lashAWDS } from "./cos/lash/lash-awds";
import { flakAWDS } from "./cos/flak/flak-awds";
import { juggerAWDS } from "./cos/jugger/jugger-awds";
import { koalAWDS } from "./cos/koal/koal-awds";
import { kindleAWDS } from "./cos/kindle/kindle-awds";
import { vonBoltAWDS } from "./cos/von-bolt/von-bolt-awds";

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

// we're using this index instead of just using a big array
// and calling .find on it every time getCOProperties is called
// because that function get called very often.

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
    ["sturm", sturmAW1Versus]
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
    ["flak", flakAW2]
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
    ["hawke", hachiAWDS],
    ["adder", adderAWDS],
    ["lash", lashAWDS],
    ["flak", flakAWDS],
    ["jugger", juggerAWDS],
    ["koal", koalAWDS],
    ["kindle", kindleAWDS],
    ["von-bolt", vonBoltAWDS]
  ])
};

export function getCOProperties(id: COID): COProperties {
  const map = COIndex[id.version];

  const coProps = map.get(id.name);

  if (coProps === undefined) {
    throw new Error(
      `CO ${JSON.stringify(id)} is not in the COIndex. (e.g. not implemented/added)`
    );
  }

  return coProps;
}
