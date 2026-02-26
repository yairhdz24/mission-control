'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Task, Agent } from '@/types/database'

interface TaskCardProps {
  task: Task
  agents: Agent[]
}

const priorityColors: Record<string, string> = {
  low: 'bg-zinc-500/10 text-zinc-500',
  medium: 'bg-blue-500/10 text-blue-500',
  high: 'bg-orange-500/10 text-orange-500',
  urgent: 'bg-red-500/10 text-red-500',
}

export function TaskCard({ task, agents }: TaskCardProps) {
  const assignedAgent = agents.find((a) => a.id === task.assigned_agent_id)

  return (
    <Card className="cursor-pointer transition-all hover:shadow-sm">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-xs font-medium leading-tight">{task.title}</h4>
          <Badge
            variant="outline"
            className={`shrink-0 text-[9px] ${priorityColors[task.priority]}`}
          >
            {task.priority}
          </Badge>
        </div>

        {task.description && (
          <p className="line-clamp-2 text-[11px] text-muted-foreground">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          {assignedAgent ? (
            <div className="flex items-center gap-1.5">
              <div
                className="h-4 w-4 rounded-full text-[8px] font-bold text-white flex items-center justify-center"
                style={{ backgroundColor: assignedAgent.avatar_color }}
              >
                {assignedAgent.name[0]}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {assignedAgent.name}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-muted-foreground">Sin asignar</span>
          )}
          <span className="text-[9px] text-muted-foreground">
            {new Date(task.created_at).toLocaleDateString('es-MX')}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
