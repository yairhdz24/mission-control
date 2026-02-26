'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Agent, Task, Message } from '@/types/database'
import { Cpu, MessageSquare, ListTodo } from 'lucide-react'

interface AgentDetailPanelProps {
  agent: Agent | null
  open: boolean
  onClose: () => void
  tasks: Task[]
  messages: Message[]
}

export function AgentDetailPanel({
  agent,
  open,
  onClose,
  tasks,
  messages,
}: AgentDetailPanelProps) {
  if (!agent) return null

  const agentTasks = tasks.filter((t) => t.assigned_agent_id === agent.id)
  const agentMessages = messages
    .filter((m) => m.from_agent_id === agent.id || m.to_agent_id === agent.id)
    .slice(-10)

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ backgroundColor: agent.avatar_color }}
            >
              {agent.name[0]}
            </div>
            <div>
              <SheetTitle>{agent.name}</SheetTitle>
              <SheetDescription>{agent.role}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Cpu className="h-4 w-4" />
              Información
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Modelo</span>
                <p className="font-mono text-xs">{agent.model}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Estado</span>
                <p>
                  <Badge variant="outline">{agent.status}</Badge>
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {agent.personality}
            </p>
          </div>

          <Separator />

          {/* Tasks */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ListTodo className="h-4 w-4" />
              Tareas ({agentTasks.length})
            </div>
            {agentTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin tareas asignadas</p>
            ) : (
              <div className="space-y-2">
                {agentTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <span className="text-xs">{task.title}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Recent Messages */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="h-4 w-4" />
              Mensajes recientes
            </div>
            {agentMessages.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin mensajes</p>
            ) : (
              <div className="space-y-2">
                {agentMessages.map((msg) => (
                  <div key={msg.id} className="rounded-md bg-muted/50 p-2 text-xs">
                    <p className="line-clamp-2 text-muted-foreground">
                      {msg.content}
                    </p>
                    <span className="text-[10px] text-muted-foreground/60">
                      {new Date(msg.created_at).toLocaleTimeString('es-MX')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
