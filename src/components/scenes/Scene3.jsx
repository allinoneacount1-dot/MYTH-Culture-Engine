import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Float, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function OrbitingRing({ radius, color, speed, count = 40 }) {
  const groupRef = useRef(null);
  const particles = useMemo(() => {
    const pos = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      pos.push({
        angle,
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
      });
    }
    return pos;
  }, [radius, count]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * speed;
    }
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, 0, p.z]}>
          <sphereGeometry args={[0.03, 4, 4]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

export default function Scene3() {
  return (
    <Canvas camera={{ position: [0, 2, 10], fov: 45 }}>
      <PerspectiveCamera makeDefault position={[0, 2, 10]} fov={45} />
      <color attach="background" args={['#05070B']} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[2, 5, 3]} intensity={0.3} />
      <pointLight position={[0, 1, 2]} intensity={2} color="#D8B36A" distance={12} />

      <Float speed={0.6} rotationIntensity={0.05} floatIntensity={0.2}>
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.8, 24, 24]} />
          <meshStandardMaterial color="#D8B36A" metalness={0.9} roughness={0.1} emissive="#D8B36A" emissiveIntensity={0.1} />
        </mesh>
      </Float>

      <OrbitingRing radius={1.8} color="#3AE9E0" speed={0.3} count={50} />
      <OrbitingRing radius={2.6} color="#D8B36A" speed={-0.2} count={60} />
      <OrbitingRing radius={3.8} color="#10213A" speed={0.15} count={80} />
    </Canvas>
  );
}
