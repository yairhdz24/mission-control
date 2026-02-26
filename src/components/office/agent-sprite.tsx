'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { gridToScreen, lerp, TILE_HEIGHT } from '@/lib/isometric/coordinates'
import { WORKSTATIONS, AGENT_WORKSTATION_MAP } from '@/lib/isometric/office-layout'
import type { Agent } from '@/types/database'

interface AgentSpriteProps {
  agent: Agent
  onClick?: () => void
}

const STATUS_ICONS: Record<string, string> = {
  idle: '☕',
  working: '⚡',
  talking: '💬',
  reviewing: '🔍',
  offline: '💤',
}

const STATUS_GLOW: Record<string, number> = {
  idle: 0x666688,
  working: 0xf0a030,
  talking: 0x30d070,
  reviewing: 0x9060e0,
  offline: 0x333344,
}

export function AgentSprite({ agent, onClick }: AgentSpriteProps) {
  // Get workstation position or fallback to agent grid position
  const ws = WORKSTATIONS.find(w => w.id === AGENT_WORKSTATION_MAP[agent.name])
  const gridX = ws ? ws.gridX : agent.position_x
  const gridY = ws ? ws.gridY : agent.position_y
  
  const targetPos = gridToScreen(gridX, gridY)
  const [currentPos, setCurrentPos] = useState(targetPos)
  const animRef = useRef<number>(0)
  const [hovered, setHovered] = useState(false)
  const [bobOffset, setBobOffset] = useState(0)

  // Smooth movement
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

  // Bobbing animation
  useEffect(() => {
    let frame: number
    const bob = () => {
      animRef.current += 0.03
      const amplitude = agent.status === 'working' ? 1.5 : agent.status === 'talking' ? 2 : 1
      setBobOffset(Math.sin(animRef.current) * amplitude)
      frame = requestAnimationFrame(bob)
    }
    frame = requestAnimationFrame(bob)
    return () => cancelAnimationFrame(frame)
  }, [agent.status])

  const color = parseInt(agent.avatar_color.replace('#', ''), 16)
  const glowColor = STATUS_GLOW[agent.status] || 0x666688
  const isActive = agent.status === 'working' || agent.status === 'talking' || agent.status === 'reviewing'

  // Draw agent character (cute isometric character)
  const drawAgent = useCallback(
    (g: import('pixi.js').Graphics) => {
      g.clear()

      // Status glow underneath
      if (isActive) {
        g.fill({ color: glowColor, alpha: 0.12 })
        g.ellipse(0, 6, 16, 8)
        g.fill()
      }

      // Shadow
      g.fill({ color: 0x000000, alpha: 0.25 })
      g.ellipse(0, 6, 10, 5)
      g.fill()

      // Body (rounded rectangle - torso)
      g.fill({ color, alpha: 1 })
      g.roundRect(-7, -10 + bobOffset, 14, 14, 4)
      g.fill()

      // Head (circle)
      g.fill({ color, alpha: 1 })
      g.circle(0, -16 + bobOffset, 8)
      g.fill()

      // Face highlight
      g.fill({ color: 0xffffff, alpha: 0.15 })
      g.circle(-2, -17 + bobOffset, 4)
      g.fill()

      // Eyes
      g.fill({ color: 0xffffff, alpha: 0.9 })
      g.circle(-3, -16 + bobOffset, 2)
      g.fill()
      g.circle(3, -16 + bobOffset, 2)
      g.fill()

      // Pupils
      g.fill({ color: 0x1a1a2e })
      g.circle(-2.5, -15.5 + bobOffset, 1)
      g.fill()
      g.circle(3.5, -15.5 + bobOffset, 1)
      g.fill()

      // Mouth (small smile when active)
      if (isActive || hovered) {
        g.setStrokeStyle({ width: 0.8, color: 0xffffff, alpha: 0.5 })
        g.arc(0, -13 + bobOffset, 2.5, 0.2, Math.PI - 0.2)
        g.stroke()
      }

      // Status ring
      if (isActive) {
        g.setStrokeStyle({ width: 1.5, color: glowColor, alpha: 0.7 })
        g.circle(0, -16 + bobOffset, 11)
        g.stroke()
      }

      // Working particles
      if (agent.status === 'working') {
        const t = animRef.current
        for (let i = 0; i < 3; i++) {
          const px = Math.sin(t * 2 + i * 2.1) * 14
          const py = -20 + Math.cos(t * 1.5 + i * 1.7) * 6 + bobOffset
          g.fill({ color: glowColor, alpha: 0.4 + Math.sin(t + i) * 0.3 })
          g.circle(px, py, 1.5)
          g.fill()
        }
      }

      // Hover outline
      if (hovered) {
        g.setStrokeStyle({ width: 1, color: 0xffffff, alpha: 0.4 })
        g.roundRect(-9, -25 + bobOffset, 18, 30, 6)
        g.stroke()
      }
    },
    [color, bobOffset, isActive, hovered, glowColor, agent.status]
  )

  // Label background
  const drawLabel = useCallback(
    (g: import('pixi.js').Graphics) => {
      g.clear()
      const labelWidth = agent.name.length * 5 + 22
      g.fill({ color: 0x000000, alpha: 0.7 })
      g.roundRect(-labelWidth / 2, -36 + bobOffset, labelWidth, 13, 4)
      g.fill()

      // Small status dot
      g.fill({ color: glowColor, alpha: 0.9 })
      g.circle(-labelWidth / 2 + 5, -29.5 + bobOffset, 2)
      g.fill()
    },
    [agent.name, bobOffset, glowColor]
  )

  const statusIcon = STATUS_ICONS[agent.status]

  return (
    <pixiContainer
      x={currentPos.x}
      y={currentPos.y - TILE_HEIGHT / 2 - 4}
      eventMode="static"
      cursor="pointer"
      onPointerDown={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <pixiGraphics draw={drawAgent} />
      <pixiGraphics draw={drawLabel} />

      {/* Name */}
      <pixiText
        text={`${agent.name}`}
        x={3}
        y={-32 + bobOffset}
        anchor={0.5}
        style={{
          fontSize: 8,
          fill: 0xddddee,
          fontFamily: 'system-ui, sans-serif',
          fontWeight: '600',
        }}
      />

      {/* Status icon */}
      <pixiText
        text={statusIcon}
        x={12}
        y={-28 + bobOffset}
        anchor={0.5}
        style={{ fontSize: 7 }}
      />

      {/* Workstation label on hover */}
      {hovered && ws && (
        <pixiText
          text={ws.label}
          x={0}
          y={14}
          anchor={0.5}
          style={{
            fontSize: 7,
            fill: 0x888899,
            fontFamily: 'system-ui, sans-serif',
          }}
        />
      )}
    </pixiContainer>
  )
}
