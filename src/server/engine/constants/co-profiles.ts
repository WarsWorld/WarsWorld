import type { COProfile } from "server/engine/constants/co-profile";

/**
 * Declarative CO profiles — the transcription of the procedural CO hooks into data. Verified against
 * the real engine per unit/phase by `co-profile-verify.test.ts`, and against the frozen combat
 * numbers by the golden snapshot. Seeded into the DB (Co/CoPhase/CoModifier/CoPhaseEffect).
 *
 * Authored in batches; each batch is proven equal to the procedural hooks before the next.
 * `directVehicle` = "non-foot direct" (matches `!isIndirect() && !isInfantryOrMech()`).
 */
export const CO_PROFILES: COProfile[] = [
  // ── Max ───────────────────────────────────────────────────────────────────
  {
    key: "max",
    gameVersion: "AW1",
    displayName: "Max",
    dayToDay: {
      description:
        "Non-footsoldier direct units have +50% firepower, but indirect units have -10% firepower, -10% defense and -1 range.",
      modifiers: [
        { group: "directVehicle", attackPct: 50 },
        { group: "indirect", attackPct: -10, rangeDelta: -1, defensePct: -10 },
      ],
    },
    coPower: {
      name: "Max Force",
      stars: 3,
      description:
        "Non-footsoldier direct units (and transport units) gain 1 movement and +20% firepower.",
      modifiers: [
        { group: "directVehicle", attackPct: 70, movementDelta: 1 },
        { group: "indirect", attackPct: -10 },
      ],
    },
  },
  {
    key: "max",
    gameVersion: "AW2",
    displayName: "Max",
    dayToDay: {
      description:
        "Non-footsoldier direct units have +20% firepower, but indirect units have -10% firepower and -1 range.",
      modifiers: [
        { group: "directVehicle", attackPct: 20 },
        { group: "indirect", attackPct: -10, rangeDelta: -1 },
      ],
    },
    coPower: {
      name: "Max Force",
      stars: 3,
      description: "Non-footsoldier direct units gain 1 movement and +20% firepower.",
      modifiers: [
        { group: "directVehicle", attackPct: 40 },
        { group: "directVehicle", movementDelta: 1, requiresWeapon: true },
        { group: "indirect", attackPct: -10 },
      ],
    },
    superCoPower: {
      name: "Max Blast",
      stars: 6,
      description: "Non-footsoldier direct units gain 2 movement and +40% firepower.",
      modifiers: [
        { group: "directVehicle", attackPct: 60 },
        { group: "directVehicle", movementDelta: 2, requiresWeapon: true },
        { group: "indirect", attackPct: -10 },
      ],
    },
  },
  {
    key: "max",
    gameVersion: "AWDS",
    displayName: "Max",
    dayToDay: {
      description:
        "Non-footsoldier direct units have +20% firepower, but indirect units have -1 range.",
      modifiers: [
        { group: "directVehicle", attackPct: 20 },
        { group: "indirect", rangeDelta: -1 },
      ],
    },
    coPower: {
      name: "Max Force",
      stars: 3,
      description: "Non-footsoldier direct units gain +30% firepower.",
      modifiers: [{ group: "directVehicle", attackPct: 50 }],
    },
    superCoPower: {
      name: "Max Blast",
      stars: 6,
      description: "Non-footsoldier direct units gain +50% firepower.",
      modifiers: [{ group: "directVehicle", attackPct: 70 }],
    },
  },

  // ── Grit (AW2 == AWDS) ────────────────────────────────────────────────────
  ...(["AW2", "AWDS"] as const).map(
    (gameVersion): COProfile => ({
      key: "grit",
      gameVersion,
      displayName: "Grit",
      dayToDay: {
        description:
          "Indirect units have +1 range and +20% firepower. Direct units have -20% firepower (footsoldiers are normal).",
        modifiers: [
          { group: "indirect", rangeDelta: 1, attackPct: 20 },
          { group: "directVehicle", attackPct: -20 },
        ],
      },
      coPower: {
        name: "Snipe Attack",
        stars: 3,
        description: "Indirect units gain +1 range and +30% firepower.",
        modifiers: [
          { group: "indirect", rangeDelta: 2, attackPct: 50 },
          { group: "directVehicle", attackPct: -20 },
        ],
      },
      superCoPower: {
        name: "Super Snipe",
        stars: 6,
        description: "Indirect units gain +2 range and +30% firepower.",
        modifiers: [
          { group: "indirect", rangeDelta: 3, attackPct: 50 },
          { group: "directVehicle", attackPct: -20 },
        ],
      },
    }),
  ),

  // ── Kanbei ────────────────────────────────────────────────────────────────
  {
    key: "kanbei",
    gameVersion: "AW2",
    displayName: "Kanbei",
    dayToDay: {
      description: "Units have +30% firepower and defense, but cost 20% more to build.",
      modifiers: [{ attackPct: 30, defensePct: 30, buildCostPct: 20 }],
    },
    coPower: {
      name: "Morale Boost",
      stars: 4,
      description: "Units gain +20% firepower.",
      modifiers: [{ attackPct: 50 }],
    },
    superCoPower: {
      name: "Samurai Spirit",
      stars: 7,
      description:
        "Units gain +20% firepower and defense, and their counterattacks are 50% stronger.",
      modifiers: [{ attackPct: 50, defensePct: 50 }],
      // Counterattack +50% is handled in calculateDamage — a later CoPhaseEffect (kanbeiCounter).
    },
  },

  // ── Grimm ─────────────────────────────────────────────────────────────────
  {
    key: "grimm",
    gameVersion: "AWDS",
    displayName: "Grimm",
    dayToDay: {
      description: "Units have +30% firepower and -20% defense.",
      modifiers: [{ attackPct: 30, defensePct: -20 }],
    },
    coPower: {
      name: "Knuckleduster",
      stars: 3,
      description: "Units gain +20% firepower.",
      modifiers: [{ attackPct: 50 }],
    },
    superCoPower: {
      name: "Haymaker",
      stars: 6,
      description: "Units gain +50% firepower",
      modifiers: [{ attackPct: 80 }],
    },
  },

  // ── Adder ─────────────────────────────────────────────────────────────────
  {
    key: "adder",
    gameVersion: "AW2",
    displayName: "Adder",
    coPower: {
      name: "Sideslip",
      stars: 2,
      description: "All units gain 1 movement.",
      modifiers: [{ movementDelta: 1 }],
    },
    superCoPower: {
      name: "Sidewinder",
      stars: 5,
      description: "All units gain 2 movement.",
      modifiers: [{ movementDelta: 2 }],
    },
  },

  // ── Sami ──────────────────────────────────────────────────────────────────
  {
    key: "sami",
    gameVersion: "AW1",
    displayName: "Sami",
    dayToDay: {
      description:
        "Footsoldiers have +20% firepower and +10% defense; transports gain 1 movement; other direct units have -10% firepower.",
      modifiers: [
        { group: "infantry", attackPct: 20, defensePct: 10 },
        { group: "transport", movementDelta: 1 },
        { group: "directVehicle", attackPct: -10 },
      ],
    },
    coPower: {
      name: "Double Time",
      stars: 2.5,
      description:
        "Footsoldiers gain 1 movement, +20% firepower, +10% defense and move at cost 1 on any terrain.",
      modifiers: [
        { group: "infantry", attackPct: 40, defensePct: 20, movementDelta: 1, movementCostAll: 1 },
        { group: "transport", movementDelta: 1 },
        { group: "directVehicle", attackPct: -10 },
      ],
    },
  },
  {
    key: "sami",
    gameVersion: "AW2",
    displayName: "Sami",
    dayToDay: {
      description:
        "Footsoldiers have +30% firepower; transports gain 1 movement; other direct units have -10% firepower.",
      modifiers: [
        { group: "infantry", attackPct: 30 },
        { group: "transport", movementDelta: 1 },
        { group: "directVehicle", attackPct: -10 },
      ],
    },
    coPower: {
      name: "Double Time",
      stars: 3,
      description: "Footsoldiers gain 1 movement and +20% firepower.",
      modifiers: [
        { group: "infantry", attackPct: 50, movementDelta: 1 },
        { group: "transport", movementDelta: 1 },
        { group: "directVehicle", attackPct: -10 },
      ],
    },
    superCoPower: {
      name: "Victory March",
      stars: 8,
      description: "Footsoldiers gain 2 movement, +50% firepower and instant capture.",
      modifiers: [
        { group: "infantry", attackPct: 80, movementDelta: 2 },
        { group: "transport", movementDelta: 1 },
        { group: "directVehicle", attackPct: -10 },
      ],
    },
  },
  {
    key: "sami",
    gameVersion: "AWDS",
    displayName: "Sami",
    dayToDay: {
      description: "Footsoldiers have +20% firepower; other direct units have -10% firepower.",
      modifiers: [
        { group: "infantry", attackPct: 20 },
        { group: "directVehicle", attackPct: -10 },
      ],
    },
    coPower: {
      name: "Double Time",
      stars: 3,
      description: "Footsoldiers gain 1 movement and +30% firepower.",
      modifiers: [
        { group: "infantry", attackPct: 40, movementDelta: 1 },
        { group: "directVehicle", attackPct: -10 },
      ],
    },
    superCoPower: {
      name: "Victory March",
      stars: 8,
      description: "Footsoldiers gain 2 movement, +60% firepower and instant capture.",
      modifiers: [
        { group: "infantry", attackPct: 80, movementDelta: 2 },
        { group: "directVehicle", attackPct: -10 },
      ],
    },
  },

  // ── Andy (day-to-day neutral; powers heal) ────────────────────────────────
  {
    key: "andy",
    gameVersion: "AW1",
    displayName: "Andy",
    coPower: {
      name: "Hyper Repair",
      stars: 3,
      description: "All units heal 2 HP.",
      effects: [{ kind: "heal", params: { hp: 2 } }],
    },
  },
  ...(["AW2", "AWDS"] as const).map(
    (gameVersion): COProfile => ({
      key: "andy",
      gameVersion,
      displayName: "Andy",
      coPower: {
        name: "Hyper Repair",
        stars: 3,
        description: "All units heal 2 HP.",
        effects: [{ kind: "heal", params: { hp: 2 } }],
      },
      superCoPower: {
        name: "Hyper Upgrade",
        stars: 6,
        description: "All units heal 5 HP, and gain +20% firepower and 1 movement.",
        effects: [{ kind: "heal", params: { hp: 5 } }],
        modifiers: [{ attackPct: 20, movementDelta: 1 }],
      },
    }),
  ),

  // ── Olaf (weather) ────────────────────────────────────────────────────────
  {
    key: "olaf",
    gameVersion: "AW1",
    displayName: "Olaf",
    dayToDay: {
      description: "Units have clear movement costs in snow, and snow movement costs in rain.",
    },
    coPower: {
      name: "Blizzard",
      stars: 3,
      description: "Causes it to snow until next turn.",
      effects: [{ kind: "setWeather", params: { weather: "snow", days: 1 } }],
    },
  },
  {
    key: "olaf",
    gameVersion: "AW2",
    displayName: "Olaf",
    dayToDay: {
      description: "Units have clear movement costs in snow, and snow movement costs in rain.",
    },
    coPower: {
      name: "Blizzard",
      stars: 3,
      description: "Causes it to snow until next turn.",
      effects: [{ kind: "setWeather", params: { weather: "snow", days: 1 } }],
    },
    superCoPower: {
      name: "Winter fury",
      stars: 6,
      description: "All enemy units lose 2 HP, and causes it to snow until next turn.",
      effects: [
        { kind: "damage", params: { hp: 2, zone: "global", friendlyFire: false, until1Hp: true } },
        { kind: "setWeather", params: { weather: "snow", days: 1 } },
      ],
    },
  },
  {
    key: "olaf",
    gameVersion: "AWDS",
    displayName: "Olaf",
    dayToDay: {
      description: "Units ignore snow penalties and have +20% firepower during snow.",
      modifiers: [{ attackPct: 20, onWeather: "snow" }],
    },
    coPower: {
      name: "Blizzard",
      stars: 3,
      description: "Causes it to snow for the next 2 days.",
      effects: [{ kind: "setWeather", params: { weather: "snow", days: 2 } }],
    },
    superCoPower: {
      name: "Winter fury",
      stars: 6,
      description: "All enemy units lose 2 HP, and causes it to snow for the next 2 days.",
      effects: [
        { kind: "damage", params: { hp: 2, zone: "global", friendlyFire: false, until1Hp: true } },
        { kind: "setWeather", params: { weather: "snow", days: 2 } },
      ],
    },
  },

  // ── Colin (economy + funds scaling) ───────────────────────────────────────
  ...(["AW2", "AWDS"] as const).map(
    (gameVersion): COProfile => ({
      key: "colin",
      gameVersion,
      displayName: "Colin",
      dayToDay: {
        description: "Units cost 20% less to build, but have -10% firepower.",
        modifiers: [{ attackPct: -10, buildCostPct: -20 }],
      },
      coPower: {
        name: "Gold Rush",
        stars: 2,
        description: "Current funds are multiplied by 1.5x.",
        effects: [{ kind: "multiplyFunds", params: { factor: 1.5 } }],
      },
      superCoPower: {
        name: "Power of Money",
        stars: 6,
        description: "All units gain 1% firepower per 300 funds.",
        modifiers: [{ scaleStat: "attack", scaleVariable: "funds", scaleDivisor: 300 }],
      },
    }),
  ),

  // ── Sonja (vision + luck; counter/terrain-stars/attack-first are non-hook) ─
  {
    key: "sonja",
    gameVersion: "AW1",
    displayName: "Sonja",
    dayToDay: {
      description: "Units have +1 vision, hidden stats, 25% good luck and 15% bad luck.",
      luckGood: 25,
      luckBad: 15,
      modifiers: [{ visionDelta: 1 }],
    },
    coPower: {
      name: "Enhanced Vision",
      stars: 3,
      description: "Units gain +3 vision; woods and reefs in range are revealed.",
      modifiers: [{ visionDelta: 3 }],
    },
  },
  {
    key: "sonja",
    gameVersion: "AW2",
    displayName: "Sonja",
    dayToDay: {
      // Counterattacks deal +50% (handled in calculateDamage, not a hook — not transcribed here).
      description: "Units have +1 vision, hidden stats, 10% bad luck and +50% counter damage.",
      luckBad: 10,
      modifiers: [{ visionDelta: 1 }],
    },
    coPower: {
      name: "Enhanced Vision",
      stars: 3,
      description: "Units gain +2 vision; woods and reefs in range are revealed.",
      modifiers: [{ visionDelta: 2 }],
    },
    superCoPower: {
      name: "Counter Break",
      stars: 5,
      description: "Units gain +2 vision and attack first when attacked.",
      modifiers: [{ visionDelta: 2 }],
    },
  },
  {
    key: "sonja",
    gameVersion: "AWDS",
    displayName: "Sonja",
    dayToDay: {
      // Enemy terrain stars -1 (handled in calculateDamage, not a hook — not transcribed here).
      description: "Units have +1 vision, hidden stats, 5% bad luck; enemy terrain stars -1.",
      luckBad: 5,
      modifiers: [{ visionDelta: 1 }],
    },
    coPower: {
      name: "Enhanced Vision",
      stars: 3,
      description: "Units gain +2 vision; enemy terrain stars -2; woods and reefs revealed.",
      modifiers: [{ visionDelta: 2 }],
    },
    superCoPower: {
      name: "Counter Break",
      stars: 5,
      description:
        "Units gain +2 vision; enemy terrain stars -3; units attack first when attacked.",
      modifiers: [{ visionDelta: 2 }],
    },
  },

  // ── Sensei (foot/copter buffs; ground+naval penalty by facility) ──────────
  {
    key: "sensei",
    gameVersion: "AW2",
    displayName: "Sensei",
    dayToDay: {
      description:
        "Footsoldiers +40% and B-Copters +50% firepower; transports +1 movement; ground vehicles and naval units -10% firepower.",
      modifiers: [
        { group: "infantry", attackPct: 40 },
        { unit: "battleCopter", attackPct: 50 },
        { group: "directVehicle", onFacility: "base", attackPct: -10 },
        { group: "indirect", onFacility: "base", attackPct: -10 },
        { onFacility: "port", attackPct: -10 },
        { group: "transport", movementDelta: 1 },
      ],
    },
    coPower: {
      name: "Copter Command",
      stars: 2,
      description: "B-Copters gain +25% firepower; spawns 9 HP infantry on owned cities.",
      effects: [{ kind: "spawnUnits", params: { unit: "infantry", hp: 9, on: "cities" } }],
      modifiers: [
        { group: "infantry", attackPct: 40 },
        { unit: "battleCopter", attackPct: 75 },
        { group: "directVehicle", onFacility: "base", attackPct: -10 },
        { group: "indirect", onFacility: "base", attackPct: -10 },
        { onFacility: "port", attackPct: -10 },
      ],
    },
    superCoPower: {
      name: "Airborne Assault",
      stars: 2,
      description: "B-Copters gain +25% firepower; spawns 9 HP mechs on owned cities.",
      effects: [{ kind: "spawnUnits", params: { unit: "mech", hp: 9, on: "cities" } }],
      modifiers: [
        { group: "infantry", attackPct: 40 },
        { unit: "battleCopter", attackPct: 75 },
        { group: "directVehicle", onFacility: "base", attackPct: -10 },
        { group: "indirect", onFacility: "base", attackPct: -10 },
        { onFacility: "port", attackPct: -10 },
      ],
    },
  },
  {
    key: "sensei",
    gameVersion: "AWDS",
    displayName: "Sensei",
    dayToDay: {
      description:
        "Footsoldiers +10% and B-Copters +50% firepower; transports +1 movement; naval units -10% firepower.",
      modifiers: [
        { group: "infantry", attackPct: 10 },
        { unit: "battleCopter", attackPct: 50 },
        { onFacility: "port", attackPct: -10 },
        { group: "transport", movementDelta: 1 },
      ],
    },
    coPower: {
      name: "Copter Command",
      stars: 2,
      description: "B-Copters gain +20% firepower; spawns 9 HP infantry on owned cities.",
      effects: [{ kind: "spawnUnits", params: { unit: "infantry", hp: 9, on: "cities" } }],
      modifiers: [
        { group: "infantry", attackPct: 10 },
        { unit: "battleCopter", attackPct: 70 },
        { onFacility: "port", attackPct: -10 },
      ],
    },
    superCoPower: {
      name: "Airborne Assault",
      stars: 2,
      description: "B-Copters gain +20% firepower; spawns 9 HP mechs on owned cities.",
      effects: [{ kind: "spawnUnits", params: { unit: "mech", hp: 9, on: "cities" } }],
      modifiers: [
        { group: "infantry", attackPct: 10 },
        { unit: "battleCopter", attackPct: 70 },
        { onFacility: "port", attackPct: -10 },
      ],
    },
  },

  // ── Eagle (air specials by facility; refresh-units powers) ────────────────
  {
    key: "eagle",
    gameVersion: "AW1",
    displayName: "Eagle",
    dayToDay: {
      description: "Air units +15% firepower and +10% defense; naval units -20% firepower.",
      modifiers: [
        { onFacility: "airport", attackPct: 15, defensePct: 10 },
        { onFacility: "port", attackPct: -20 },
      ],
    },
    coPower: {
      name: "Lightning Strike",
      stars: 5,
      description:
        "Non-footsoldiers may move and fire again; all units -30% firepower and -40% defense (air/naval differ).",
      effects: [{ kind: "refreshUnits", params: { excludeFoot: true } }],
      modifiers: [
        { attackPct: -30, defensePct: -40 },
        { onFacility: "airport", attackPct: 15, defensePct: 20 },
        { onFacility: "port", attackPct: -20 },
      ],
    },
  },
  {
    key: "eagle",
    gameVersion: "AW2",
    displayName: "Eagle",
    dayToDay: {
      description: "Air units +15% firepower and +10% defense; naval units -30% firepower.",
      modifiers: [
        { onFacility: "airport", attackPct: 15, defensePct: 10 },
        { onFacility: "port", attackPct: -30 },
      ],
    },
    coPower: {
      name: "Lightning Drive",
      stars: 3,
      description: "Air units gain +15% firepower and +10% defense.",
      modifiers: [{ onFacility: "airport", attackPct: 30, defensePct: 20 }],
    },
    superCoPower: {
      name: "Lightning Strike",
      stars: 9,
      description: "Air units gain +15% firepower and +10% defense; non-footsoldiers act again.",
      effects: [{ kind: "refreshUnits", params: { excludeFoot: true } }],
      modifiers: [{ onFacility: "airport", attackPct: 30, defensePct: 20 }],
    },
  },
  {
    key: "eagle",
    gameVersion: "AWDS",
    displayName: "Eagle",
    dayToDay: {
      description: "Air units +20% firepower; naval units -10% firepower.",
      modifiers: [
        { onFacility: "airport", attackPct: 20 },
        { onFacility: "port", attackPct: -10 },
      ],
    },
    coPower: {
      name: "Lightning Drive",
      stars: 3,
      description:
        "Non-footsoldiers may act again; firepower becomes 70% air, 60% vehicles, 55% naval.",
      effects: [{ kind: "refreshUnits", params: { excludeFoot: true } }],
      modifiers: [
        { attackPct: -50 },
        { onFacility: "airport", attackPct: 10 },
        { onFacility: "port", attackPct: -5 },
      ],
    },
    superCoPower: {
      name: "Lightning Strike",
      stars: 9,
      description: "Non-footsoldier units may move and fire again.",
      effects: [{ kind: "refreshUnits", params: { excludeFoot: true } }],
    },
  },

  // ── Nell (good luck) ──────────────────────────────────────────────────────
  {
    key: "nell",
    gameVersion: "AW1",
    displayName: "Nell",
    dayToDay: {
      description: "Luck is increased by 10% (for a total of 20%).",
      luckGood: 20,
    },
    coPower: {
      name: "Lucky star",
      stars: 3,
      description: "Luck is increased by an extra 40% (for a total of 60%).",
      luckGood: 60,
    },
  },
  ...(["AW2", "AWDS"] as const).map(
    (gameVersion): COProfile => ({
      key: "nell",
      gameVersion,
      displayName: "Nell",
      dayToDay: {
        description: "Luck is increased by 10% (for a total of 20%).",
        luckGood: 20,
      },
      coPower: {
        name: "Lucky star",
        stars: 3,
        description: "Luck is increased by an extra 40% (for a total of 60%).",
        luckGood: 60,
      },
      superCoPower: {
        name: "Lady Luck",
        stars: 6,
        description: "Luck is increased by an extra 80% (for a total of 100%).",
        luckGood: 100,
      },
    }),
  ),

  // ── Flak (good & bad luck) ────────────────────────────────────────────────
  {
    key: "flak",
    gameVersion: "AW2",
    displayName: "Flak",
    dayToDay: {
      description: "Units have 15% good luck and 10% bad luck.",
      luckGood: 15,
      luckBad: 10,
    },
    coPower: {
      name: "Brute Force",
      stars: 3,
      description: "Luck changes to 40% good luck and 20% bad luck.",
      luckGood: 40,
      luckBad: 20,
    },
    superCoPower: {
      name: "Barbaric Blow",
      stars: 6,
      description: "Luck changes to 80% good luck and 40% bad luck.",
      luckGood: 80,
      luckBad: 40,
    },
  },
  {
    key: "flak",
    gameVersion: "AWDS",
    displayName: "Flak",
    dayToDay: {
      description: "Units have 25% good luck and 10% bad luck.",
      luckGood: 25,
      luckBad: 10,
    },
    coPower: {
      name: "Brute Force",
      stars: 3,
      description: "Luck changes to 50% good luck and 20% bad luck.",
      luckGood: 50,
      luckBad: 20,
    },
    superCoPower: {
      name: "Barbaric Blow",
      stars: 6,
      description: "Luck changes to 90% good luck and 40% bad luck.",
      luckGood: 90,
      luckBad: 40,
    },
  },

  // ── Jugger (good & bad luck; robot Flak) ──────────────────────────────────
  {
    key: "jugger",
    gameVersion: "AWDS",
    displayName: "Jugger",
    dayToDay: {
      description: "Units have 30% good luck and 15% bad luck.",
      luckGood: 30,
      luckBad: 15,
    },
    coPower: {
      name: "Overclock",
      stars: 3,
      description: "Luck changes to 55% good luck and 25% bad luck.",
      luckGood: 55,
      luckBad: 25,
    },
    superCoPower: {
      name: "System Crash",
      stars: 7,
      description: "Luck changes to 95% good luck and 45% bad luck.",
      luckGood: 95,
      luckBad: 45,
    },
  },

  // ── Rachel (repair d2d; luck power + missiles) ────────────────────────────
  {
    key: "rachel",
    gameVersion: "AWDS",
    displayName: "Rachel",
    dayToDay: {
      description: "When repairing on properties, units heal 1 extra HP (consumes extra funds).",
    },
    coPower: {
      name: "Lucky lass",
      stars: 3,
      description: "Luck is increased by 30% (for a total of 40%).",
      luckGood: 40,
    },
    superCoPower: {
      name: "Covering Fire",
      stars: 6,
      description:
        "Fires three missiles that deal 3 HP of damage to all units within 2 tiles of each impact.",
      effects: [
        {
          kind: "damage",
          params: { hp: 3, zone: 2, count: 3, friendlyFire: true, until1Hp: true },
        },
      ],
    },
  },

  // ── Jake (plains firepower + ground buffs) ────────────────────────────────
  {
    key: "jake",
    gameVersion: "AWDS",
    displayName: "Jake",
    dayToDay: {
      description: "Units have +10% firepower on plains (air units included).",
      modifiers: [{ attackPct: 10, onTerrainKey: "plain" }],
    },
    coPower: {
      name: "Beat Down",
      stars: 3,
      description: "Units gain +20% firepower on plains; ground indirects gain +1 range.",
      modifiers: [
        { attackPct: 20, onTerrainKey: "plain" },
        { group: "indirect", onFacility: "base", rangeDelta: 1 },
      ],
    },
    superCoPower: {
      name: "Block Rock",
      stars: 6,
      description:
        "Units gain +40% firepower on plains; ground indirects gain +1 range; ground vehicles gain +2 movement.",
      modifiers: [
        { attackPct: 40, onTerrainKey: "plain" },
        { group: "indirect", onFacility: "base", rangeDelta: 1, movementDelta: 2 },
        { group: "directVehicle", onFacility: "base", movementDelta: 2 },
      ],
    },
  },

  // ── Koal (roads firepower + movement) ─────────────────────────────────────
  {
    key: "koal",
    gameVersion: "AWDS",
    displayName: "Koal",
    dayToDay: {
      description: "Units have +10% firepower on roads (air units included).",
      modifiers: [{ attackPct: 10, onTerrainKey: "road" }],
    },
    coPower: {
      name: "Forced March",
      stars: 3,
      description: "Units gain +1 movement and +20% firepower on roads.",
      modifiers: [{ attackPct: 20, onTerrainKey: "road" }, { movementDelta: 1 }],
    },
    superCoPower: {
      name: "Trail of Woe",
      stars: 5,
      description: "Units gain +2 movement and +30% firepower on roads.",
      modifiers: [{ attackPct: 30, onTerrainKey: "road" }, { movementDelta: 2 }],
    },
  },

  // ── Drake (naval buffs by facility; weather/HP/fuel powers) ───────────────
  {
    key: "drake",
    gameVersion: "AW1",
    displayName: "Drake",
    dayToDay: {
      description:
        "Naval units have +1 movement and +2 terrain stars; air units have -20% firepower.",
      modifiers: [
        { onFacility: "port", movementDelta: 1, terrainStarsDelta: 2 },
        { onFacility: "airport", attackPct: -20 },
      ],
    },
    coPower: {
      name: "Tsunami",
      stars: 4,
      description: "All enemy units lose 1 HP.",
      effects: [
        { kind: "damage", params: { hp: 1, zone: "global", friendlyFire: false, until1Hp: true } },
      ],
    },
  },
  {
    key: "drake",
    gameVersion: "AW2",
    displayName: "Drake",
    dayToDay: {
      description: "Naval units have +1 movement and +10% defense; air units have -30% firepower.",
      modifiers: [
        { onFacility: "port", movementDelta: 1, defensePct: 10 },
        { onFacility: "airport", attackPct: -30 },
      ],
    },
    coPower: {
      name: "Tsunami",
      stars: 4,
      description: "All enemy units lose 1 HP and half their current fuel.",
      effects: [
        { kind: "damage", params: { hp: 1, zone: "global", friendlyFire: false, until1Hp: true } },
        { kind: "drain", params: { type: "fuel", percent: 50 } },
      ],
    },
    superCoPower: {
      name: "Typhoon",
      stars: 7,
      description: "All enemy units lose 2 HP and half their fuel; weather becomes rain for 1 day.",
      effects: [
        { kind: "damage", params: { hp: 2, zone: "global", friendlyFire: false, until1Hp: true } },
        { kind: "drain", params: { type: "fuel", percent: 50 } },
        { kind: "setWeather", params: { weather: "rain", days: 1 } },
      ],
    },
  },
  {
    key: "drake",
    gameVersion: "AWDS",
    displayName: "Drake",
    dayToDay: {
      description: "Naval units have +20% firepower; air units have -10% firepower.",
      modifiers: [
        { onFacility: "port", attackPct: 20 },
        { onFacility: "airport", attackPct: -10 },
      ],
    },
    coPower: {
      name: "Tsunami",
      stars: 4,
      description: "All enemy units lose 1 HP and half their current fuel.",
      effects: [
        { kind: "damage", params: { hp: 1, zone: "global", friendlyFire: false, until1Hp: true } },
        { kind: "drain", params: { type: "fuel", percent: 50 } },
      ],
    },
    superCoPower: {
      name: "Typhoon",
      stars: 7,
      description: "All enemy units lose 2 HP and half their fuel; weather becomes rain for 1 day.",
      effects: [
        { kind: "damage", params: { hp: 2, zone: "global", friendlyFire: false, until1Hp: true } },
        { kind: "drain", params: { type: "fuel", percent: 50 } },
        { kind: "setWeather", params: { weather: "rain", days: 1 } },
      ],
    },
  },

  // ── Javier (Comm Tower scaling + indirect resistance) ─────────────────────
  {
    key: "javier",
    gameVersion: "AWDS",
    displayName: "Javier",
    dayToDay: {
      description:
        "Units have +20% defense against indirect units. Comm Towers grant all units additional defense.",
      modifiers: [
        { defensePct: 20, vsGroup: "indirect" },
        { scaleStat: "defense", scaleVariable: "commtowerBoost" },
      ],
    },
    coPower: {
      name: "Tower Shield",
      stars: 3,
      description: "Defense from indirect attacks rises to +40%; Comm Tower bonuses are doubled.",
      modifiers: [
        { defensePct: 40, vsGroup: "indirect" },
        { scaleStat: "defense", scaleVariable: "commtowerBoost", scaleFactor: 2 },
        { scaleStat: "attack", scaleVariable: "commtowerBoost" },
      ],
    },
    superCoPower: {
      name: "Tower of Power",
      stars: 6,
      description: "Defense from indirect attacks rises to +60%; Comm Tower bonuses are tripled.",
      modifiers: [
        { defensePct: 60, vsGroup: "indirect" },
        { scaleStat: "defense", scaleVariable: "commtowerBoost", scaleFactor: 3 },
        { scaleStat: "attack", scaleVariable: "commtowerBoost", scaleFactor: 2 },
      ],
    },
  },

  // ── Hachi (build discount) ────────────────────────────────────────────────
  ...(["AW2", "AWDS"] as const).map(
    (gameVersion): COProfile => ({
      key: "hachi",
      gameVersion,
      displayName: "Hachi",
      dayToDay: {
        description: "Units cost 10% less to build.",
        modifiers: [{ buildCostPct: -10 }],
      },
      coPower: {
        name: "Barter",
        stars: 3,
        description: "Units cost 50% less to build.",
        modifiers: [{ buildCostPct: -50 }],
      },
      superCoPower: {
        name: "Merchant Union",
        stars: 5,
        description: "Units cost 50% less to build, and ground units can be built on cities.",
        modifiers: [{ buildCostPct: -50 }],
      },
    }),
  ),

  // ── Hawke (firepower + heal/drain powers) ─────────────────────────────────
  // AW2 == AWDS (engine `hawkeAWDS = {...hawkeAW2}`). The AW2 registry alias to `hachiAW2` was a
  // bug, now fixed to `["hawke", hawkeAW2]`.
  ...(["AW2", "AWDS"] as const).map(
    (gameVersion): COProfile => ({
      key: "hawke",
      gameVersion,
      displayName: "Hawke",
      dayToDay: {
        description: "Units have +10% firepower.",
        modifiers: [{ attackPct: 10 }],
      },
      coPower: {
        name: "Black Wave",
        stars: 5,
        description: "All units heal 1 HP; all enemy units lose 1 HP.",
        effects: [
          { kind: "heal", params: { hp: 1, roundUp: false } },
          {
            kind: "damage",
            params: { hp: 1, zone: "global", friendlyFire: false, until1Hp: true },
          },
        ],
      },
      superCoPower: {
        name: "Black Storm",
        stars: 9,
        description: "All units heal 2 HP; all enemy units lose 2 HP.",
        effects: [
          { kind: "heal", params: { hp: 2, roundUp: false } },
          {
            kind: "damage",
            params: { hp: 2, zone: "global", friendlyFire: false, until1Hp: true },
          },
        ],
      },
    }),
  ),

  // ── Sasha (economy; no stat hooks) ────────────────────────────────────────
  {
    key: "sasha",
    gameVersion: "AWDS",
    displayName: "Sasha",
    dayToDay: {
      description: "Fund-giving properties yield an extra 100 funds per turn.",
      effects: [{ kind: "propertyFundsBonus", params: { amount: 100 } }],
    },
    coPower: {
      name: "Market Crash",
      stars: 2,
      description: "Reduces each enemy's power charge by 10% per 5000 funds Sasha holds.",
      effects: [
        { kind: "drain", params: { target: "power", source: "funds", per: 5000, pct: 10 } },
      ],
    },
    superCoPower: {
      name: "War Bonds",
      stars: 6,
      description: "Turns 50% of the damage units deal into funds.",
      effects: [{ kind: "fundsFromDamage", params: { percent: 50 } }],
    },
  },

  // ── Sturm (all-terrain move; meteor) ──────────────────────────────────────
  {
    key: "sturm",
    gameVersion: "AW1",
    displayName: "Sturm",
    dayToDay: {
      description:
        "Units have -20% firepower and +20% defense; all terrain costs 1 movement (except in snow).",
      modifiers: [
        { attackPct: -20, defensePct: 20 },
        { movementCostAll: 1, notWeather: "snow" },
      ],
    },
    coPower: {
      name: "Meteor Strike",
      stars: 5,
      description: "Deals 4 HP of damage to all units within 2 tiles of the target.",
      effects: [{ kind: "damage", params: { hp: 4, zone: 2, friendlyFire: true, until1Hp: true } }],
    },
  },
  {
    key: "sturm",
    gameVersion: "AW2",
    displayName: "Sturm",
    dayToDay: {
      description:
        "Units have +20% firepower and +20% defense; all terrain costs 1 movement (except in snow).",
      modifiers: [
        { attackPct: 20, defensePct: 20 },
        { movementCostAll: 1, notWeather: "snow" },
      ],
    },
    superCoPower: {
      name: "Meteor Strike",
      stars: 10,
      description:
        "Units gain +20% more firepower and defense; deals 8 HP of damage within 2 tiles of the target.",
      effects: [{ kind: "damage", params: { hp: 8, zone: 2, friendlyFire: true, until1Hp: true } }],
      modifiers: [{ attackPct: 40, defensePct: 40 }],
    },
  },

  // ── Lash (firepower scales with terrain stars) ────────────────────────────
  {
    key: "lash",
    gameVersion: "AW2",
    displayName: "Lash",
    dayToDay: {
      description: "Units gain +10% firepower per terrain star (air units excluded).",
      modifiers: [
        {
          scaleStat: "attack",
          scaleVariable: "terrainStars",
          scaleFactor: 10,
          facilityNot: "airport",
        },
      ],
    },
    coPower: {
      name: "Terrain Tactics",
      stars: 4,
      description: "All terrain costs 1 movement (except in snow).",
      modifiers: [{ movementCostAll: 1, notWeather: "snow" }],
    },
    superCoPower: {
      name: "Prime Tactics",
      stars: 7,
      description:
        "Terrain stars are doubled; units gain +20% firepower per terrain star; all terrain costs 1 movement (except in snow).",
      modifiers: [
        {
          scaleStat: "attack",
          scaleVariable: "terrainStars",
          scaleFactor: 20,
          facilityNot: "airport",
        },
        { terrainStarsMult: 2 },
        { movementCostAll: 1, notWeather: "snow" },
      ],
    },
  },
  {
    key: "lash",
    gameVersion: "AWDS",
    displayName: "Lash",
    dayToDay: {
      description: "Units gain +5% firepower per terrain star (air units excluded).",
      modifiers: [
        {
          scaleStat: "attack",
          scaleVariable: "terrainStars",
          scaleFactor: 5,
          facilityNot: "airport",
        },
      ],
    },
    coPower: {
      name: "Terrain Tactics",
      stars: 4,
      description: "All terrain costs 1 movement (except in snow).",
      modifiers: [{ movementCostAll: 1, notWeather: "snow" }],
    },
    superCoPower: {
      name: "Prime Tactics",
      stars: 7,
      description:
        "Terrain stars are doubled; units gain +10% firepower per terrain star; all terrain costs 1 movement (except in snow).",
      modifiers: [
        {
          scaleStat: "attack",
          scaleVariable: "terrainStars",
          scaleFactor: 10,
          facilityNot: "airport",
        },
        { terrainStarsMult: 2 },
        { movementCostAll: 1, notWeather: "snow" },
      ],
    },
  },

  // ── Kindle (firepower on properties; owned-property scaling) ──────────────
  {
    key: "kindle",
    gameVersion: "AWDS",
    displayName: "Kindle",
    dayToDay: {
      description: "Units have +40% firepower on properties (air units included).",
      modifiers: [{ attackPct: 40, onProperty: true }],
    },
    coPower: {
      name: "Urban Blight",
      stars: 3,
      description: "Units gain +80% firepower on properties; enemy units on properties lose 3 HP.",
      effects: [
        {
          kind: "damage",
          params: { hp: 3, zone: "global", friendlyFire: false, until1Hp: true, onProperty: true },
        },
      ],
      modifiers: [{ attackPct: 80, onProperty: true }],
    },
    superCoPower: {
      name: "High Society",
      stars: 6,
      description: "Units gain +120% firepower on cities and +3% firepower per owned property.",
      modifiers: [
        { attackPct: 120, onTerrainKey: "city" },
        { scaleStat: "attack", scaleVariable: "ownedProperties", scaleFactor: 3 },
      ],
    },
  },

  // ── Von Bolt (firepower + defense; immobilizing bolt) ─────────────────────
  {
    key: "von-bolt",
    gameVersion: "AWDS",
    displayName: "Von Bolt",
    dayToDay: {
      description: "Units have +10% firepower and defense.",
      modifiers: [{ attackPct: 10, defensePct: 10 }],
    },
    superCoPower: {
      name: "Ex Machina",
      stars: 10,
      description:
        "A lightning strike deals 3 HP of damage and immobilizes all units within 2 tiles of the target.",
      effects: [
        {
          kind: "damage",
          params: { hp: 3, zone: 2, friendlyFire: false, until1Hp: true, stun: true },
        },
      ],
    },
  },

  // ── Jess (ground-vehicle firepower + resupply) ────────────────────────────
  {
    key: "jess",
    gameVersion: "AW2",
    displayName: "Jess",
    dayToDay: {
      description: "Ground vehicles have +10% firepower; all other units have -10% firepower.",
      modifiers: [
        { group: "directVehicle", onFacility: "base", attackPct: 10 },
        { group: "indirect", onFacility: "base", attackPct: 10 },
        { group: "infantry", attackPct: -10 },
        { onFacility: "airport", attackPct: -10 },
        { onFacility: "port", attackPct: -10 },
      ],
    },
    coPower: {
      name: "Turbo Charge",
      stars: 3,
      description: "Resupplies all units; ground vehicles gain +20% firepower and +1 movement.",
      effects: [{ kind: "resupply" }],
      modifiers: [
        { group: "directVehicle", onFacility: "base", attackPct: 30, movementDelta: 1 },
        { group: "indirect", onFacility: "base", attackPct: 30, movementDelta: 1 },
        { group: "infantry", attackPct: -10 },
        { onFacility: "airport", attackPct: -10 },
        { onFacility: "port", attackPct: -10 },
      ],
    },
    superCoPower: {
      name: "Overdrive",
      stars: 6,
      description: "Resupplies all units; ground vehicles gain +40% firepower and +2 movement.",
      effects: [{ kind: "resupply" }],
      modifiers: [
        { group: "directVehicle", onFacility: "base", attackPct: 50, movementDelta: 2 },
        { group: "indirect", onFacility: "base", attackPct: 50, movementDelta: 2 },
        { group: "infantry", attackPct: -10 },
        { onFacility: "airport", attackPct: -10 },
        { onFacility: "port", attackPct: -10 },
      ],
    },
  },
  {
    key: "jess",
    gameVersion: "AWDS",
    displayName: "Jess",
    dayToDay: {
      description: "Ground vehicles have +20% firepower; air and naval units have -10% firepower.",
      modifiers: [
        { group: "directVehicle", onFacility: "base", attackPct: 20 },
        { group: "indirect", onFacility: "base", attackPct: 20 },
        { group: "infantry", attackPct: -10 },
        { onFacility: "airport", attackPct: -10 },
        { onFacility: "port", attackPct: -10 },
      ],
    },
    coPower: {
      name: "Turbo Charge",
      stars: 3,
      description: "Resupplies all units; ground vehicles gain +20% firepower and +1 movement.",
      effects: [{ kind: "resupply" }],
      modifiers: [
        { group: "directVehicle", onFacility: "base", attackPct: 40, movementDelta: 1 },
        { group: "indirect", onFacility: "base", attackPct: 40, movementDelta: 1 },
        { group: "infantry", attackPct: -10 },
        { onFacility: "airport", attackPct: -10 },
        { onFacility: "port", attackPct: -10 },
      ],
    },
    superCoPower: {
      name: "Overdrive",
      stars: 6,
      description: "Resupplies all units; ground vehicles gain +40% firepower and +2 movement.",
      effects: [{ kind: "resupply" }],
      modifiers: [
        { group: "directVehicle", onFacility: "base", attackPct: 60, movementDelta: 2 },
        { group: "indirect", onFacility: "base", attackPct: 60, movementDelta: 2 },
        { group: "infantry", attackPct: -10 },
        { onFacility: "airport", attackPct: -10 },
        { onFacility: "port", attackPct: -10 },
      ],
    },
  },

  // ── Kanbei AW1 / AWDS (were missing; AW2 done in batch 1) ──────────────────
  {
    key: "kanbei",
    gameVersion: "AW1",
    displayName: "Kanbei",
    dayToDay: {
      description: "Units have +20% firepower and defense, but cost 20% more to build.",
      modifiers: [{ attackPct: 20, defensePct: 20, buildCostPct: 20 }],
    },
    coPower: {
      name: "Morale Boost",
      stars: 5,
      description: "Units gain +10% firepower.",
      modifiers: [{ attackPct: 30 }],
    },
  },
  {
    key: "kanbei",
    gameVersion: "AWDS",
    displayName: "Kanbei",
    dayToDay: {
      description: "Units have +20% firepower and defense, but cost 20% more to build.",
      modifiers: [{ attackPct: 20, defensePct: 20, buildCostPct: 20 }],
    },
    coPower: {
      name: "Morale Boost",
      stars: 4,
      description: "Units gain +30% firepower.",
      modifiers: [{ attackPct: 50 }],
    },
    superCoPower: {
      name: "Samurai Spirit",
      stars: 7,
      description: "Units gain +30% firepower and defense; counterattacks deal double damage.",
      modifiers: [{ attackPct: 50, defensePct: 50 }],
    },
  },

  // ── Grit AW1 (direct penalty hits footsoldiers too, unlike AW2/AWDS) ───────
  {
    key: "grit",
    gameVersion: "AW1",
    displayName: "Grit",
    dayToDay: {
      description:
        "Indirect units have +1 range; all direct units (footsoldiers included) -20% firepower.",
      modifiers: [
        { group: "indirect", rangeDelta: 1 },
        { group: "directVehicle", attackPct: -20 },
        { group: "infantry", attackPct: -20 },
      ],
    },
    coPower: {
      name: "Snipe Attack",
      stars: 3,
      description: "Indirect units gain +2 range and +50% firepower.",
      modifiers: [{ group: "indirect", rangeDelta: 3, attackPct: 50 }],
    },
  },

  // ── Adder AWDS (= AW2) ─────────────────────────────────────────────────────
  {
    key: "adder",
    gameVersion: "AWDS",
    displayName: "Adder",
    coPower: {
      name: "Sideslip",
      stars: 2,
      description: "All units gain 1 movement.",
      modifiers: [{ movementDelta: 1 }],
    },
    superCoPower: {
      name: "Sidewinder",
      stars: 5,
      description: "All units gain 2 movement.",
      modifiers: [{ movementDelta: 2 }],
    },
  },
];
