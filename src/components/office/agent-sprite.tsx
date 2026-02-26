'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { gridToScreen, lerp, TILE_HEIGHT } from '@/lib/isometric/coordinates'
import type { Agent } from '@/types/database'

interface AgentSpriteProps {
  agent: Agent
  onClick?: () => void
}

const STATUS_ICONS: Record<string, string> = {
  idle: '',
  working: '⚡',
  talking: '💬',
  reviewing: '🔍',
  offline: '💤',
}

export function AgentSprite({ agent, onClick }: AgentSpriteProps) {
  const targetPos = gridToScreen(agent.position_x, agent.position_y)
  const [currentPos, setCurrentPos] = useState(targetPos)
  const animRef = useRef<number>(0)
  const [hovered, setHovered] = useState(false)
  const [bobOffset, setBobOffset] = useState(0)

  // Smooth movement animation
  useEffect(() => {
    let frame: number
    const animate = () => {
      setCurrentPos((prev) => ({
        x: lerp(prev.x, targetPos.x, 0.08),
        y: lerp(prev.y, targetPos.y, 0.08),
      }))
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [targetPos.x, targetPos.y])

  // Idle bobbing animation
  useEffect(() => {
    let frame: number
    const bob = () => {
      animRef.current += 0.03
      setBobOffset(Math.sin(animRef.current) * 2)
      frame = requestAnimationFrame(bob)
    }
    frame = requestAnimationFrame(bob)
    return () => cancelAnimationFrame(frame)
  }, [])

  const color = parseInt(agent.avatar_color.replace('#', ''), 16)
  const isActive = agent.status === 'working' || agent.status === 'talking'

  // Draw agent body (simple isometric character)
  const drawBody = useCallback(
    (g: import('pixi.js').Graphics) => {
      g.clear()

      // Shadow
      g.fill({ color: 0x000000, alpha: 0.2 })
      g.ellipse(0, 4, 12, 6)
      g.fill()

      // Body (circle)
      g.fill({ color, alpha: 1 })
      g.circle(0, -12 + bobOffset, 10)
      g.fill()

      // Letter
      // (Text handled separately as PixiJS text)

      // Status ring
      if (isActive) {
        g.setStrokeStyle({ width: 2, color: 0x00ff88, alpha: 0.8 })
        g.circle(0, -12 + bobOffset, 14)
        g.stroke()
      }

      // Hover ring
      if (hovered) {
        g.setStrokeStyle({ width: 1.5, color: 0xffffff, alpha: 0.5 })
        g.circle(0, -12 + bobOffset, 16)
        g.stroke()
      }
    },
    [color, bobOffset, isActive, hovered]
  )

  // Draw name label
  const drawLabel = useCallback(
    (g: import('pixi.js').Graphics) => {
      g.clear()

      // Background
      const labelWidth = agent.name.length * 6 + 16
      g.roundRect(-labelWidth / 2, -38 + bobOffset, labelWidth, 14, 4)
      g.fill({ color: 0x000000, alpha: 0.7 })
      g.fill()
    },
    [agent.name, bobOffset]
  )

  const statusIcon = STATUS_ICONS[agent.status]

  return (
    <pixiContainer
      x={currentPos.x}
      y={currentPos.y - TILE_HEIGHT / 2}
      eventMode="static"
      cursor="pointer"
      onPointerDown={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Agent body */}
      <pixiGraphics draw={drawBody} />

      {/* Name label background */}
      <pixiGraphics draw={drawLabel} />

      {/* Name text */}
      <pixiText
        text={`${statusIcon} ${agent.name}`}
        x={0}
        y={-34 + bobOffset}
        anchor={0.5}
        style={{
          fontSize: 9,
          fill: 0xffffff,
          fontFamily: 'monospace',
        }}
      />

      {/* Role text (on hover) */}
      {hovered && (
        <pixiText
          text={agent.role}
          x={0}
          y={10}
          anchor={0.5}
          style={{
            fontSize: 8,
            fill: 0xaaaaaa,
            fontFamily: 'monospace',
          }}
        />
      )}
    </pixiContainer>
  )
}
