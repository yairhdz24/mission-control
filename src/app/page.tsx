'use client'

import { useState } from 'react'
import { useAgents, useTasks, useMessages, useConnections } from '@/hooks/use-realtime'
import { AgentHub } from '@/components/hub/agent-hub'
import { TaskFeed } from '@/components/hub/task-feed'
import { ChatFeed } from '@/components/hub/chat-feed'
import { AgentDetail } from '@/components/hub/agent-detail'
import { FiCpu, FiMessageCircle, FiList, FiUsers } from 'react-icons/fi'
import type { Agent } from '@/types/database'

type Tab = 'office' | 'tasks' | 'chat'

export default function Home() {
  const { agents } = useAgents()
  const { tasks } = useTasks()
  const { messages } = useMessages()
  const { connections } = useConnections()
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('office')

  const activeCount = agents.filter(a => a.status !== 'offline' && a.status !== 'idle').length

  return (
    <div className="flex flex-col h-[100dvh] bg-[#08090f] text-white overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
            <FiCpu className="w-4 h-4 text-white/60" />
            {activeCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#08090f]" />
            )}
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Mission Control</h1>
            <p className="text-[10px] text-white/30 uppercase tracking-widest">AI Agent Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-white/30">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {activeCount} active
          </span>
          <span>{agents.length} agents</span>
        </div>
      </header>

      {/* Content area */}
      <main className="flex-1 overflow-hidden">
        {/* Desktop layout */}
        <div className="hidden md:flex h-full">
          {/* Left: Agent hub */}
          <div className="w-[360px] border-r border-white/5 overflow-y-auto">
            <AgentHub
              agents={agents}
              connections={connections}
              tasks={tasks}
              onSelectAgent={setSelectedAgent}
              selectedAgent={selectedAgent}
            />
          </div>

          {/* Center: Tasks + Chat */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <TaskFeed tasks={tasks} agents={agents} />
            </div>
          </div>

          {/* Right: Chat */}
          <div className="w-[320px] border-l border-white/5 overflow-hidden flex flex-col">
            <ChatFeed messages={messages} agents={agents} />
          </div>
        </div>

        {/* Mobile layout */}
        <div className="md:hidden flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'office' && (
              <AgentHub
                agents={agents}
                connections={connections}
                tasks={tasks}
                onSelectAgent={setSelectedAgent}
                selectedAgent={selectedAgent}
              />
            )}
            {activeTab === 'tasks' && (
              <TaskFeed tasks={tasks} agents={agents} />
            )}
            {activeTab === 'chat' && (
              <ChatFeed messages={messages} agents={agents} />
            )}
          </div>

          {/* Mobile tab bar */}
          <nav className="flex border-t border-white/5 bg-[#0c0d14] flex-shrink-0 safe-area-bottom">
            {([
              { id: 'office' as Tab, icon: FiUsers, label: 'Agents' },
              { id: 'tasks' as Tab, icon: FiList, label: 'Tasks' },
              { id: 'chat' as Tab, icon: FiMessageCircle, label: 'Chat' },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                  activeTab === tab.id ? 'text-white' : 'text-white/30'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[9px] uppercase tracking-wider font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </main>

      {/* Agent detail overlay */}
      {selectedAgent && (
        <AgentDetail
          agent={selectedAgent}
          tasks={tasks}
          messages={messages}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  )
}
