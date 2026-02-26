'use client';
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stars, PerspectiveCamera } from '@react-three/drei';
import Platform from './Platform';
import AgentAvatar from './AgentAvatar';
import ConnectionBeam from './ConnectionBeam';
import type { Agent, Message, AgentConnection } from '@/types/database';

interface Props {
  agents: Agent[];
  messages: Message[];
  connections: AgentConnection[];
}

export default function MissionScene({ agents, messages, connections }: Props) {
  // Get latest message per agent
  const latestMsgByAgent = new Map<string, Message>();
  for (const msg of messages) {
    if (msg.from_agent_id && !latestMsgByAgent.has(msg.from_agent_id)) {
      latestMsgByAgent.set(msg.from_agent_id, msg);
    }
  }

  const connectedAgentIds = new Set<string>();
  connections.forEach(c => {
    connectedAgentIds.add(c.from_agent_id);
    connectedAgentIds.add(c.to_agent_id);
  });

  return (
    <div className="w-full h-full">
      <Canvas shadows gl={{ antialias: true, alpha: false }} dpr={[1, 2]}>
        <color attach="background" args={['#070b14']} />
        <fog attach="fog" args={['#070b14', 15, 30]} />

        <PerspectiveCamera makeDefault position={[8, 6, 8]} fov={45} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={4}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, 0.5, 0]}
        />

        {/* Lighting */}
        <ambientLight intensity={0.15} />
        <directionalLight
          position={[10, 15, 5]}
          intensity={0.6}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />
        <pointLight position={[0, 8, 0]} intensity={0.4} color="#3b82f6" />

        <Suspense fallback={null}>
          <Stars radius={50} depth={50} count={2000} factor={3} fade speed={0.5} />
          <Environment preset="night" />

          <Platform />

          {/* Agents */}
          {agents.map(agent => (
            <AgentAvatar
              key={agent.id}
              agent={agent}
              latestMessage={latestMsgByAgent.get(agent.id)}
              isConnected={connectedAgentIds.has(agent.id)}
            />
          ))}

          {/* Connection beams */}
          {connections.map(conn => (
            <ConnectionBeam key={conn.id} connection={conn} agents={agents} />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}
