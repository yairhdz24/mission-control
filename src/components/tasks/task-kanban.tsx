'use client'

import { TaskCard } from './task-card'
import type { Task, Agent } from '@/types/database'

interface TaskKanbanProps {
  tasks: Task[]
  agents: Agent[]
}

const COLUMNS = [
  { id: 'pending' as const, label: 'Pendiente', color: 'bg-zinc-500' },
  { id: 'in_progress' as const, label: 'En Progreso', color: 'bg-blue-500' },
  { id: 'review' as const, label: 'En Revisión', color: 'bg-yellow-500' },
  { id: 'completed' as const, label: 'Completado', color: 'bg-green-500' },
]

export function TaskKanban({ tasks, agents }: TaskKanbanProps) {
  return (
    <div className="grid flex-1 grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id)
        return (
          <div key={col.id} className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-1">
              <div className={`h-2 w-2 rounded-full ${col.color}`} />
              <span className="text-sm font-medium">{col.label}</span>
              <span className="text-xs text-muted-foreground">
                ({columnTasks.length})
              </span>
            </div>
            <div className="flex-1 space-y-2 rounded-lg bg-muted/20 p-2">
              {columnTasks.length === 0 ? (
                <div className="flex h-20 items-center justify-center">
                  <p className="text-xs text-muted-foreground">Sin tareas</p>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard key={task.id} task={task} agents={agents} />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
