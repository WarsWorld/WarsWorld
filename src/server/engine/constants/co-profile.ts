import type { CO } from "server/core/schemas/co";
import type { GameVersion } from "server/core/schemas/game-version";
import type { UnitType } from "server/core/schemas/unit";
import type { UnitWrapper } from "server/engine/entities/unit";
import type { Hooks } from "server/engine/rules/co-hooks";
import { unitPropertiesMap } from "server/engine/constants/unit-properties";
import { getTerrainDefenseStars } from "server/engine/constants/terrain-properties";

/**
 * DECLARATIVE CO model — the future source of CO truth (mirrors the DB tables `CoModifier` /
 * `CoPhaseEffect` 1:1). `buildPhaseHooks` turns a phase's declarative modifiers into the engine's
 * `Hooks`, so combat reads the table instead of hand-written closures. The golden snapshot
 * (`co-modifiers-golden`) and `co-profile-verify` prove these reproduce the procedural hooks exactly.
 */

const PROPERTY_TILE_TYPES = new Set(["hq", "city", "base", "airport", "port", "lab", "commtower"]);

/** The engine's `UnitWrapper.isTransport()` set = units with a `loadedUnit` field (the type
 *  signature understates it; at runtime cruiser + carrier carry too). CO "transport" bonuses hit these. */
const TRANSPORT_UNITS = new Set<UnitType>([
  "apc",
  "transportCopter",
  "blackBoat",
  "lander",
  "cruiser",
  "carrier",
]);

/**
 * Every group a unit belongs to (units are in SEVERAL). Mirrors the engine predicates so a
 * group-targeted modifier hits the same units the procedural hook did. Kept in sync with the DB seed.
 */
export const unitGroupsOf = (type: UnitType): string[] => {
  const p = unitPropertiesMap[type];
  const groups: string[] = [];
  const isInfantry = type === "infantry" || type === "mech";
  const isIndirect = "attackRange" in p && p.attackRange[1] > 1;

  if (isInfantry) {
    groups.push("infantry");
  }

  if (isIndirect) {
    groups.push("indirect");
  }

  if (!isInfantry && !isIndirect) {
    groups.push("directVehicle");
  }

  if (p.facility === "airport" || p.movementType === "air") {
    groups.push("air");
  }

  if (p.facility === "port" || p.movementType === "sea" || p.movementType === "lander") {
    groups.push("sea");
  }

  if (TRANSPORT_UNITS.has(type)) {
    groups.push("transport");
  }

  return groups;
};

/**
 * Named runtime variables a modifier can scale by (Colin's funds, Javier's Comm Tower boost). The
 * "owner" is the CO's own unit in the engagement — attacker for attack scaling, defender for defense.
 */
const VARIABLE_RESOLVERS: Record<string, (owner: UnitWrapper) => number> = {
  funds: (owner) => owner.player.data.funds,
  commtowerBoost: (owner) => owner.player.getCommtowerAttackBoost(),
  /** Defense stars of the owner's current tile (Lash = +N% firepower per terrain star). */
  terrainStars: (owner) => getTerrainDefenseStars(owner.getTile().type),
  /** Count of property tiles the owner holds (Kindle SCOP = +3% firepower per owned property). */
  ownedProperties: (owner) =>
    owner.match.changeableTiles.filter((t) => "playerSlot" in t && owner.player.owns(t)).length,
};

export type UnitModifier = {
  /** Target: a group key, a specific unit (override), or neither = all units. */
  group?: string;
  unit?: UnitType;
  attackPct?: number;
  defensePct?: number;
  rangeDelta?: number;
  movementDelta?: number;
  visionDelta?: number;
  buildCostPct?: number;
  terrainStarsPct?: number;
  /** Flat terrain-stars bonus on the DEFENDER's own units (Drake's naval +2). */
  terrainStarsDelta?: number;
  /** Multiplies the DEFENDER's terrain stars (Lash SCOP doubles them). */
  terrainStarsMult?: number;
  /** Overrides every terrain's movement cost to this flat value (Sami Double Time, Sturm). */
  movementCostAll?: number;
  // Conditions (undefined = always).
  onTerrainKey?: string;
  onProperty?: boolean;
  onWeather?: string;
  /** Applies only when weather is NOT this (Sturm/Lash all-terrain-cost-1 except snow). */
  notWeather?: string;
  /** The unit's build facility ("airport" | "port" | "base"). Partitions air/naval/ground cleanly
   *  (each unit has exactly one) where group targeting would over/under-reach — Eagle, Sensei, Drake. */
  onFacility?: string;
  /** Excludes units of this facility (Lash's firepower skips airport units — no terrain stars). */
  facilityNot?: string;
  /** Only units that can attack (have `attackRange`) — excludes transports. Max's movement bonus. */
  requiresWeapon?: boolean;
  /** Opponent condition: applies only when the OTHER combatant is in this group. Javier = defence
   *  vs "indirect" attackers; also how Max/Sami AW1's attacker-keyed defence is reproduced. */
  vsGroup?: string;
  /** Scale a stat by an injectable variable: `floor(variable / divisor) * factor` percent added.
   *  Colin SCOP = attack by funds/300; Javier = defence by commtowerBoost (divisor 1, factor 1/2/3). */
  scaleStat?: "attack" | "defense";
  scaleVariable?: keyof typeof VARIABLE_RESOLVERS;
  scaleDivisor?: number;
  scaleFactor?: number;
};

export type CoEffect = { kind: string; params?: Record<string, unknown> };

export type PhaseProfile = {
  name?: string;
  stars?: number;
  description: string;
  luckGood?: number;
  luckBad?: number;
  visualKey?: string;
  modifiers?: UnitModifier[];
  effects?: CoEffect[];
};

export type COProfile = {
  key: CO;
  gameVersion: GameVersion;
  displayName: string;
  dayToDay?: PhaseProfile;
  coPower?: PhaseProfile;
  superCoPower?: PhaseProfile;
};

/** Whether a modifier applies (target + conditions on `unit`, plus optional opponent condition). */
const applies = (mod: UnitModifier, unit: UnitWrapper, opponent?: UnitWrapper): boolean => {
  if (mod.unit !== undefined) {
    if (unit.data.type !== mod.unit) {
      return false;
    }
  } else if (mod.group !== undefined) {
    if (!unitGroupsOf(unit.data.type).includes(mod.group)) {
      return false;
    }
  }

  if (mod.onTerrainKey !== undefined && unit.getTile().type !== mod.onTerrainKey) {
    return false;
  }

  if (mod.onProperty === true && !PROPERTY_TILE_TYPES.has(unit.getTile().type)) {
    return false;
  }

  if (mod.onWeather !== undefined && unit.match.getCurrentWeather() !== mod.onWeather) {
    return false;
  }

  if (mod.notWeather !== undefined && unit.match.getCurrentWeather() === mod.notWeather) {
    return false;
  }

  if (mod.onFacility !== undefined && unit.properties.facility !== mod.onFacility) {
    return false;
  }

  if (mod.facilityNot !== undefined && unit.properties.facility === mod.facilityNot) {
    return false;
  }

  if (mod.requiresWeapon === true && !("attackRange" in unit.properties)) {
    return false;
  }

  if (mod.vsGroup !== undefined) {
    if (opponent === undefined || !unitGroupsOf(opponent.data.type).includes(mod.vsGroup)) {
      return false;
    }
  }

  return true;
};

/** Injected-variable contribution of one scaling modifier: `floor(value / divisor) * factor`. */
const scaleContribution = (mod: UnitModifier, owner: UnitWrapper): number => {
  const value = VARIABLE_RESOLVERS[mod.scaleVariable!]?.(owner) ?? 0;
  return Math.floor(value / (mod.scaleDivisor ?? 1)) * (mod.scaleFactor ?? 1);
};

/**
 * Combined attack/defense delta over the matching modifiers: flat percent (`attackPct`/`defensePct`)
 * plus any injected-variable scaling for that stat. `undefined` when no modifier applies — preserving
 * the procedural hook's "no change" semantics. A modifier that applies with a 0 contribution still
 * makes the hook defined (Javier's always-100 baseline), matching the engine.
 */
const statDelta = (
  mods: UnitModifier[],
  owner: UnitWrapper,
  pctField: "attackPct" | "defensePct",
  stat: "attack" | "defense",
  opponent?: UnitWrapper,
): number | undefined => {
  let sum = 0;
  let found = false;

  for (const mod of mods) {
    if (!applies(mod, owner, opponent)) {
      continue;
    }

    const pct = mod[pctField];

    if (typeof pct === "number") {
      sum += pct;
      found = true;
    }

    if (mod.scaleStat === stat && mod.scaleVariable !== undefined) {
      sum += scaleContribution(mod, owner);
      found = true;
    }
  }

  return found ? sum : undefined;
};

/** Sum a per-unit modifier field over the matching modifiers; `undefined` when none match. */
const sumFor = (
  mods: UnitModifier[],
  unit: UnitWrapper,
  field: keyof UnitModifier,
): number | undefined => {
  let sum = 0;
  let found = false;

  for (const mod of mods) {
    const value = mod[field];

    if (typeof value === "number" && applies(mod, unit)) {
      sum += value;
      found = true;
    }
  }

  return found ? sum : undefined;
};

/** Sum a player-wide field (vision/buildCost) over untargeted modifiers; `undefined` when none. */
const sumGlobal = (mods: UnitModifier[], field: keyof UnitModifier): number | undefined => {
  let sum = 0;
  let found = false;

  for (const mod of mods) {
    const value = mod[field];

    if (typeof value === "number") {
      sum += value;
      found = true;
    }
  }

  return found ? sum : undefined;
};

/**
 * Build the engine `Hooks` for a phase from its declarative modifiers. Returns `undefined` from each
 * hook when nothing applies — preserving the procedural hooks' "no change" semantics exactly.
 */
export const buildPhaseHooks = (phase: PhaseProfile | undefined): Partial<Hooks> => {
  const hooks: Partial<Hooks> = {};

  if (phase === undefined) {
    return hooks;
  }

  // Luck is a phase-level constant (absolute max, not a per-unit delta), so it lives on the phase
  // and is emitted even when the phase has no unit modifiers (Nell/Flak/Jugger).
  const { luckGood, luckBad } = phase;

  if (luckGood !== undefined) {
    hooks.maxGoodLuck = () => luckGood;
  }

  if (luckBad !== undefined) {
    hooks.maxBadLuck = () => luckBad;
  }

  const mods = phase.modifiers ?? [];

  if (mods.length === 0) {
    return hooks;
  }

  const attackFields = mods.some((m) => m.attackPct !== undefined || m.scaleStat === "attack");
  const defenseFields = mods.some((m) => m.defensePct !== undefined || m.scaleStat === "defense");
  const rangeFields = mods.some((m) => m.rangeDelta !== undefined);
  const moveFields = mods.some((m) => m.movementDelta !== undefined);
  const moveCostFields = mods.some((m) => m.movementCostAll !== undefined);
  const visionFields = mods.some((m) => m.visionDelta !== undefined);
  const buildCostFields = mods.some((m) => m.buildCostPct !== undefined);
  const terrainStarsFields = mods.some(
    (m) => m.terrainStarsDelta !== undefined || m.terrainStarsMult !== undefined,
  );

  if (attackFields) {
    hooks.attack = ({ attacker, defender }) => {
      const delta = statDelta(mods, attacker, "attackPct", "attack", defender);
      return delta === undefined ? undefined : 100 + delta;
    };
  }

  if (defenseFields) {
    hooks.defense = ({ attacker, defender }) => {
      const delta = statDelta(mods, defender, "defensePct", "defense", attacker);
      return delta === undefined ? undefined : 100 + delta;
    };
  }

  if (rangeFields) {
    hooks.attackRange = (value, attacker) => {
      const delta = sumFor(mods, attacker, "rangeDelta");
      return delta === undefined ? undefined : value + delta;
    };
  }

  if (moveFields) {
    hooks.movementPoints = (value, unit) => {
      const delta = sumFor(mods, unit, "movementDelta");
      return delta === undefined ? undefined : value + delta;
    };
  }

  if (moveCostFields) {
    hooks.movementCost = (_value, unit) => {
      for (const mod of mods) {
        if (mod.movementCostAll !== undefined && applies(mod, unit)) {
          return mod.movementCostAll;
        }
      }

      return undefined;
    };
  }

  if (terrainStarsFields) {
    hooks.terrainStars = (value, { defender }) => {
      const delta = sumFor(mods, defender, "terrainStarsDelta");

      let mult: number | undefined;

      for (const mod of mods) {
        if (mod.terrainStarsMult !== undefined && applies(mod, defender)) {
          mult = (mult ?? 1) * mod.terrainStarsMult;
        }
      }

      if (delta === undefined && mult === undefined) {
        return undefined;
      }

      return (value + (delta ?? 0)) * (mult ?? 1);
    };
  }

  if (visionFields) {
    const delta = sumGlobal(mods, "visionDelta");
    hooks.vision = (value) => (delta === undefined ? undefined : value + delta);
  }

  if (buildCostFields) {
    const pct = sumGlobal(mods, "buildCostPct");
    hooks.buildCost = (value) => (pct === undefined ? undefined : value * (1 + pct / 100));
  }

  return hooks;
};

/** Per-unit-type view of a phase's flat modifiers, for the champ-select dossier (0 = no change). */
export type UnitModifierSummary = {
  attackPct: number;
  defensePct: number;
  rangeDelta: number;
  movementDelta: number;
};

/** Conditions that depend on runtime context (terrain/weather/property/opponent/scaling) rather than
 *  the unit type itself — excluded from the flat per-unit summary, which the description text covers. */
const CONTEXT_CONDITION_KEYS: (keyof UnitModifier)[] = [
  "onTerrainKey",
  "onWeather",
  "onProperty",
  "vsGroup",
  "scaleStat",
];

/** Whether a modifier's targeting is intrinsic to the unit type (group/unit/facility/weapon only). */
const targetsUnitType = (mod: UnitModifier, type: UnitType): boolean => {
  if (CONTEXT_CONDITION_KEYS.some((key) => mod[key] !== undefined)) {
    return false;
  }

  const props = unitPropertiesMap[type];

  if (mod.unit !== undefined) {
    return mod.unit === type;
  }

  if (mod.group !== undefined && !unitGroupsOf(type).includes(mod.group)) {
    return false;
  }

  if (mod.onFacility !== undefined && props.facility !== mod.onFacility) {
    return false;
  }

  if (mod.facilityNot !== undefined && props.facility === mod.facilityNot) {
    return false;
  }

  if (mod.requiresWeapon === true && !("attackRange" in props)) {
    return false;
  }

  return true;
};

/**
 * Sum a phase's unconditional modifiers for one unit type — the "always-on" attack/defense/range/
 * movement deltas shown in the champ-select ▲▼ grid. Context-conditional bonuses (Jake on plains,
 * Kindle on properties, Javier vs indirect, scaling COs) are intentionally omitted here; the phase
 * description carries them instead.
 */
export const unitDayToDayModifiers = (
  phase: PhaseProfile | undefined,
  type: UnitType,
): UnitModifierSummary => {
  const summary: UnitModifierSummary = {
    attackPct: 0,
    defensePct: 0,
    rangeDelta: 0,
    movementDelta: 0,
  };

  for (const mod of phase?.modifiers ?? []) {
    if (!targetsUnitType(mod, type)) {
      continue;
    }

    summary.attackPct += mod.attackPct ?? 0;
    summary.defensePct += mod.defensePct ?? 0;
    summary.rangeDelta += mod.rangeDelta ?? 0;
    summary.movementDelta += mod.movementDelta ?? 0;
  }

  return summary;
};
