import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';

function CentralRelic() {
  const meshRef = useRef(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
      meshRef.current.rotation.x = Math.sin(Date.now() * 0.0002) * 0.1;
    }
  });

  return (
    <Float speed={0.8} rotationIntensity={0.02} floatIntensity={0.3}>
      <group ref={meshRef} position={[0, 0.5, 0]}>
        <mesh>
          <icosahedronGeometry args={[0.6, 1]} />
          <meshStandardMaterial
            color="#D8B36A"
            metalness={0.9}
            roughness={0.1}
            emissive="#D8B36A"
            emissiveIntensity={0.15}
            transparent
            opacity={0.8}
          />
        </mesh>
        <mesh scale={[1.3, 1.3, 1.3]}>
          <icosahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial
            color="#3AE9E0"
            metalness={0.5}
            roughness={0.3}
            transparent
            opacity={0.15}
            wireframe
          />
        </mesh>
      </group>
    </Float>
  );
}

function FloatingRunes({ count = 30 }) {
  const groupRef = useRef(null);
  const runes = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 8,
        Math.random() * 4 - 1,
        (Math.random() - 0.5) * 6 - 2,
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      scale: 0.05 + Math.random() * 0.1,
      color: ['#D8B36A', '#3AE9E0', '#F7F4EE'][Math.floor(Math.random() * 3)],
    }));
  }, [count]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {runes.map((r, i) => (
        <mesh key={i} position={r.position} rotation={r.rotation}>
          <boxGeometry args={[r.scale, r.scale * 2, r.scale * 0.3]} />
          <meshStandardMaterial color={r.color} metalness={0.6} roughness={0.3} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

export default function Scene5() {
  return (
    <Canvas camera={{ position: [0, 1.5, 9], fov: 45 }}>
      <PerspectiveCamera makeDefault position={[0, 1.5, 9]} fov={45} />
      <color attach="background" args={['#05070B']} />
      <ambientLight intensity={0.1} />
      <directionalLight position={[0, 3, 2]} intensity={0.3} color="#D8B36A" />
      <pointLight position={[0, 1, 1]} intensity={2} color="#D8B36A" distance={8} />
      <pointLight position={[-2, 1, -1]} intensity={0.5} color="#3AE9E0" distance={6} />

      <CentralRelic />
      <FloatingRunes count={24} />
    </Canvas>
  );
}
