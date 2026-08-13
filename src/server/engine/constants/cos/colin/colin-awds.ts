import type { COProperties } from "server/engine/rules/co";
import { colinAW2 } from "server/engine/constants/cos/colin/colin-aw2";

export const colinAWDS: COProperties = {
  ...colinAW2,
  gameVersion: "AWDS",
};
