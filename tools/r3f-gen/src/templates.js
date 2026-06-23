// Template fragments used by the code generator

export function buildImports(needs) {
  const drei = [];
  if (needs.float) drei.push('Float');
  if (needs.stars) drei.push('Stars');
  if (needs.reflector) drei.push('MeshReflectorMaterial');
  if (needs.environment) drei.push('Environment');
  if (needs.contactShadows) drei.push('ContactShadows');
  const dreiStr = drei.length ? `\nimport { ${[...new Set(drei)].join(', ')} } from '@react-three/drei';` : '';

  const pp = [];
  if (needs.bloom) pp.push('EffectComposer', 'Bloom');
  if (needs.vignette) pp.push('Vignette');
  const ppStr = pp.length ? `\nimport { ${pp.join(', ')} } from '@react-three/postprocessing';` : '';

  return `import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';${dreiStr}${ppStr}
import * as THREE from 'three';`;
}

export const FRESNEL_SHADER = `
// Fresnel glow shader
const glowVert = \`varying vec3 vN; varying vec3 vW; void main(){
  vec4 wp=modelMatrix*vec4(position,1.); vN=normalize(normalMatrix*normal); vW=wp.xyz;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}\`;
const glowFrag = \`uniform vec3 c; uniform float i; uniform float t;
varying vec3 vN; varying vec3 vW;
void main(){
  vec3 v=normalize(cameraPosition-vW); float rim=1.-max(0.,dot(v,vN));
  rim=pow(rim,2.5); float p=.85+.15*sin(t*.6);
  gl_FragColor=vec4(c,rim*i*p);
}\`;

const FresnelGlow = React.forwardRef(({ children, color = '#D8B36A', intensity = 1, scale = 1.15, ...props }, ref) => {
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
});`;

export const PARTICLE_RING = `
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
}`;

export const UTILS = `
function lerp(a, b, t) { return a + (b - a) * t; }
function fadeInOut(raw, center, width) { return Math.max(0, 1 - Math.abs(raw - center) / width); }`;

export const PREFERS_REDUCED = `const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;`;

export const CAMERA_VARS = `const S = CAM.length - 1;`;

export function cameraKeyframes(keyframes) {
  const poses = keyframes.map(k => `  [${k.pos.join(', ')}]`).join(',\n');
  const tgts = keyframes.map(k => `  [${k.target.join(', ')}]`).join(',\n');
  return `const CAM = [\n${poses}\n];\nconst TGT = [\n${tgts}\n];`;
}

export function useFrameBlock(objectFrames, hasCamera, hasFog, hasLights) {
  let code = `  useFrame((state, delta) => {
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
    const g = (c, w) => fadeInOut(raw, c, w);`;

  if (objectFrames) code += `\n${objectFrames}`;

  if (hasFog) code += `
    if (state.scene.fog) state.scene.fog.density = 0.015 + raw * 0.006;`;

  if (hasLights) code += `
    if (ambientRef.current) ambientRef.current.intensity = 0.05 + raw * 0.015;
    if (keyLightRef.current) {
      keyLightRef.current.intensity = 0.12 + (!prefersReduced ? Math.sin(t * 0.12) * 0.04 : 0) + raw * 0.02;
      keyLightRef.current.position.x = 5 + Math.sin(t * 0.1) * 2;
    }
    if (rimLightRef.current) rimLightRef.current.intensity = 0.25 + (!prefersReduced ? Math.sin(t * 0.18 + 1) * 0.08 : 0) + raw * 0.025;`;

  code += `
  });`;

  return code;
}
