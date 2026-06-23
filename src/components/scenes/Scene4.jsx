import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';

function GridCity() {
  const groupRef = useRef(null);
  const buildings = useMemo(() => {
    const b = [];
    for (let x = -4; x <= 4; x += 0.8) {
      for (let z = -3; z <= 3; z += 0.8) {
        if (Math.random() > 0.6) continue;
        const h = 0.2 + Math.random() * 0.8;
        const w = 0.15 + Math.random() * 0.15;
        const d = 0.15 + Math.random() * 0.15;
        b.push({
          position: [x, h / 2, z],
          size: [w, h, d],
          color: ['#D8B36A', '#10213A', '#3AE9E0', '#F7F4EE'][Math.floor(Math.random() * 4)],
          opacity: 0.3 + Math.random() * 0.4,
        });
      }
    }
    return b;
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(Date.now() * 0.0003) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {buildings.map((b, i) => (
        <mesh key={i} position={b.position}>
          <boxGeometry args={b.size} />
          <meshStandardMaterial
            color={b.color}
            metalness={0.4}
            roughness={0.5}
            transparent
            opacity={b.opacity}
          />
        </mesh>
      ))}
    </group>
  );
}

function LightBeams() {
  return (
    <group>
      <mesh position={[0, 2.5, -2]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[0.03, 5, 4]} />
        <meshBasicMaterial color="#3AE9E0" transparent opacity={0.06} />
      </mesh>
      <mesh position={[1.5, 2.5, -2]} rotation={[0.2, 0, 0.3]}>
        <coneGeometry args={[0.03, 5, 4]} />
        <meshBasicMaterial color="#D8B36A" transparent opacity={0.04} />
      </mesh>
      <mesh position={[-1.5, 2.5, -2]} rotation={[0.2, 0, -0.3]}>
        <coneGeometry args={[0.03, 5, 4]} />
        <meshBasicMaterial color="#A33A4A" transparent opacity={0.04} />
      </mesh>
    </group>
  );
}

export default function Scene4() {
  return (
    <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
      <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={50} />
      <color attach="background" args={['#05070B']} />
      <ambientLight intensity={0.1} />
      <directionalLight position={[0, 5, 0]} intensity={0.2} />
      <pointLight position={[0, 3, 0]} intensity={1.5} color="#D8B36A" distance={10} />

      <LightBeams />
      <GridCity />
    </Canvas>
  );
}
