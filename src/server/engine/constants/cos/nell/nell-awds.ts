import type { COProperties } from "server/engine/rules/co";
import { nellAW2 } from "server/engine/constants/cos/nell/nell-aw2";

export const nellAWDS: COProperties = {
  ...nellAW2,
  gameVersion: "AWDS",
};
