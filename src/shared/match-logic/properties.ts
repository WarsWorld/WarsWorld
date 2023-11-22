import type { PropertyTile } from "shared/schemas/tile";
import type { MovementType } from "shared/match-logic/buildable-unit";

type PropertyProperties = {
  providesFunds: boolean;
  resuppliedMovementTypes: MovementType[];
};

const movementTypesThatGetResuppliedByBases: MovementType[] = ["boots", "foot", "pipe", "tires", "treads"];

export const propertyPropertiesMap: Record<PropertyTile["type"], PropertyProperties> = {
  airport: { providesFunds: true, resuppliedMovementTypes: ["air"] },
  base: {
    providesFunds: true,
    resuppliedMovementTypes: movementTypesThatGetResuppliedByBases
  },
  city: {
    providesFunds: true,
    // pipes can't move here so no need for an exception
    resuppliedMovementTypes: movementTypesThatGetResuppliedByBases
  },
  port: { providesFunds: true, resuppliedMovementTypes: ["sea", "lander"] },
  commtower: { providesFunds: false, resuppliedMovementTypes: [] },
  lab: { providesFunds: false, resuppliedMovementTypes: [] },
  hq: {
    providesFunds: true,
    resuppliedMovementTypes: movementTypesThatGetResuppliedByBases
  }
};
