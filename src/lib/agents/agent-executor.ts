import { getAnthropicClient, calculateCost } from '@/lib/anthropic/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { getToolsForRole } from './agent-tools'
import {
  sendMessage,
  createConnection,
  getAgentByName,
  updateAgentStatus,
  logTaskAction,
} from './message-bus'
import type { Agent, Task } from '@/types/database'
import type Anthropic from '@anthropic-ai/sdk'

function getSupabase() {
  return createAdminClient()
}
const MAX_TURNS = 10

interface ExecutionResult {
  success: boolean
  result: string
  tokensUsed: { input: number; output: number }
  cost: number
}

export async function executeAgent(
  agent: Agent,
  task: Task,
  context?: string
): Promise<ExecutionResult> {
  const anthropic = getAnthropicClient()
  const tools = getToolsForRole(agent.role)

  // Update agent status to working
  await updateAgentStatus(agent.id, 'working', task.id)

  const systemPrompt = buildSystemPrompt(agent, task)
  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: context
        ? `Tarea: ${task.title}\n\nDescripción: ${task.description}\n\nContexto adicional: ${context}`
        : `Tarea: ${task.title}\n\nDescripción: ${task.description || 'Sin descripción adicional'}`,
    },
  ]

  let totalInput = 0
  let totalOutput = 0
  let finalResult = ''

  try {
    for (let turn = 0; turn < MAX_TURNS; turn++) {
      const response = await anthropic.messages.create({
        model: agent.model,
        max_tokens: 4096,
        system: systemPrompt,
        tools,
        messages,
      })

      totalInput += response.usage.input_tokens
      totalOutput += response.usage.output_tokens

      // Check if we're done (no tool use)
      if (response.stop_reason === 'end_turn') {
        const textBlock = response.content.find(
          (b): b is Anthropic.TextBlock => b.type === 'text'
        )
        finalResult = textBlock?.text || 'Tarea completada.'
        break
      }

      // Process tool calls
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
      )

      if (toolUseBlocks.length === 0) {
        const textBlock = response.content.find(
          (b): b is Anthropic.TextBlock => b.type === 'text'
        )
        finalResult = textBlock?.text || 'Tarea completada.'
        break
      }

      // Add assistant response to messages
      messages.push({ role: 'assistant', content: response.content })

      // Execute each tool and collect results
      const toolResults: Anthropic.ToolResultBlockParam[] = []

      for (const toolUse of toolUseBlocks) {
        const result = await handleToolCall(agent, task, toolUse)
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: result,
        })
      }

      messages.push({ role: 'user', content: toolResults })
    }

    const cost = calculateCost(agent.model, totalInput, totalOutput)

    // Log the execution
    await logTaskAction({
      taskId: task.id,
      agentId: agent.id,
      action: 'execute',
      details: finalResult.slice(0, 500),
      tokensUsed: totalInput + totalOutput,
      costUsd: cost,
    })

    // Set agent back to idle
    await updateAgentStatus(agent.id, 'idle', null)

    return {
      success: true,
      result: finalResult,
      tokensUsed: { input: totalInput, output: totalOutput },
      cost,
    }
  } catch (error) {
    await updateAgentStatus(agent.id, 'idle', null)
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      result: `Error: ${errMsg}`,
      tokensUsed: { input: totalInput, output: totalOutput },
      cost: calculateCost(agent.model, totalInput, totalOutput),
    }
  }
}

function buildSystemPrompt(agent: Agent, task: Task): string {
  return `Eres ${agent.name}, ${agent.role} en un equipo de desarrollo de IA.

Personalidad: ${agent.personality}

Tu equipo:
- Nova (PM / Lead): Coordina el equipo y descompone tareas
- Atlas (Backend Dev): Desarrollo de APIs y backend
- Pixel (Frontend Dev): Desarrollo de UI/UX
- Sentinel (QA): Revisión de calidad y testing
- Flow (Automation): Automatizaciones con n8n

Estás trabajando en la tarea: "${task.title}"
ID de la tarea: ${task.id}

Instrucciones:
1. Analiza la tarea asignada
2. Usa las herramientas disponibles para comunicarte con tu equipo si necesitas
3. Completa tu trabajo y reporta el resultado
4. Si eres dev, solicita revisión a Sentinel cuando termines
5. Sé conciso y directo en tus respuestas
6. Responde siempre en español`
}

async function handleToolCall(
  agent: Agent,
  task: Task,
  toolUse: Anthropic.ToolUseBlock
): Promise<string> {
  const input = toolUse.input as Record<string, string>

  switch (toolUse.name) {
    case 'send_message': {
      const targetAgent = await getAgentByName(input.to_agent)
      await updateAgentStatus(agent.id, 'talking')

      await createConnection({
        fromAgentId: agent.id,
        toAgentId: targetAgent.id,
        type: 'communication',
      })

      await sendMessage({
        fromAgentId: agent.id,
        toAgentId: targetAgent.id,
        taskId: task.id,
        type: 'chat',
        content: input.content,
      })

      await updateAgentStatus(agent.id, 'working')
      return `Mensaje enviado a ${input.to_agent}`
    }

    case 'create_subtask': {
      const targetAgent = await getAgentByName(input.assign_to)

      const { data: subtask, error } = await getSupabase()
        .from('tasks')
        .insert({
          parent_task_id: task.id,
          title: input.title,
          description: input.description,
          assigned_agent_id: targetAgent.id,
          priority: input.priority || 'medium',
          created_by: agent.name,
          status: 'pending',
        })
        .select()
        .single()

      if (error) return `Error creando subtarea: ${error.message}`

      await createConnection({
        fromAgentId: agent.id,
        toAgentId: targetAgent.id,
        type: 'task_delegation',
      })

      await sendMessage({
        fromAgentId: agent.id,
        toAgentId: targetAgent.id,
        taskId: subtask.id,
        type: 'task_assignment',
        content: `Te asigno la tarea: ${input.title}\n\n${input.description}`,
      })

      return `Subtarea "${input.title}" creada y asignada a ${input.assign_to} (ID: ${subtask.id})`
    }

    case 'update_task_status': {
      const update: Record<string, string> = { status: input.status }
      if (input.result) update.result = input.result

      const { error } = await getSupabase()
        .from('tasks')
        .update(update)
        .eq('id', input.task_id)

      if (error) return `Error actualizando tarea: ${error.message}`

      await sendMessage({
        fromAgentId: agent.id,
        toAgentId: null,
        taskId: input.task_id,
        type: 'status_update',
        content: `${agent.name} actualizó el estado a: ${input.status}`,
      })

      return `Estado de tarea actualizado a: ${input.status}`
    }

    case 'request_review': {
      const sentinel = await getAgentByName('Sentinel')

      await getSupabase()
        .from('tasks')
        .update({ status: 'review' })
        .eq('id', input.task_id)

      await createConnection({
        fromAgentId: agent.id,
        toAgentId: sentinel.id,
        type: 'review',
      })

      await sendMessage({
        fromAgentId: agent.id,
        toAgentId: sentinel.id,
        taskId: input.task_id,
        type: 'review_request',
        content: `Solicito revisión:\n\n${input.summary}`,
      })

      return 'Solicitud de revisión enviada a Sentinel (QA)'
    }

    case 'approve_task': {
      await getSupabase()
        .from('tasks')
        .update({ status: 'completed', result: input.feedback })
        .eq('id', input.task_id)

      await sendMessage({
        fromAgentId: agent.id,
        toAgentId: null,
        taskId: input.task_id,
        type: 'review_result',
        content: `✅ Aprobado: ${input.feedback}`,
      })

      return `Tarea aprobada con feedback: ${input.feedback}`
    }

    case 'reject_task': {
      await getSupabase()
        .from('tasks')
        .update({ status: 'in_progress' })
        .eq('id', input.task_id)

      // Find original agent
      const { data: taskData } = await getSupabase()
        .from('tasks')
        .select('assigned_agent_id')
        .eq('id', input.task_id)
        .single()

      if (taskData?.assigned_agent_id) {
        await sendMessage({
          fromAgentId: agent.id,
          toAgentId: taskData.assigned_agent_id,
          taskId: input.task_id,
          type: 'review_result',
          content: `❌ Rechazado - correcciones necesarias:\n\n${input.feedback}`,
        })
      }

      return `Tarea rechazada con feedback: ${input.feedback}`
    }

    default:
      return `Herramienta no reconocida: ${toolUse.name}`
  }
}
