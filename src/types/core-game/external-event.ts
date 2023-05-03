import { AttemptMoveAction } from "components/schemas/action";
import { FrontendUnit } from "components/schemas/unit";

export interface AttemptMoveExternalEvent extends AttemptMoveAction {
  trap?: FrontendUnit;
  discovered?: FrontendUnit[];
}
