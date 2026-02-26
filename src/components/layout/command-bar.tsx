'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Building2,
  Users,
  ListTodo,
  MessageSquare,
  Plus,
} from 'lucide-react'

export function CommandBar() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const navigate = (href: string) => {
    router.push(href)
    setOpen(false)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar comando..." />
      <CommandList>
        <CommandEmpty>Sin resultados.</CommandEmpty>
        <CommandGroup heading="Navegación">
          <CommandItem onSelect={() => navigate('/office')}>
            <Building2 className="mr-2 h-4 w-4" />
            Oficina Virtual
          </CommandItem>
          <CommandItem onSelect={() => navigate('/agents')}>
            <Users className="mr-2 h-4 w-4" />
            Agentes
          </CommandItem>
          <CommandItem onSelect={() => navigate('/tasks')}>
            <ListTodo className="mr-2 h-4 w-4" />
            Tareas
          </CommandItem>
          <CommandItem onSelect={() => navigate('/logs')}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Comunicación
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Acciones">
          <CommandItem onSelect={() => navigate('/tasks')}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Tarea
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
