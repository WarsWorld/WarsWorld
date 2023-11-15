import type { EmittableEvent } from "shared/types/events";
import { createEmitter } from "./create-emitter";

const wwEventEmitter = createEmitter<EmittableEvent>();

export const emitEvent = wwEventEmitter.emit;
export const subscribeToEvents = wwEventEmitter.subscribe;
