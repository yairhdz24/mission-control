'use client'

import { MessageSquare } from 'lucide-react'
import { useAgents, useMessages } from '@/hooks/use-realtime'
import { MessageFeed } from '@/components/communication/message-feed'
import { TaskInput } from '@/components/tasks/task-input'

export default function LogsPage() {
  const { agents } = useAgents()
  const { messages, loading } = useMessages()

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h1 className="text-lg font-semibold">Comunicación</h1>
      </div>

      <TaskInput />

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <MessageFeed messages={messages} agents={agents} />
      )}
    </div>
  )
}
