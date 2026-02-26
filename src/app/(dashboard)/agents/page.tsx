'use client'

import { useState } from 'react'
import { Users } from 'lucide-react'
import { useAgents, useTasks, useMessages } from '@/hooks/use-realtime'
import { AgentCard } from '@/components/agents/agent-card'
import { AgentDetailPanel } from '@/components/agents/agent-detail-panel'
import type { Agent } from '@/types/database'

export default function AgentsPage() {
  const { agents, loading } = useAgents()
  const { tasks } = useTasks()
  const { messages } = useMessages()
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        <h1 className="text-lg font-semibold">Agentes</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onClick={() => setSelectedAgent(agent)}
            />
          ))}
        </div>
      )}

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
