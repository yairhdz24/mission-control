'use client'

import { FiMessageCircle, FiSend, FiArrowRight } from 'react-icons/fi'
import type { Message, Agent } from '@/types/database'

interface Props {
  messages: Message[]
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

const TYPE_ICONS: Record<string, string> = {
  chat: 'msg',
  task_assignment: 'task',
  status_update: 'status',
  review_request: 'review',
  review_result: 'result',
  system: 'sys',
  user_input: 'user',
}

export function ChatFeed({ messages, agents }: Props) {
  const agentMap = new Map(agents.map(a => [a.id, a]))

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 flex-shrink-0">
        <FiMessageCircle className="w-3.5 h-3.5 text-white/40" />
        <span className="text-xs font-medium text-white/60">Activity Feed</span>
        <span className="ml-auto text-[10px] text-white/20">{messages.length} msgs</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {messages.length === 0 && (
          <div className="text-center py-12 text-sm text-white/20">
            No messages yet
          </div>
        )}
        {[...messages].reverse().slice(0, 30).map(msg => {
          const from = msg.from_agent_id ? agentMap.get(msg.from_agent_id) : null
          const to = msg.to_agent_id ? agentMap.get(msg.to_agent_id) : null
          const typeLabel = TYPE_ICONS[msg.type] || msg.type

          return (
            <div key={msg.id} className="rounded-lg px-3 py-2 hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-1.5 mb-1">
                {from && (
                  <>
                    <span
                      className="w-4 h-4 rounded flex items-center justify-center text-[7px] font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: from.avatar_color }}
                    >
                      {from.name[0]}
                    </span>
                    <span className="text-[11px] font-semibold" style={{ color: from.avatar_color }}>
                      {from.name}
                    </span>
                  </>
                )}
                {to && (
                  <>
                    <FiArrowRight className="w-2.5 h-2.5 text-white/15" />
                    <span className="text-[11px] font-semibold" style={{ color: to.avatar_color }}>
                      {to.name}
                    </span>
                  </>
                )}
                <span className="text-[8px] text-white/15 uppercase font-medium ml-1">{typeLabel}</span>
                <span className="ml-auto text-[9px] text-white/15">{timeAgo(msg.created_at)}</span>
              </div>
              <p className="text-[11px] text-white/45 leading-relaxed line-clamp-3 pl-5">
                {msg.content}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
