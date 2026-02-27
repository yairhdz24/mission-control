'use client'

import { FiX, FiCpu, FiClock, FiZap, FiGitBranch, FiActivity } from 'react-icons/fi'
import { AGENT_SKILLS } from '@/types/database'
import type { Agent, Task, Message } from '@/types/database'

interface Props {
  agent: Agent
  tasks: Task[]
  messages: Message[]
  onClose: () => void
}

export function AgentDetail({ agent, tasks, messages, onClose }: Props) {
  const skills = AGENT_SKILLS[agent.name] || []
  const agentTasks = tasks.filter(t => t.assigned_agent_id === agent.id)
  const agentMessages = messages.filter(m => m.from_agent_id === agent.id || m.to_agent_id === agent.id).slice(0, 10)
  const completedTasks = agentTasks.filter(t => t.status === 'completed').length

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full md:w-[480px] max-h-[85dvh] bg-[#0c0d14] border border-white/10 rounded-t-2xl md:rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3 p-4 border-b border-white/5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-lg flex-shrink-0"
            style={{ backgroundColor: agent.avatar_color }}
          >
            {agent.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold">{agent.name}</h2>
            <p className="text-xs text-white/40">{agent.role}</p>
            <div className="flex items-center gap-3 mt-1 text-[10px] text-white/25">
              <span className="flex items-center gap-1"><FiCpu className="w-3 h-3" />{agent.model}</span>
              <span className="flex items-center gap-1"><FiActivity className="w-3 h-3" />{agent.status}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <FiX className="w-5 h-5 text-white/40" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2 text-center">
              <div className="text-base font-bold tabular-nums">{agentTasks.length}</div>
              <div className="text-[9px] text-white/30 uppercase tracking-wider">Tasks</div>
            </div>
            <div className="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2 text-center">
              <div className="text-base font-bold tabular-nums text-emerald-400">{completedTasks}</div>
              <div className="text-[9px] text-white/30 uppercase tracking-wider">Done</div>
            </div>
            <div className="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2 text-center">
              <div className="text-base font-bold tabular-nums text-amber-400">{agentMessages.length}</div>
              <div className="text-[9px] text-white/30 uppercase tracking-wider">Messages</div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-[10px] text-white/30 uppercase tracking-widest font-medium mb-2 flex items-center gap-1.5">
              <FiZap className="w-3 h-3" /> Skills
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {skills.map(skill => (
                <div key={skill.name} className="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2">
                  <div className="text-xs font-medium">{skill.name}</div>
                  <div className="text-[10px] text-white/25 mt-0.5">{skill.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Personality */}
          <div>
            <h3 className="text-[10px] text-white/30 uppercase tracking-widest font-medium mb-2">Personality</h3>
            <p className="text-xs text-white/40 leading-relaxed">{agent.personality}</p>
          </div>

          {/* Recent tasks */}
          {agentTasks.length > 0 && (
            <div>
              <h3 className="text-[10px] text-white/30 uppercase tracking-widest font-medium mb-2 flex items-center gap-1.5">
                <FiGitBranch className="w-3 h-3" /> Tasks
              </h3>
              <div className="space-y-1">
                {agentTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 bg-white/[0.02]">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      task.status === 'completed' ? 'bg-emerald-400' :
                      task.status === 'in_progress' ? 'bg-amber-400' :
                      task.status === 'failed' ? 'bg-red-400' : 'bg-zinc-500'
                    }`} />
                    <span className="text-xs text-white/50 truncate">{task.title}</span>
                    <span className="ml-auto text-[9px] text-white/20 uppercase">{task.status.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
