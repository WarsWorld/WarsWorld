import type { Emittable } from "shared/types/events";
import { createEmitter } from "./create-emitter";

const wwEmitter = createEmitter<Emittable>();

// eslint-disable-next-line @typescript-eslint/unbound-method
export const emit = wwEmitter.emit;
// eslint-disable-next-line @typescript-eslint/unbound-method
export const subscribe = wwEmitter.subscribe;
export const unsubscribe = wwEmitter.unsubscribe;
