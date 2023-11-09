import { CO } from "server/schemas/co";
import { COHookProps, COHooks } from "./co-hooks";
import { adder } from "./cos/adder";
import { andy } from "./cos/andy";
import { colin } from "./cos/colin";
import { drake } from "./cos/drake";
import { eagle } from "./cos/eagle";
import { grit } from "./cos/grit";
import { hawke } from "./cos/hawke";
import { javier } from "./cos/javier";
import { lash } from "./cos/lash";

export interface COPower {
  name: string;
  description: string;
  stars: number;
  instantEffect?: (props: COHookProps) => void;
  hooks?: COHooks;
}

// TODO general CO description, likes, dislikes, etc.
export interface COProperties {
  displayName: string;
  dayToDay?: {
    description: string;
    hooks: COHooks;
  };
  powers: {
    COPower?: COPower;
    superCOPower: COPower;
  };
}

export const COPropertiesMap: Record<CO, COProperties> = {
  andy,
  adder,
  drake,
  eagle,
  grit,
  hawke,
  javier,
  lash,
  colin,
};
