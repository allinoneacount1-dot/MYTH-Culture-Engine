import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Float, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField({ count = 2000 }) {
  const meshRef = useRef(null);
  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60 - 20;
    }
    return pos;
  }, [count]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = 0.2;
    }
  }, []);

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#D8B36A"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function Scene1() {
  return (
    <Canvas camera={{ position: [0, 2, 12], fov: 45 }}>
      <PerspectiveCamera makeDefault position={[0, 2, 12]} fov={45} />
      <color attach="background" args={['#05070B']} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 10, 5]} intensity={0.5} color="#D8B36A" />
      <pointLight position={[-3, 2, 0]} intensity={2} color="#3AE9E0" distance={15} />

      <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.5}>
        <mesh position={[0, 0, -2]}>
          <torusKnotGeometry args={[1.2, 0.4, 120, 16]} />
          <meshStandardMaterial
            color="#D8B36A"
            metalness={0.8}
            roughness={0.1}
            transparent
            opacity={0.3}
            wireframe
          />
        </mesh>
      </Float>

      <Float speed={0.3} rotationIntensity={0.05} floatIntensity={0.3}>
        <mesh position={[4, -1, -4]}>
          <icosahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial color="#10213A" metalness={0.6} roughness={0.3} transparent opacity={0.5} />
        </mesh>
      </Float>

      <Float speed={0.4} rotationIntensity={0.08} floatIntensity={0.4}>
        <mesh position={[-3.5, 1.5, -5]}>
          <octahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial color="#3AE9E0" metalness={0.9} roughness={0.1} transparent opacity={0.4} />
        </mesh>
      </Float>

      <Stars radius={40} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />

      <ParticleField count={1500} />
    </Canvas>
  );
}
