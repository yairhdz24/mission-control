'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { Agent, Message } from '@/types/database';

const STATUS_EMISSIVE: Record<string, string> = {
  idle: '#334155',
  working: '#f97316',
  talking: '#22c55e',
  reviewing: '#a855f7',
  offline: '#1e293b',
};

interface Props {
  agent: Agent;
  latestMessage?: Message;
  isConnected?: boolean;
}

export default function AgentAvatar({ agent, latestMessage, isConnected }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const bubbleRef = useRef<THREE.Group>(null);

  const color = useMemo(() => new THREE.Color(agent.avatar_color), [agent.avatar_color]);
  const emissive = useMemo(() => new THREE.Color(STATUS_EMISSIVE[agent.status] || '#334155'), [agent.status]);
  const pos: [number, number, number] = [agent.position_x, 0, agent.position_y];

  // Breathing / working animation
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    if (agent.status === 'idle') {
      meshRef.current.position.y = Math.sin(t * 1.5 + agent.position_x) * 0.05 + 0.6;
    } else if (agent.status === 'working') {
      meshRef.current.position.y = Math.sin(t * 3) * 0.08 + 0.65;
      meshRef.current.rotation.y += 0.005;
    } else if (agent.status === 'reviewing') {
      meshRef.current.position.y = 0.6 + Math.sin(t * 2) * 0.03;
    } else if (agent.status === 'talking') {
      meshRef.current.position.y = 0.6 + Math.sin(t * 4) * 0.06;
    } else {
      meshRef.current.position.y = 0.6;
    }

    // Glow pulse
    if (glowRef.current) {
      const scale = agent.status === 'working'
        ? 1.3 + Math.sin(t * 4) * 0.15
        : agent.status === 'reviewing'
          ? 1.2 + Math.sin(t * 2) * 0.1
          : 1.1 + Math.sin(t * 1.5) * 0.05;
      glowRef.current.scale.setScalar(scale);
    }

    // Chat bubble fade
    if (bubbleRef.current) {
      const showBubble = latestMessage && (Date.now() - new Date(latestMessage.created_at).getTime()) < 8000;
      bubbleRef.current.visible = !!showBubble;
      if (showBubble) {
        bubbleRef.current.position.y = 1.8 + Math.sin(t * 2) * 0.03;
      }
    }
  });

  const truncatedMsg = latestMessage?.content
    ? latestMessage.content.length > 60
      ? latestMessage.content.slice(0, 57) + '...'
      : latestMessage.content
    : '';

  return (
    <group position={pos}>
      {/* Ground shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="#000" transparent opacity={0.25} />
      </mesh>

      {/* Glow ring */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.4, 0.55, 32]} />
        <meshBasicMaterial color={emissive} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Agent body */}
      <mesh ref={meshRef} position={[0, 0.6, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.4, 8, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={agent.status === 'offline' ? 0 : 0.3}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.2}
          roughness={0.2}
          metalness={0.15}
        />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.08, 1.18, 0.18]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#fff" />
      </mesh>
      <mesh position={[0.08, 1.18, 0.18]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#fff" />
      </mesh>
      <mesh position={[-0.08, 1.18, 0.2]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.08, 1.18, 0.2]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>

      {/* Name label */}
      <Billboard position={[0, 1.55, 0]}>
        <Text fontSize={0.14} color="#e2e8f0" anchorY="bottom">
          {agent.name}
        </Text>
        <Text fontSize={0.08} color="#94a3b8" position={[0, -0.16, 0]}>
          {agent.role} · {agent.status}
        </Text>
      </Billboard>

      {/* Status particles for working */}
      {agent.status === 'working' && (
        <WorkingParticles color={agent.avatar_color} />
      )}

      {/* Connection indicator */}
      {isConnected && (
        <mesh position={[0.3, 1.4, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      )}

      {/* Chat bubble */}
      <group ref={bubbleRef} visible={false} position={[0, 1.8, 0]}>
        <Billboard>
          <RoundedBox args={[2.2, 0.5, 0.05]} radius={0.08} position={[0, 0, 0]}>
            <meshBasicMaterial color="#1e293b" transparent opacity={0.92} />
          </RoundedBox>
          <Text
            fontSize={0.09}
            color="#e2e8f0"
            maxWidth={2}
            textAlign="center"
            anchorY="middle"
          >
            {truncatedMsg}
          </Text>
        </Billboard>
      </group>
    </group>
  );
}

function WorkingParticles({ color }: { color: string }) {
  const ref = useRef<THREE.Points>(null);
  const count = 20;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 0.8;
      arr[i * 3 + 1] = Math.random() * 1.2 + 0.3;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const posArr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      posArr[i * 3 + 1] = (posArr[i * 3 + 1] + 0.01) % 1.8 + 0.3;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y = t * 0.5;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.03} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}
