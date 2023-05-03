import { AttemptMoveAction, UnloadAction } from "components/schemas/action";

export interface AttemptMoveInternalEvent extends AttemptMoveAction {
  trapped?: boolean;
}

export interface UnloadInternalEvent extends UnloadAction {
  trapped?: boolean;
}

// TODO check!
