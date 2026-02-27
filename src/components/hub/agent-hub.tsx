'use client'

import { FiZap, FiCoffee, FiMessageCircle, FiEye, FiWifiOff, FiChevronRight, FiGitBranch } from 'react-icons/fi'
import { AGENT_SKILLS } from '@/types/database'
import type { Agent, AgentConnection, Task } from '@/types/database'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STATUS_CONFIG: Record<string, { icon: any; label: string; color: string; dot: string }> = {
  idle: { icon: FiCoffee, label: 'Idle', color: 'text-zinc-400', dot: 'bg-zinc-400' },
  working: { icon: FiZap, label: 'Working', color: 'text-amber-400', dot: 'bg-amber-400 animate-pulse' },
  talking: { icon: FiMessageCircle, label: 'Talking', color: 'text-emerald-400', dot: 'bg-emerald-400 animate-pulse' },
  reviewing: { icon: FiEye, label: 'Reviewing', color: 'text-violet-400', dot: 'bg-violet-400 animate-pulse' },
  offline: { icon: FiWifiOff, label: 'Offline', color: 'text-zinc-600', dot: 'bg-zinc-600' },
}

interface Props {
  agents: Agent[]
  connections: AgentConnection[]
  tasks: Task[]
  selectedAgent: Agent | null
  onSelectAgent: (a: Agent) => void
}

export function AgentHub({ agents, connections, tasks, selectedAgent, onSelectAgent }: Props) {
  return (
    <div className="p-4 space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-widest font-medium">
        <FiGitBranch className="w-3.5 h-3.5" />
        Agent Team ({agents.length})
      </div>

      {/* Agent cards */}
      {agents.map(agent => {
        const status = STATUS_CONFIG[agent.status] || STATUS_CONFIG.idle
        const StatusIcon = status.icon
        const currentTask = tasks.find(t => t.id === agent.current_task_id)
        const skills = AGENT_SKILLS[agent.name] || []
        const isSelected = selectedAgent?.id === agent.id
        const connCount = connections.filter(c => c.from_agent_id === agent.id || c.to_agent_id === agent.id).length

        return (
          <button
            key={agent.id}
            onClick={() => onSelectAgent(agent)}
            className={`w-full text-left rounded-xl border transition-all duration-200 p-4 ${
              isSelected
                ? 'border-white/15 bg-white/[0.06]'
                : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg"
                  style={{ backgroundColor: agent.avatar_color }}
                >
                  {agent.name.slice(0, 2).toUpperCase()}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#08090f] ${status.dot}`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold truncate">{agent.name}</h3>
                  <div className={`flex items-center gap-1 text-[10px] font-medium ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </div>
                </div>
                <p className="text-xs text-white/40 mt-0.5">{agent.role}</p>

                {/* Current task */}
                {currentTask && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-white/50 bg-white/[0.03] rounded-md px-2 py-1">
                    <FiZap className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{currentTask.title}</span>
                  </div>
                )}

                {/* Skills pills */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {skills.slice(0, 3).map(skill => (
                    <span key={skill.name} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/35 font-medium">
                      {skill.name}
                    </span>
                  ))}
                  {skills.length > 3 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/25">
                      +{skills.length - 3}
                    </span>
                  )}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 mt-2 text-[10px] text-white/25">
                  <span>{agent.model}</span>
                  {connCount > 0 && (
                    <span className="flex items-center gap-0.5">
                      <FiGitBranch className="w-2.5 h-2.5" />
                      {connCount} links
                    </span>
                  )}
                </div>
              </div>

              <FiChevronRight className="w-4 h-4 text-white/15 flex-shrink-0 mt-1" />
            </div>
          </button>
        )
      })}

      {agents.length === 0 && (
        <div className="text-center py-12 text-sm text-white/20">
          No agents found
        </div>
      )}
    </div>
  )
}
