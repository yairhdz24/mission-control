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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { href: '/office', label: 'Oficina', icon: Building2 },
  { href: '/agents', label: 'Agentes', icon: Users },
  { href: '/tasks', label: 'Tareas', icon: ListTodo },
  { href: '/logs', label: 'Comunicación', icon: MessageSquare },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-semibold">Mission Control</h1>
          <p className="text-[10px] text-muted-foreground">Virtual AI Office</p>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Button
              key={item.href}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-2',
                isActive && 'bg-secondary'
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          )
        })}
      </nav>

      <Separator />

      {/* Footer */}
      <div className="p-2">
        <Button variant="ghost" className="w-full justify-start gap-2" size="sm">
          <Settings className="h-4 w-4" />
          Configuración
        </Button>
      </div>
    </aside>
  )
}
