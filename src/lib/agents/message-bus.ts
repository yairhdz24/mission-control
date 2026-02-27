import { createAdminClient } from '@/lib/supabase/admin'
import type { Message } from '@/types/database'
type MessageType = string

function getSupabase() {
  return createAdminClient()
}

export async function sendMessage(params: {
  fromAgentId: string | null
  toAgentId: string | null
  taskId: string | null
  type: MessageType
  content: string
  metadata?: Record<string, unknown>
}): Promise<Message> {
  const { data, error } = await getSupabase()
    .from('messages')
    .insert({
      from_agent_id: params.fromAgentId,
      to_agent_id: params.toAgentId,
      task_id: params.taskId,
      type: params.type,
      content: params.content,
      metadata: params.metadata || {},
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to send message: ${error.message}`)
  return data as Message
}

export async function createConnection(params: {
  fromAgentId: string
  toAgentId: string
  type: 'communication' | 'task_delegation' | 'review'
}) {
  const { error } = await getSupabase().from('agent_connections').insert({
    from_agent_id: params.fromAgentId,
    to_agent_id: params.toAgentId,
    type: params.type,
    active: true,
    expires_at: new Date(Date.now() + 30_000).toISOString(),
  })

  if (error) throw new Error(`Failed to create connection: ${error.message}`)
}

export async function getAgentByName(name: string) {
  const { data, error } = await getSupabase()
    .from('agents')
    .select('*')
    .eq('name', name)
    .single()

  if (error) throw new Error(`Agent not found: ${name}`)
  return data
}

export async function updateAgentStatus(
  agentId: string,
  status: string,
  currentTaskId?: string | null
) {
  const update: Record<string, unknown> = {
    status,
    last_active_at: new Date().toISOString(),
  }
  if (currentTaskId !== undefined) {
    update.current_task_id = currentTaskId
  }

  const { error } = await getSupabase()
    .from('agents')
    .update(update)
    .eq('id', agentId)

  if (error) throw new Error(`Failed to update agent status: ${error.message}`)
}

export async function logTaskAction(params: {
  taskId: string
  agentId: string | null
  action: string
  details?: string
  tokensUsed?: number
  costUsd?: number
}) {
  await getSupabase().from('task_logs').insert({
    task_id: params.taskId,
    agent_id: params.agentId,
    action: params.action,
    details: params.details || null,
    tokens_used: params.tokensUsed || 0,
    cost_usd: params.costUsd || 0,
  })
}
