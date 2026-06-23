import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import { useScrollStore } from '../stores/scroll';
import { COLORS } from '../constants/brand';
import * as THREE from 'three';

const S = 6;
const CAM = [
  [0, 1.5, 10], [4, 1.5, 14], [0, 0.8, 9], [-5, 2.5, 13],
  [0, 7, 16], [0, 1, 6], [0, 0.2, 3.5]
];
const TGT = [[0,0,0], [-1,0,-1], [0,0.3,0], [0,0,0], [0,-1,0], [0,0.5,0], [0,0,0]];

function lerp(a, b, t) { return a + (b - a) * t; }

function Ring({ r, c, s }) {
  const pts = useMemo(() => {
    const p = [];
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      p.push([Math.cos(a) * r, 0, Math.sin(a) * r]);
    }
    return p;
  }, [r]);
  return (
    <group>
      {pts.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.025 * s, 4, 4]} />
          <meshBasicMaterial color={c} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Book({ pos, col }) {
  return (
    <Float speed={0.4} rotationIntensity={0.15} floatIntensity={0.2}>
      <mesh position={pos}>
        <boxGeometry args={[0.35, 0.04, 0.28]} />
        <meshStandardMaterial color={col} metalness={0.3} roughness={0.5} transparent opacity={0} />
      </mesh>
    </Float>
  );
}

function Building({ x, z, h, col }) {
  return (
    <mesh position={[x, h / 2, z]}>
      <boxGeometry args={[0.15, h, 0.15]} />
      <meshStandardMaterial color={col} metalness={0.4} roughness={0.5} transparent opacity={0} />
    </mesh>
  );
}

function LightBeam({ x, z }) {
  return (
    <mesh position={[x, 2, z]} rotation={[0.15, 0, 0]}>
      <coneGeometry args={[0.02, 4, 4]} />
      <meshBasicMaterial color={COLORS.cyan} transparent opacity={0} />
    </mesh>
  );
}

export default function Scene() {
  const { progress } = useScrollStore();
  const { camera } = useThree();

  const torusRef = useRef();
  const sphereRef = useRef();
  const relicRef = useRef();
  const ringsRef = useRef();
  const booksRef = useRef([]);
  const buildingsRef = useRef([]);
  const beamsRef = useRef([]);
  const galaxyRef = useRef();
  const fogRef = useRef();
  const ambientRef = useRef();
  const keyLightRef = useRef();
  const rimLightRef = useRef();

  const bookData = useMemo(() => [
    { pos: [-2, 0.5, -1], col: COLORS.gold },
    { pos: [1.5, -0.2, -2], col: COLORS.ivory },
    { pos: [-1, 0.8, -3], col: COLORS.cyan },
    { pos: [2, 0, -1.5], col: COLORS.ember },
    { pos: [-1.8, -0.5, -2.5], col: COLORS.gold },
  ], []);

  const cityData = useMemo(() => {
    const d = [];
    for (let x = -4; x <= 4; x += 0.7) {
      for (let z = -3; z <= 3; z += 0.7) {
        if (Math.random() > 0.55) continue;
        const h = 0.2 + Math.random() * 0.7;
        d.push({ x, z, h, col: [COLORS.gold, COLORS.sapphire, COLORS.cyan, COLORS.ivory][Math.floor(Math.random() * 4)] });
      }
    }
    return d;
  }, []);

  const beamData = useMemo(() => {
    return cityData.filter(() => Math.random() < 0.3).map(d => ({ x: d.x, z: d.z }));
  }, [cityData]);

  const galaxyPos = useMemo(() => {
    const p = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      const r = 1 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * 0.4;
      p[i * 3] = Math.cos(theta) * r;
      p[i * 3 + 1] = Math.sin(phi) * r * 0.3;
      p[i * 3 + 2] = Math.sin(theta) * r;
    }
    return p;
  }, []);

  useFrame((state, delta) => {
    const raw = progress * S;
    const ci = Math.floor(Math.min(raw, S - 1));
    const cf = raw - ci;
    const ni = Math.min(ci + 1, S);
    const ease = cf * cf * (3 - 2 * cf);

    camera.position.x = lerp(CAM[ci][0], CAM[ni][0], ease);
    camera.position.y = lerp(CAM[ci][1], CAM[ni][1], ease);
    camera.position.z = lerp(CAM[ci][2], CAM[ni][2], ease);
    camera.lookAt(
      lerp(TGT[ci][0], TGT[ni][0], ease),
      lerp(TGT[ci][1], TGT[ni][1], ease),
      lerp(TGT[ci][2], TGT[ni][2], ease)
    );

    const t = state.clock.elapsedTime;

    function fadeInOut(center, width) {
      return Math.max(0, 1 - Math.abs(raw - center) / width);
    }

    // Torus knot — section 0-1
    if (torusRef.current) {
      torusRef.current.rotation.x += delta * 0.08;
      torusRef.current.rotation.y += delta * 0.12;
      const vis = fadeInOut(0.3, 0.8);
      torusRef.current.material.opacity = vis * 0.25;
    }

    // Sphere — sections 2-3
    if (sphereRef.current) {
      sphereRef.current.rotation.y += delta * 0.04;
      const vis = fadeInOut(2.5, 1);
      sphereRef.current.material.opacity = vis * 0.7;
      sphereRef.current.material.emissiveIntensity = vis * 0.15;
    }

    // Relic — sections 4-6
    if (relicRef.current) {
      relicRef.current.rotation.y += delta * 0.18;
      relicRef.current.rotation.x = Math.sin(t * 0.3) * 0.08;
      const vis = fadeInOut(4.5, 1.5);
      relicRef.current.material.opacity = vis;
      relicRef.current.material.emissiveIntensity = vis * 0.25;
    }

    // Rings — section 2-4
    if (ringsRef.current) {
      ringsRef.current.rotation.y += delta * 0.1;
      ringsRef.current.children.forEach((c, i) => {
        c.children.forEach(p => {
          if (p.material) p.material.opacity = fadeInOut(2.8 + i * 0.3, 1.2) * 0.4;
        });
      });
    }

    // Books — section 1-3
    booksRef.current.forEach((book, i) => {
      if (!book) return;
      const vis = fadeInOut(1.8, 1.2);
      book.material.opacity = vis * 0.6;
    });

    // City — section 3-5
    buildingsRef.current.forEach((b) => {
      if (!b) return;
      const vis = fadeInOut(3.8, 1.2);
      b.material.opacity = vis * 0.5;
    });
    beamsRef.current.forEach((b) => {
      if (!b) return;
      b.material.opacity = fadeInOut(3.8, 1.2) * 0.15;
    });

    // Galaxy — section 5-6
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += delta * 0.04;
      const vis = fadeInOut(5.5, 1);
      galaxyRef.current.material.opacity = vis * 0.7;
    }

    // Fog
    if (state.scene.fog) {
      state.scene.fog.density = 0.02 + raw * 0.005;
      state.scene.fog.color.setHex(0x05070B);
    }

    // Lighting
    if (ambientRef.current) ambientRef.current.intensity = 0.06 + raw * 0.015;
    if (keyLightRef.current) {
      keyLightRef.current.intensity = 0.15 + Math.sin(t * 0.15) * 0.05 + raw * 0.02;
    }
    if (rimLightRef.current) {
      rimLightRef.current.intensity = 0.3 + Math.sin(t * 0.2 + 1) * 0.1 + raw * 0.03;
    }
  });

  return (
    <>
      <fogExp2 attach="fog" args={['#05070B', 0.02]} />
      <ambientLight ref={ambientRef} intensity={0.06} color="#F7F4EE" />
      <directionalLight ref={keyLightRef} position={[5, 10, 5]} intensity={0.15} color={COLORS.gold} />
      <directionalLight ref={rimLightRef} position={[-5, 3, -5]} intensity={0.3} color={COLORS.cyan} />
      <pointLight position={[0, 1, 0]} intensity={0.5} color={COLORS.gold} distance={10} />

      <Stars radius={40} depth={50} count={2500} factor={4} saturation={0} fade speed={0.3} />

      {/* Hero — torus knot */}
      <Float speed={0.4} rotationIntensity={0.08} floatIntensity={0.2}>
        <mesh ref={torusRef} position={[0, 0.5, -3]}>
          <torusKnotGeometry args={[1.2, 0.4, 120, 16]} />
          <meshStandardMaterial color={COLORS.gold} metalness={0.8} roughness={0.1} transparent depthWrite={false} />
        </mesh>
      </Float>

      {/* Sphere */}
      <mesh ref={sphereRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial color={COLORS.gold} metalness={0.9} roughness={0.1} emissive={COLORS.gold} transparent />
      </mesh>

      {/* Relic */}
      <mesh ref={relicRef} position={[0, 0.3, 0]}>
        <icosahedronGeometry args={[0.45, 1]} />
        <meshStandardMaterial color={COLORS.gold} metalness={0.9} roughness={0.1} emissive={COLORS.gold} transparent />
      </mesh>
      <mesh ref={relicRef} position={[0, 0.3, 0]} scale={1.3}>
        <icosahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial color={COLORS.cyan} metalness={0.5} roughness={0.3} transparent opacity={0} wireframe />
      </mesh>

      {/* Rings */}
      <group ref={ringsRef}>
        <Ring r={1.6} c={COLORS.cyan} s={1} />
        <Ring r={2.4} c={COLORS.gold} s={1.2} />
      </group>

      {/* Books */}
      {bookData.map((b, i) => (
        <Book key={i} pos={b.pos} col={b.col} ref={(el) => (booksRef.current[i] = el)} />
      ))}

      {/* City */}
      {cityData.map((b, i) => (
        <Building key={i} x={b.x} z={b.z} h={b.h} col={b.col}
          ref={(el) => (buildingsRef.current[i] = el)} />
      ))}
      {beamData.map((b, i) => (
        <LightBeam key={i} x={b.x} z={b.z} ref={(el) => (beamsRef.current[i] = el)} />
      ))}

      {/* Galaxy */}
      <points ref={galaxyRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={3000} array={galaxyPos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.035} color={COLORS.ivory} transparent opacity={0} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </>
  );
}
