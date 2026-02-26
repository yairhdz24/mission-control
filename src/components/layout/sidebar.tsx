'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  Users,
  ListTodo,
  MessageSquare,
  Settings,
  Zap,
  Activity,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { useAgents } from '@/hooks/use-realtime'

const navItems = [
  { href: '/office', label: 'Oficina', icon: Building2, description: 'Vista isométrica' },
  { href: '/agents', label: 'Agentes', icon: Users, description: 'Gestión de equipo' },
  { href: '/tasks', label: 'Tareas', icon: ListTodo, description: 'Pipeline de trabajo' },
  { href: '/logs', label: 'Actividad', icon: MessageSquare, description: 'Logs y mensajes' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { agents } = useAgents()
  
  const activeCount = agents.filter(a => a.status !== 'offline' && a.status !== 'idle').length
  const totalCount = agents.length

  return (
    <aside className="flex h-full w-56 flex-col border-r border-border/50 bg-sidebar">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 px-4">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/[0.08]">
          <Zap className="h-4 w-4 text-foreground/70" />
          {activeCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold tracking-tight truncate">Mission Control</h1>
          <p className="text-[10px] text-muted-foreground tracking-wide">AI AGENT ORCHESTRATOR</p>
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* Stats mini bar */}
      <div className="grid grid-cols-2 gap-px bg-border/30 mx-3 mt-3 mb-2 rounded-lg overflow-hidden">
        <div className="bg-sidebar px-3 py-2 text-center">
          <div className="text-base font-bold tabular-nums">{totalCount}</div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Agentes</div>
        </div>
        <div className="bg-sidebar px-3 py-2 text-center">
          <div className="text-base font-bold tabular-nums text-emerald-400">{activeCount}</div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Activos</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-2 py-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150',
                isActive
                  ? 'bg-foreground/[0.07] text-foreground'
                  : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-4 w-4 flex-shrink-0', isActive && 'text-foreground')} />
              <div className="flex-1 min-w-0">
                <span className="font-medium">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            </Link>
          )
        })}
      </nav>

      <Separator className="opacity-50" />

      {/* Agent status list mini */}
      <div className="px-3 py-2 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
          <Activity className="h-3 w-3" />
          Estado del equipo
        </div>
        {agents.slice(0, 4).map(agent => (
          <div key={agent.id} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{
                backgroundColor: agent.status === 'offline' ? 'oklch(0.4 0 0)' :
                  agent.status === 'idle' ? 'oklch(0.55 0 0)' :
                  agent.status === 'working' ? 'oklch(0.7 0.18 80)' :
                  agent.status === 'talking' ? 'oklch(0.7 0.17 155)' :
                  'oklch(0.6 0.18 290)'
              }}
            />
            <span className="truncate text-muted-foreground">{agent.name}</span>
            <span className="ml-auto text-[10px] text-muted-foreground/60 capitalize">{agent.status}</span>
          </div>
        ))}
      </div>

      <Separator className="opacity-50" />

      {/* Footer */}
      <div className="p-2">
        <Link
          href="#"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground transition-colors"
        >
          <Settings className="h-3.5 w-3.5" />
          Configuración
        </Link>
      </div>
    </aside>
  )
}
