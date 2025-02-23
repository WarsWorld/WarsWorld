/** Clamps newValue to be higher-or-equal to min and lower-or-equal to max */
export const clamp = (min: number, newValue: number, max: number) => {
  const flooredValue = Math.max(min, newValue);
  const ceiledValue = Math.min(max, flooredValue);
  return ceiledValue;
};
