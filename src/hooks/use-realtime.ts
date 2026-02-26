'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Agent, Task, Message, AgentConnection } from '@/types/database'
import type { RealtimePostgresChangesPayload, SupabaseClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient() as SupabaseClient | null
}

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) { setLoading(false); return }

    supabase
      .from('agents')
      .select('*')
      .order('name')
      .then(({ data }) => {
        if (data) setAgents(data as Agent[])
        setLoading(false)
      })

    const channel = supabase
      .channel('agents-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agents' },
        (payload: RealtimePostgresChangesPayload<Agent>) => {
          if (payload.eventType === 'UPDATE') {
            setAgents((prev) =>
              prev.map((a) =>
                a.id === (payload.new as Agent).id ? (payload.new as Agent) : a
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { agents, loading }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    const supabase = getSupabase()
    if (!supabase) { setLoading(false); return }

    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setTasks(data as Task[])
    setLoading(false)
  }, [])

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) { setLoading(false); return }

    fetchTasks()

    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload: RealtimePostgresChangesPayload<Task>) => {
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => [payload.new as Task, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((t) =>
                t.id === (payload.new as Task).id ? (payload.new as Task) : t
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) =>
              prev.filter((t) => t.id !== (payload.old as { id: string }).id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTasks])

  return { tasks, loading, refetch: fetchTasks }
}

export function useMessages(taskId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) { setLoading(false); return }

    let query = supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100)

    if (taskId) {
      query = query.eq('task_id', taskId)
    }

    query.then(({ data }) => {
      if (data) setMessages(data as Message[])
      setLoading(false)
    })

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          const newMsg = payload.new as Message
          if (!taskId || newMsg.task_id === taskId) {
            setMessages((prev) => [...prev, newMsg])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [taskId])

  return { messages, loading }
}

export function useConnections() {
  const [connections, setConnections] = useState<AgentConnection[]>([])

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) return

    supabase
      .from('agent_connections')
      .select('*')
      .eq('active', true)
      .then(({ data }) => {
        if (data) setConnections(data as AgentConnection[])
      })

    const channel = supabase
      .channel('connections-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agent_connections' },
        () => {
          supabase
            .from('agent_connections')
            .select('*')
            .eq('active', true)
            .then(({ data }) => {
              if (data) setConnections(data as AgentConnection[])
            })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { connections }
}
