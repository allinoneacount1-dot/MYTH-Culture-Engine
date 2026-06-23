import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Float, Sphere } from '@react-three/drei';

function FloatingBooks({ count = 8 }) {
  const items = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 8 - 3,
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      scale: 0.3 + Math.random() * 0.3,
      speed: 0.3 + Math.random() * 0.4,
      color: ['#D8B36A', '#F7F4EE', '#3AE9E0', '#A33A4A'][Math.floor(Math.random() * 4)],
    }));
  }, [count]);

  return (
    <group>
      {items.map((item, i) => (
        <Float key={i} speed={item.speed} rotationIntensity={0.1} floatIntensity={0.3}>
          <mesh position={item.position} rotation={item.rotation}>
            <boxGeometry args={[0.5 * item.scale, 0.05 * item.scale, 0.4 * item.scale]} />
            <meshStandardMaterial color={item.color} metalness={0.3} roughness={0.6} transparent opacity={0.7} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function LightRays() {
  return (
    <group>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[i * 2.5 - 5, 2, -6]}
          rotation={[0.3, 0, 0.1 * i]}
        >
          <planeGeometry args={[0.02, 6]} />
          <meshBasicMaterial color="#D8B36A" transparent opacity={0.08} side={2} />
        </mesh>
      ))}
    </group>
  );
}

export default function Scene2() {
  return (
    <Canvas camera={{ position: [0, 1, 10], fov: 45 }}>
      <PerspectiveCamera makeDefault position={[0, 1, 10]} fov={45} />
      <color attach="background" args={['#05070B']} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[0, 5, 3]} intensity={0.3} color="#F7F4EE" />
      <pointLight position={[0, 2, 2]} intensity={1.5} color="#D8B36A" distance={10} />

      <LightRays />
      <FloatingBooks count={10} />
    </Canvas>
  );
}
