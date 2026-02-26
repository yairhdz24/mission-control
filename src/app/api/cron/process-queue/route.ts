import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { executeAgent } from '@/lib/agents/agent-executor'
import type { Agent, Task } from '@/types/database'

export const maxDuration = 120

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()

    // Find pending tasks with assigned agents
    const { data: pendingTasks } = await supabase
      .from('tasks')
      .select('*, agents!tasks_assigned_agent_id_fkey(*)')
      .eq('status', 'pending')
      .not('assigned_agent_id', 'is', null)
      .order('created_at', { ascending: true })
      .limit(3)

    if (!pendingTasks || pendingTasks.length === 0) {
      return NextResponse.json({ processed: 0 })
    }

    let processed = 0

    for (const task of pendingTasks) {
      const agent = task.agents as unknown as Agent
      if (!agent) continue

      await supabase
        .from('tasks')
        .update({ status: 'in_progress' })
        .eq('id', task.id)

      await executeAgent(agent, task as unknown as Task)
      processed++
    }

    // Also cleanup expired connections
    await supabase.rpc('cleanup_expired_connections')

    return NextResponse.json({ processed })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Cron error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
