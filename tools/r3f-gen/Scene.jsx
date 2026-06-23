import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
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
  [0, 0.5, 6],
  [0, 0, 3],
];
const TGT = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];

export default function MyScene() {
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
  const dustRef_4 = useRef();

  // Memoized data

  const dustPos_4 = useMemo(() => {
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
      const _v = g(2.5, 1);
      sphereRef_1.current.material.opacity = _v * 0.7;
      sphereRef_1.current.material.emissiveIntensity = _v * 0.2;
      sphereRef_1.current.scale.setScalar(1 + Math.sin(t * 0.3) * 0.02 * _v);
    }

    if (dustRef_4.current)
      dustRef_4.current.material.opacity = 0.06 + g(3, 2) * 0.1;
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

      <points ref={dustRef_4}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={800}
            array={dustPos_4}
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
