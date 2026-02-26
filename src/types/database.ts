export interface Agent {
  id: string;
  name: string;
  role: string;
  model: string;
  personality: string;
  avatar_color: string;
  status: 'idle' | 'working' | 'talking' | 'reviewing' | 'offline';
  position_x: number;
  position_y: number;
  current_task_id: string | null;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentState {
  id: string;
  agent_id: string;
  state: string;
  details: string | null;
  created_at: string;
}

export interface AgentConnection {
  id: string;
  from_agent_id: string;
  to_agent_id: string;
  type: string;
  active: boolean;
  created_at: string;
  expires_at: string | null;
}

export interface Message {
  id: string;
  from_agent_id: string | null;
  to_agent_id: string | null;
  task_id: string | null;
  type: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Task {
  id: string;
  parent_task_id: string | null;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_agent_id: string | null;
  created_by: string;
  result: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TaskLog {
  id: string;
  task_id: string;
  agent_id: string | null;
  action: string;
  details: string | null;
  tokens_used: number;
  cost_usd: number;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      agents: { Row: Agent; Insert: Partial<Agent> & Pick<Agent, 'name' | 'role' | 'model' | 'personality'>; Update: Partial<Agent> };
      agent_states: { Row: AgentState; Insert: Partial<AgentState> & Pick<AgentState, 'agent_id' | 'state'>; Update: Partial<AgentState> };
      agent_connections: { Row: AgentConnection; Insert: Partial<AgentConnection> & Pick<AgentConnection, 'from_agent_id' | 'to_agent_id'>; Update: Partial<AgentConnection> };
      messages: { Row: Message; Insert: Partial<Message> & Pick<Message, 'content'>; Update: Partial<Message> };
      tasks: { Row: Task; Insert: Partial<Task> & Pick<Task, 'title'>; Update: Partial<Task> };
      task_logs: { Row: TaskLog; Insert: Partial<TaskLog> & Pick<TaskLog, 'task_id' | 'action'>; Update: Partial<TaskLog> };
    };
  };
}
