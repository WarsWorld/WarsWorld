import { publicBaseProcedure, router } from "../trpc/trpc-setup";

/**
 * Tiny liveness endpoint. The client's ping indicator calls it on an interval and measures the
 * round-trip time (it runs over the same WS as gameplay, so it reflects the real match latency).
 * The returned value is irrelevant — the client only times the round-trip.
 */
export const systemRouter = router({
  ping: publicBaseProcedure.query(() => Date.now()),
});
