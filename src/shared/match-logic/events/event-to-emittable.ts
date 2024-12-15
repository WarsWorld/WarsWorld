import type { EmittableEvent, EmittableSubEvent, MainEvent, MoveEvent } from "../../types/events";
import type { MatchWrapper } from "../../wrappers/match";
import type { Position } from "../../schemas/position";
import { addDirection, getFinalPositionSafe, getNeighbourPositions } from "../../schemas/position";
import { getPowerChargeGain } from "./handlers/attack";
import { getVisualHPfromHP } from "../calculate-damage";
import { TeamWrapper } from "../../wrappers/team";

export const subEventToEmittables = (match: MatchWrapper, { subEvent, path }: MoveEvent) => {
  const fromPosition = getFinalPositionSafe(path);
  const teams = [...match.teams];
  teams.push(new TeamWrapper([], match, -1)); // add spectator vision

  const emittableSubEvents = new Array<EmittableSubEvent>(teams.length);
  emittableSubEvents.fill({ type: "wait" });

  // array responsible for letting move event know if last position is
  // required for the sub-event to work
  const requireLastMovePosition = new Array<boolean>(teams.length);
  requireLastMovePosition.fill(false);

  switch (subEvent.type) {
    case "attack": {
      const attacker = match.getUnitOrThrow(fromPosition);
      const defender = match.getUnit(subEvent.defenderPosition);

      if (defender === undefined) {
        // pipe seam attack
        for (let i = 0; i < teams.length; ++i) {
          emittableSubEvents[i] = {
            ...subEvent,
            attackerPlayerSlot: attacker.data.playerSlot,
            defenderPlayerSlot: -1,
            attackerPowerCharge: 0,
            defenderPowerCharge: 0,
          };
        }

        break;
      }

      const attackerHpDiff =
        attacker.getVisualHP() - getVisualHPfromHP(subEvent.attackerHP ?? attacker.getVisualHP());
      const defenderHpDiff = defender.getVisualHP() - getVisualHPfromHP(subEvent.defenderHP);

      const powerChargeGain = getPowerChargeGain(
        attacker,
        attackerHpDiff,
        defender,
        defenderHpDiff,
      );

      for (let i = 0; i < teams.length; ++i) {
        const canSeeAttacker = teams[i].canSeeUnitAtPosition(fromPosition);
        const canSeeDefender = teams[i].canSeeUnitAtPosition(subEvent.defenderPosition);
        const showDefenderHP =
          canSeeDefender &&
          (defender.player.team.index === teams[i].index ||
            defender.player.data.coId.name !== "sonja" ||
            subEvent.defenderHP === 0);
        const showAttackerHP =
          canSeeAttacker &&
          (attacker.player.team.index === teams[i].index ||
            attacker.player.data.coId.name !== "sonja" ||
            subEvent.attackerHP === 0);

        emittableSubEvents[i] = {
          type: "attack",
          attackerHP: showAttackerHP ? subEvent.attackerHP : undefined,
          attackerPlayerSlot: attacker.data.playerSlot,
          defenderHP: showDefenderHP ? subEvent.defenderHP : undefined,
          defenderPosition: canSeeDefender ? defender.data.position : undefined,
          defenderPlayerSlot: defender.data.playerSlot,
          ...powerChargeGain,
          eliminationReason: subEvent.eliminationReason,
        };
      }

      break;
    }
    case "ability": {
      for (let i = 0; i < teams.length; ++i) {
        if (teams[i].isPositionVisible(fromPosition)) {
          emittableSubEvents[i] = subEvent;
        } else if (
          match.getUnitOrThrow(fromPosition).data.type === "apc" &&
          (teams[i].isPositionVisible(addDirection(fromPosition, "up")) ||
            teams[i].isPositionVisible(addDirection(fromPosition, "down")) ||
            teams[i].isPositionVisible(addDirection(fromPosition, "left")) ||
            teams[i].isPositionVisible(addDirection(fromPosition, "right")))
        ) {
          // that means that at least one supplied unit by apc is visible, so we kinda need to "reveal"
          // the apc location to play the refuel animation (we can later give less information, but it
          // would need a lot more work)
          emittableSubEvents[i] = subEvent;
          requireLastMovePosition[i] = true;
        } else if (subEvent.eliminationReason !== undefined) {
          // if it's an hp / lab capture, we have to send the event to everyone,
          // and send the last position as well to reveal which team captured it
          emittableSubEvents[i] = subEvent;
          requireLastMovePosition[i] = true;
        }
      }

      break;
    }
    case "unloadWait": {
      for (let i = 0; i < match.teams.length + 1; ++i) {
        const visibleUnloads = subEvent.unloads.filter((unload) =>
          teams[i].isPositionVisible(addDirection(fromPosition, unload.direction)),
        );

        if (teams[i].isPositionVisible(fromPosition)) {
          emittableSubEvents[i] = {
            ...subEvent,
            unloads: visibleUnloads,
          };
        } else {
          emittableSubEvents[i] = {
            ...subEvent,
            unloads: visibleUnloads,
          };
          requireLastMovePosition[i] = true;
        }
      }

      break;
    }
    case "repair": {
      for (let i = 0; i < match.teams.length + 1; ++i) {
        if (teams[i].isPositionVisible(fromPosition)) {
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
    requireLastMovePosition,
  };
};

export const mainEventToEmittables = (match: MatchWrapper, event: MainEvent) => {
  const teams = [...match.teams];
  teams.push(new TeamWrapper([], match, -1)); // add spectator vision

  const emittableEvents = new Array<EmittableEvent | undefined>(match.teams.length + 1);

  emittableEvents.forEach((e, i) => {
    emittableEvents[i] = undefined;
  });

  switch (event.type) {
    case "move": {
      // the move has already been applied to match !
      const { requireLastMovePosition, emittableSubEvents } = subEventToEmittables(match, event);

      const unit = match.getUnitOrThrow(event.path[event.path.length - 1]);

      for (let i = 0; i < match.teams.length + 1; ++i) {
        const shownPath = [];

        // special visible function for hidden subs and stealth
        const isPositionVisible =
          "hidden" in unit.data && unit.data.hidden
            ? (position: Position) => {
                for (const pos of getNeighbourPositions(position)) {
                  if (match.getUnit(pos)?.player.team.index === match.teams[i].index) {
                    return true;
                  }
                }

                return false;
              }
            : (position: Position) => teams[i].isPositionVisible(position);

        if (event.path.length === 1) {
          if (requireLastMovePosition[i] || isPositionVisible(event.path[0])) {
            shownPath.push(event.path[0]);
          }
        } else {
          if (isPositionVisible(event.path[0]) || isPositionVisible(event.path[1])) {
            shownPath.push(event.path[0]);
          }

          for (let pInd = 1; pInd < event.path.length - 1; ++pInd) {
            if (
              isPositionVisible(event.path[pInd - 1]) ||
              isPositionVisible(event.path[pInd]) ||
              isPositionVisible(event.path[pInd + 1])
            ) {
              shownPath.push(event.path[0]);
            }
          }

          if (
            isPositionVisible(event.path[event.path.length - 1]) ||
            isPositionVisible(event.path[event.path.length - 2]) ||
            requireLastMovePosition[i]
          ) {
            shownPath.push(event.path[event.path.length - 1]);
          }
        }

        if (emittableSubEvents[i] === undefined) {
          emittableSubEvents[i] = { type: "wait" };
        }

        // right now appearing units have all data, but if they go from fog to fog,
        // they may have only unit type (and other stats not visible)
        emittableEvents[i] = {
          playerId: getFirstPlayerInTeam(teams[i]),
          type: "move",
          path: shownPath,
          trap: teams[i].isPositionVisible(event.path[event.path.length - 1]) ? event.trap : false,
          subEvent: emittableSubEvents[i],
          //if unit shows and it was not visible before
          appearingUnit:
            shownPath.length == 0 || teams[i].isPositionVisible(event.path[0])
              ? undefined
              : match.getUnitOrThrow(getFinalPositionSafe(event.path)).data,
        };
      }

      break;
    }
    case "unloadNoWait": {
      for (let i = 0; i < match.teams.length + 1; ++i) {
        // if either the transport or the unloaded unit is visible, send the event
        if (
          teams[i].isPositionVisible(event.transportPosition) ||
          teams[i].isPositionVisible(addDirection(event.transportPosition, event.unloads.direction))
        ) {
          emittableEvents[i] = {
            ...event,
            playerId: getFirstPlayerInTeam(teams[i]),
          };
        }
      }

      break;
    }
    case "build": {
      // NOTE: THIS IS JUST FOR TESTING
      // I suspect that Fog Of War will stop certain players from receiving these events and thus
      // this switch case will have a different implementation.
      for (let i = 0; i < match.teams.length + 1; ++i) {
        emittableEvents[i] = {
          ...event,
          playerId: getFirstPlayerInTeam(teams[i]),
        };
      }

      break;
    }
    case "delete": {
      for (let i = 0; i < match.teams.length + 1; ++i) {
        // slight inaccuracy: we send the delete position that causes the player to lose
        if (
          teams[i].isPositionVisible(event.position) ||
          ("eliminationReason" in event && event.eliminationReason !== undefined)
        ) {
          emittableEvents[i] = {
            ...event,
            playerId: getFirstPlayerInTeam(teams[i]),
          };
        }
      }

      break;
    }
    default: {
      for (let i = 0; i < match.teams.length + 1; ++i) {
        emittableEvents[i] = {
          ...event,
          playerId: getFirstPlayerInTeam(teams[i]),
        };
      }

      break;
    }
  }

  return emittableEvents;
};

function getFirstPlayerInTeam(team: TeamWrapper) {
  if (team.players === undefined || team.players.length === 0) {
    return "spectator";
  }

  return team.players[0].data.id;
}
