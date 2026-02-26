'use client'

import { Circle, Wifi, Database } from 'lucide-react'

export function GlobalStatusBar() {
  return (
    <div className="flex h-6 items-center justify-between border-t border-border/30 bg-sidebar px-3 text-[10px] text-muted-foreground/60">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <Circle className="h-1.5 w-1.5 fill-emerald-400 text-emerald-400" />
          Sistema activo
        </span>
        <span className="flex items-center gap-1">
          <Database className="h-2.5 w-2.5" />
          Supabase
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <Wifi className="h-2.5 w-2.5" />
          Realtime
        </span>
        <span className="font-mono">v0.1.0</span>
      </div>
    </div>
  )
}
