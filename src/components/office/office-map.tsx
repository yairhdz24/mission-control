'use client'

import { useCallback } from 'react'
import { getOfficeLayout, TILE_COLORS, type TileType } from '@/lib/isometric/office-layout'
import { gridToScreen, TILE_WIDTH, TILE_HEIGHT } from '@/lib/isometric/coordinates'

export function OfficeMap() {
  const tiles = getOfficeLayout()

  return (
    <pixiContainer>
      {tiles.map((tile) => (
        <IsometricTile key={`${tile.x}-${tile.y}`} x={tile.x} y={tile.y} type={tile.type} />
      ))}
    </pixiContainer>
  )
}

function IsometricTile({ x, y, type }: { x: number; y: number; type: TileType }) {
  const screen = gridToScreen(x, y)
  const colors = TILE_COLORS[type]

  const draw = useCallback(
    (g: import('pixi.js').Graphics) => {
      g.clear()

      if (type === 'empty') return

      const hw = TILE_WIDTH / 2
      const hh = TILE_HEIGHT / 2

      // Top face
      g.fill({ color: colors.top, alpha: 0.9 })
      g.moveTo(0, -hh)
      g.lineTo(hw, 0)
      g.lineTo(0, hh)
      g.lineTo(-hw, 0)
      g.closePath()
      g.fill()

      // Left face (for walls and furniture)
      if (type !== 'floor') {
        const depth = type === 'wall' ? 16 : 8
        g.fill({ color: colors.left, alpha: 0.9 })
        g.moveTo(-hw, 0)
        g.lineTo(0, hh)
        g.lineTo(0, hh + depth)
        g.lineTo(-hw, depth)
        g.closePath()
        g.fill()

        // Right face
        g.fill({ color: colors.right, alpha: 0.9 })
        g.moveTo(hw, 0)
        g.lineTo(0, hh)
        g.lineTo(0, hh + depth)
        g.lineTo(hw, depth)
        g.closePath()
        g.fill()
      }

      // Grid line
      g.setStrokeStyle({ width: 0.5, color: 0xffffff, alpha: 0.05 })
      g.moveTo(0, -hh)
      g.lineTo(hw, 0)
      g.lineTo(0, hh)
      g.lineTo(-hw, 0)
      g.closePath()
      g.stroke()
    },
    [type, colors]
  )

  return <pixiGraphics x={screen.x} y={screen.y} draw={draw} />
}
