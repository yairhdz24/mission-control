'use client'

import { useCallback } from 'react'
import { gridToScreen, TILE_WIDTH, TILE_HEIGHT, GRID_COLS, GRID_ROWS } from '@/lib/isometric/coordinates'
import { WORKSTATIONS, DECORATIONS, OFFICE_COLORS as C } from '@/lib/isometric/office-layout'

export function OfficeMap() {
  // Draw the isometric floor
  const drawFloor = useCallback((g: import('pixi.js').Graphics) => {
    g.clear()

    // Draw floor tiles
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const { x, y } = gridToScreen(col, row)
        const isDark = (row + col) % 2 === 0

        // Tile diamond
        g.fill({ color: isDark ? C.floor : C.floorAccent, alpha: 1 })
        g.moveTo(x, y)
        g.lineTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2)
        g.lineTo(x, y + TILE_HEIGHT)
        g.lineTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2)
        g.closePath()
        g.fill()

        // Subtle grid line
        g.setStrokeStyle({ width: 0.5, color: 0xffffff, alpha: 0.03 })
        g.moveTo(x, y)
        g.lineTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2)
        g.lineTo(x, y + TILE_HEIGHT)
        g.lineTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2)
        g.closePath()
        g.stroke()
      }
    }
  }, [])

  // Draw walls (back walls of the room)
  const drawWalls = useCallback((g: import('pixi.js').Graphics) => {
    g.clear()
    const topLeft = gridToScreen(0, 0)
    const topRight = gridToScreen(GRID_COLS, 0)
    const center = gridToScreen(0, 0)
    const wallH = 60

    // Left wall
    g.fill({ color: C.wall, alpha: 0.9 })
    const bl = gridToScreen(0, GRID_ROWS)
    g.moveTo(center.x - TILE_WIDTH / 2, center.y + TILE_HEIGHT / 2)
    g.lineTo(center.x - TILE_WIDTH / 2, center.y + TILE_HEIGHT / 2 - wallH)
    g.lineTo(topLeft.x, topLeft.y - wallH)
    g.lineTo(topLeft.x, topLeft.y)
    g.closePath()
    g.fill()

    // Right wall
    g.fill({ color: C.wallDark, alpha: 0.9 })
    g.moveTo(topLeft.x, topLeft.y)
    g.lineTo(topLeft.x, topLeft.y - wallH)
    g.lineTo(topRight.x, topRight.y + TILE_HEIGHT / 2 - wallH)
    g.lineTo(topRight.x, topRight.y + TILE_HEIGHT / 2)
    g.closePath()
    g.fill()

    // Wall trim lines
    g.setStrokeStyle({ width: 1, color: C.wallLight, alpha: 0.3 })
    g.moveTo(center.x - TILE_WIDTH / 2, center.y + TILE_HEIGHT / 2 - wallH)
    g.lineTo(topLeft.x, topLeft.y - wallH)
    g.lineTo(topRight.x, topRight.y + TILE_HEIGHT / 2 - wallH)
    g.stroke()

    // Window glow on left wall
    const wx = (center.x - TILE_WIDTH / 2 + topLeft.x) / 2
    const wy = ((center.y + TILE_HEIGHT / 2 - wallH) + (topLeft.y - wallH)) / 2
    g.fill({ color: 0x3a6a9a, alpha: 0.2 })
    g.roundRect(wx - 10, wy - 8, 20, 16, 2)
    g.fill()

    // Window glow on right wall
    const wx2 = (topLeft.x + topRight.x) / 2
    const wy2 = ((topLeft.y - wallH) + (topRight.y + TILE_HEIGHT / 2 - wallH)) / 2
    g.fill({ color: 0x3a6a9a, alpha: 0.15 })
    g.roundRect(wx2 - 12, wy2 - 8, 24, 16, 2)
    g.fill()
  }, [])

  // Draw furniture for all workstations
  const drawFurniture = useCallback((g: import('pixi.js').Graphics) => {
    g.clear()

    for (const ws of WORKSTATIONS) {
      const origin = gridToScreen(ws.gridX, ws.gridY)

      for (const f of ws.furniture) {
        const fx = origin.x + f.offsetX
        const fy = origin.y + f.offsetY

        switch (f.type) {
          case 'desk':
            drawDesk(g, fx, fy)
            break
          case 'chair':
            drawChair(g, fx, fy)
            break
          case 'monitor':
            drawMonitor(g, fx, fy, f.variant)
            break
          case 'plant':
            drawPlant(g, fx, fy)
            break
          case 'lamp':
            drawLamp(g, fx, fy)
            break
          case 'server':
            drawServer(g, fx, fy)
            break
          case 'shelf':
            drawShelf(g, fx, fy)
            break
          case 'coffee':
            drawCoffee(g, fx, fy)
            break
        }
      }
    }

    // Draw decorations
    for (const d of DECORATIONS) {
      const pos = gridToScreen(d.gridX, d.gridY)
      const dx = pos.x + d.offsetX
      const dy = pos.y + d.offsetY

      switch (d.type) {
        case 'plant': drawPlant(g, dx, dy); break
        case 'whiteboard': drawWhiteboard(g, dx, dy); break
        case 'rug': drawRug(g, dx, dy); break
        case 'bean-bag': drawBeanBag(g, dx, dy); break
        case 'coffee': drawCoffee(g, dx, dy); break
      }
    }
  }, [])

  return (
    <pixiContainer>
      <pixiGraphics draw={drawWalls} />
      <pixiGraphics draw={drawFloor} />
      <pixiGraphics draw={drawFurniture} />
    </pixiContainer>
  )
}

// ─── Furniture draw functions ───
function drawDesk(g: import('pixi.js').Graphics, x: number, y: number) {
  // Desk top (isometric rectangle)
  g.fill({ color: C.deskTop })
  g.moveTo(x, y - 8)
  g.lineTo(x + 20, y - 2)
  g.lineTo(x, y + 4)
  g.lineTo(x - 20, y - 2)
  g.closePath()
  g.fill()

  // Desk front face
  g.fill({ color: C.desk })
  g.moveTo(x - 20, y - 2)
  g.lineTo(x, y + 4)
  g.lineTo(x, y + 12)
  g.lineTo(x - 20, y + 6)
  g.closePath()
  g.fill()

  // Desk side face
  g.fill({ color: C.deskEdge })
  g.moveTo(x, y + 4)
  g.lineTo(x + 20, y - 2)
  g.lineTo(x + 20, y + 6)
  g.lineTo(x, y + 12)
  g.closePath()
  g.fill()
}

function drawChair(g: import('pixi.js').Graphics, x: number, y: number) {
  // Seat
  g.fill({ color: C.chairSeat })
  g.ellipse(x, y, 8, 5)
  g.fill()

  // Back
  g.fill({ color: C.chair })
  g.roundRect(x - 6, y - 12, 12, 10, 3)
  g.fill()

  // Legs hint
  g.setStrokeStyle({ width: 1, color: 0x333344 })
  g.moveTo(x, y + 4)
  g.lineTo(x, y + 8)
  g.stroke()
}

function drawMonitor(g: import('pixi.js').Graphics, x: number, y: number, variant?: number) {
  // Screen bezel
  g.fill({ color: C.monitor })
  g.roundRect(x - 10, y - 14, 20, 14, 2)
  g.fill()

  // Screen
  const screenColor = variant === 1 ? 0x2a4a6a : C.monitorScreen
  g.fill({ color: screenColor, alpha: 0.8 })
  g.roundRect(x - 8, y - 12, 16, 10, 1)
  g.fill()

  // Screen glow
  g.fill({ color: screenColor, alpha: 0.15 })
  g.circle(x, y - 7, 14)
  g.fill()

  // Stand
  g.fill({ color: C.monitor })
  g.rect(x - 2, y, 4, 4)
  g.fill()

  // Code lines on screen (tiny detail)
  g.setStrokeStyle({ width: 0.5, color: 0x4a8a6a, alpha: 0.6 })
  for (let i = 0; i < 3; i++) {
    const lw = 4 + Math.random() * 8
    g.moveTo(x - 6, y - 10 + i * 3)
    g.lineTo(x - 6 + lw, y - 10 + i * 3)
    g.stroke()
  }
}

function drawPlant(g: import('pixi.js').Graphics, x: number, y: number) {
  // Pot
  g.fill({ color: C.plantPot })
  g.moveTo(x - 5, y)
  g.lineTo(x + 5, y)
  g.lineTo(x + 4, y + 8)
  g.lineTo(x - 4, y + 8)
  g.closePath()
  g.fill()

  // Leaves
  g.fill({ color: C.plantLeaf, alpha: 0.9 })
  g.circle(x, y - 4, 6)
  g.fill()
  g.fill({ color: C.plant, alpha: 0.8 })
  g.circle(x - 3, y - 7, 4)
  g.fill()
  g.circle(x + 4, y - 6, 4)
  g.fill()
}

function drawLamp(g: import('pixi.js').Graphics, x: number, y: number) {
  // Pole
  g.setStrokeStyle({ width: 1.5, color: C.lamp })
  g.moveTo(x, y + 8)
  g.lineTo(x, y - 10)
  g.stroke()

  // Light shade
  g.fill({ color: C.lamp })
  g.moveTo(x - 6, y - 10)
  g.lineTo(x + 6, y - 10)
  g.lineTo(x + 4, y - 14)
  g.lineTo(x - 4, y - 14)
  g.closePath()
  g.fill()

  // Light glow
  g.fill({ color: C.lampLight, alpha: 0.08 })
  g.circle(x, y, 18)
  g.fill()
  g.fill({ color: C.lampLight, alpha: 0.04 })
  g.circle(x, y, 30)
  g.fill()
}

function drawServer(g: import('pixi.js').Graphics, x: number, y: number) {
  // Server rack body
  g.fill({ color: C.server })
  g.roundRect(x - 6, y - 20, 12, 24, 2)
  g.fill()

  // Server slots
  for (let i = 0; i < 4; i++) {
    g.fill({ color: 0x0d1a2a })
    g.rect(x - 4, y - 17 + i * 5, 8, 3)
    g.fill()
    // LED
    g.fill({ color: C.serverLed, alpha: 0.7 + Math.random() * 0.3 })
    g.circle(x + 3, y - 15.5 + i * 5, 1)
    g.fill()
  }
}

function drawShelf(g: import('pixi.js').Graphics, x: number, y: number) {
  // Shelf board
  g.fill({ color: C.shelf })
  g.rect(x - 12, y, 24, 3)
  g.fill()
  g.rect(x - 12, y - 12, 24, 3)
  g.fill()

  // Books
  const books = C.shelfBooks
  for (let i = 0; i < 4; i++) {
    const bx = x - 10 + i * 6
    const bh = 6 + Math.random() * 4
    g.fill({ color: books[i % books.length] })
    g.rect(bx, y - 9 - bh + 9, 4, bh)
    g.fill()
  }
}

function drawWhiteboard(g: import('pixi.js').Graphics, x: number, y: number) {
  // Board
  g.fill({ color: C.whiteboard })
  g.roundRect(x - 20, y - 24, 40, 24, 3)
  g.fill()

  // Inner white area
  g.fill({ color: 0x2a2a3a, alpha: 0.8 })
  g.roundRect(x - 17, y - 21, 34, 18, 2)
  g.fill()

  // Scribbles
  g.setStrokeStyle({ width: 0.5, color: 0x5a5a7a, alpha: 0.4 })
  g.moveTo(x - 12, y - 16)
  g.lineTo(x + 8, y - 16)
  g.stroke()
  g.moveTo(x - 12, y - 12)
  g.lineTo(x + 4, y - 12)
  g.stroke()
  g.moveTo(x - 12, y - 8)
  g.lineTo(x + 10, y - 8)
  g.stroke()
}

function drawRug(g: import('pixi.js').Graphics, x: number, y: number) {
  // Isometric rug
  g.fill({ color: C.rug, alpha: 0.3 })
  g.moveTo(x, y - 12)
  g.lineTo(x + 24, y)
  g.lineTo(x, y + 12)
  g.lineTo(x - 24, y)
  g.closePath()
  g.fill()

  // Border
  g.setStrokeStyle({ width: 1, color: 0x4a3a5a, alpha: 0.3 })
  g.moveTo(x, y - 12)
  g.lineTo(x + 24, y)
  g.lineTo(x, y + 12)
  g.lineTo(x - 24, y)
  g.closePath()
  g.stroke()
}

function drawCoffee(g: import('pixi.js').Graphics, x: number, y: number) {
  // Cup
  g.fill({ color: C.coffee })
  g.roundRect(x - 3, y - 4, 6, 6, 1)
  g.fill()
  // Handle
  g.setStrokeStyle({ width: 1, color: C.coffee })
  g.arc(x + 4, y - 1, 2, -Math.PI / 2, Math.PI / 2)
  g.stroke()
  // Steam
  g.setStrokeStyle({ width: 0.5, color: 0xaaaaaa, alpha: 0.3 })
  g.moveTo(x - 1, y - 5)
  g.lineTo(x - 1, y - 9)
  g.stroke()
  g.moveTo(x + 1, y - 5)
  g.lineTo(x + 1, y - 10)
  g.stroke()
}

function drawBeanBag(g: import('pixi.js').Graphics, x: number, y: number) {
  g.fill({ color: C.beanBag })
  g.ellipse(x, y, 10, 7)
  g.fill()
  g.fill({ color: 0x5a4a7a })
  g.ellipse(x, y - 4, 8, 5)
  g.fill()
}
