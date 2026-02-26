'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function TaskInput() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al enviar tarea')
      }

      toast.success('Tarea enviada a Nova (PM)')
      setTitle('')
      setDescription('')
      setExpanded(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al enviar tarea')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex gap-2">
          <div className="flex-1 space-y-2">
            <Input
              placeholder="Describe una tarea para el equipo de IA..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setExpanded(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !expanded) {
                  handleSubmit()
                }
              }}
              disabled={loading}
            />
            {expanded && (
              <textarea
                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Descripción detallada (opcional)..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            )}
          </div>
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!title.trim() || loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
