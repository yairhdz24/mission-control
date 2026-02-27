'use client'

import { FiCircle, FiLoader, FiEye, FiCheckCircle, FiXCircle, FiArrowUp, FiClock } from 'react-icons/fi'
import type { Task, Agent } from '@/types/database'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  pending: { icon: FiClock, color: 'text-zinc-400', bg: 'bg-zinc-400/10' },
  in_progress: { icon: FiLoader, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  review: { icon: FiEye, color: 'text-violet-400', bg: 'bg-violet-400/10' },
  completed: { icon: FiCheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  failed: { icon: FiXCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
}

const PRIORITY_CONFIG: Record<string, { color: string }> = {
  low: { color: 'text-zinc-500' },
  medium: { color: 'text-blue-400' },
  high: { color: 'text-amber-400' },
  urgent: { color: 'text-red-400' },
}

interface Props {
  tasks: Task[]
  agents: Agent[]
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

export function TaskFeed({ tasks, agents }: Props) {
  const agentMap = new Map(agents.map(a => [a.id, a]))

  // Stats
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const completed = tasks.filter(t => t.status === 'completed').length
  const totalTokens = 0 // TODO: sum from task_logs

  return (
    <div className="p-4 space-y-3">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2">
          <div className="text-lg font-bold tabular-nums">{tasks.length}</div>
          <div className="text-[9px] text-white/30 uppercase tracking-wider">Total</div>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2">
          <div className="text-lg font-bold tabular-nums text-amber-400">{inProgress}</div>
          <div className="text-[9px] text-white/30 uppercase tracking-wider">In Progress</div>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2">
          <div className="text-lg font-bold tabular-nums text-emerald-400">{completed}</div>
          <div className="text-[9px] text-white/30 uppercase tracking-wider">Done</div>
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {tasks.map(task => {
          const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending
          const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
          const StatusIcon = statusCfg.icon
          const assignee = task.assigned_agent_id ? agentMap.get(task.assigned_agent_id) : null

          return (
            <div key={task.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-3 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-start gap-2.5">
                <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center ${statusCfg.bg}`}>
                  <StatusIcon className={`w-3.5 h-3.5 ${statusCfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium truncate">{task.title}</h4>
                    <span className={`text-[9px] font-bold uppercase ${priorityCfg.color}`}>
                      <FiArrowUp className="w-2.5 h-2.5 inline" />
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-white/30 mt-0.5 line-clamp-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-white/25">
                    <span className="uppercase font-medium">{task.status.replace('_', ' ')}</span>
                    {assignee && (
                      <span className="flex items-center gap-1">
                        <span
                          className="w-3 h-3 rounded inline-flex items-center justify-center text-[7px] font-bold text-white"
                          style={{ backgroundColor: assignee.avatar_color }}
                        >
                          {assignee.name[0]}
                        </span>
                        {assignee.name}
                      </span>
                    )}
                    {task.parent_task_id && (
                      <span className="flex items-center gap-0.5">
                        <FiCircle className="w-2 h-2" /> subtask
                      </span>
                    )}
                    <span>{timeAgo(task.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {tasks.length === 0 && (
          <div className="text-center py-12 text-sm text-white/20">
            No tasks yet
          </div>
        )}
      </div>
    </div>
  )
}
