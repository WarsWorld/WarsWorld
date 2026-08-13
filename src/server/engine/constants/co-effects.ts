import type { Position } from "server/core/schemas/position";
import { getDistance } from "server/core/schemas/position";
import type { Weather } from "server/core/schemas/weather";
import type { PlayerInMatchWrapper } from "server/engine/entities/player-in-match";
import { unitPropertiesMap } from "server/engine/constants/unit-properties";
import type { CoEffect } from "server/engine/constants/co-profile";

/**
 * DECLARATIVE CO EFFECTS interpreter — the runtime counterpart of `buildPhaseHooks`. Where hooks
 * cover passive stat changes, this applies a phase's one-shot `CoEffect`s (heal / damage / drain /
 * weather / refresh / resupply / funds / spawn) when a power activates. It deliberately dispatches
 * to the SAME `UnitWrapper` / `MatchWrapper` primitives the procedural `instantEffect`s call, so it
 * reproduces them by construction. `co-effects-verify` pins that equivalence against the engine.
 *
 * `positions` mirrors the engine's `instantEffect(player, positions)` — targeting AI
 * (`calculatePositions`) stays engine-side; the effect only describes the damage SHAPE.
 */

const num = (params: Record<string, unknown> | undefined, key: string, fallback = 0): number => {
  const value = params?.[key];
  return typeof value === "number" ? value : fallback;
};

const isOnProperty = (unit: { getTile: () => object }): boolean => "playerSlot" in unit.getTile();

export const applyEffect = (
  effect: CoEffect,
  player: PlayerInMatchWrapper,
  positions?: Position[],
): void => {
  const p = effect.params;
  const { match } = player;

  switch (effect.kind) {
    case "heal": {
      const hp = num(p, "hp");
      // Andy rounds up to the next visual-HP step (`unit.heal`); Hawke adds raw HP (`roundUp:false`).
      const roundUp = p?.roundUp !== false;

      for (const unit of player.getUnits()) {
        if (roundUp) {
          unit.heal(hp);
        } else if (unit.data.stats !== "hidden") {
          unit.data.stats.hp = Math.min(unit.data.stats.hp + hp * 10, 100);
        }
      }

      break;
    }

    case "damage": {
      const hp = num(p, "hp");
      const onProperty = p?.onProperty === true;

      if (p?.zone === "global") {
        for (const unit of player.team.getEnemyUnits()) {
          if (onProperty && !isOnProperty(unit)) {
            continue;
          }

          unit.damageUntil1HP(hp);
        }
      } else if (typeof p?.zone === "number") {
        const radius = p.zone;
        const count = num(p, "count", 1);
        // friendlyFire hits every unit in radius (Rachel/Sturm meteors); otherwise enemies only.
        const targets = p.friendlyFire === true ? match.units : player.team.getEnemyUnits();

        for (let i = 0; i < count; i++) {
          const epicenter = positions?.[i];

          if (epicenter === undefined) {
            continue;
          }

          for (const unit of targets) {
            if (getDistance(unit.data.position, epicenter) > radius) {
              continue;
            }

            unit.damageUntil1HP(hp);

            if (p.stun === true) {
              unit.data.isReady = false;
            }
          }
        }
      }

      break;
    }

    case "drain": {
      if (p?.target === "power") {
        // Sasha Market Crash: cut each enemy's meter by `pct`% per `per` funds Sasha holds.
        const per = num(p, "per", 1);
        const pct = num(p, "pct");
        // Single division to match the engine's `funds / 50000` bit-for-bit (no float drift).
        const decrease = player.data.funds / ((per * 100) / pct);

        for (const enemy of match.getAllPlayers()) {
          if (enemy.team.index === player.team.index) {
            continue;
          }

          enemy.data.powerMeter = Math.max(
            0,
            enemy.data.powerMeter - decrease * enemy.getMaxPowerMeter(),
          );
        }
      } else {
        // Fuel drain (Drake): each enemy loses `percent`% of its current fuel (floored).
        const percent = num(p, "percent");

        for (const unit of player.team.getEnemyUnits()) {
          unit.drainFuel(Math.floor((unit.getFuel() * percent) / 100));
        }
      }

      break;
    }

    case "setWeather":
      match.setWeather(String(p?.weather) as Weather, num(p, "days"));
      break;

    case "refreshUnits":
      for (const unit of player.getUnits()) {
        if (p?.excludeFoot === true && unit.isInfantryOrMech()) {
          continue;
        }

        unit.data.isReady = true;
      }

      break;

    case "resupply":
      for (const unit of player.getUnits()) {
        unit.resupply();
      }

      break;

    case "multiplyFunds":
      player.data.funds = player.data.funds * num(p, "factor", 1);
      break;

    case "spawnUnits": {
      // Sensei power: fill unoccupied owned cities top-left → right → down, respecting the unit cap.
      const type = p?.unit === "mech" ? "mech" : "infantry";
      // The `hp` param is display HP (e.g. 9); the engine stores HP on the 0–100 scale
      // (visual = ceil(hp / 10)), so scale it up like heal/damage do — otherwise a "9 HP" spawn
      // would be stored as 9 internal and render as 1 HP.
      const hp = num(p, "hp") * 10;
      let unitCount = player.getUnits().length;

      for (let y = 0; y < match.map.height; y++) {
        for (let x = 0; x < match.map.width; x++) {
          if (unitCount >= match.rules.unitCapPerPlayer) {
            return;
          }

          const position: Position = [x, y];
          const tile = match.getTile(position);

          if (tile.type !== "city" || !player.owns(tile) || match.getUnit(position) !== undefined) {
            continue;
          }

          player.addUnwrappedUnit(
            type === "mech"
              ? {
                  type: "mech",
                  position,
                  isReady: true,
                  stats: {
                    hp,
                    fuel: unitPropertiesMap.mech.initialFuel,
                    ammo: unitPropertiesMap.mech.initialAmmo,
                  },
                }
              : {
                  type: "infantry",
                  position,
                  isReady: true,
                  stats: { hp, fuel: unitPropertiesMap.infantry.initialFuel },
                },
          );
          unitCount++;
        }
      }

      break;
    }

    // Passive effects (propertyFundsBonus, fundsFromDamage) are applied in passTurn / attack events,
    // not as one-shot power effects — nothing to do here.
    default:
      break;
  }
};

/** Apply every effect of a phase in order. */
export const applyEffects = (
  effects: CoEffect[] | undefined,
  player: PlayerInMatchWrapper,
  positions?: Position[],
): void => {
  for (const effect of effects ?? []) {
    applyEffect(effect, player, positions);
  }
};
