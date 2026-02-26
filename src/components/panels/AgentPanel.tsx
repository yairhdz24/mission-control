'use client';
import type { Agent, Task } from '@/types/database';

const STATUS_COLORS: Record<string, string> = {
  idle: 'bg-slate-500',
  working: 'bg-orange-500',
  talking: 'bg-green-500',
  reviewing: 'bg-purple-500',
  offline: 'bg-slate-700',
};

const STATUS_DOT: Record<string, string> = {
  idle: 'bg-slate-400 animate-pulse',
  working: 'bg-orange-400 animate-ping',
  talking: 'bg-green-400 animate-ping',
  reviewing: 'bg-purple-400 animate-pulse',
  offline: 'bg-slate-600',
};

interface Props {
  agents: Agent[];
  tasks: Task[];
}

export default function AgentPanel({ agents, tasks }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">
        Agentes ({agents.length})
      </h2>
      {agents.length === 0 && (
        <div className="text-sm text-slate-600 italic px-1">Sin agentes activos</div>
      )}
      {agents.map(agent => {
        const task = tasks.find(t => t.id === agent.current_task_id);
        return (
          <div
            key={agent.id}
            className="group rounded-xl border border-white/5 bg-white/[0.03] p-3 hover:bg-white/[0.06] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-lg"
                style={{ backgroundColor: agent.avatar_color }}
              >
                {agent.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-200 truncate">{agent.name}</span>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[agent.status] || ''}`} />
                </div>
                <div className="text-xs text-slate-500 truncate">{agent.role} · {agent.model}</div>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md text-white ${STATUS_COLORS[agent.status] || 'bg-slate-600'}`}>
                {agent.status}
              </span>
            </div>
            {task && (
              <div className="mt-2 ml-12 text-xs text-slate-400 truncate">
                📋 {task.title}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
