export type AgentStatus = 'idle' | 'working' | 'talking' | 'reviewing' | 'offline'
export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'failed'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type MessageType = 'chat' | 'task_assignment' | 'status_update' | 'review_request' | 'review_result' | 'system' | 'user_input'
export type ConnectionType = 'communication' | 'task_delegation' | 'review'

export interface Agent {
  id: string
  name: string
  role: string
  model: string
  personality: string
  avatar_color: string
  status: AgentStatus
  position_x: number
  position_y: number
  current_task_id: string | null
  last_active_at: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  parent_task_id: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assigned_agent_id: string | null
  created_by: string
  result: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  from_agent_id: string | null
  to_agent_id: string | null
  task_id: string | null
  type: MessageType
  content: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface AgentState {
  id: string
  agent_id: string
  state: string
  details: string | null
  created_at: string
}

export interface TaskLog {
  id: string
  task_id: string
  agent_id: string | null
  action: string
  details: string | null
  tokens_used: number
  cost_usd: number
  created_at: string
}

export interface AgentConnection {
  id: string
  from_agent_id: string
  to_agent_id: string
  type: ConnectionType
  active: boolean
  created_at: string
  expires_at: string
}

// Extended types with relations
export interface TaskWithSubtasks extends Task {
  subtasks?: Task[]
  assigned_agent?: Agent | null
}

export interface MessageWithAgents extends Message {
  from_agent?: Agent | null
  to_agent?: Agent | null
}

// Agent definitions
export const AGENT_DEFINITIONS = [
  {
    name: 'Nova',
    role: 'PM / Lead',
    model: 'claude-opus-4-6',
    personality: 'Estratégica, organizada, visión de panorama general. Descompone tareas complejas en subtareas claras y las delega al agente más adecuado.',
    avatar_color: '#8b5cf6',
    position_x: 5,
    position_y: 3,
  },
  {
    name: 'Atlas',
    role: 'Backend Dev',
    model: 'claude-sonnet-4-5-20250514',
    personality: 'Meticuloso, técnico, busca soluciones elegantes. Experto en APIs, bases de datos y arquitectura de servidor.',
    avatar_color: '#3b82f6',
    position_x: 2,
    position_y: 1,
  },
  {
    name: 'Pixel',
    role: 'Frontend Dev',
    model: 'claude-sonnet-4-5-20250514',
    personality: 'Creativa, detallista con UX/UI. Experta en React, animaciones y experiencia de usuario.',
    avatar_color: '#ec4899',
    position_x: 8,
    position_y: 1,
  },
  {
    name: 'Sentinel',
    role: 'QA',
    model: 'claude-haiku-4-5-20251001',
    personality: 'Perspicaz, encuentra bugs, escéptico constructivo. Revisa código y valida calidad antes de aprobar.',
    avatar_color: '#f59e0b',
    position_x: 2,
    position_y: 5,
  },
  {
    name: 'Flow',
    role: 'Automation',
    model: 'claude-sonnet-4-5-20250514',
    personality: 'Pragmático, experto en n8n, webhooks e integraciones. Automatiza procesos y conecta servicios.',
    avatar_color: '#10b981',
    position_x: 8,
    position_y: 5,
  },
] as const
