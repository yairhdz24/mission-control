'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Agent, AgentConnection } from '@/types/database';

interface Props {
  connection: AgentConnection;
  agents: Agent[];
}

export default function ConnectionBeam({ connection, agents }: Props) {
  const lineRef = useRef<THREE.Line>(null);
  const from = agents.find(a => a.id === connection.from_agent_id);
  const to = agents.find(a => a.id === connection.to_agent_id);

  const points = useMemo(() => {
    if (!from || !to) return [];
    return [
      new THREE.Vector3(from.position_x, 0.8, from.position_y),
      new THREE.Vector3(
        (from.position_x + to.position_x) / 2,
        1.4,
        (from.position_y + to.position_y) / 2
      ),
      new THREE.Vector3(to.position_x, 0.8, to.position_y),
    ];
  }, [from, to]);

  const curve = useMemo(() => {
    if (points.length < 3) return null;
    return new THREE.QuadraticBezierCurve3(points[0], points[1], points[2]);
  }, [points]);

  const geometry = useMemo(() => {
    if (!curve) return null;
    const pts = curve.getPoints(30);
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [curve]);

  useFrame((state) => {
    if (!lineRef.current) return;
    const mat = lineRef.current.material as THREE.LineBasicMaterial;
    const t = state.clock.elapsedTime;
    mat.opacity = 0.4 + Math.sin(t * 3) * 0.2;
  });

  if (!geometry || !from || !to) return null;

  const color = connection.type === 'delegation' ? '#f97316' : '#3b82f6';

  return (
    <primitive object={(() => {
      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 });
      const line = new THREE.Line(geometry, mat);
      return line;
    })()} ref={lineRef} />
  );
}
