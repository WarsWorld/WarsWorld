import { Position, isSamePosition } from "server/schemas/position";
import { WWUnit } from "server/schemas/unit";
import { BackendMatchState } from "shared/types/server-match-state";

export const getUnit = (
  matchState: BackendMatchState,
  position: Position
): WWUnit => {
  const unit = matchState.units.find((u) =>
    isSamePosition(u.position, position)
  );

  if (unit === undefined) {
    throw new Error(`No unit found at ${JSON.stringify(position)}`);
  }

  return unit;
};
