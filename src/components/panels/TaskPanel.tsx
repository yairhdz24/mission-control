'use client';
import type { Task, Agent } from '@/types/database';

const STATUS_STYLE: Record<string, string> = {
  pending: 'border-l-slate-500 bg-slate-500/5',
  in_progress: 'border-l-orange-500 bg-orange-500/5',
  review: 'border-l-purple-500 bg-purple-500/5',
  completed: 'border-l-green-500 bg-green-500/5',
  failed: 'border-l-red-500 bg-red-500/5',
};

const PRIORITY_BADGE: Record<string, string> = {
  low: 'text-slate-400 bg-slate-400/10',
  medium: 'text-blue-400 bg-blue-400/10',
  high: 'text-orange-400 bg-orange-400/10',
  urgent: 'text-red-400 bg-red-400/10',
};

interface Props {
  tasks: Task[];
  agents: Agent[];
}

export default function TaskPanel({ tasks, agents }: Props) {
  const agentMap = new Map(agents.map(a => [a.id, a]));

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">
        Tareas ({tasks.length})
      </h2>
      {tasks.length === 0 && (
        <div className="text-sm text-slate-600 italic px-1">Sin tareas</div>
      )}
      {tasks.map(task => {
        const assignee = task.assigned_agent_id ? agentMap.get(task.assigned_agent_id) : null;
        return (
          <div
            key={task.id}
            className={`rounded-lg border-l-2 border border-white/5 p-3 transition-all hover:bg-white/[0.04] ${STATUS_STYLE[task.status] || ''}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-200 truncate">{task.title}</div>
                {task.description && (
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
                )}
              </div>
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${PRIORITY_BADGE[task.priority] || ''}`}>
                {task.priority}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] uppercase font-semibold text-slate-500">{task.status.replace('_', ' ')}</span>
              {assignee && (
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="w-3 h-3 rounded inline-flex items-center justify-center text-[7px] font-bold text-white" style={{ backgroundColor: assignee.avatar_color }}>
                    {assignee.name[0]}
                  </span>
                  {assignee.name}
                </span>
              )}
              {task.parent_task_id && (
                <span className="text-[10px] text-slate-600">↳ subtarea</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
