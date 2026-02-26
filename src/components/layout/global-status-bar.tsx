'use client'

import { useAgents } from '@/hooks/use-realtime'
import { Badge } from '@/components/ui/badge'
import { Activity, Cpu, DollarSign, Zap } from 'lucide-react'

export function GlobalStatusBar() {
  const { agents } = useAgents()

  const activeCount = agents.filter((a) => a.status !== 'idle' && a.status !== 'offline').length
  const totalAgents = agents.length

  return (
    <div className="flex h-8 items-center justify-between border-t bg-card px-4 text-[11px] text-muted-foreground">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Activity className="h-3 w-3" />
          <span>
            {activeCount}/{totalAgents} agentes activos
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Cpu className="h-3 w-3" />
          <span>5 modelos configurados</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3 w-3" />
          <span>Supabase Realtime</span>
          <Badge variant="outline" className="h-4 px-1 text-[9px]">
            conectado
          </Badge>
        </div>
        <span>Mission Control v0.1.0</span>
      </div>
    </div>
  )
}
