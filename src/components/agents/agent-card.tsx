'use client'

import { Bot, Cpu, Clock, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Agent } from '@/types/database'

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string }> = {
  idle: { label: 'Idle', dot: 'bg-zinc-400', bg: 'bg-zinc-400/10 text-zinc-400' },
  working: { label: 'Working', dot: 'bg-amber-400 animate-pulse', bg: 'bg-amber-400/10 text-amber-400' },
  talking: { label: 'Talking', dot: 'bg-emerald-400 animate-pulse', bg: 'bg-emerald-400/10 text-emerald-400' },
  reviewing: { label: 'Reviewing', dot: 'bg-violet-400 animate-pulse', bg: 'bg-violet-400/10 text-violet-400' },
  offline: { label: 'Offline', dot: 'bg-zinc-600', bg: 'bg-zinc-600/10 text-zinc-500' },
}

interface AgentCardProps {
  agent: Agent
  onClick?: () => void
  compact?: boolean
}

export function AgentCard({ agent, onClick, compact }: AgentCardProps) {
  const status = STATUS_CONFIG[agent.status] || STATUS_CONFIG.idle

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-2.5 rounded-lg px-3 py-2 w-full text-left hover:bg-foreground/[0.04] transition-colors"
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white flex-shrink-0"
          style={{ backgroundColor: agent.avatar_color }}
        >
          {agent.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium truncate">{agent.name}</span>
            <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', status.dot)} />
          </div>
          <div className="text-[11px] text-muted-foreground truncate">{agent.role}</div>
        </div>
      </button>
    )
  }

  return (
    <Card
      className={cn(
        'group cursor-pointer border-border/50 transition-all duration-200 hover:border-border hover:shadow-sm',
        agent.status === 'offline' && 'opacity-50'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: agent.avatar_color }}
          >
            {agent.name.slice(0, 2).toUpperCase()}
            <span className={cn('absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card', status.dot)} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold truncate">{agent.name}</h3>
              <Badge variant="outline" className={cn('text-[9px] uppercase tracking-wider font-semibold border-0 px-1.5 py-0', status.bg)}>
                {status.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{agent.role}</p>

            <div className="flex items-center gap-3 mt-2.5 text-[10px] text-muted-foreground/70">
              <span className="flex items-center gap-1">
                <Cpu className="h-3 w-3" />
                {agent.model}
              </span>
              {agent.last_active_at && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Activo
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
