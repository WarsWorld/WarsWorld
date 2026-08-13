import type { COProperties } from "server/engine/rules/co";
import { adderAW2 } from "server/engine/constants/cos/adder/adder-aw2";

export const adderAWDS: COProperties = {
  ...adderAW2,
  gameVersion: "AWDS",
};
