'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Platform() {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame((state) => {
    if (gridRef.current) {
      const mat = gridRef.current.material as THREE.Material;
      if ('opacity' in mat) {
        (mat as THREE.MeshBasicMaterial).opacity = 0.12 + Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
      }
    }
  });

  return (
    <group>
      {/* Main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[12, 64]} />
        <meshStandardMaterial color="#0c1222" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Grid overlay */}
      <gridHelper
        ref={gridRef}
        args={[24, 24, '#1e3a5f', '#1e3a5f']}
        position={[0, 0, 0]}
      />

      {/* Center platform glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[3, 64]} />
        <meshBasicMaterial color="#0f2847" transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[2.9, 3.05, 64]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} />
      </mesh>

      {/* Outer ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[10, 10.1, 64]} />
        <meshBasicMaterial color="#1e40af" transparent opacity={0.15} />
      </mesh>

      {/* Ambient light posts (decorative) */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
        <group key={i} position={[Math.cos(angle) * 8, 0, Math.sin(angle) * 8]}>
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.03, 0.05, 3, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
          </mesh>
          <pointLight position={[0, 3, 0]} intensity={0.3} color="#3b82f6" distance={6} />
          <mesh position={[0, 3, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color="#3b82f6" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
