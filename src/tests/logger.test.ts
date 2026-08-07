import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * The active level is resolved once at module load, so each case resets the module registry and
 * re-imports with a fresh env. Vitest runs in the "node" environment (no `window`), so the logger
 * reads `LOG_LEVEL`.
 */
const loadLogger = async () => {
  vi.resetModules();
  return import("shared/utils/logger");
};

describe("logger level configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("defaults to warn in production — debug/info are suppressed, warn/error pass", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LOG_LEVEL", "");
    vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "");
    const debug = vi.spyOn(console, "debug").mockImplementation(() => undefined);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const { logger, getLogLevel } = await loadLogger();

    expect(getLogLevel()).toBe("warn");
    logger.debug("hidden");
    logger.warn("shown");
    expect(debug).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledOnce();
  });

  it("defaults to debug outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("LOG_LEVEL", "");
    vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "");
    const debug = vi.spyOn(console, "debug").mockImplementation(() => undefined);

    const { logger, getLogLevel } = await loadLogger();

    expect(getLogLevel()).toBe("debug");
    logger.debug("shown");
    expect(debug).toHaveBeenCalledOnce();
  });

  it("LOG_LEVEL overrides the NODE_ENV default", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LOG_LEVEL", "debug");
    const debug = vi.spyOn(console, "debug").mockImplementation(() => undefined);

    const { logger, getLogLevel } = await loadLogger();

    expect(getLogLevel()).toBe("debug");
    logger.debug("shown in prod because LOG_LEVEL=debug");
    expect(debug).toHaveBeenCalledOnce();
  });

  it("silent suppresses every level, including error", async () => {
    vi.stubEnv("LOG_LEVEL", "silent");
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { logger } = await loadLogger();

    logger.error("not emitted");
    expect(error).not.toHaveBeenCalled();
  });

  it("an unknown LOG_LEVEL falls back to the NODE_ENV default", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LOG_LEVEL", "loud");

    const { getLogLevel } = await loadLogger();

    expect(getLogLevel()).toBe("warn");
  });

  it("createLogger prefixes lines with its tag", async () => {
    vi.stubEnv("LOG_LEVEL", "debug");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const { createLogger } = await loadLogger();
    createLogger("engine").warn("boom", 42);

    expect(warn).toHaveBeenCalledWith("[engine]", "boom", 42);
  });
});
