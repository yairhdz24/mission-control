import type Anthropic from '@anthropic-ai/sdk'

// Tool definitions that agents can use during execution
export function getToolsForRole(role: string): Anthropic.Tool[] {
  const commonTools: Anthropic.Tool[] = [
    {
      name: 'send_message',
      description: 'Envía un mensaje a otro agente del equipo',
      input_schema: {
        type: 'object' as const,
        properties: {
          to_agent: {
            type: 'string',
            description: 'Nombre del agente destino: Nova, Atlas, Pixel, Sentinel, o Flow',
          },
          content: {
            type: 'string',
            description: 'Contenido del mensaje',
          },
        },
        required: ['to_agent', 'content'],
      },
    },
    {
      name: 'update_task_status',
      description: 'Actualiza el estado de una tarea',
      input_schema: {
        type: 'object' as const,
        properties: {
          task_id: {
            type: 'string',
            description: 'ID de la tarea',
          },
          status: {
            type: 'string',
            enum: ['in_progress', 'review', 'completed', 'failed'],
            description: 'Nuevo estado',
          },
          result: {
            type: 'string',
            description: 'Resultado o output de la tarea (opcional)',
          },
        },
        required: ['task_id', 'status'],
      },
    },
  ]

  const pmTools: Anthropic.Tool[] = [
    {
      name: 'create_subtask',
      description: 'Crea una sub-tarea y la asigna a un agente específico',
      input_schema: {
        type: 'object' as const,
        properties: {
          title: {
            type: 'string',
            description: 'Título de la sub-tarea',
          },
          description: {
            type: 'string',
            description: 'Descripción detallada de qué hacer',
          },
          assign_to: {
            type: 'string',
            description: 'Nombre del agente: Atlas, Pixel, Sentinel, o Flow',
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'urgent'],
            description: 'Prioridad de la tarea',
          },
        },
        required: ['title', 'description', 'assign_to'],
      },
    },
  ]

  const devTools: Anthropic.Tool[] = [
    {
      name: 'request_review',
      description: 'Solicita revisión de QA (Sentinel) para el trabajo realizado',
      input_schema: {
        type: 'object' as const,
        properties: {
          task_id: {
            type: 'string',
            description: 'ID de la tarea a revisar',
          },
          summary: {
            type: 'string',
            description: 'Resumen del trabajo realizado',
          },
        },
        required: ['task_id', 'summary'],
      },
    },
  ]

  const qaTools: Anthropic.Tool[] = [
    {
      name: 'approve_task',
      description: 'Aprueba una tarea después de la revisión de QA',
      input_schema: {
        type: 'object' as const,
        properties: {
          task_id: {
            type: 'string',
            description: 'ID de la tarea',
          },
          feedback: {
            type: 'string',
            description: 'Feedback de la revisión',
          },
        },
        required: ['task_id', 'feedback'],
      },
    },
    {
      name: 'reject_task',
      description: 'Rechaza una tarea con feedback para correcciones',
      input_schema: {
        type: 'object' as const,
        properties: {
          task_id: {
            type: 'string',
            description: 'ID de la tarea',
          },
          feedback: {
            type: 'string',
            description: 'Qué necesita ser corregido',
          },
        },
        required: ['task_id', 'feedback'],
      },
    },
  ]

  switch (role) {
    case 'PM / Lead':
      return [...commonTools, ...pmTools]
    case 'QA':
      return [...commonTools, ...qaTools]
    case 'Backend Dev':
    case 'Frontend Dev':
    case 'Automation':
      return [...commonTools, ...devTools]
    default:
      return commonTools
  }
}
