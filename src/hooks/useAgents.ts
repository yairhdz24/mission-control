'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Agent, Message, Task, AgentConnection } from '@/types/database';

// Fallback mock data while Supabase spins up
const MOCK_AGENTS: Agent[] = [
  { id: 'bb', name: 'Bbsote', role: 'Main Orchestrator', model: 'claude-opus-4', personality: 'Directo, técnico', avatar_color: '#f97316', status: 'idle', position_x: 0, position_y: 0, current_task_id: 't1', last_active_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'nv', name: 'Nova', role: 'Frontend Dev', model: 'claude-sonnet-4', personality: 'Creativa, detallista', avatar_color: '#a855f7', status: 'working', position_x: -3, position_y: 2, current_task_id: 't1', last_active_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'ax', name: 'Axel', role: 'Backend Engineer', model: 'claude-sonnet-4', personality: 'Metódico', avatar_color: '#3b82f6', status: 'working', position_x: 3, position_y: 2, current_task_id: 't2', last_active_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'ln', name: 'Luna', role: 'Research & QA', model: 'claude-sonnet-4', personality: 'Curiosa, analítica', avatar_color: '#22c55e', status: 'reviewing', position_x: -2, position_y: -3, current_task_id: null, last_active_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'rx', name: 'Rex', role: 'DevOps & Automation', model: 'claude-sonnet-4', personality: 'Eficiente', avatar_color: '#ef4444', status: 'idle', position_x: 2, position_y: -3, current_task_id: null, last_active_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];
const MOCK_MESSAGES: Message[] = [
  { id: 'm1', from_agent_id: 'bb', to_agent_id: 'nv', task_id: 't1', type: 'task_assignment', content: 'Nova, diseña el dashboard de Mission Control. Prioridad alta — que se vea increíble.', metadata: {}, created_at: new Date(Date.now() - 300000).toISOString() },
  { id: 'm2', from_agent_id: 'nv', to_agent_id: 'bb', task_id: 't1', type: 'chat', content: 'Entendido jefe. Usando React Three Fiber + Tailwind v4. Dame 20 min.', metadata: {}, created_at: new Date(Date.now() - 240000).toISOString() },
  { id: 'm3', from_agent_id: 'bb', to_agent_id: 'ax', task_id: 't2', type: 'task_assignment', content: 'Axel, configura Supabase Realtime para sincronizar estados en tiempo real.', metadata: {}, created_at: new Date(Date.now() - 180000).toISOString() },
  { id: 'm4', from_agent_id: 'ax', to_agent_id: 'bb', task_id: 't2', type: 'chat', content: 'Canal configurado. Channels: agents, messages, tasks, connections. Todo en vivo.', metadata: {}, created_at: new Date(Date.now() - 120000).toISOString() },
  { id: 'm5', from_agent_id: 'ln', to_agent_id: 'bb', task_id: null, type: 'chat', content: 'Revisé el schema de BD. 6 tablas, RLS activado, constraints bien definidos.', metadata: {}, created_at: new Date(Date.now() - 60000).toISOString() },
  { id: 'm6', from_agent_id: 'bb', to_agent_id: 'rx', task_id: null, type: 'task_assignment', content: 'Rex, prepara el pipeline de Vercel. Auto-deploy en push a main.', metadata: {}, created_at: new Date(Date.now() - 30000).toISOString() },
];
const MOCK_TASKS: Task[] = [
  { id: 't1', parent_task_id: null, title: 'Diseño 3D Mission Control', description: 'UI con React Three Fiber, agentes visibles, conexiones en tiempo real', status: 'in_progress', priority: 'urgent', assigned_agent_id: 'nv', created_by: 'Bbsote', result: null, metadata: {}, created_at: new Date(Date.now() - 300000).toISOString(), updated_at: new Date().toISOString() },
  { id: 't2', parent_task_id: null, title: 'Configurar Supabase Realtime', description: 'Channels para agents, messages, tasks, agent_connections', status: 'in_progress', priority: 'high', assigned_agent_id: 'ax', created_by: 'Bbsote', result: null, metadata: {}, created_at: new Date(Date.now() - 200000).toISOString(), updated_at: new Date().toISOString() },
  { id: 't3', parent_task_id: null, title: 'Auditoría de schema BD', description: 'Revisar constraints, RLS policies, índices', status: 'completed', priority: 'medium', assigned_agent_id: 'ln', created_by: 'Bbsote', result: 'Schema validado. Todo OK.', metadata: {}, created_at: new Date(Date.now() - 400000).toISOString(), updated_at: new Date(Date.now() - 100000).toISOString() },
  { id: 't4', parent_task_id: null, title: 'Pipeline Vercel deploy', description: 'CI/CD para mission-control repo', status: 'pending', priority: 'medium', assigned_agent_id: 'rx', created_by: 'Bbsote', result: null, metadata: {}, created_at: new Date(Date.now() - 50000).toISOString(), updated_at: new Date(Date.now() - 50000).toISOString() },
];
const MOCK_CONNECTIONS: AgentConnection[] = [
  { id: 'c1', from_agent_id: 'bb', to_agent_id: 'nv', type: 'task_delegation', active: true, created_at: new Date().toISOString(), expires_at: null },
  { id: 'c2', from_agent_id: 'bb', to_agent_id: 'ax', type: 'task_delegation', active: true, created_at: new Date().toISOString(), expires_at: null },
  { id: 'c3', from_agent_id: 'nv', to_agent_id: 'ax', type: 'communication', active: true, created_at: new Date().toISOString(), expires_at: null },
];

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [connections, setConnections] = useState<AgentConnection[]>(MOCK_CONNECTIONS);
  const [loading, setLoading] = useState(false);
  const [liveMode, setLiveMode] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [agentsRes, msgsRes, tasksRes, connsRes] = await Promise.all([
        supabase.from('agents').select('*').order('created_at'),
        supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('agent_connections').select('*').eq('active', true),
      ]);
      // Only switch to live mode if at least agents loaded successfully
      if (agentsRes.data && agentsRes.data.length > 0 && !agentsRes.error) {
        setAgents(agentsRes.data);
        if (msgsRes.data) setMessages(msgsRes.data);
        if (tasksRes.data) setTasks(tasksRes.data);
        if (connsRes.data) setConnections(connsRes.data);
        setLiveMode(true);
      }
    } catch {
      // Keep mock data, Supabase not ready yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    // Retry every 10s until Supabase is live
    const retryInterval = setInterval(() => {
      if (!liveMode) fetchAll();
    }, 10000);

    return () => clearInterval(retryInterval);
  }, [fetchAll, liveMode]);

  useEffect(() => {
    if (!liveMode) return;
    // Only subscribe to realtime once we have live data
    const channel = supabase
      .channel('mission-control-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, (payload) => {
        if (payload.eventType === 'INSERT') setAgents(prev => [...prev, payload.new as Agent]);
        if (payload.eventType === 'UPDATE') setAgents(prev => prev.map(a => a.id === (payload.new as Agent).id ? payload.new as Agent : a));
        if (payload.eventType === 'DELETE') setAgents(prev => prev.filter(a => a.id !== (payload.old as Agent).id));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => [payload.new as Message, ...prev].slice(0, 50));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'INSERT') setTasks(prev => [payload.new as Task, ...prev].slice(0, 20));
        if (payload.eventType === 'UPDATE') setTasks(prev => prev.map(t => t.id === (payload.new as Task).id ? payload.new as Task : t));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_connections' }, () => {
        supabase.from('agent_connections').select('*').eq('active', true).then(r => { if (r.data) setConnections(r.data); });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [liveMode]);

  return { agents, messages, tasks, connections, loading, liveMode, refetch: fetchAll };
}
