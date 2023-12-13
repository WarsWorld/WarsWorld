import type { EmittableEvent, EmittableSubEvent, MainEvent, MoveEvent } from "../../types/events";
import type { MatchWrapper } from "../../wrappers/match";
import type { Position } from "../../schemas/position";
import { addDirection, getFinalPositionSafe, getNeighbourPositions } from "../../schemas/position";
import { getPowerChargeGain } from "./handlers/attack";
import { getVisualHPfromHP } from "../calculate-damage";
import { Vision } from "../../wrappers/vision";
import { TeamWrapper } from "../../wrappers/team";


// TODO discoveries

export const subEventToEmittables = (
  match: MatchWrapper,
  { subEvent, path }: MoveEvent
) => {
  const fromPosition = getFinalPositionSafe(path);
  const visions = match.teams.map((team) => team.getVision());
  visions.push(new Vision(new TeamWrapper([], match, -1))); // add spectator vision

  const emittableSubEvents = new Array<EmittableSubEvent>(match.teams.length + 1);
  emittableSubEvents.fill({type: "wait"});

  // array responsible for letting move event know if last position is
  // required for the sub-event to work
  const requireLastMovePosition = new Array<boolean>(match.teams.length + 1);
  requireLastMovePosition.fill(false);

  switch (subEvent.type) {
    case "attack": {
      const attacker = match.getUnitOrThrow(fromPosition);
      const defender = match.getUnitOrThrow(subEvent.defenderPosition);

      const attackerHpDiff = attacker.getVisualHP() - getVisualHPfromHP(subEvent.attackerHP ?? attacker.getVisualHP());
      const defenderHpDiff = defender.getVisualHP() - getVisualHPfromHP(subEvent.defenderHP);
      
      const powerChargeGain = getPowerChargeGain(
        attacker,
        attackerHpDiff,
        defender,
        defenderHpDiff
      );
      
      for (let i = 0; i < match.teams.length + 1; ++i) {
        // spectators are not part of a team
        const teamIndex = (i == match.teams.length) ? -1 : match.teams[i].index;

        const canSeeDefender = visions[i].isPositionVisible(defender.data.position);
        const showDefenderHP = canSeeDefender &&
          (defender.player.team.index === teamIndex || defender.player.data.coId.name !== "sonja" || subEvent.defenderHP === 0);
        const showAttackerHP = 
          attacker.player.team.index === teamIndex || attacker.player.data.coId.name !== "sonja" || subEvent.attackerHP === 0;

        emittableSubEvents[i] = {
          type: "attack",
          attackerHP: showAttackerHP ? subEvent.attackerHP : undefined,
          attackerPlayerSlot: attacker.data.playerSlot,
          defenderHP: showDefenderHP ? subEvent.defenderHP : undefined,
          defenderPosition: canSeeDefender ? defender.data.position : undefined,
          defenderPlayerSlot: defender.data.playerSlot,
          ...powerChargeGain
        };
      }

      break;
    }
    case "ability": {
      for (let i = 0; i < match.teams.length + 1; ++i) {
        if (visions[i].isPositionVisible(fromPosition)) {
          emittableSubEvents[i] = subEvent;
        }
        else if (match.getUnitOrThrow(fromPosition).data.type === "apc" &&
          (visions[i].isPositionVisible(addDirection(fromPosition, "up")) ||
            visions[i].isPositionVisible(addDirection(fromPosition, "down")) ||
            visions[i].isPositionVisible(addDirection(fromPosition, "left")) ||
            visions[i].isPositionVisible(addDirection(fromPosition, "right")))) {
          // that means that at least one supplied unit by apc is visible, so we kinda need to "reveal"
          // the apc location to play the refuel animation (we can later give less information, but it
          // would need a lot more work)
          emittableSubEvents[i] = subEvent;
          requireLastMovePosition[i] = true;
        }
      }
      
      break;
    }
    case "unloadWait": {
      for (let i = 0; i < match.teams.length + 1; ++i) {
        const visibleUnloads = subEvent.unloads.filter((unload) => visions[i].isPositionVisible(addDirection(fromPosition, unload.direction)));

        if (visions[i].isPositionVisible(fromPosition)) {
          emittableSubEvents[i] = {
            ...subEvent,
            unloads: visibleUnloads
          };
        } else {
          emittableSubEvents[i] = {
            ...subEvent,
            unloads: visibleUnloads
          };
          requireLastMovePosition[i] = true;
        }
      }

      break;
    }
    case "repair": {
      for (let i = 0; i < match.teams.length + 1; ++i) {
        if (visions[i].isPositionVisible(fromPosition)) {
          emittableSubEvents[i] = subEvent;
        }
      }

      break;
    }
    case "launchMissile": {
      // missile is visible for spectators in fog of war as well
      // it requires position to update the missile silo tile
      for (let i = 0; i < match.teams.length + 1; ++i) {
        emittableSubEvents[i] = subEvent;
        requireLastMovePosition[i] = true;
      }

      break;
    }
  }

  return {
    emittableSubEvents,
    requireLastMovePosition
  };
}


/**
 * EXTREMELY IMPORTANT!
 * 1. Apply move event
 * 2. Create emittable sub events (for all players at once, as an array of emittable events)
 * 3. Create emittable move events
 * 4. Apply sub event
 */
export const mainEventToEmittables = (
  match: MatchWrapper,
  event: MainEvent
) => {
  const visions = match.teams.map((team) => team.getVision());
  visions.push(new Vision(new TeamWrapper([], match, -1))); // add spectator vision

  const emittableEvents = new Array<EmittableEvent | undefined>(match.teams.length + 1);
  emittableEvents.fill(undefined);

  switch (event.type) {
    case "move": {
      // the move has already been applied to match !
      const { requireLastMovePosition, emittableSubEvents } = subEventToEmittables(match, event);

      const unit = match.getUnitOrThrow(event.path[event.path.length - 1]);

      for (let i = 0; i < match.teams.length + 1; ++i) {
        const shownPath = [];

        // special visible function for hidden subs and stealth
        const isPositionVisible = ("hidden" in unit.data && unit.data.hidden) ?
          ((position: Position) => {
          for (const pos of getNeighbourPositions(position)) {
            if (match.getUnit(pos)?.player.team.index === match.teams[i].index) {
              return true;
            }
          }

          return false;
        })
          : ((position: Position) => visions[i].isPositionVisible(position));

        if (event.path.length === 1) {
          if (requireLastMovePosition[i] || isPositionVisible(event.path[0])) {
            shownPath.push(event.path[0]);
          }
        } else {
          if (isPositionVisible(event.path[0]) || isPositionVisible(event.path[1])) {
            shownPath.push(event.path[0]);
          }

          for (let pInd = 1; pInd < event.path.length - 1; ++pInd) {
            if (isPositionVisible(event.path[pInd - 1]) ||
              isPositionVisible(event.path[pInd]) ||
              isPositionVisible(event.path[pInd + 1])) {
              shownPath.push(event.path[0]);
            }
          }

          if (isPositionVisible(event.path[event.path.length - 1]) ||
            isPositionVisible(event.path[event.path.length - 2]) ||
            requireLastMovePosition[i]) {
            shownPath.push(event.path[event.path.length - 1]);
          }
        }

        // right now appearing units have all data, but if they go from fog to fog,
        // they may have only unit type (and other stats not visible)
        emittableEvents[i] = {
          type: "move",
          path: shownPath,
          trap: (visions[i].isPositionVisible(event.path[event.path.length - 1])) ? event.trap : false,
          subEvent: emittableSubEvents[i],
          //if unit shows and it was not visible before
          appearingUnit: (shownPath.length == 0 || visions[i].isPositionVisible(event.path[0])) ? undefined :
            match.getUnitOrThrow(getFinalPositionSafe(event.path)).data
        };
      }

      break;
    }
    case "unloadNoWait": {
      for (let i = 0; i < match.teams.length + 1; ++i) {
        // if either the transport or the unloaded unit is visible, send the event
        if (visions[i].isPositionVisible(event.transportPosition) ||
            visions[i].isPositionVisible(addDirection(event.transportPosition, event.unloads.direction))) {
          emittableEvents[i] = event;
        }
      }

      break;
    }
    case "build":
    case "delete": {
      for (let i = 0; i < match.teams.length + 1; ++i) {
        if (visions[i].isPositionVisible(event.position)) {
          emittableEvents[i] = event;
        }
      }

      break;
    }
    default: {
      for (let i = 0; i < match.teams.length + 1; ++i) {
        emittableEvents[i] = event;
      }
    }
  }

  return emittableEvents;
}