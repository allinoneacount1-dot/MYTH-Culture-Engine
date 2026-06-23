import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
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
function fadeInOut(raw, center, width) { return Math.max(0, 1 - Math.abs(raw - center) / width); }

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

const FresnelGlow = React.forwardRef(({ children, color = COLORS.gold, intensity = 1, scale = 1.15, ...props }, ref) => {
  const uniforms = useMemo(() => ({
    c: { value: new THREE.Color(color) },
    i: { value: intensity },
    t: { value: 0 },
  }), [color, intensity]);
  useFrame((_, delta) => { uniforms.t.value += delta; });
  return (
    <mesh ref={ref} scale={scale} {...props}>
      {children}
      <shaderMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.BackSide}
        vertexShader={glowVert} fragmentShader={glowFrag} uniforms={uniforms} />
    </mesh>
  );
});

// Orbiting particle ring
function ParticleRing({ radius, color, count = 80, spread = 0.3, speed = 0.2 }) {
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
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * speed; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={pos} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color={color} transparent opacity={0.5} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

const EXP = 2;

// ====== MAIN ======
export default function Scene() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { progress } = useScrollStore();
  const { camera } = useThree();

  const torusRef = useRef();
  const sphereRef = useRef();
  const relicSolidRef = useRef();
  const relicWireRef = useRef();
  const relicGlowRef = useRef();
  const galaxyRef = useRef();
  const dustRef = useRef();
  const ambientRef = useRef();
  const keyLightRef = useRef();
  const rimLightRef = useRef();

  // Glyph, tower, and glow refs stored for useFrame manipulation
  const glyphRefs = useRef([]);
  const towerRefsArr = useRef([]);
  const glowRefsArr = useRef([]);
  // Tower procedural data
  const towerData = useMemo(() => {
    const d = [];
    for (let x = -4; x <= 4; x += 0.7)
      for (let z = -3; z <= 3; z += 0.7) {
        if (Math.random() > 0.5) continue;
        d.push({ x, z, h: 0.2 + Math.random() * 0.8, col: [COLORS.sapphire, COLORS.ivory, COLORS.gold][Math.floor(Math.random() * 3)] });
      }
    return d;
  }, []);

  // Glyph orbit data
  const glyphData = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      color: [COLORS.gold, COLORS.cyan, COLORS.ember][i % 3],
      speed: 0.12 + Math.random() * 0.06,
      radius: 1.6 + i * 0.25,
      yOff: (Math.random() - 0.5) * 0.8,
      phase: i * 1.05,
    })), []);

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
      camera.lookAt(lerp(TGT[ci][0], TGT[ni][0], ease), lerp(TGT[ci][1], TGT[ni][1], ease), lerp(TGT[ci][2], TGT[ni][2], ease));
    }

    const t = state.clock.elapsedTime;
    const g = (c, w) => fadeInOut(raw, c, w);

    if (torusRef.current) {
      if (!prefersReduced) { torusRef.current.rotation.x += delta * 0.08; torusRef.current.rotation.y += delta * 0.12; }
      const v = g(0.3, 0.8);
      torusRef.current.material.opacity = v * 0.25;
      torusRef.current.material.emissiveIntensity = v * 0.08;
    }

    if (sphereRef.current) {
      if (!prefersReduced) sphereRef.current.rotation.y += delta * 0.04;
      const v = g(2.5, 1);
      sphereRef.current.material.opacity = v * 0.7;
      sphereRef.current.material.emissiveIntensity = v * 0.2;
      sphereRef.current.scale.setScalar(1 + Math.sin(t * 0.3) * 0.02 * v);
    }

    if (relicSolidRef.current) {
      if (!prefersReduced) { relicSolidRef.current.rotation.y += delta * 0.18; relicSolidRef.current.rotation.x = Math.sin(t * 0.3) * 0.08; }
      const v = g(4.5, 1.5);
      relicSolidRef.current.material.opacity = v;
      relicSolidRef.current.material.emissiveIntensity = v * 0.3;
      relicSolidRef.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.03 * v);
    }
    if (relicWireRef.current) {
      if (!prefersReduced) relicWireRef.current.rotation.y -= delta * 0.1;
      relicWireRef.current.material.opacity = g(4.5, 1.5) * 0.25;
    }
    if (relicGlowRef.current) {
      relicGlowRef.current.material.uniforms.i.value = g(4.5, 1.5) * 1.2;
    }

    // Orbiting glyphs (Ch4-6)
    glyphRefs.current.forEach((m, i) => {
      if (!m) return;
      const v = g(4.8, 1.8);
      m.material.opacity = v * 0.7;
      m.material.emissiveIntensity = v * 0.3;
      if (!prefersReduced) {
        const a = t * glyphData[i].speed + glyphData[i].phase;
        m.position.x = Math.cos(a) * glyphData[i].radius;
        m.position.z = Math.sin(a) * glyphData[i].radius;
        m.position.y = glyphData[i].yOff + Math.sin(t * 0.5 + glyphData[i].phase) * 0.1 * v;
        m.rotation.y += delta * 0.3;
      }
    });

    // Towers (Ch3-5)
    const tv = g(3.8, 1.2);
    towerRefsArr.current.forEach((m) => { if (m) m.material.opacity = tv * 0.5; });
    glowRefsArr.current.forEach((m) => {
      if (m) m.material.opacity = tv * (0.3 + Math.sin(t * EXP + m.position.x) * 0.15);
    });

    if (galaxyRef.current) {
      const v = g(5.5, 1);
      galaxyRef.current.material.opacity = v * 0.7;
      galaxyRef.current.rotation.z = v * 0.15;
    }

    if (dustRef.current) dustRef.current.material.opacity = 0.06 + g(3, 2) * 0.1;

    if (state.scene.fog) state.scene.fog.density = 0.015 + raw * 0.006;

    if (ambientRef.current) ambientRef.current.intensity = 0.05 + raw * 0.015;
    if (keyLightRef.current) {
      keyLightRef.current.intensity = 0.12 + (!prefersReduced ? Math.sin(t * 0.12) * 0.04 : 0) + raw * 0.02;
      keyLightRef.current.position.x = 5 + Math.sin(t * 0.1) * 2;
    }
    if (rimLightRef.current) rimLightRef.current.intensity = 0.25 + (!prefersReduced ? Math.sin(t * 0.18 + 1) * 0.08 : 0) + raw * 0.025;
  });

  const dustPos = useMemo(() => {
    const p = new Float32Array(800 * 3);
    for (let i = 0; i < 800; i++) { p[i * 3] = (Math.random() - 0.5) * 30; p[i * 3 + 1] = (Math.random() - 0.5) * 15; p[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5; }
    return p;
  }, []);

  const galaxyPos = useMemo(() => {
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
      c[i * 3] = b * (0.8 + w * 0.2); c[i * 3 + 1] = b * (0.5 + w * 0.3); c[i * 3 + 2] = b * (0.3 + (1 - w) * 0.5);
    }
    return { pos: p, col: c };
  }, []);

  return (
    <>
      <EffectComposer>
        <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} intensity={0.5} mipmapBlur />
      </EffectComposer>

      <fogExp2 attach="fog" args={['#05070B', 0.015]} />
      <ambientLight ref={ambientRef} intensity={0.05} color="#F7F4EE" />
      <directionalLight ref={keyLightRef} position={[5, 10, 5]} intensity={0.12} color={COLORS.gold} />
      <directionalLight ref={rimLightRef} position={[-5, 3, -5]} intensity={0.25} color={COLORS.cyan} />
      <directionalLight position={[0, -3, 5]} intensity={0.08} color={COLORS.ember} />

      <Stars radius={50} depth={60} count={3000} factor={5} saturation={0.3} fade speed={0.2} />

      {/* Ambient dust */}
      <points ref={dustRef}>
        <bufferGeometry><bufferAttribute attach="attributes-position" count={800} array={dustPos} itemSize={3} /></bufferGeometry>
        <pointsMaterial size={0.012} color={COLORS.ivory} transparent opacity={0.06} sizeAttenuation depthWrite={false} />
      </points>

      {/* ——— TORUS KNOT ——— */}
      <Float speed={0.4} rotationIntensity={0.08} floatIntensity={0.2}>
        <mesh ref={torusRef} position={[0, 0.5, -3]}>
          <torusKnotGeometry args={[1.2, 0.4, 180, 24]} />
          <meshStandardMaterial color={COLORS.gold} metalness={0.85} roughness={0.08} emissive={COLORS.gold} transparent />
        </mesh>
      </Float>

      {/* ——— SPHERE ——— */}
      <mesh ref={sphereRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.55, 48, 48]} />
        <meshStandardMaterial color={COLORS.gold} metalness={0.9} roughness={0.05} emissive={COLORS.gold} transparent />
      </mesh>
      <FresnelGlow position={[0, 0, 0]} intensity={0.8}><sphereGeometry args={[0.55, 48, 48]} /></FresnelGlow>

      <ParticleRing radius={1.8} color={COLORS.cyan} speed={0.15} spread={0.2} count={100} />
      <ParticleRing radius={2.8} color={COLORS.gold} speed={-0.1} spread={0.3} count={120} />

      {/* ——— RELIC ——— */}
      <mesh ref={relicSolidRef} position={[0, 0.3, 0]}>
        <icosahedronGeometry args={[0.45, 2]} />
        <meshStandardMaterial color={COLORS.gold} metalness={0.9} roughness={0.05} emissive={COLORS.gold} transparent />
      </mesh>
      <FresnelGlow ref={relicGlowRef} position={[0, 0.3, 0]} color={COLORS.gold} intensity={1.2} scale={1.3}>
        <icosahedronGeometry args={[0.45, 2]} />
      </FresnelGlow>
      <mesh ref={relicWireRef} position={[0, 0.3, 0]} scale={1.5}>
        <icosahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial color={COLORS.cyan} metalness={0.5} roughness={0.3} transparent wireframe />
      </mesh>

      {/* ——— GLYPHS ——— */}
      {glyphData.map((d, i) => (
        <Float key={i} speed={0.2} floatIntensity={0.1}>
          <mesh ref={el => glyphRefs.current[i] = el} position={[Math.cos(d.phase) * d.radius, d.yOff, Math.sin(d.phase) * d.radius]}>
            <octahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial color={d.color} emissive={d.color} transparent metalness={0.7} roughness={0.2} />
          </mesh>
        </Float>
      ))}

      {/* ——— LIGHT SHAFTS ——— */}
      <mesh position={[0, 2, -1]} rotation={[0.2, 0, 0]}><coneGeometry args={[0.03, 6, 4]} /><meshBasicMaterial color={COLORS.gold} transparent opacity={0.05} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      <mesh position={[1.5, 2, -1]} rotation={[0.25, 0.3, 0]}><coneGeometry args={[0.03, 6, 4]} /><meshBasicMaterial color={COLORS.cyan} transparent opacity={0.04} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      <mesh position={[-1.5, 2, -1]} rotation={[0.25, -0.3, 0]}><coneGeometry args={[0.03, 6, 4]} /><meshBasicMaterial color={COLORS.ember} transparent opacity={0.04} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>

      {/* ——— CITY TOWERS ——— */}
      {towerData.map((b, i) => (
        <mesh key={i} ref={el => towerRefsArr.current[i] = el} position={[b.x, b.h / 2, b.z]}>
          <boxGeometry args={[0.12, b.h, 0.12]} />
          <meshStandardMaterial color={b.col} metalness={0.6} roughness={0.3} transparent />
        </mesh>
      ))}

      {/* Tower window glows */}
      {towerData.filter(t => t.h > 0.4).map((b, i) => (
        <mesh key={'w' + i} ref={el => glowRefsArr.current[i] = el} position={[b.x, b.h * 0.8, b.z + 0.065]}>
          <planeGeometry args={[0.03, 0.015]} />
          <meshBasicMaterial color={COLORS.gold} transparent />
        </mesh>
      ))}

      {/* ——— GALAXY ——— */}
      <points ref={galaxyRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={5000} array={galaxyPos.pos} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={5000} array={galaxyPos.col} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.022} vertexColors transparent opacity={0} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </>
  );
}
