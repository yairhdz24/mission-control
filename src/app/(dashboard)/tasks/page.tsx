'use client'

import { ListTodo } from 'lucide-react'
import { useAgents, useTasks } from '@/hooks/use-realtime'
import { TaskInput } from '@/components/tasks/task-input'
import { TaskKanban } from '@/components/tasks/task-kanban'

export default function TasksPage() {
  const { agents } = useAgents()
  const { tasks, loading } = useTasks()

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-2">
        <ListTodo className="h-5 w-5" />
        <h1 className="text-lg font-semibold">Tareas</h1>
      </div>

      <TaskInput />

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <TaskKanban tasks={tasks} agents={agents} />
      )}
    </div>
  )
}
