import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  Float,
  Stars,
  MeshReflectorMaterial,
  Environment,
  ContactShadows,
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useScrollStore } from '../stores/scroll';

function lerp(a, b, t) {
  return a + (b - a) * t;
}
function fadeInOut(raw, center, width) {
  return Math.max(0, 1 - Math.abs(raw - center) / width);
}

// Fresnel glow shader
const glowVert = `varying vec3 vN; varying vec3 vW; void main(){
  vec4 wp=modelMatrix*vec4(position,1.); vN=normalize(normalMatrix*normal); vW=wp.xyz;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}`;
const glowFrag = `uniform vec3 c; uniform float i; uniform float t;
varying vec3 vN; varying vec3 vW;
void main(){
  vec3 v=normalize(cameraPosition-vW); float rim=1.-max(0.,dot(v,vN));
  rim=pow(rim,2.5); float p=.85+.15*sin(t*.6);
  gl_FragColor=vec4(c,rim*i*p);
}`;

const FresnelGlow = React.forwardRef(
  (
    { children, color = '#D8B36A', intensity = 1, scale = 1.15, ...props },
    ref,
  ) => {
    const uniforms = useMemo(
      () => ({
        c: { value: new THREE.Color(color) },
        i: { value: intensity },
        t: { value: 0 },
      }),
      [color, intensity],
    );
    useFrame((_, delta) => {
      uniforms.t.value += delta;
    });
    return (
      <mesh ref={ref} scale={scale} {...props}>
        {children}
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          vertexShader={glowVert}
          fragmentShader={glowFrag}
          uniforms={uniforms}
        />
      </mesh>
    );
  },
);

function ParticleRing({
  radius,
  color,
  count = 80,
  spread = 0.3,
  speed = 0.2,
}) {
  const ref = useRef();
  const pos = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + Math.random() * 0.05;
      const r = radius + (Math.random() - 0.5) * spread;
      p[i * 3] = Math.cos(a) * r;
      p[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.5;
      p[i * 3 + 2] = Math.sin(a) * r;
    }
    return p;
  }, [count, radius, spread]);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={pos}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color={color}
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

const CAM = [
  [0, 1.8, 12],
  [5, 2, 16],
  [0, 1, 10],
  [-6, 3, 15],
  [0, 8, 20],
  [0, 1.5, 7],
  [0, 0.3, 4],
];
const TGT = [
  [0, 0, 0],
  [-1.5, 0.5, -1],
  [0, 0.5, 0],
  [0, 0, 0],
  [0, -0.5, 0],
  [0, 0.8, 0],
  [0, 0, 0],
];

export default function MythSceneSSS() {
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  const { progress } = useScrollStore();
  const { camera, gl } = useThree();

  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.2;
  // Refs
  const ambientRef = useRef();
  const keyLightRef = useRef();
  const rimLightRef = useRef();
  const floorRef_0 = useRef();
  const torusRef_1 = useRef();
  const sphereRef_2 = useRef();
  const sphereGlowRef_2 = useRef();
  const relicSolidRef_5 = useRef();
  const relicWireRef_5 = useRef();
  const relicGlowRef_5 = useRef();
  const galaxyRef_8 = useRef();
  const dustRef_10 = useRef();
  const glyphRefs_6 = useRef([]);
  const towerRefs_7 = useRef([]);
  const towerGlowRefs_7 = useRef([]);

  // Memoized data

  const glyphData_6 = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        color: ['#D8B36A', '#3AE9E0', '#A33A4A', '#F7F4EE'][i % 4],
        speed: 0.1 + Math.random() * 0.06,
        radius: 1.8 + i * 0.212,
        yOff: (Math.random() - 0.5) * 0.8,
        phase: i * 1.05,
      })),
    [],
  );

  const towerData_7 = useMemo(() => {
    const d = [];
    for (let x = -5; x <= 5; x += 0.6)
      for (let z = -4; z <= 4; z += 0.6) {
        if (Math.random() > 0.6) continue;
        d.push({
          x,
          z,
          h: 0.15 + Math.random() * 1.05,
          col: ['#10213A', '#F7F4EE', '#D8B36A', '#3AE9E0'][
            Math.floor(Math.random() * 4)
          ],
        });
      }
    return d;
  }, []);

  const galaxyPos_8 = useMemo(() => {
    const count = 8000;
    const p = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const arm = Math.floor(Math.random() * 4);
      const tt = Math.random() * 5;
      const a = tt * 0.8 + arm * 2.1;
      const sp = 0.2 + tt * 0.06;
      p[i * 3] = Math.cos(a) * tt + (Math.random() - 0.5) * sp;
      p[i * 3 + 1] = (Math.random() - 0.5) * sp * 0.6;
      p[i * 3 + 2] = Math.sin(a) * tt + (Math.random() - 0.5) * sp;
      const b = 0.4 + Math.random() * 0.6;
      const w = Math.random();
      c[i * 3] = b * (0.8 + w * 0.2);
      c[i * 3 + 1] = b * (0.5 + w * 0.3);
      c[i * 3 + 2] = b * (0.3 + (1 - w) * 0.5);
    }
    return { pos: p, col: c };
  }, []);

  const dustPos_10 = useMemo(() => {
    const p = new Float32Array(1500 * 3);
    for (let i = 0; i < 1500; i++) {
      p[i * 3] = (Math.random() - 0.5) * 40;
      p[i * 3 + 1] = (Math.random() - 0.5) * 20;
      p[i * 3 + 2] = (Math.random() - 0.5) * 45 - 5;
    }
    return p;
  }, []);

  useFrame((state, delta) => {
    const raw = progress * S;
    const ci = Math.floor(Math.min(raw, S - 1));
    const cf = raw - ci;
    const ni = Math.min(ci + 1, S);

    if (!prefersReduced) {
      const ease = cf * cf * (3 - 2 * cf);
      camera.position.x = lerp(CAM[ci][0], CAM[ni][0], ease);
      camera.position.y = lerp(CAM[ci][1], CAM[ni][1], ease);
      camera.position.z = lerp(CAM[ci][2], CAM[ni][2], ease);
      camera.lookAt(
        lerp(TGT[ci][0], TGT[ni][0], ease),
        lerp(TGT[ci][1], TGT[ni][1], ease),
        lerp(TGT[ci][2], TGT[ni][2], ease),
      );
    }

    const t = state.clock.elapsedTime;
    const g = (c, w) => fadeInOut(raw, c, w);

    if (torusRef_1.current) {
      torusRef_1.current.rotation.x += delta * 0.05;
      torusRef_1.current.rotation.y += delta * 0.08;
      torusRef_1.current.material.opacity = g(0.3, 0.8) * 0.25;
      torusRef_1.current.material.emissiveIntensity = g(0.3, 0.8) * 0.08;
    }

    if (sphereRef_2.current) {
      sphereRef_2.current.rotation.y += delta * 0.03;
      const _v = g(2.5, 1.2);
      sphereRef_2.current.material.opacity = _v * 0.7;
      sphereRef_2.current.material.emissiveIntensity = _v * 0.2;
      sphereRef_2.current.scale.setScalar(1 + Math.sin(t * 0.3) * 0.02 * _v);
    }

    if (relicSolidRef_5.current) {
      relicSolidRef_5.current.rotation.y += delta * 0.15;
      relicSolidRef_5.current.rotation.x = Math.sin(t * 0.3) * 0.08;
      const _v = g(4.5, 1.5);
      relicSolidRef_5.current.material.opacity = _v;
      relicSolidRef_5.current.material.emissiveIntensity = _v * 0.3;
      relicSolidRef_5.current.scale.setScalar(
        1 + Math.sin(t * 0.5) * 0.03 * _v,
      );
    }
    if (relicWireRef_5.current) {
      relicWireRef_5.current.rotation.y -= delta * 0.075;
      relicWireRef_5.current.material.opacity = g(4.5, 1.5) * 0.3;
    }
    if (relicGlowRef_5.current) {
      relicGlowRef_5.current.material.uniforms.i.value = g(4.5, 1.5) * 1.5;
    }

    glyphRefs_6.current.forEach((m, i) => {
      if (!m) return;
      const _v = g(4.8, 1.8);
      m.material.opacity = _v * 0.7;
      m.material.emissiveIntensity = _v * 0.3;
      if (!prefersReduced) {
        const a = t * glyphData_6[i].speed + glyphData_6[i].phase;
        m.position.x = Math.cos(a) * glyphData_6[i].radius;
        m.position.z = Math.sin(a) * glyphData_6[i].radius;
        m.position.y =
          glyphData_6[i].yOff +
          Math.sin(t * 0.5 + glyphData_6[i].phase) * 0.1 * _v;
        m.rotation.y += delta * 0.3;
      }
    });

    const _tv = g(3.8, 1.2);
    towerRefs_7.current.forEach((m) => {
      if (m) m.material.opacity = _tv * 0.5;
    });
    towerGlowRefs_7.current.forEach((m) => {
      if (m)
        m.material.opacity =
          _tv * (0.3 + Math.sin(t * 2 + m.position.x) * 0.15);
    });

    if (galaxyRef_8.current) {
      const _v = g(5.5, 1);
      galaxyRef_8.current.material.opacity = _v * 0.7;
      galaxyRef_8.current.rotation.z = _v * 0.15;
    }

    if (dustRef_10.current)
      dustRef_10.current.material.opacity = 0.06 + g(3, 2) * 0.1;
    if (state.scene.fog) state.scene.fog.density = 0.015 + raw * 0.006;
    if (ambientRef.current) ambientRef.current.intensity = 0.05 + raw * 0.015;
    if (keyLightRef.current) {
      keyLightRef.current.intensity =
        0.12 + (!prefersReduced ? Math.sin(t * 0.12) * 0.04 : 0) + raw * 0.02;
      keyLightRef.current.position.x = 5 + Math.sin(t * 0.1) * 2;
    }
    if (rimLightRef.current)
      rimLightRef.current.intensity =
        0.25 +
        (!prefersReduced ? Math.sin(t * 0.18 + 1) * 0.08 : 0) +
        raw * 0.025;
  });

  return (
    <>
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.05}
          luminanceSmoothing={0.9}
          intensity={0.4}
          mipmapBlur={true}
        />
        <Vignette offset={0.25} darkness={0.6} />
      </EffectComposer>
      <fogExp2 attach="fog" args={['#05070B', 0.008]} />

      <Environment preset="studio" background={false} blur={0.3} />
      <ContactShadows
        position={[0, -0.4, 0]}
        opacity={0.5}
        scale={12}
        blur={4}
        far={6}
      />
      <ambientLight ref={ambientRef} intensity={0.08} color="#F7F4EE" />
      <directionalLight
        ref={keyLightRef}
        position={[8, 12, 6]}
        intensity={0.3}
        color={'#D8B36A'}
      />
      <directionalLight
        ref={rimLightRef}
        position={[-6, 4, -8]}
        intensity={0.4}
        color={'#3AE9E0'}
      />
      <hemisphereLight args={['#1a2a4a', '#0a0a12', 0.25]} />
      <directionalLight
        position={[0, -5, 8]}
        intensity={0.12}
        color={'#A33A4A'}
      />

      <mesh
        ref={floorRef_0}
        position={[0, -0.6, 0]}
        rotation={[-1.5707963267948966, 0, 0]}
      >
        <planeGeometry args={[25, 25]} />
        <MeshReflectorMaterial
          blur={[1024, 1024]}
          resolution={1024}
          mixBlur={0.6}
          mixStrength={0.9}
          depthScale={1}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.3}
          color="#0a0d14"
          metalness={0.95}
          roughness={0.05}
          reflectorOffset={0.2}
          mirror={true}
        />
      </mesh>

      <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <mesh ref={torusRef_1} position={[0, 0.6, -3.5]}>
          <torusKnotGeometry args={[1.4, 0.45, 256, 32]} />
          <meshPhysicalMaterial
            color={new THREE.Color('#D8B36A')}
            metalness={0.9}
            roughness={0.06}
            emissive={new THREE.Color('#D8B36A')}
            emissiveIntensity={0.15}
            clearcoat={1}
            clearcoatRoughness={0.1}
            anisotropy={0.5}
            envMapIntensity={2}
          />
        </mesh>
      </Float>

      <mesh ref={sphereRef_2} position={[0, 0, 0]}>
        <sphereGeometry args={[0.6, 64, 64]} />
        <meshPhysicalMaterial
          color={new THREE.Color('#D8B36A')}
          metalness={0.95}
          roughness={0.03}
          emissive={new THREE.Color('#D8B36A')}
          emissiveIntensity={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.05}
          envMapIntensity={2.5}
          ior={1.5}
          transmission={0.1}
        />
      </mesh>
      <FresnelGlow
        ref={sphereGlowRef_2}
        position={[0, 0, 0]}
        color="#D8B36A"
        intensity={1}
        scale={1.2}
      >
        <sphereGeometry args={[0.6, 64, 64]} />
      </FresnelGlow>

      <ParticleRing
        radius={2}
        color="#3AE9E0"
        count={200}
        speed={0.12}
        spread={0.15}
        opacity={0.7}
        size={0.025}
      />

      <ParticleRing
        radius={3.2}
        color="#D8B36A"
        count={150}
        speed={-0.08}
        spread={0.25}
        opacity={0.6}
        size={0.03}
      />

      <mesh ref={relicSolidRef_5} position={[0, 0.4, 0]}>
        <icosahedronGeometry args={[0.5, 3]} />
        <meshPhysicalMaterial
          color={new THREE.Color('#D8B36A')}
          metalness={0.95}
          roughness={0.04}
          emissive={new THREE.Color('#D8B36A')}
          emissiveIntensity={0.3}
          clearcoat={1}
          clearcoatRoughness={0.08}
          anisotropy={0.8}
          anisotropyRotation={0.5}
          envMapIntensity={2}
        />
      </mesh>
      <FresnelGlow
        ref={relicGlowRef_5}
        position={[0, 0.4, 0]}
        color="#D8B36A"
        intensity={1.5}
        scale={1.4}
      >
        <icosahedronGeometry args={[0.5, 3]} />
      </FresnelGlow>
      <mesh ref={relicWireRef_5} position={[0, 0.4, 0]} scale={1.6}>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color={new THREE.Color('#3AE9E0')}
          metalness={0.5}
          roughness={0.3}
          transparent
          wireframe
          opacity={0.3}
        />
      </mesh>

      {glyphData_6.map((d, i) => (
        <Float key={i} speed={0.2} floatIntensity={0.1}>
          <mesh
            ref={(el) => (glyphRefs_6.current[i] = el)}
            position={[
              Math.cos(d.phase) * d.radius,
              d.yOff,
              Math.sin(d.phase) * d.radius,
            ]}
          >
            <octahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial
              color={d.color}
              emissive={d.color}
              transparent
              metalness={0.7}
              roughness={0.2}
              envMapIntensity={0.5}
            />
          </mesh>
        </Float>
      ))}

      {towerData_7.map((b, i) => (
        <mesh
          key={i}
          ref={(el) => (towerRefs_7.current[i] = el)}
          position={[b.x, b.h / 2, b.z]}
        >
          <boxGeometry args={[0.12, b.h, 0.12]} />
          <meshStandardMaterial
            color={b.col}
            metalness={0.6}
            roughness={0.3}
            transparent
          />
        </mesh>
      ))}
      {towerData_7
        .filter((t) => t.h > 0.4)
        .map((b, i) => (
          <mesh
            key={'w' + i}
            ref={(el) => (towerGlowRefs_7.current[i] = el)}
            position={[b.x, b.h * 0.8, b.z + 0.065]}
          >
            <planeGeometry args={[0.03, 0.015]} />
            <meshBasicMaterial color="#D8B36A" transparent />
          </mesh>
        ))}

      <points ref={galaxyRef_8}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={8000}
            array={galaxyPos_8.pos}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={8000}
            array={galaxyPos_8.col}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.018}
          vertexColors
          transparent
          opacity={0}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <mesh position={[0, 2.5, -1.5]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[0.03, 6, 4]} />
        <meshBasicMaterial
          color="#D8B36A"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[2, 2.5, -1]} rotation={[0.25, 0.3, 0]}>
        <coneGeometry args={[0.03, 6, 4]} />
        <meshBasicMaterial
          color="#3AE9E0"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[-2, 2.5, -1]} rotation={[0.25, -0.3, 0]}>
        <coneGeometry args={[0.03, 6, 4]} />
        <meshBasicMaterial
          color="#A33A4A"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[1, 2.5, 1]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[0.03, 6, 4]} />
        <meshBasicMaterial
          color="#D8B36A"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[-1, 2.5, 1]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[0.03, 6, 4]} />
        <meshBasicMaterial
          color="#3AE9E0"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <points ref={dustRef_10}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={1500}
            array={dustPos_10}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.008}
          color="#F7F4EE"
          transparent
          opacity={0.06}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      <Stars
        radius={60}
        depth={70}
        count={5000}
        factor={4}
        saturation={0.3}
        fade
        speed={0.2}
      />
    </>
  );
}
