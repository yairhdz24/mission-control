import { GRID_COLS, GRID_ROWS } from './coordinates'

export type TileType = 'floor' | 'wall' | 'desk' | 'empty' | 'plant' | 'server'

// Office layout grid (10x8)
// 0=empty, 1=floor, 2=wall, 3=desk, 4=plant, 5=server
const RAW_LAYOUT: number[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 1, 3, 1, 1, 1, 1, 3, 1, 2],
  [2, 1, 1, 1, 4, 1, 4, 1, 1, 2],
  [2, 1, 1, 1, 1, 3, 1, 1, 1, 2],
  [2, 1, 4, 1, 1, 1, 1, 1, 4, 2],
  [2, 3, 1, 1, 1, 1, 1, 1, 3, 2],
  [2, 1, 1, 1, 5, 1, 5, 1, 1, 2],
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
]

const TILE_MAP: Record<number, TileType> = {
  0: 'empty',
  1: 'floor',
  2: 'wall',
  3: 'desk',
  4: 'plant',
  5: 'server',
}

export interface Tile {
  x: number
  y: number
  type: TileType
}

export function getOfficeLayout(): Tile[] {
  const tiles: Tile[] = []
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      tiles.push({
        x,
        y,
        type: TILE_MAP[RAW_LAYOUT[y]?.[x] ?? 0] || 'empty',
      })
    }
  }
  return tiles
}

// Colors for each tile type
export const TILE_COLORS: Record<TileType, { top: number; left: number; right: number }> = {
  floor: { top: 0x2a2a3e, left: 0x1e1e30, right: 0x222236 },
  wall: { top: 0x3d3d5c, left: 0x2d2d44, right: 0x333350 },
  desk: { top: 0x4a3728, left: 0x3a2a1e, right: 0x402f22 },
  empty: { top: 0x111122, left: 0x0d0d1a, right: 0x0f0f1e },
  plant: { top: 0x2d5a3d, left: 0x1e4030, right: 0x254a35 },
  server: { top: 0x3a3a5a, left: 0x2a2a44, right: 0x30304e },
}

// Agent desk positions (where they sit in the office)
export const AGENT_POSITIONS: Record<string, { x: number; y: number }> = {
  Nova: { x: 5, y: 3 },
  Atlas: { x: 2, y: 1 },
  Pixel: { x: 7, y: 1 },
  Sentinel: { x: 1, y: 5 },
  Flow: { x: 8, y: 5 },
}
