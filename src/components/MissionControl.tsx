'use client';
import dynamic from 'next/dynamic';
import { useAgents } from '@/hooks/useAgents';
import AgentPanel from './panels/AgentPanel';
import MessageFeed from './panels/MessageFeed';
import TaskPanel from './panels/TaskPanel';

// R3F Canvas must be client-only (no SSR)
const MissionScene = dynamic(() => import('./scene/MissionScene'), { ssr: false });

export default function MissionControl() {
  const { agents, messages, tasks, connections, loading, liveMode } = useAgents();

  const activeAgents = agents.filter(a => a.status !== 'offline').length;
  const activeTasks = tasks.filter(t => t.status === 'in_progress').length;

  return (
    <div className="h-screen w-screen bg-[#070b14] text-slate-200 flex overflow-hidden">
      {/* LEFT SIDEBAR */}
      <aside className="w-80 flex-shrink-0 border-r border-white/5 bg-[#0a0f1a] flex flex-col">
        {/* Brand */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-lg">🎯</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Mission Control</h1>
              <p className="text-[11px] text-slate-500 uppercase tracking-widest">Agent Orchestrator</p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-px bg-white/5 border-b border-white/5">
          <div className="bg-[#0a0f1a] p-3 text-center">
            <div className="text-lg font-bold text-blue-400">{agents.length}</div>
            <div className="text-[9px] uppercase text-slate-500 tracking-wider">Agentes</div>
          </div>
          <div className="bg-[#0a0f1a] p-3 text-center">
            <div className="text-lg font-bold text-green-400">{activeAgents}</div>
            <div className="text-[9px] uppercase text-slate-500 tracking-wider">Activos</div>
          </div>
          <div className="bg-[#0a0f1a] p-3 text-center">
            <div className="text-lg font-bold text-orange-400">{activeTasks}</div>
            <div className="text-[9px] uppercase text-slate-500 tracking-wider">Tareas</div>
          </div>
        </div>

        {/* Agent list */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          <AgentPanel agents={agents} tasks={tasks} />
        </div>
      </aside>

      {/* CENTER — 3D Scene */}
      <main className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-sm text-slate-500 uppercase tracking-widest">Cargando escena...</span>
            </div>
          </div>
        ) : (
          <MissionScene agents={agents} messages={messages} connections={connections} />
        )}

        {/* Overlay info */}
        <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600">
            {agents.length} agentes · {connections.length} conexiones · {messages.length} mensajes
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${liveMode ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${liveMode ? 'bg-green-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
            {liveMode ? 'Live' : 'Demo'}
          </div>
        </div>

        {/* Bottom overlay — quick stats */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="flex items-center gap-6 bg-black/60 backdrop-blur-md rounded-full px-6 py-2 border border-white/5">
            <StatusDot color="green" label="Online" count={activeAgents} />
            <StatusDot color="orange" label="Working" count={agents.filter(a => a.status === 'working').length} />
            <StatusDot color="purple" label="Reviewing" count={agents.filter(a => a.status === 'reviewing').length} />
            <StatusDot color="blue" label="Talking" count={agents.filter(a => a.status === 'talking').length} />
          </div>
        </div>
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="w-80 flex-shrink-0 border-l border-white/5 bg-[#0a0f1a] flex flex-col">
        <div className="p-4 border-b border-white/5 flex-1 overflow-y-auto scrollbar-thin">
          <TaskPanel tasks={tasks} agents={agents} />
        </div>
        <div className="p-4 border-t border-white/5 flex-1 overflow-y-auto scrollbar-thin">
          <MessageFeed messages={messages} agents={agents} />
        </div>
      </aside>
    </div>
  );
}

function StatusDot({ color, label, count }: { color: string; label: string; count: number }) {
  const dotColor = {
    green: 'bg-green-400',
    orange: 'bg-orange-400',
    purple: 'bg-purple-400',
    blue: 'bg-blue-400',
  }[color] || 'bg-slate-400';

  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${dotColor} ${count > 0 ? 'animate-pulse' : 'opacity-30'}`} />
      <span className="text-[10px] text-slate-400">{label}</span>
      <span className="text-[10px] font-bold text-slate-300">{count}</span>
    </div>
  );
}
