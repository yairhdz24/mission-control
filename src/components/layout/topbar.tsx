'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command } from 'lucide-react'

interface TopbarProps {
  onCommandOpen?: () => void
}

export function Topbar({ onCommandOpen }: TopbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          AI Team Status
        </h2>
        <Badge variant="outline" className="gap-1 text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          5 agentes online
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs text-muted-foreground"
          onClick={onCommandOpen}
        >
          <Command className="h-3 w-3" />
          <span>Cmd + K</span>
        </Button>
      </div>
    </header>
  )
}
