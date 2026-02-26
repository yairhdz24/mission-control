'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Building2 } from 'lucide-react'
import { useAgents, useTasks, useMessages, useConnections } from '@/hooks/use-realtime'
import { AgentDetailPanel } from '@/components/agents/agent-detail-panel'
import { TaskInput } from '@/components/tasks/task-input'
import type { Agent } from '@/types/database'

// Dynamic import for PixiJS (no SSR)
const IsometricCanvas = dynamic(
  () => import('@/components/office/isometric-canvas').then((m) => m.IsometricCanvas),
  { ssr: false, loading: () => (
    <div className="flex h-full items-center justify-center rounded-lg border bg-[#0a0a1a]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )}
)

export default function OfficePage() {
  const { agents } = useAgents()
  const { tasks } = useTasks()
  const { messages } = useMessages()
  const { connections } = useConnections()
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <h1 className="text-lg font-semibold">Oficina Virtual</h1>
        </div>
        <div className="w-96">
          <TaskInput />
        </div>
      </div>

      <div className="flex-1">
        <IsometricCanvas
          agents={agents}
          connections={connections}
          onAgentClick={(agent) => setSelectedAgent(agent)}
        />
      </div>

      <AgentDetailPanel
        agent={selectedAgent}
        open={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
        tasks={tasks}
        messages={messages}
      />
    </div>
  )
}
