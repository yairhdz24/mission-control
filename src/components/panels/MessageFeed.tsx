'use client';
import type { Agent, Message } from '@/types/database';

interface Props {
  messages: Message[];
  agents: Agent[];
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

const TYPE_ICONS: Record<string, string> = {
  chat: '💬',
  system: '⚙️',
  skill: '🧠',
  error: '❌',
  delegation: '📤',
  result: '✅',
};

export default function MessageFeed({ messages, agents }: Props) {
  const agentMap = new Map(agents.map(a => [a.id, a]));

  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1 mb-1">
        Actividad ({messages.length})
      </h2>
      <div className="flex flex-col gap-1.5 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
        {messages.length === 0 && (
          <div className="text-sm text-slate-600 italic px-1">Sin mensajes aún</div>
        )}
        {messages.map(msg => {
          const from = msg.from_agent_id ? agentMap.get(msg.from_agent_id) : null;
          const to = msg.to_agent_id ? agentMap.get(msg.to_agent_id) : null;
          const icon = TYPE_ICONS[msg.type] || '💬';

          return (
            <div key={msg.id} className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs">{icon}</span>
                {from && (
                  <span className="text-xs font-semibold" style={{ color: from.avatar_color }}>
                    {from.name}
                  </span>
                )}
                {to && (
                  <>
                    <span className="text-[10px] text-slate-600">→</span>
                    <span className="text-xs font-semibold" style={{ color: to.avatar_color }}>
                      {to.name}
                    </span>
                  </>
                )}
                <span className="ml-auto text-[10px] text-slate-600 flex-shrink-0">
                  {timeAgo(msg.created_at)}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {msg.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
