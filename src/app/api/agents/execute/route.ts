import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { executeAgent } from '@/lib/agents/agent-executor'
import type { Agent, Task } from '@/types/database'

export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    const { agentId, taskId, context } = await req.json()

    if (!agentId || !taskId) {
      return NextResponse.json(
        { error: 'agentId and taskId are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const [agentRes, taskRes] = await Promise.all([
      supabase.from('agents').select('*').eq('id', agentId).single(),
      supabase.from('tasks').select('*').eq('id', taskId).single(),
    ])

    if (agentRes.error || !agentRes.data) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }
    if (taskRes.error || !taskRes.data) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const result = await executeAgent(
      agentRes.data as Agent,
      taskRes.data as Task,
      context
    )

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Agent execution error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
