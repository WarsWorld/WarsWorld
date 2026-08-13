/**
 * Frontend entry point for the logger. The implementation is isomorphic (see `shared/utils/logger`)
 * because the game engine it also serves is bundled into the client; this re-export just gives FE
 * code a `frontend/…` import path. Browser level is controlled by `NEXT_PUBLIC_LOG_LEVEL`.
 */
export { createLogger, getLogLevel, logger, type Logger, type LogLevel } from "shared/utils/logger";
