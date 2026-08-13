/**
 * Level-configurable logger, isomorphic on purpose: the game engine (still under `src/shared`) runs
 * both server-side and inside the FE bundle, so a single implementation must work in Node and the
 * browser. Level is resolved once at module load:
 *
 *   - Browser: `NEXT_PUBLIC_LOG_LEVEL` (Next inlines `NEXT_PUBLIC_*` at build time).
 *   - Server:  `LOG_LEVEL`, falling back to `NEXT_PUBLIC_LOG_LEVEL`.
 *   - Default: `warn` in production, `debug` otherwise — so prod views stay quiet unless opted in.
 *
 * Anything below the active level is dropped. Use `debug` for per-action/per-move hot-path traces,
 * `info` for lifecycle transitions, `warn` for expected failures, `error` for unexpected ones.
 */

export const LOG_LEVELS = ["debug", "info", "warn", "error", "silent"] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

const isLogLevel = (value: string | undefined): value is LogLevel =>
  value !== undefined && (LOG_LEVELS as readonly string[]).includes(value);

const resolveActiveLevel = (): LogLevel => {
  const fromEnv =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_LOG_LEVEL
      : (process.env.LOG_LEVEL ?? process.env.NEXT_PUBLIC_LOG_LEVEL);

  const normalized = fromEnv?.toLowerCase();

  if (isLogLevel(normalized)) {
    return normalized;
  }

  return process.env.NODE_ENV === "production" ? "warn" : "debug";
};

const activeLevel = resolveActiveLevel();

const isEnabled = (level: LogLevel) => LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[activeLevel];

export type Logger = {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

const build = (prefix?: string): Logger => {
  const tag = prefix !== undefined ? [`[${prefix}]`] : [];

  const emit =
    (level: LogLevel, sink: (...args: unknown[]) => void) =>
    (...args: unknown[]) => {
      if (isEnabled(level)) {
        sink(...tag, ...args);
      }
    };

  return {
    debug: emit("debug", console.debug),
    info: emit("info", console.info),
    warn: emit("warn", console.warn),
    error: emit("error", console.error),
  };
};

/** The active log level resolved at load, exposed for diagnostics/tests. */
export const getLogLevel = (): LogLevel => activeLevel;

/** Default shared logger. */
export const logger = build();

/** A logger that prefixes every line with `[prefix]` for easy grepping. */
export const createLogger = (prefix: string): Logger => build(prefix);
