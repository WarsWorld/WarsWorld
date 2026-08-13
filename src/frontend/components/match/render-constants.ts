// Tile-size constants shared by every pixi renderer (v2 board scene, HUD overlays, in-game menus).
// Framework-free and engine-free — the presentation layer's fixed geometry, nothing else.
export const baseTileSize = 16;
export const renderMultiplier = 2;
export const renderedTileSize = baseTileSize * renderMultiplier;
export const mapBorder = baseTileSize / 2;
