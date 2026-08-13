import type { COProperties } from "server/engine/rules/co";
import { hawkeAW2 } from "server/engine/constants/cos/hawke/hawke-aw2";

export const hawkeAWDS: COProperties = {
  ...hawkeAW2,
  gameVersion: "AWDS",
};
