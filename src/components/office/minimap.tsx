'use client'

import type { Agent } from '@/types/database'
import { GRID_COLS, GRID_ROWS } from '@/lib/isometric/coordinates'

interface MinimapProps {
  agents: Agent[]
}

export function Minimap({ agents }: MinimapProps) {
  const scale = 12

  return (
    <div className="absolute bottom-4 right-4 rounded-lg border bg-card/80 p-2 backdrop-blur-sm">
      <div
        className="relative"
        style={{
          width: GRID_COLS * scale,
          height: GRID_ROWS * scale,
        }}
      >
        {/* Grid background */}
        <div className="absolute inset-0 rounded bg-muted/50" />

        {/* Agent dots */}
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="absolute h-2 w-2 rounded-full transition-all duration-500"
            style={{
              backgroundColor: agent.avatar_color,
              left: agent.position_x * scale - 4,
              top: agent.position_y * scale - 4,
              boxShadow: agent.status !== 'idle'
                ? `0 0 6px ${agent.avatar_color}`
                : 'none',
            }}
            title={agent.name}
          />
        ))}
      </div>
    </div>
  )
}
