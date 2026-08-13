import type { CO, COID } from "server/core/schemas/co";
import type { GameVersion } from "server/core/schemas/game-version";
import type { Position } from "server/core/schemas/position";
import type { PlayerInMatchWrapper } from "server/engine/entities/player-in-match";
import type { Hooks } from "server/engine/rules/co-hooks";
import { applyEffects } from "server/engine/constants/co-effects";
import { buildPhaseHooks } from "server/engine/constants/co-profile";
import type { COProfile } from "server/engine/constants/co-profile";
import { CO_PROFILES } from "server/engine/constants/co-profiles";
import { getMissilePositions } from "server/engine/constants/cos/rachel/get-missile-positions";
import { getRandomMeteorPosition } from "server/engine/constants/cos/sturm/get-meteor-position";
import { adderAW2 } from "server/engine/constants/cos/adder/adder-aw2";
import { adderAWDS } from "server/engine/constants/cos/adder/adder-awds";
import { andyAW1 } from "server/engine/constants/cos/andy/andy-aw1";
import { andyAW2 } from "server/engine/constants/cos/andy/andy-aw2";
import { andyAWDS } from "server/engine/constants/cos/andy/andy-awds";
import { colinAW2 } from "server/engine/constants/cos/colin/colin-aw2";
import { colinAWDS } from "server/engine/constants/cos/colin/colin-awds";
import { drakeAW1 } from "server/engine/constants/cos/drake/drake-aw1";
import { drakeAW2 } from "server/engine/constants/cos/drake/drake-aw2";
import { drakeAWDS } from "server/engine/constants/cos/drake/drake-awds";
import { eagleAW1 } from "server/engine/constants/cos/eagle/eagle-aw1";
import { eagleAW2 } from "server/engine/constants/cos/eagle/eagle-aw2";
import { eagleAWDS } from "server/engine/constants/cos/eagle/eagle-awds";
import { flakAW2 } from "server/engine/constants/cos/flak/flak-aw2";
import { flakAWDS } from "server/engine/constants/cos/flak/flak-awds";
import { grimmAWDS } from "server/engine/constants/cos/grimm/grimm-awds";
import { gritAW1 } from "server/engine/constants/cos/grit/grit-aw1";
import { gritAW2 } from "server/engine/constants/cos/grit/grit-aw2";
import { gritAWDS } from "server/engine/constants/cos/grit/grit-awds";
import { hachiAW2 } from "server/engine/constants/cos/hachi/hachi-aw2";
import { hachiAWDS } from "server/engine/constants/cos/hachi/hachi-awds";
import { hawkeAW2 } from "server/engine/constants/cos/hawke/hawke-aw2";
import { hawkeAWDS } from "server/engine/constants/cos/hawke/hawke-awds";
import { jakeAWDS } from "server/engine/constants/cos/jake/jake-awds";
import { javierAWDS } from "server/engine/constants/cos/javier/javier-awds";
import { jessAW2 } from "server/engine/constants/cos/jess/jess-aw2";
import { jessAWDS } from "server/engine/constants/cos/jess/jess-awds";
import { juggerAWDS } from "server/engine/constants/cos/jugger/jugger-awds";
import { kanbeiAW1 } from "server/engine/constants/cos/kanbei/kanbei-aw1";
import { kanbeiAW2 } from "server/engine/constants/cos/kanbei/kanbei-aw2";
import { kanbeiAWDS } from "server/engine/constants/cos/kanbei/kanbei-awds";
import { kindleAWDS } from "server/engine/constants/cos/kindle/kindle-awds";
import { koalAWDS } from "server/engine/constants/cos/koal/koal-awds";
import { lashAW2 } from "server/engine/constants/cos/lash/lash-aw2";
import { lashAWDS } from "server/engine/constants/cos/lash/lash-awds";
import { maxAW1 } from "server/engine/constants/cos/max/max-aw1";
import { maxAW2 } from "server/engine/constants/cos/max/max-aw2";
import { maxAWDS } from "server/engine/constants/cos/max/max-awds";
import { nellAW1 } from "server/engine/constants/cos/nell/nell-aw1";
import { nellAW2 } from "server/engine/constants/cos/nell/nell-aw2";
import { nellAWDS } from "server/engine/constants/cos/nell/nell-awds";
import { olafAW1 } from "server/engine/constants/cos/olaf/olaf-aw1";
import { olafAW2 } from "server/engine/constants/cos/olaf/olaf-aw2";
import { olafAWDS } from "server/engine/constants/cos/olaf/olaf-awds";
import { rachelAWDS } from "server/engine/constants/cos/rachel/rachel";
import { samiAW1 } from "server/engine/constants/cos/sami/sami-aw1";
import { samiAW2 } from "server/engine/constants/cos/sami/sami-aw2";
import { samiAWDS } from "server/engine/constants/cos/sami/sami-awds";
import { sashaAWDS } from "server/engine/constants/cos/sasha/sasha-awds";
import { senseiAW2 } from "server/engine/constants/cos/sensei/sensei-aw2";
import { senseiAWDS } from "server/engine/constants/cos/sensei/sensei-awds";
import { sonjaAW1 } from "server/engine/constants/cos/sonja/sonja-aw1";
import { sonjaAW2 } from "server/engine/constants/cos/sonja/sonja-aw2";
import { sonjaAWDS } from "server/engine/constants/cos/sonja/sonja-awds";
import { sturmAW1Versus } from "server/engine/constants/cos/sturm/sturm-aw1-versus";
import { sturmAW2 } from "server/engine/constants/cos/sturm/sturm-aw2";
import { vonBoltAWDS } from "server/engine/constants/cos/von-bolt/von-bolt-awds";

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
    ["hawke", hawkeAW2],
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

/**
 * The ORIGINAL hand-written procedural CO hooks. Retained only as the reference the declarative
 * verify tests (`co-profile-verify`, `co-effects-verify`) check against — the engine itself now
 * reads the declarative `getCOProperties` below. The frozen `co-modifiers-golden` snapshot pins that
 * the declarative output stays byte-identical to what this used to produce.
 */
export function getProceduralCOProperties(id: COID): COProperties {
  const map = COIndex[id.version];

  const coProperties = map.get(id.name);

  if (coProperties === undefined) {
    throw new Error(`CO ${JSON.stringify(id)} is not in the COIndex. (e.g. not implemented/added)`);
  }

  return coProperties;
}

// ---- Declarative CO source (the engine's actual data path) ----

type PowerPhaseKey = "coPower" | "superCoPower";

/**
 * Target-selection AI for the position-based powers. This is engine code (not CO stat data), so it
 * stays here and is grafted onto the declarative powers by version/CO/phase; the declarative effect
 * only describes the damage SHAPE.
 */
const CO_TARGETING: Record<string, (player: PlayerInMatchWrapper) => Position[]> = {
  "AWDS/rachel/superCoPower": (player) => getMissilePositions(player),
  "AW1/sturm/coPower": (player) => [getRandomMeteorPosition(player, 4, true)],
  "AW2/sturm/superCoPower": (player) => [getRandomMeteorPosition(player, 8, false)],
  "AWDS/von-bolt/superCoPower": (player) => {
    const positions = getMissilePositions(player);
    return [positions[Math.floor(Math.random() * 2) + 1]];
  },
};

const buildPower = (profile: COProfile, phaseKey: PowerPhaseKey): COPower => {
  const phase = profile[phaseKey]!;
  const effects = phase.effects;
  const calculatePositions = CO_TARGETING[`${profile.gameVersion}/${profile.key}/${phaseKey}`];

  return {
    name: phase.name ?? "",
    description: phase.description,
    stars: phase.stars ?? 0,
    hooks: buildPhaseHooks(phase),
    ...(effects !== undefined && effects.length > 0
      ? { instantEffect: (player, positions) => applyEffects(effects, player, positions) }
      : {}),
    ...(calculatePositions !== undefined ? { calculatePositions } : {}),
  };
};

/** Build engine `COProperties` from a declarative profile: hooks from `buildPhaseHooks`, powers'
 *  one-shot effects from `applyEffects`, targeting AI from `CO_TARGETING`. */
const buildCOProperties = (profile: COProfile): COProperties => ({
  displayName: profile.displayName,
  gameVersion: profile.gameVersion,
  ...(profile.dayToDay !== undefined
    ? {
        dayToDay: {
          description: profile.dayToDay.description,
          hooks: buildPhaseHooks(profile.dayToDay),
        },
      }
    : {}),
  powers: {
    ...(profile.coPower !== undefined ? { COPower: buildPower(profile, "coPower") } : {}),
    ...(profile.superCoPower !== undefined
      ? { superCOPower: buildPower(profile, "superCoPower") }
      : {}),
  },
});

let declarativeIndex: Map<string, COProperties> | null = null;
const indexKey = (name: string, version: string) => `${version}/${name}`;

const buildDeclarativeIndex = (profiles: COProfile[]): Map<string, COProperties> =>
  new Map(profiles.map((p) => [indexKey(p.key, p.gameVersion), buildCOProperties(p)]));

/**
 * Point the engine at a set of CO profiles (e.g. DB-loaded ones at server boot). Rebuilds the CO
 * index so every subsequent `getCOProperties` reads the new data. Until called, the engine uses the
 * bundled `CO_PROFILES` (proven identical to the DB by `verify-co-roundtrip`).
 */
export const setCoProfiles = (profiles: COProfile[]): void => {
  declarativeIndex = buildDeclarativeIndex(profiles);
};

export function getCOProperties(id: COID): COProperties {
  if (declarativeIndex === null) {
    declarativeIndex = buildDeclarativeIndex(CO_PROFILES);
  }

  const coProperties = declarativeIndex.get(indexKey(id.name, id.version));

  if (coProperties === undefined) {
    throw new Error(
      `CO ${JSON.stringify(id)} is not in the CO index. (e.g. not implemented/added)`,
    );
  }

  return coProperties;
}
