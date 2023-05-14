export const movementTypes = [
  "foot",
  "boots",
  "treads",
  "tires",
  "air",
  "sea",
  "lander",
  "pipe",
] as const;

export type MovementType = (typeof movementTypes)[number];

export function isMovementType(x: any): x is MovementType {
  return (
    typeof x === "string" && (movementTypes as readonly string[]).includes(x)
  );
}
