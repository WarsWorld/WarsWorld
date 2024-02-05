import type { Emittable } from "shared/types/emittables";
import { createEmitter } from "./create-emitter";

const wwEmitter = createEmitter<Emittable>();

export const emit = wwEmitter.emit;
export const subscribe = wwEmitter.subscribe;
export const unsubscribe = wwEmitter.unsubscribe;
