'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { gridToScreen, TILE_HEIGHT } from '@/lib/isometric/coordinates'

interface ConnectionLineProps {
  fromX: number
  fromY: number
  toX: number
  toY: number
  type: string
}

const TYPE_COLORS: Record<string, number> = {
  communication: 0x8b5cf6,
  task_delegation: 0x3b82f6,
  review: 0xf59e0b,
}

export function ConnectionLine({ fromX, fromY, toX, toY, type }: ConnectionLineProps) {
  const from = gridToScreen(fromX, fromY)
  const to = gridToScreen(toX, toY)
  const [dashOffset, setDashOffset] = useState(0)
  const animRef = useRef<number>(0)

  useEffect(() => {
    let frame: number
    const animate = () => {
      animRef.current += 0.5
      setDashOffset(animRef.current % 20)
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  const color = TYPE_COLORS[type] || TYPE_COLORS.communication

  const draw = useCallback(
    (g: import('pixi.js').Graphics) => {
      g.clear()

      // Animated dashed line effect using segments
      const dx = to.x - from.x
      const dy = (to.y - TILE_HEIGHT / 2) - (from.y - TILE_HEIGHT / 2)
      const dist = Math.sqrt(dx * dx + dy * dy)
      const segments = Math.floor(dist / 10)

      for (let i = 0; i < segments; i++) {
        const t1 = (i + (dashOffset / 20)) / segments
        const t2 = (i + 0.5 + (dashOffset / 20)) / segments

        if (t1 > 1 || t2 > 1) continue

        const x1 = from.x + dx * t1
        const y1 = (from.y - TILE_HEIGHT / 2) + dy * t1
        const x2 = from.x + dx * Math.min(t2, 1)
        const y2 = (from.y - TILE_HEIGHT / 2) + dy * Math.min(t2, 1)

        g.setStrokeStyle({ width: 2, color, alpha: 0.6 })
        g.moveTo(x1, y1)
        g.lineTo(x2, y2)
        g.stroke()
      }

      // Glow at endpoints
      g.fill({ color, alpha: 0.3 })
      g.circle(from.x, from.y - TILE_HEIGHT / 2, 4)
      g.fill()
      g.circle(to.x, to.y - TILE_HEIGHT / 2, 4)
      g.fill()
    },
    [from, to, dashOffset, color]
  )

  return <pixiGraphics draw={draw} />
}
