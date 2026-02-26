import { GRID_COLS, GRID_ROWS } from './coordinates'
import { getOfficeLayout } from './office-layout'

interface Node {
  x: number
  y: number
  g: number
  h: number
  f: number
  parent: Node | null
}

const WALKABLE = new Set(['floor', 'desk', 'plant', 'server'])

export function findPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): { x: number; y: number }[] {
  const layout = getOfficeLayout()
  const grid = new Map<string, boolean>()

  for (const tile of layout) {
    grid.set(`${tile.x},${tile.y}`, WALKABLE.has(tile.type))
  }

  const openList: Node[] = []
  const closedSet = new Set<string>()

  const startNode: Node = {
    x: startX,
    y: startY,
    g: 0,
    h: heuristic(startX, startY, endX, endY),
    f: 0,
    parent: null,
  }
  startNode.f = startNode.g + startNode.h
  openList.push(startNode)

  while (openList.length > 0) {
    // Find node with lowest f
    openList.sort((a, b) => a.f - b.f)
    const current = openList.shift()!
    const key = `${current.x},${current.y}`

    if (current.x === endX && current.y === endY) {
      return reconstructPath(current)
    }

    closedSet.add(key)

    // Check neighbors (4 directions)
    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ]

    for (const n of neighbors) {
      const nKey = `${n.x},${n.y}`
      if (
        n.x < 0 || n.x >= GRID_COLS ||
        n.y < 0 || n.y >= GRID_ROWS ||
        closedSet.has(nKey) ||
        !grid.get(nKey)
      ) {
        continue
      }

      const g = current.g + 1
      const h = heuristic(n.x, n.y, endX, endY)
      const f = g + h

      const existing = openList.find((o) => o.x === n.x && o.y === n.y)
      if (existing && g >= existing.g) continue

      if (existing) {
        existing.g = g
        existing.h = h
        existing.f = f
        existing.parent = current
      } else {
        openList.push({ x: n.x, y: n.y, g, h, f, parent: current })
      }
    }
  }

  // No path found - return direct line
  return [{ x: endX, y: endY }]
}

function heuristic(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2)
}

function reconstructPath(node: Node): { x: number; y: number }[] {
  const path: { x: number; y: number }[] = []
  let current: Node | null = node
  while (current) {
    path.unshift({ x: current.x, y: current.y })
    current = current.parent
  }
  return path.slice(1) // Remove start position
}
