import type { EmittableEvent } from "server/engine/types/events";
import type { WWUnit } from "server/core/schemas/unit";
import type { MatchWrapper } from "server/engine/entities/match";
import { maskUnitForViewer } from "server/engine/entities/team";
import type { CapturableTile } from "server/core/schemas/tile-state";

export const fillDiscoveredUnitsAndProperties = (
  match: MatchWrapper,
  emittableEvents: (EmittableEvent | undefined)[],
) => {
  // emittableEvents.length = math.teams.length + 1, since it has "no team" in the end
  for (let i = 0; i < match.teams.length; ++i) {
    const emittableEvent = emittableEvents[i]; // have to save it in a variable cause typescript is too dumb
    const team = match.teams[i];

    if (emittableEvent === undefined) {
      continue;
    }

    // TODO this condition can be thinned out more (for example, only update sonja's own team,
    //  or pass turn only when cop deactivates or weather changes
    //  AND more importantly, skip if no fog of war (in previous turn (?))
    const recalculateVision =
      emittableEvent.type === "matchStart" ||
      emittableEvent.type === "passTurn" ||
      (emittableEvent.type === "coPower" &&
        (match.getCurrentTurnPlayer().data.coId.name === "sonja" ||
          match.getCurrentTurnPlayer().data.coId.name === "drake"));

    if (recalculateVision) {
      // getEnemyUnitsInVision already masks each unit for this team (cargo + Sonja stats).
      emittableEvent.discoveredUnits = team.getEnemyUnitsInVision();
      continue; // process every team, not just index 0 — `return` here dropped teams 1+
    }

    if (team.vision === null) {
      // no fog of war
      continue;
    }

    const discoveredUnits: WWUnit[] = [];
    const discoveredProperties: CapturableTile[] = [];

    for (const position of team.vision.getDiscoveredPositionsAndClear()) {
      const unit = match.getUnit(position);
      const tile = match.getTile(position);

      if (unit !== undefined) {
        // Mask the newly-discovered unit for THIS team, exactly like the recalculate branch and the
        // board — a reveal must not leak transport cargo or a Sonja unit's hidden stats.
        discoveredUnits.push(maskUnitForViewer(unit, team));
      }

      if ("playerSlot" in tile) {
        discoveredProperties.push({
          ...tile,
          position: position,
        });
      }
    }

    // unused in backend, useful in frontend. Must flush so the array doesn't get too big.
    team.vision.getUndiscoveredPositionsAndClear();

    if (discoveredUnits.length > 0) {
      emittableEvent.discoveredUnits = discoveredUnits;
    }

    if (discoveredProperties.length > 0) {
      emittableEvent.discoveredProperties = discoveredProperties;
    }
  }

  // TODO handle player-eliminated changing properties clientside
};
