'use client'

import { usePathname } from 'next/navigation'
import { Search, Bell, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const PAGE_TITLES: Record<string, string> = {
  '/office': 'Oficina Virtual',
  '/agents': 'Agentes',
  '/tasks': 'Tareas',
  '/logs': 'Actividad',
}

export function Topbar() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] || 'Mission Control'

  return (
    <header className="flex h-12 items-center justify-between border-b border-border/50 px-4">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="h-8 w-48 pl-8 text-xs bg-foreground/[0.04] border-transparent focus:border-border"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground/50 font-mono">⌘K</kbd>
        </div>

        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>

        <div className="flex items-center gap-1.5 rounded-lg bg-foreground/[0.04] px-2.5 py-1.5">
          <Cpu className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground font-medium">claude-opus-4</span>
        </div>
      </div>
    </header>
  )
}
