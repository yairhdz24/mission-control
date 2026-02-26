// Isometric coordinate system
// Grid -> Screen conversion and vice versa

export const TILE_WIDTH = 64
export const TILE_HEIGHT = 32
export const GRID_COLS = 10
export const GRID_ROWS = 8

// Convert grid coordinates to screen (isometric) coordinates
export function gridToScreen(
  gridX: number,
  gridY: number
): { x: number; y: number } {
  return {
    x: (gridX - gridY) * (TILE_WIDTH / 2),
    y: (gridX + gridY) * (TILE_HEIGHT / 2),
  }
}

// Convert screen coordinates back to grid coordinates
export function screenToGrid(
  screenX: number,
  screenY: number
): { x: number; y: number } {
  return {
    x: Math.round(screenX / TILE_WIDTH + screenY / TILE_HEIGHT),
    y: Math.round(screenY / TILE_HEIGHT - screenX / TILE_WIDTH),
  }
}

// Get the center of the map in screen coordinates
export function getMapCenter(): { x: number; y: number } {
  return gridToScreen(GRID_COLS / 2, GRID_ROWS / 2)
}

// Lerp for smooth movement
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * Math.min(1, t)
}
