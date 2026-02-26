'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Application, extend, useApplication } from '@pixi/react'
import { Container, Graphics, Text, FederatedPointerEvent } from 'pixi.js'
import { OfficeMap } from './office-map'
import { AgentSprite } from './agent-sprite'
import { ConnectionLine } from './connection-line'
import { Minimap } from './minimap'
import { getMapCenter, TILE_WIDTH, TILE_HEIGHT, GRID_COLS, GRID_ROWS } from '@/lib/isometric/coordinates'
import type { Agent, AgentConnection } from '@/types/database'

// Register PixiJS components
extend({ Container, Graphics, Text })

interface IsometricCanvasProps {
  agents: Agent[]
  connections: AgentConnection[]
  onAgentClick?: (agent: Agent) => void
}

function OfficeScene({ agents, connections, onAgentClick }: IsometricCanvasProps) {
  const app = useApplication()
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1.5)
  const isDragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  // Center the map initially
  useEffect(() => {
    if (app.app) {
      const center = getMapCenter()
      setOffset({
        x: app.app.screen.width / 2 - center.x * zoom,
        y: app.app.screen.height / 4 - center.y * zoom + 100,
      })
    }
  }, [app.app, zoom])

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    setZoom((z) => Math.max(0.5, Math.min(3, z - e.deltaY * 0.001)))
  }, [])

  useEffect(() => {
    const canvas = app.app?.canvas
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false })
      return () => canvas.removeEventListener('wheel', handleWheel)
    }
  }, [app.app, handleWheel])

  const handlePointerDown = useCallback((e: FederatedPointerEvent) => {
    isDragging.current = true
    lastPos.current = { x: e.globalX, y: e.globalY }
  }, [])

  const handlePointerMove = useCallback((e: FederatedPointerEvent) => {
    if (!isDragging.current) return
    const dx = e.globalX - lastPos.current.x
    const dy = e.globalY - lastPos.current.y
    lastPos.current = { x: e.globalX, y: e.globalY }
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }))
  }, [])

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
  }, [])

  return (
    <pixiContainer
      x={offset.x}
      y={offset.y}
      scale={zoom}
      eventMode="static"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerUpOutside={handlePointerUp}
    >
      <OfficeMap />

      {/* Connection lines between communicating agents */}
      {connections.map((conn) => {
        const fromAgent = agents.find((a) => a.id === conn.from_agent_id)
        const toAgent = agents.find((a) => a.id === conn.to_agent_id)
        if (!fromAgent || !toAgent) return null
        return (
          <ConnectionLine
            key={conn.id}
            fromX={fromAgent.position_x}
            fromY={fromAgent.position_y}
            toX={toAgent.position_x}
            toY={toAgent.position_y}
            type={conn.type}
          />
        )
      })}

      {/* Agent sprites */}
      {agents.map((agent) => (
        <AgentSprite
          key={agent.id}
          agent={agent}
          onClick={() => onAgentClick?.(agent)}
        />
      ))}
    </pixiContainer>
  )
}

export function IsometricCanvas({ agents, connections, onAgentClick }: IsometricCanvasProps) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border bg-[#0a0a1a]">
      <Application
        resizeTo={undefined}
        background="#0a0a1a"
        antialias
        autoDensity
        resolution={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
        className="h-full w-full"
      >
        <OfficeScene
          agents={agents}
          connections={connections}
          onAgentClick={onAgentClick}
        />
      </Application>

      <Minimap agents={agents} />
    </div>
  )
}
