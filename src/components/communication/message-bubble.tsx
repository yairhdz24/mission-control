'use client'

import { Badge } from '@/components/ui/badge'
import type { Message, Agent } from '@/types/database'
import { cn } from '@/lib/utils'
import {
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  User,
  Bot,
  type LucideIcon,
} from 'lucide-react'

interface MessageBubbleProps {
  message: Message
  agents: Agent[]
}

const typeIcons: Record<string, LucideIcon> = {
  chat: MessageSquare,
  task_assignment: ArrowRight,
  status_update: CheckCircle2,
  review_request: AlertCircle,
  review_result: CheckCircle2,
  system: Bot,
  user_input: User,
}

const typeColors: Record<string, string> = {
  chat: 'bg-blue-500/10 text-blue-500',
  task_assignment: 'bg-purple-500/10 text-purple-500',
  status_update: 'bg-green-500/10 text-green-500',
  review_request: 'bg-yellow-500/10 text-yellow-500',
  review_result: 'bg-emerald-500/10 text-emerald-500',
  system: 'bg-zinc-500/10 text-zinc-500',
  user_input: 'bg-indigo-500/10 text-indigo-500',
}

export function MessageBubble({ message, agents }: MessageBubbleProps) {
  const fromAgent = agents.find((a) => a.id === message.from_agent_id)
  const toAgent = agents.find((a) => a.id === message.to_agent_id)
  const Icon = typeIcons[message.type] || MessageSquare
  const isSystem = message.type === 'system' || message.type === 'user_input'

  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg border p-3 text-sm',
        isSystem && 'bg-muted/30'
      )}
    >
      {/* Avatar */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{
          backgroundColor: fromAgent?.avatar_color || '#6b7280',
        }}
      >
        {fromAgent ? fromAgent.name[0] : message.type === 'user_input' ? 'U' : 'S'}
      </div>

      <div className="flex-1 space-y-1">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {fromAgent?.name || (message.type === 'user_input' ? 'Usuario' : 'Sistema')}
          </span>
          {toAgent && (
            <>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{toAgent.name}</span>
            </>
          )}
          <Badge variant="outline" className={cn('text-[10px]', typeColors[message.type])}>
            <Icon className="mr-1 h-2.5 w-2.5" />
            {message.type.replace('_', ' ')}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {new Date(message.created_at).toLocaleTimeString('es-MX')}
          </span>
        </div>

        {/* Content */}
        <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
          {message.content}
        </p>
      </div>
    </div>
  )
}
