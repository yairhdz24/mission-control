'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Agent } from '@/types/database'
import { cn } from '@/lib/utils'

interface AgentCardProps {
  agent: Agent
  onClick?: () => void
}

const statusConfig: Record<string, { label: string; color: string; pulse: boolean }> = {
  idle: { label: 'Libre', color: 'bg-green-500', pulse: false },
  working: { label: 'Trabajando', color: 'bg-blue-500', pulse: true },
  talking: { label: 'Comunicando', color: 'bg-purple-500', pulse: true },
  reviewing: { label: 'Revisando', color: 'bg-yellow-500', pulse: true },
  offline: { label: 'Offline', color: 'bg-zinc-500', pulse: false },
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const status = statusConfig[agent.status] || statusConfig.idle

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md hover:ring-1 hover:ring-ring/20',
        agent.status === 'working' && 'ring-1 ring-blue-500/30'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: agent.avatar_color }}
              >
                {agent.name[0]}
              </div>
              <div
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card',
                  status.color,
                  status.pulse && 'animate-pulse'
                )}
              />
            </div>
            <div>
              <CardTitle className="text-sm">{agent.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{agent.role}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {agent.personality}
        </p>
      </CardContent>
    </Card>
  )
}
