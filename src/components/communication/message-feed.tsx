'use client'

import { useRef, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './message-bubble'
import type { Message, Agent } from '@/types/database'

interface MessageFeedProps {
  messages: Message[]
  agents: Agent[]
}

export function MessageFeed({ messages, agents }: MessageFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Los mensajes entre agentes aparecerán aquí...
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-2 p-1">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} agents={agents} />
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
