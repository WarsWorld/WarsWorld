import { PropertyTile } from "server/schemas/tile";
import { MovementType } from "shared/match-logic/buildable-unit";

interface PropertyProperties {
  providesFunds: boolean;
  resuppliedMovementTypes: MovementType[];
}

const movementTypesThatGetResuppliedByBases: MovementType[] = [
  "boots",
  "foot",
  "pipe",
  "tires",
  "treads",
];

export const propertyPropertiesMap: Record<
  PropertyTile["type"],
  PropertyProperties
> = {
  airport: { providesFunds: true, resuppliedMovementTypes: ["air"] },
  base: {
    providesFunds: true,
    resuppliedMovementTypes: movementTypesThatGetResuppliedByBases,
  },
  city: {
    providesFunds: true,
    resuppliedMovementTypes: movementTypesThatGetResuppliedByBases, // pipes can't move here so no need for an exception
  },
  port: { providesFunds: true, resuppliedMovementTypes: ["sea", "lander"] },
  comtower: { providesFunds: false, resuppliedMovementTypes: [] },
  lab: { providesFunds: false, resuppliedMovementTypes: [] },
  hq: {
    providesFunds: true,
    resuppliedMovementTypes: movementTypesThatGetResuppliedByBases,
  },
};
