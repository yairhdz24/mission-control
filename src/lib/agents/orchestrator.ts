import { createAdminClient } from '@/lib/supabase/admin'
import { executeAgent } from './agent-executor'
import { sendMessage, getAgentByName, updateAgentStatus } from './message-bus'
import type { Agent, Task } from '@/types/database'

function getSupabase() {
  return createAdminClient()
}

/**
 * Main orchestration flow:
 * 1. User sends task -> create in DB
 * 2. Execute Nova (PM) to analyze and decompose
 * 3. Nova creates subtasks and assigns them
 * 4. Execute assigned agents for each subtask
 * 5. Sentinel reviews completed subtasks
 * 6. Nova compiles final result
 */
export async function orchestrate(taskTitle: string, taskDescription: string) {
  // 1. Create main task
  const { data: mainTask, error: taskError } = await getSupabase()
    .from('tasks')
    .insert({
      title: taskTitle,
      description: taskDescription,
      status: 'in_progress',
      priority: 'high',
      created_by: 'user',
    })
    .select()
    .single()

  if (taskError) throw new Error(`Failed to create task: ${taskError.message}`)

  // Log user input as message
  await sendMessage({
    fromAgentId: null,
    toAgentId: null,
    taskId: mainTask.id,
    type: 'user_input',
    content: `Nueva tarea: ${taskTitle}\n\n${taskDescription}`,
  })

  // 2. Get Nova (PM)
  const nova = await getAgentByName('Nova')

  // Assign main task to Nova
  await getSupabase()
    .from('tasks')
    .update({ assigned_agent_id: nova.id })
    .eq('id', mainTask.id)

  await sendMessage({
    fromAgentId: null,
    toAgentId: nova.id,
    taskId: mainTask.id,
    type: 'system',
    content: `Tarea asignada a Nova para análisis y delegación`,
  })

  // 3. Execute Nova - she'll analyze and create subtasks via tools
  const novaResult = await executeAgent(nova as Agent, mainTask as Task)

  // 4. Get all subtasks created by Nova
  const { data: subtasks } = await getSupabase()
    .from('tasks')
    .select('*, agents!tasks_assigned_agent_id_fkey(*)')
    .eq('parent_task_id', mainTask.id)
    .order('created_at', { ascending: true })

  if (subtasks && subtasks.length > 0) {
    // 5. Execute each assigned agent for their subtask
    for (const subtask of subtasks) {
      if (!subtask.assigned_agent_id) continue

      const { data: agent } = await getSupabase()
        .from('agents')
        .select('*')
        .eq('id', subtask.assigned_agent_id)
        .single()

      if (!agent) continue

      const agentResult = await executeAgent(
        agent as Agent,
        subtask as Task,
        `Tarea principal: ${taskTitle}\nInstrucciones de Nova: ${novaResult.result}`
      )

      // Update subtask with result
      if (agentResult.success) {
        await getSupabase()
          .from('tasks')
          .update({
            result: agentResult.result,
            status: subtask.status === 'review' ? 'review' : 'completed',
          })
          .eq('id', subtask.id)
      }
    }

    // 6. Check if any tasks need QA review
    const { data: reviewTasks } = await getSupabase()
      .from('tasks')
      .select('*')
      .eq('parent_task_id', mainTask.id)
      .eq('status', 'review')

    if (reviewTasks && reviewTasks.length > 0) {
      const sentinel = await getAgentByName('Sentinel')
      for (const reviewTask of reviewTasks) {
        await executeAgent(
          sentinel as Agent,
          reviewTask as Task,
          `Revisa el trabajo realizado en esta tarea. Resultado actual: ${reviewTask.result}`
        )
      }
    }
  }

  // 7. Compile final result
  const { data: allSubtasks } = await getSupabase()
    .from('tasks')
    .select('title, status, result')
    .eq('parent_task_id', mainTask.id)

  const summary = allSubtasks
    ?.map((st) => `- ${st.title}: ${st.status} ${st.result ? `(${st.result.slice(0, 100)})` : ''}`)
    .join('\n') || 'Sin subtareas'

  // Update main task as completed
  await getSupabase()
    .from('tasks')
    .update({
      status: 'completed',
      result: `Resumen:\n${novaResult.result}\n\nSubtareas:\n${summary}`,
    })
    .eq('id', mainTask.id)

  await sendMessage({
    fromAgentId: nova.id,
    toAgentId: null,
    taskId: mainTask.id,
    type: 'status_update',
    content: `Tarea completada. ${allSubtasks?.length || 0} subtareas procesadas.`,
  })

  return {
    taskId: mainTask.id,
    result: novaResult.result,
    subtasks: allSubtasks,
  }
}
