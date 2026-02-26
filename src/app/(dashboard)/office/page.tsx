'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Building2, Users, Zap, MessageSquare } from 'lucide-react'
import { useAgents, useTasks, useMessages, useConnections } from '@/hooks/use-realtime'
import { AgentDetailPanel } from '@/components/agents/agent-detail-panel'
import { TaskInput } from '@/components/tasks/task-input'
import { AgentCard } from '@/components/agents/agent-card'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Agent } from '@/types/database'

const IsometricCanvas = dynamic(
  () => import('@/components/office/isometric-canvas').then((m) => m.IsometricCanvas),
  { ssr: false, loading: () => (
    <div className="flex h-full items-center justify-center rounded-lg border border-border/50 bg-[#08090f]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground/60" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Cargando oficina...</span>
      </div>
    </div>
  )}
)

export default function OfficePage() {
  const { agents } = useAgents()
  const { tasks } = useTasks()
  const { messages } = useMessages()
  const { connections } = useConnections()
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  const activeCount = agents.filter(a => a.status !== 'offline' && a.status !== 'idle').length
  const recentMessages = messages.slice(-8)

  return (
    <div className="flex h-full gap-3">
      {/* Main canvas area */}
      <div className="flex flex-1 flex-col gap-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h1 className="text-sm font-semibold">Oficina Virtual</h1>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {agents.length} agentes
              </span>
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {activeCount} activos
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {messages.length} mensajes
              </span>
            </div>
          </div>
          <div className="w-80">
            <TaskInput />
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 min-h-0">
          <IsometricCanvas
            agents={agents}
            connections={connections}
            onAgentClick={(agent) => setSelectedAgent(agent)}
          />
        </div>
      </div>

      {/* Right sidebar — agent list + activity */}
      <div className="flex w-64 flex-col gap-3">
        {/* Agent list */}
        <div className="rounded-lg border border-border/50 bg-card flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-border/30">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">Equipo</span>
            <span className="ml-auto text-[10px] text-muted-foreground">{agents.length}</span>
          </div>
          <ScrollArea className="flex-1">
            <div className="py-1">
              {agents.map(agent => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  compact
                  onClick={() => setSelectedAgent(agent)}
                />
              ))}
              {agents.length === 0 && (
                <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                  Sin agentes activos
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Recent activity */}
        <div className="rounded-lg border border-border/50 bg-card flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-border/30">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">Actividad</span>
            <span className="ml-auto text-[10px] text-muted-foreground">{messages.length}</span>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {recentMessages.length === 0 && (
                <div className="px-2 py-6 text-center text-xs text-muted-foreground">
                  Sin actividad
                </div>
              )}
              {recentMessages.map(msg => {
                const from = agents.find(a => a.id === msg.from_agent_id)
                return (
                  <div key={msg.id} className="rounded-md px-2.5 py-1.5 hover:bg-foreground/[0.03] transition-colors">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {from && (
                        <span className="text-[10px] font-semibold" style={{ color: from.avatar_color }}>
                          {from.name}
                        </span>
                      )}
                      <span className="text-[9px] text-muted-foreground/40">
                        {new Date(msg.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                      {msg.content}
                    </p>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>
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
