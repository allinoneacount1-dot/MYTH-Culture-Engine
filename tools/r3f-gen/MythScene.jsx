import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
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
  [0, 1.5, 10],
  [4, 1.5, 14],
  [0, 0.8, 9],
  [-5, 2.5, 13],
  [0, 7, 16],
  [0, 1, 6],
  [0, 0.2, 3.5],
];
const TGT = [
  [0, 0, 0],
  [-1, 0, -1],
  [0, 0.3, 0],
  [0, 0, 0],
  [0, -1, 0],
  [0, 0.5, 0],
  [0, 0, 0],
];

export default function MythScene() {
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  const { progress } = useScrollStore();
  const { camera } = useThree();

  // Refs
  const ambientRef = useRef();
  const keyLightRef = useRef();
  const rimLightRef = useRef();
  const torusRef_0 = useRef();
  const sphereRef_1 = useRef();
  const sphereGlowRef_1 = useRef();
  const relicSolidRef_4 = useRef();
  const relicWireRef_4 = useRef();
  const relicGlowRef_4 = useRef();
  const galaxyRef_7 = useRef();
  const dustRef_9 = useRef();
  const glyphRefs_5 = useRef([]);
  const towerRefs_6 = useRef([]);
  const towerGlowRefs_6 = useRef([]);

  // Memoized data

  const glyphData_5 = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        color: ['#D8B36A', '#3AE9E0', '#A33A4A'][i % 3],
        speed: 0.12 + Math.random() * 0.06,
        radius: 1.6 + i * 0.25,
        yOff: (Math.random() - 0.5) * 0.8,
        phase: i * 1.05,
      })),
    [],
  );

  const towerData_6 = useMemo(() => {
    const d = [];
    for (let x = -4; x <= 4; x += 0.7)
      for (let z = -3; z <= 3; z += 0.7) {
        if (Math.random() > 0.5) continue;
        d.push({
          x,
          z,
          h: 0.2 + Math.random() * 0.8,
          col: ['#10213A', '#F7F4EE', '#D8B36A'][Math.floor(Math.random() * 3)],
        });
      }
    return d;
  }, []);

  const galaxyPos_7 = useMemo(() => {
    const count = 5000;
    const p = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const arm = Math.floor(Math.random() * 3);
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

  const dustPos_9 = useMemo(() => {
    const p = new Float32Array(800 * 3);
    for (let i = 0; i < 800; i++) {
      p[i * 3] = (Math.random() - 0.5) * 30;
      p[i * 3 + 1] = (Math.random() - 0.5) * 15;
      p[i * 3 + 2] = (Math.random() - 0.5) * 35 - 5;
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

    if (torusRef_0.current) {
      torusRef_0.current.rotation.x += delta * 0.08;
      torusRef_0.current.rotation.y += delta * 0.12;
      torusRef_0.current.material.opacity = g(0.3, 0.8) * 0.25;
      torusRef_0.current.material.emissiveIntensity = g(0.3, 0.8) * 0.08;
    }

    if (sphereRef_1.current) {
      sphereRef_1.current.rotation.y += delta * 0.04;
      const _v = g(2.5, 1);
      sphereRef_1.current.material.opacity = _v * 0.7;
      sphereRef_1.current.material.emissiveIntensity = _v * 0.2;
      sphereRef_1.current.scale.setScalar(1 + Math.sin(t * 0.3) * 0.02 * _v);
    }

    if (relicSolidRef_4.current) {
      relicSolidRef_4.current.rotation.y += delta * 0.18;
      relicSolidRef_4.current.rotation.x = Math.sin(t * 0.3) * 0.08;
      const _v = g(4.5, 1.5);
      relicSolidRef_4.current.material.opacity = _v;
      relicSolidRef_4.current.material.emissiveIntensity = _v * 0.3;
      relicSolidRef_4.current.scale.setScalar(
        1 + Math.sin(t * 0.5) * 0.03 * _v,
      );
    }
    if (relicWireRef_4.current) {
      relicWireRef_4.current.rotation.y -= delta * 0.09;
      relicWireRef_4.current.material.opacity = g(4.5, 1.5) * 0.25;
    }
    if (relicGlowRef_4.current) {
      relicGlowRef_4.current.material.uniforms.i.value = g(4.5, 1.5) * 1.2;
    }

    glyphRefs_5.current.forEach((m, i) => {
      if (!m) return;
      const _v = g(4.8, 1.8);
      m.material.opacity = _v * 0.7;
      m.material.emissiveIntensity = _v * 0.3;
      if (!prefersReduced) {
        const a = t * glyphData_5[i].speed + glyphData_5[i].phase;
        m.position.x = Math.cos(a) * glyphData_5[i].radius;
        m.position.z = Math.sin(a) * glyphData_5[i].radius;
        m.position.y =
          glyphData_5[i].yOff +
          Math.sin(t * 0.5 + glyphData_5[i].phase) * 0.1 * _v;
        m.rotation.y += delta * 0.3;
      }
    });

    const _tv = g(3.8, 1.2);
    towerRefs_6.current.forEach((m) => {
      if (m) m.material.opacity = _tv * 0.5;
    });
    towerGlowRefs_6.current.forEach((m) => {
      if (m)
        m.material.opacity =
          _tv * (0.3 + Math.sin(t * 2 + m.position.x) * 0.15);
    });

    if (galaxyRef_7.current) {
      const _v = g(5.5, 1);
      galaxyRef_7.current.material.opacity = _v * 0.7;
      galaxyRef_7.current.rotation.z = _v * 0.15;
    }

    if (dustRef_9.current)
      dustRef_9.current.material.opacity = 0.06 + g(3, 2) * 0.1;
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
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          intensity={0.5}
          mipmapBlur={true}
        />
      </EffectComposer>
      <fogExp2 attach="fog" args={['#05070B', 0.015]} />
      <ambientLight ref={ambientRef} intensity={0.05} color="#F7F4EE" />
      <directionalLight
        ref={keyLightRef}
        position={[5, 10, 5]}
        intensity={0.12}
        color={'#D8B36A'}
      />
      <directionalLight
        ref={rimLightRef}
        position={[-5, 3, -5]}
        intensity={0.25}
        color={'#3AE9E0'}
      />

      <Float speed={0.4} rotationIntensity={0.08} floatIntensity={0.2}>
        <mesh ref={torusRef_0} position={[0, 0.5, -3]}>
          <torusKnotGeometry args={[1.2, 0.4, 180, 24]} />
          <meshStandardMaterial
            color={new THREE.Color('#D8B36A')}
            metalness={0.85}
            roughness={0.08}
            emissive={new THREE.Color('#D8B36A')}
            transparent
          />
        </mesh>
      </Float>

      <mesh ref={sphereRef_1} position={[0, 0, 0]}>
        <sphereGeometry args={[0.55, 48, 48]} />
        <meshStandardMaterial
          color={new THREE.Color('#D8B36A')}
          metalness={0.9}
          roughness={0.05}
          emissive={new THREE.Color('#D8B36A')}
          transparent
        />
      </mesh>
      <FresnelGlow
        ref={sphereGlowRef_1}
        position={[0, 0, 0]}
        color="#D8B36A"
        intensity={0.8}
        scale={1.15}
      >
        <sphereGeometry args={[0.55, 48, 48]} />
      </FresnelGlow>

      <ParticleRing
        radius={1.8}
        color="#3AE9E0"
        count={100}
        speed={0.15}
        spread={0.2}
        opacity={0.5}
        size={0.035}
      />

      <ParticleRing
        radius={2.8}
        color="#D8B36A"
        count={120}
        speed={-0.1}
        spread={0.3}
        opacity={0.5}
        size={0.035}
      />

      <mesh ref={relicSolidRef_4} position={[0, 0.3, 0]}>
        <icosahedronGeometry args={[0.45, 2]} />
        <meshStandardMaterial
          color={new THREE.Color('#D8B36A')}
          metalness={0.9}
          roughness={0.05}
          emissive={new THREE.Color('#D8B36A')}
          transparent
        />
      </mesh>
      <FresnelGlow
        ref={relicGlowRef_4}
        position={[0, 0.3, 0]}
        color="#D8B36A"
        intensity={1.2}
        scale={1.3}
      >
        <icosahedronGeometry args={[0.45, 2]} />
      </FresnelGlow>
      <mesh ref={relicWireRef_4} position={[0, 0.3, 0]} scale={1.5}>
        <icosahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial
          color={new THREE.Color('#3AE9E0')}
          transparent
          wireframe
          opacity={0.25}
        />
      </mesh>

      {glyphData_5.map((d, i) => (
        <Float key={i} speed={0.2} floatIntensity={0.1}>
          <mesh
            ref={(el) => (glyphRefs_5.current[i] = el)}
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
            />
          </mesh>
        </Float>
      ))}

      {towerData_6.map((b, i) => (
        <mesh
          key={i}
          ref={(el) => (towerRefs_6.current[i] = el)}
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
      {towerData_6
        .filter((t) => t.h > 0.4)
        .map((b, i) => (
          <mesh
            key={'w' + i}
            ref={(el) => (towerGlowRefs_6.current[i] = el)}
            position={[b.x, b.h * 0.8, b.z + 0.065]}
          >
            <planeGeometry args={[0.03, 0.015]} />
            <meshBasicMaterial color="#D8B36A" transparent />
          </mesh>
        ))}

      <points ref={galaxyRef_7}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={5000}
            array={galaxyPos_7.pos}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={5000}
            array={galaxyPos_7.col}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.022}
          vertexColors
          transparent
          opacity={0}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <mesh position={[0, 2, -1]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[0.03, 6, 4]} />
        <meshBasicMaterial
          color="#D8B36A"
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[1.5, 2, -1]} rotation={[0.25, 0.3, 0]}>
        <coneGeometry args={[0.03, 6, 4]} />
        <meshBasicMaterial
          color="#3AE9E0"
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[-1.5, 2, -1]} rotation={[0.25, -0.3, 0]}>
        <coneGeometry args={[0.03, 6, 4]} />
        <meshBasicMaterial
          color="#A33A4A"
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <points ref={dustRef_9}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={800}
            array={dustPos_9}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.012}
          color="#F7F4EE"
          transparent
          opacity={0.06}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </>
  );
}
