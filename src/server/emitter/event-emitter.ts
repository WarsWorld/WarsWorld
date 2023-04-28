import { EmittableEvent } from "types/core-game/event";
import { createEmitter } from "./create-emitter";

const wwEventEmitter = createEmitter<EmittableEvent>();

export const emitEvent = wwEventEmitter.emit;
export const subscribeToEvents = wwEventEmitter.subscribe;
