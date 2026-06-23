import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

function Galaxy() {
  const pointsRef = useRef(null);
  const count = 4000;

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = 1 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * 0.5;

      pos[i * 3] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = Math.sin(phi) * radius * 0.3;
      pos[i * 3 + 2] = Math.sin(theta) * radius;

      const brightness = 0.3 + Math.random() * 0.7;
      col[i * 3] = brightness;
      col[i * 3 + 1] = brightness * (0.7 + Math.random() * 0.3);
      col[i * 3 + 2] = brightness * (0.5 + Math.random() * 0.5);

      siz[i] = 0.02 + Math.random() * 0.06;
    }

    return [pos, col, siz];
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function Scene6() {
  return (
    <Canvas camera={{ position: [0, 1, 8], fov: 50 }}>
      <PerspectiveCamera makeDefault position={[0, 1, 8]} fov={50} />
      <color attach="background" args={['#05070B']} />
      <ambientLight intensity={0.05} />
      <pointLight position={[0, 2, 0]} intensity={1} color="#F7F4EE" distance={12} />

      <Galaxy />

      <Float speed={0.4} rotationIntensity={0.03} floatIntensity={0.2}>
        <mesh position={[0, 0.3, 1]}>
          <ringGeometry args={[0.5, 0.6, 64]} />
          <meshBasicMaterial color="#F7F4EE" transparent opacity={0.15} side={2} />
        </mesh>
        <mesh position={[0, 0.3, 1]} rotation={[0, Math.PI / 3, 0]}>
          <ringGeometry args={[0.4, 0.5, 64]} />
          <meshBasicMaterial color="#D8B36A" transparent opacity={0.1} side={2} />
        </mesh>
      </Float>
    </Canvas>
  );
}
