import type { Emittable } from "shared/types/events";
import { createEmitter } from "./create-emitter";

const wwEmitter = createEmitter<Emittable>();

export const emit = wwEmitter.emit;
export const subscribe = wwEmitter.subscribe;
