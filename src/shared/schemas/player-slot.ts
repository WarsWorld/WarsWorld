// INTERIM SHIM: the game vocabulary now lives in src/server/core (the shared kernel). This file
// re-exports it so the frontend and other src/shared code keep compiling until the FE fetches
// vocabulary from the BE and caches it (game-data-in-DB initiative). Delete when that lands.
export * from "server/core/schemas/player-slot";
