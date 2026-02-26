// Office furniture and layout definitions for the isometric view
// Each workstation has a position (grid coords), furniture items, and assigned agent slot

export interface Furniture {
  type: 'desk' | 'chair' | 'monitor' | 'plant' | 'shelf' | 'lamp' | 'bean-bag' | 'coffee' | 'server' | 'whiteboard' | 'rug'
  offsetX: number  // pixel offset from workstation origin
  offsetY: number
  variant?: number
}

export interface Workstation {
  id: string
  label: string
  gridX: number
  gridY: number
  furniture: Furniture[]
}

// 5 workstations for our agents + common areas
export const WORKSTATIONS: Workstation[] = [
  {
    id: 'main',
    label: 'Command Center',
    gridX: 4, gridY: 4,
    furniture: [
      { type: 'desk', offsetX: 0, offsetY: 0 },
      { type: 'chair', offsetX: 0, offsetY: 16 },
      { type: 'monitor', offsetX: -4, offsetY: -18 },
      { type: 'monitor', offsetX: 8, offsetY: -18 },
      { type: 'lamp', offsetX: -24, offsetY: -12 },
      { type: 'coffee', offsetX: 22, offsetY: -4 },
    ],
  },
  {
    id: 'frontend',
    label: 'Design Lab',
    gridX: 1, gridY: 2,
    furniture: [
      { type: 'desk', offsetX: 0, offsetY: 0 },
      { type: 'chair', offsetX: 0, offsetY: 16 },
      { type: 'monitor', offsetX: 0, offsetY: -18, variant: 1 },
      { type: 'plant', offsetX: -30, offsetY: -8 },
      { type: 'lamp', offsetX: 26, offsetY: -14 },
    ],
  },
  {
    id: 'backend',
    label: 'Server Room',
    gridX: 7, gridY: 2,
    furniture: [
      { type: 'desk', offsetX: 0, offsetY: 0 },
      { type: 'chair', offsetX: 0, offsetY: 16 },
      { type: 'monitor', offsetX: 0, offsetY: -18 },
      { type: 'server', offsetX: 30, offsetY: -10 },
      { type: 'coffee', offsetX: -26, offsetY: -2 },
    ],
  },
  {
    id: 'research',
    label: 'Research Corner',
    gridX: 7, gridY: 6,
    furniture: [
      { type: 'desk', offsetX: 0, offsetY: 0 },
      { type: 'chair', offsetX: 0, offsetY: 16 },
      { type: 'monitor', offsetX: 0, offsetY: -18, variant: 1 },
      { type: 'shelf', offsetX: 28, offsetY: -22 },
      { type: 'plant', offsetX: -28, offsetY: -6 },
    ],
  },
  {
    id: 'devops',
    label: 'Ops Deck',
    gridX: 1, gridY: 6,
    furniture: [
      { type: 'desk', offsetX: 0, offsetY: 0 },
      { type: 'chair', offsetX: 0, offsetY: 16 },
      { type: 'monitor', offsetX: 0, offsetY: -18 },
      { type: 'server', offsetX: -30, offsetY: -10 },
      { type: 'lamp', offsetX: 28, offsetY: -14 },
    ],
  },
]

// Common area decorations
export const DECORATIONS: { type: Furniture['type']; gridX: number; gridY: number; offsetX: number; offsetY: number }[] = [
  { type: 'plant', gridX: 0, gridY: 0, offsetX: 10, offsetY: 0 },
  { type: 'plant', gridX: 8, gridY: 0, offsetX: -10, offsetY: 0 },
  { type: 'plant', gridX: 0, gridY: 8, offsetX: 10, offsetY: 0 },
  { type: 'plant', gridX: 8, gridY: 8, offsetX: -10, offsetY: 0 },
  { type: 'whiteboard', gridX: 4, gridY: 0, offsetX: 0, offsetY: 8 },
  { type: 'rug', gridX: 4, gridY: 4, offsetX: 0, offsetY: 40 },
  { type: 'bean-bag', gridX: 3, gridY: 7, offsetX: 0, offsetY: 0 },
  { type: 'coffee', gridX: 5, gridY: 7, offsetX: 0, offsetY: 0 },
]

// Agent to workstation mapping (by index)
export const AGENT_WORKSTATION_MAP: Record<string, string> = {
  'Bbsote': 'main',
  'Nova': 'frontend',
  'Axel': 'backend',
  'Luna': 'research',
  'Rex': 'devops',
}

// Grid layout for pathfinding
export function getOfficeLayout(): { x: number; y: number; type: string }[] {
  const tiles: { x: number; y: number; type: string }[] = []
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      tiles.push({ x, y, type: 'floor' })
    }
  }
  for (const ws of WORKSTATIONS) {
    tiles.push({ x: ws.gridX, y: ws.gridY, type: 'desk' })
  }
  return tiles
}

// Colors for dark office theme
export const OFFICE_COLORS = {
  floor: 0x1a1a2e,
  floorAccent: 0x16213e,
  wall: 0x0f3460,
  wallDark: 0x0a1628,
  wallLight: 0x1a4a7a,
  desk: 0x2d2d3f,
  deskTop: 0x3d3d52,
  deskEdge: 0x22222f,
  chair: 0x3a3a5c,
  chairSeat: 0x4a4a6a,
  monitor: 0x0d0d1a,
  monitorScreen: 0x1a3a5a,
  monitorScreenActive: 0x2d6a4f,
  plant: 0x2d6a4f,
  plantPot: 0x4a3728,
  plantLeaf: 0x3da35a,
  shelf: 0x3d2e1f,
  shelfBooks: [0x5a3a6a, 0x3a5a6a, 0x6a5a3a, 0x3a6a5a],
  lamp: 0x8a7a5a,
  lampLight: 0xffe4a0,
  server: 0x1a2a3a,
  serverLed: 0x00ff88,
  beanBag: 0x4a3a6a,
  coffee: 0x6a5a4a,
  whiteboard: 0x2a2a3a,
  rug: 0x2a1a3a,
}
