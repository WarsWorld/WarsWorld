import type { Path, Position } from "../../schemas/position";
import { addDirection, getFinalPositionSafe, getNeighbourPositions } from "../../schemas/position";
import type {
  EmittableEvent,
  EmittableSubEvent,
  MainEventsWithoutSubEvents,
  MainEventWithSubEvents,
  MoveEventWithoutSubEvent,
  MoveEventWithSubEvent,
} from "../../types/events";
import type { MatchWrapper } from "../../wrappers/match";
import { TeamWrapper } from "../../wrappers/team";
import { getVisualHPfromHP } from "../calculate-damage";
import { getPowerChargeGain } from "./handlers/attack/getPowerChargeGain";

type EmittableSubEventWithExtraInfo = {
  teamIndex: number;
  subEvent: EmittableSubEvent;
  requireLastMovePosition: boolean;
};

const subEventToEmittables = (
  match: MatchWrapper,
  moveEvent: MoveEventWithSubEvent | MoveEventWithoutSubEvent,
): EmittableSubEventWithExtraInfo[] => {
  const spectatorTeam = new TeamWrapper([], match, -1);
  const teamsWithSpectator = [...match.teams, spectatorTeam];

  if (!("subEvent" in moveEvent)) {
    return teamsWithSpectator.map((team) => ({
      teamIndex: team.index,
      subEvent: { type: "wait" },
      requireLastMovePosition: false,
    }));
  }

  const { subEvent, path } = moveEvent;
  const fromPosition = getFinalPositionSafe(path);

  // requireLastMovePosition is responsible for letting move event know if last position is
  // required for the sub-event to work

  switch (subEvent.type) {
    case "attack": {
      const attacker = match.getUnitOrThrow(fromPosition);
      const defender = match.getUnit(subEvent.defenderPosition);

      switch (subEvent.eliminationReason) {
        case "all-attacker-units-destroyed": {
          attacker.player.data.status = "routed";
          break;
        }
        case "all-defender-units-destroyed": {
          const defender = match.getUnitOrThrow(subEvent.defenderPosition);
          defender.player.data.status = "routed";
          break;
        }
      }

      const playerUpdate = match.getAllPlayers().map((p) => p.data);

      if (defender === undefined) {
        // pipe seam attack
        return teamsWithSpectator.map((team) => ({
          teamIndex: team.index,
          subEvent: {
            ...subEvent,
            attackerPlayerSlot: attacker.data.playerSlot,
            defenderPlayerSlot: -1,
            playerUpdate,
          },
          requireLastMovePosition: false,
        }));
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

      return teamsWithSpectator.map((team) => {
        const canSeeAttacker = team.canSeeUnitAtPosition(fromPosition);
        const canSeeDefender = team.canSeeUnitAtPosition(subEvent.defenderPosition);
        const showDefenderHP =
          canSeeDefender &&
          (defender.player.team.index === team.index ||
            defender.player.data.coId.name !== "sonja" ||
            subEvent.defenderHP === 0);
        const showAttackerHP =
          canSeeAttacker &&
          (attacker.player.team.index === team.index ||
            attacker.player.data.coId.name !== "sonja" ||
            subEvent.attackerHP === 0);

        return {
          teamIndex: team.index,
          subEvent: {
            type: "attack",
            attackerHP: showAttackerHP ? subEvent.attackerHP : undefined,
            attackerPlayerSlot: attacker.data.playerSlot,
            defenderHP: showDefenderHP ? subEvent.defenderHP : undefined,
            defenderPosition: canSeeDefender ? defender.data.position : undefined,
            defenderPlayerSlot: defender.data.playerSlot,
            playerUpdate,
            ...powerChargeGain,
          },
          requireLastMovePosition: false,
        };
      });
    }
    case "ability": {
      return teamsWithSpectator.map((team) => {
        if (team.isPositionVisible(fromPosition)) {
          return {
            teamIndex: team.index,
            subEvent,
            requireLastMovePosition: false,
          };
        } else if (
          match.getUnitOrThrow(fromPosition).data.type === "apc" &&
          (team.isPositionVisible(addDirection(fromPosition, "up")) ||
            team.isPositionVisible(addDirection(fromPosition, "down")) ||
            team.isPositionVisible(addDirection(fromPosition, "left")) ||
            team.isPositionVisible(addDirection(fromPosition, "right")))
        ) {
          // that means that at least one supplied unit by apc is visible, so we kinda need to "reveal"
          // the apc location to play the refuel animation (we can later give less information, but it
          // would need a lot more work)
          return {
            teamIndex: team.index,
            subEvent,
            requireLastMovePosition: true,
          };
        } else if (subEvent.eliminationReason !== undefined) {
          // if it's an hp / lab capture, we have to send the event to everyone,
          // and send the last position as well to reveal which team captured it
          return {
            teamIndex: team.index,
            subEvent,
            requireLastMovePosition: true,
          };
        } else {
          return {
            teamIndex: team.index,
            subEvent: { type: "wait" },
            requireLastMovePosition: false,
          };
        }
      });
    }
    case "unloadWait": {
      return teamsWithSpectator.map((team) => ({
        teamIndex: team.index,
        subEvent,
        unloads: subEvent.unloads.filter((unload) =>
          team.isPositionVisible(addDirection(fromPosition, unload.direction)),
        ),
        requireLastMovePosition: team.isPositionVisible(fromPosition),
      }));
    }
    case "repair": {
      return teamsWithSpectator.map((team) => ({
        teamIndex: team.index,
        subEvent: team.isPositionVisible(fromPosition) ? subEvent : { type: "wait" },
        requireLastMovePosition: false,
      }));
    }
    case "launchMissile": {
      // missile is visible for spectators in fog of war as well
      // it requires position to update the missile silo tile
      return teamsWithSpectator.map((team) => ({
        teamIndex: team.index,
        subEvent,
        requireLastMovePosition: true,
      }));
    }
    case "wait": {
      return teamsWithSpectator.map((team) => ({
        teamIndex: team.index,
        subEvent,
        requireLastMovePosition: false,
      }));
    }
  }
};

export const mainEventToEmittables = (
  match: MatchWrapper,
  event: MainEventsWithoutSubEvents | MainEventWithSubEvents,
): (EmittableEvent | undefined)[] => {
  const spectatorTeam = new TeamWrapper([], match, -1);
  const teamsWithSpectator = [...match.teams, spectatorTeam];

  switch (event.type) {
    case "move": {
      // the move has already been applied to match !
      const emittableSubEvents = subEventToEmittables(match, {
        subEvent: { type: "wait" }, // fill a wait subEvent if move doesn't have a subEvent
        ...event,
      });

      const unit = match.getUnitOrThrow(getFinalPositionSafe(event.path));

      return teamsWithSpectator.map((team) => {
        // special visible function for hidden subs and stealth
        const isPositionVisible =
          "hidden" in unit.data && unit.data.hidden
            ? (position: Position) => {
                for (const pos of getNeighbourPositions(position)) {
                  if (match.getUnit(pos)?.player.team.index === team.index) {
                    return true;
                  }
                }

                return false;
              }
            : (position: Position) => team.isPositionVisible(position);

        const shownPath: Path = [];

        const emittableSubEvent = emittableSubEvents.find((s) => s.teamIndex === team.index)!;

        if (event.path.length === 1) {
          if (emittableSubEvent.requireLastMovePosition || isPositionVisible(event.path[0])) {
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
            isPositionVisible(event.path.at(-1)!) ||
            isPositionVisible(event.path.at(-2)!) ||
            emittableSubEvent.requireLastMovePosition
          ) {
            shownPath.push(getFinalPositionSafe(event.path));
          }
        }

        // right now appearing units have all data, but if they go from fog to fog,
        // they may have only unit type (and other stats not visible)
        const result: EmittableEvent = {
          playerId: getFirstPlayerInTeam(team),
          type: "move",
          path: shownPath,
          trap: team.isPositionVisible(event.path.at(-1)!) ? event.trap : false,
          subEvent: emittableSubEvent.subEvent,
          //if unit shows and it was not visible before
          appearingUnit:
            shownPath.length == 0 || team.isPositionVisible(event.path[0])
              ? undefined
              : match.getUnitOrThrow(getFinalPositionSafe(event.path)).data,
        };

        return result;
      });
    }
    case "unloadNoWait": {
      return teamsWithSpectator.map((team) => {
        // if either the transport or the unloaded unit is visible, send the event
        if (
          team.isPositionVisible(event.transportPosition) ||
          team.isPositionVisible(addDirection(event.transportPosition, event.unloads.direction))
        ) {
          return {
            ...event,
            playerId: getFirstPlayerInTeam(team),
          };
        } else {
          return undefined;
        }
      });
    }
    case "build": {
      // NOTE: THIS IS JUST FOR TESTING
      // I suspect that Fog Of War will stop certain players from receiving these events and thus
      // this switch case will have a different implementation.
      return teamsWithSpectator.map((team) => ({
        ...event,
        playerId: getFirstPlayerInTeam(team),
      }));
    }
    case "delete": {
      return teamsWithSpectator.map((team) => {
        // slight inaccuracy: we send the delete position that causes the player to lose
        if (team.isPositionVisible(event.position) || event.eliminationReason !== undefined) {
          return {
            ...event,
            playerId: getFirstPlayerInTeam(team),
          };
        } else {
          return undefined;
        }
      });
    }
    default: {
      return teamsWithSpectator.map((team) => ({
        ...event,
        playerId: getFirstPlayerInTeam(team),
      }));
    }
  }
};

function getFirstPlayerInTeam(team: TeamWrapper) {
  if (team.players === undefined || team.players.length === 0) {
    return "spectator";
  }

  return team.players[0].data.id;
}
