import { toPropStr, wrapInFloat, materialComponent, materialProps, visibilityCode, fadeVar, animationCode } from './utils.js';

// Each writer returns { jsx: string, useFrame: string, refs: string[], comps: string[] }
// refs = list of ref variable names to declare
// comps = list of shared component definitions needed

export function writeObject(obj, idx) {
  const fn = WRITERS[obj.type];
  if (!fn) return { jsx: '', useFrame: '', refs: [], comps: [] };
  return fn(obj, idx);
}

const WRITERS = {
  torusKnot,
  sphere,
  relic,
  particleRing,
  galaxy,
  glyphs,
  towers,
  lightShaft,
  dust,
  stars,
  reflectiveFloor,
  group,
};

function matEl(m, indent = 0) {
  const comp = materialComponent(m);
  const props = materialProps(m);
  const pad = '  '.repeat(indent);
  if (indent) return `${pad}<${comp} ${props} />`;
  return `<${comp} ${props} />`;
}

function wrapVisibility(obj, innerJsx) {
  if (!obj.visibility) return innerJsx;
  const v = obj.visibility;
  const refName = `ref_${obj.type}_${v.center}`.replace(/\./g, '_');
  const visCode = visibilityCode(v.center, v.width);
  const frameCode = `
    if (${refName}.current) {
      const _v = g(${v.center}, ${v.width});
      ${refName}.current.material.opacity = _v;
      ${refName}.current.material.emissiveIntensity = _v * 0.3;
    }`;
  const jsx = innerJsx.replace(/<mesh/, `<mesh ref={${refName}}`).replace(/<mesh /, `<mesh ref={${refName}} `);
  return { jsx, frameCode, refName };
}

function torusKnot(obj, idx) {
  const args = obj.args || [1.2, 0.4, 180, 24];
  const pos = obj.position || [0, 0.5, -3];
  const mat = materialProps(obj.material || { color: '#D8B36A', metalness: 0.85, roughness: 0.08, emissive: '#D8B36A' });
  const anim = obj.animation || {};
  const hasFloat = anim.float;
  const refName = `torusRef_${idx}`;

  let inner = `<mesh ref={${refName}} position={[${pos.join(', ')}]}>
  <torusKnotGeometry args={[${args.join(', ')}]} />
  ${matEl(obj.material || { color: '#D8B36A', metalness: 0.85, roughness: 0.08, emissive: '#D8B36A' }, 1)}
</mesh>`;

  if (hasFloat) {
    const fs = anim.floatSpeed || 0.4;
    const ri = anim.rotationIntensity || 0.08;
    const fi = anim.floatIntensity || 0.2;
    inner = `<Float speed={${fs}} rotationIntensity={${ri}} floatIntensity={${fi}}>\n${indent(inner, 1)}\n</Float>`;
  }

  let useFrame = '';
  if (anim.rotateY || anim.rotateX) {
    useFrame = `
    if (${refName}.current) {
      ${anim.rotateX ? `${refName}.current.rotation.x += delta * ${anim.rotateX};` : ''}
      ${anim.rotateY ? `${refName}.current.rotation.y += delta * ${anim.rotateY};` : ''}
      ${obj.visibility ? `${refName}.current.material.opacity = g(${obj.visibility.center}, ${obj.visibility.width}) * 0.25;` : ''}
      ${obj.visibility ? `${refName}.current.material.emissiveIntensity = g(${obj.visibility.center}, ${obj.visibility.width}) * 0.08;` : ''}
    }`;
  }

  return { jsx: inner, useFrame, refs: [refName], comps: hasFloat ? ['Float'] : [] };
}

function sphere(obj, idx) {
  const args = obj.args || [0.55, 48, 48];
  const pos = obj.position || [0, 0, 0];
  const mat = materialProps(obj.material || { color: '#D8B36A', metalness: 0.9, roughness: 0.05, emissive: '#D8B36A' });
  const glow = obj.glow || null;
  const anim = obj.animation || {};
  const refName = `sphereRef_${idx}`;
  const glowRefName = glow ? `sphereGlowRef_${idx}` : null;

  let inner = `<mesh ref={${refName}} position={[${pos.join(', ')}]}>
  <sphereGeometry args={[${args.join(', ')}]} />
  ${matEl(obj.material || { color: '#D8B36A', metalness: 0.9, roughness: 0.05, emissive: '#D8B36A' }, 1)}
</mesh>`;

  let glowJsx = '';
  if (glow) {
    glowJsx = `\n<FresnelGlow ref={${glowRefName}} position={[${pos.join(', ')}]} color="${glow.color || '#D8B36A'}" intensity={${glow.intensity || 0.8}} scale={${glow.scale || 1.15}}>
  <sphereGeometry args={[${args.join(', ')}]} />
</FresnelGlow>`;
  }

  let useFrame = '';
  if (anim.breathe || anim.rotateY || obj.visibility) {
    useFrame = `
    if (${refName}.current) {
      ${anim.rotateY ? `${refName}.current.rotation.y += delta * ${anim.rotateY};` : ''}
      ${obj.visibility ? `const _v = g(${obj.visibility.center}, ${obj.visibility.width});` : ''}
      ${obj.visibility ? `${refName}.current.material.opacity = _v * 0.7;` : ''}
      ${obj.visibility ? `${refName}.current.material.emissiveIntensity = _v * 0.2;` : ''}
      ${anim.breathe ? `${refName}.current.scale.setScalar(1 + Math.sin(t * 0.3) * 0.02${obj.visibility ? ' * _v' : ''});` : ''}
    }`;
  }

  return { jsx: inner + glowJsx, useFrame, refs: [refName, glowRefName].filter(Boolean), comps: [] };
}

function relic(obj, idx) {
  const args = obj.args || [0.45, 2];
  const pos = obj.position || [0, 0.3, 0];
  const solidMat = materialProps(obj.solid?.material || { color: '#D8B36A', metalness: 0.9, roughness: 0.05, emissive: '#D8B36A' });
  const wireMat = materialProps(obj.wireframe?.material || { color: '#3AE9E0', metalness: 0.5, roughness: 0.3 });
  const wireOpacity = obj.wireframe?.opacity ?? 0.25;
  const glow = obj.glow || { color: '#D8B36A', intensity: 1.2, scale: 1.3 };
  const anim = obj.animation || {};
  const v = obj.visibility || { center: 4.5, width: 1.5 };

  const solidRef = `relicSolidRef_${idx}`;
  const wireRef = `relicWireRef_${idx}`;
  const glowRef = `relicGlowRef_${idx}`;

  const jsx = `
<mesh ref={${solidRef}} position={[${pos.join(', ')}]}>
  <icosahedronGeometry args={[${args.join(', ')}]} />
  ${matEl(obj.solid?.material || { color: '#D8B36A', metalness: 0.9, roughness: 0.05, emissive: '#D8B36A' }, 1)}
</mesh>
<FresnelGlow ref={${glowRef}} position={[${pos.join(', ')}]} color="${glow.color || '#D8B36A'}" intensity={${glow.intensity || 1.2}} scale={${glow.scale || 1.3}}>
  <icosahedronGeometry args={[${args.join(', ')}]} />
</FresnelGlow>
<mesh ref={${wireRef}} position={[${pos.join(', ')}]} scale={${obj.wireframe?.scale || 1.5}}>
  <icosahedronGeometry args={[${args[0]}, 0]} />
  <meshStandardMaterial ${wireMat} transparent wireframe opacity={${wireOpacity}} />
</mesh>`;

  const useFrame = `
    if (${solidRef}.current) {
      ${anim.rotateY ? `${solidRef}.current.rotation.y += delta * ${anim.rotateY};` : ''}
      ${anim.breathe ? `${solidRef}.current.rotation.x = Math.sin(t * 0.3) * 0.08;` : ''}
      const _v = g(${v.center}, ${v.width});
      ${solidRef}.current.material.opacity = _v;
      ${solidRef}.current.material.emissiveIntensity = _v * 0.3;
      ${anim.breathe ? `${solidRef}.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.03 * _v);` : ''}
    }
    if (${wireRef}.current) {
      ${anim.rotateY ? `${wireRef}.current.rotation.y -= delta * ${anim.rotateY * 0.5};` : ''}
      ${wireRef}.current.material.opacity = g(${v.center}, ${v.width}) * ${wireOpacity};
    }
    if (${glowRef}.current) {
      ${glowRef}.current.material.uniforms.i.value = g(${v.center}, ${v.width}) * ${glow.intensity || 1.2};
    }`;

  return { jsx, useFrame, refs: [solidRef, wireRef, glowRef], comps: [] };
}

function particleRing(obj, idx) {
  const radius = obj.radius || 1.8;
  const count = obj.count || 80;
  const color = obj.color || '#3AE9E0';
  const speed = obj.speed ?? 0.15;
  const spread = obj.spread ?? 0.3;
  const opacity = obj.opacity ?? 0.5;
  const size = obj.size ?? 0.035;

  const jsx = `<ParticleRing radius={${radius}} color="${color}" count={${count}} speed={${speed}} spread={${spread}} opacity={${opacity}} size={${size}} />`;

  return { jsx, useFrame: '', refs: [], comps: ['ParticleRing'] };
}

function galaxy(obj, idx) {
  const count = obj.count || 5000;
  const arms = obj.arms || 3;
  const size = obj.size || 0.022;
  const v = obj.visibility || { center: 5.5, width: 1 };
  const refName = `galaxyRef_${idx}`;

  const jsx = `
<points ref={${refName}}>
  <bufferGeometry>
    <bufferAttribute attach="attributes-position" count={${count}} array={galaxyPos_${idx}.pos} itemSize={3} />
    <bufferAttribute attach="attributes-color" count={${count}} array={galaxyPos_${idx}.col} itemSize={3} />
  </bufferGeometry>
  <pointsMaterial size={${size}} vertexColors transparent opacity={0} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
</points>`;

  const galaxyDataVar = `const galaxyPos_${idx} = useMemo(() => {
    const count = ${count};
    const p = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const arm = Math.floor(Math.random() * ${arms});
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
  }, []);`;

  const useFrame = `
    if (${refName}.current) {
      const _v = g(${v.center}, ${v.width});
      ${refName}.current.material.opacity = _v * 0.7;
      ${refName}.current.rotation.z = _v * 0.15;
    }`;

  return { jsx, useFrame, refs: [refName], comps: [], dataInit: galaxyDataVar };
}

function glyphs(obj, idx) {
  const count = obj.count || 6;
  const colors = obj.colors || ['#D8B36A', '#3AE9E0', '#A33A4A'];
  const orbitRadius = obj.orbit?.radius || [1.6, 3.1];
  const orbitSpeed = obj.orbit?.speed || 0.12;
  const v = obj.visibility || { center: 4.8, width: 1.8 };
  const refName = `glyphRefs_${idx}`;
  const dataName = `glyphData_${idx}`;

  const glyphDataVar = `const ${dataName} = useMemo(() =>
    Array.from({ length: ${count} }, (_, i) => ({
      color: [${colors.map(c => `'${c}'`).join(', ')}][i % ${colors.length}],
      speed: ${orbitSpeed} + Math.random() * 0.06,
      radius: ${orbitRadius[0]} + i * ${((orbitRadius[1] - orbitRadius[0]) / count).toFixed(3)},
      yOff: (Math.random() - 0.5) * 0.8,
      phase: i * 1.05,
    })), []);`;

  const useFrame = `
    ${refName}.current.forEach((m, i) => {
      if (!m) return;
      const _v = g(${v.center}, ${v.width});
      m.material.opacity = _v * 0.7;
      m.material.emissiveIntensity = _v * 0.3;
      if (!prefersReduced) {
        const a = t * ${dataName}[i].speed + ${dataName}[i].phase;
        m.position.x = Math.cos(a) * ${dataName}[i].radius;
        m.position.z = Math.sin(a) * ${dataName}[i].radius;
        m.position.y = ${dataName}[i].yOff + Math.sin(t * 0.5 + ${dataName}[i].phase) * 0.1 * _v;
        m.rotation.y += delta * 0.3;
      }
    });`;

  const jsx = `
{${dataName}.map((d, i) => (
  <Float key={i} speed={0.2} floatIntensity={0.1}>
    <mesh ref={el => ${refName}.current[i] = el} position={[Math.cos(d.phase) * d.radius, d.yOff, Math.sin(d.phase) * d.radius]}>
      <octahedronGeometry args={[0.12, 0]} />
      <meshStandardMaterial color={d.color} emissive={d.color} transparent metalness={0.7} roughness={0.2} envMapIntensity={0.5} />
    </mesh>
  </Float>
))}`;

  return { jsx, useFrame, refs: [refName], comps: ['Float'], dataInit: glyphDataVar };
}

function towers(obj, idx) {
  const area = obj.area || { x: [-4, 4, 0.7], z: [-3, 3, 0.7] };
  const density = obj.density ?? 0.5;
  const height = obj.height || [0.2, 1.0];
  const colors = obj.colors || ['#10213A', '#F7F4EE', '#D8B36A'];
  const v = obj.visibility || { center: 3.8, width: 1.2 };
  const refName = `towerRefs_${idx}`;
  const glowRefName = `towerGlowRefs_${idx}`;
  const dataName = `towerData_${idx}`;

  const towerDataVar = `const ${dataName} = useMemo(() => {
    const d = [];
    for (let x = ${area.x[0]}; x <= ${area.x[1]}; x += ${area.x[2]})
      for (let z = ${area.z[0]}; z <= ${area.z[1]}; z += ${area.z[2]}) {
        if (Math.random() > ${density}) continue;
        d.push({ x, z, h: ${height[0]} + Math.random() * ${height[1] - height[0]}, col: [${colors.map(c => `'${c}'`).join(', ')}][Math.floor(Math.random() * ${colors.length})] });
      }
    return d;
  }, []);`;

  const useFrame = `
    const _tv = g(${v.center}, ${v.width});
    ${refName}.current.forEach((m) => { if (m) m.material.opacity = _tv * 0.5; });
    ${glowRefName}.current.forEach((m) => {
      if (m) m.material.opacity = _tv * (0.3 + Math.sin(t * 2 + m.position.x) * 0.15);
    });`;

  const jsx = `
{${dataName}.map((b, i) => (
  <mesh key={i} ref={el => ${refName}.current[i] = el} position={[b.x, b.h / 2, b.z]}>
    <boxGeometry args={[0.12, b.h, 0.12]} />
    <meshStandardMaterial color={b.col} metalness={0.6} roughness={0.3} transparent />
  </mesh>
))}
{${dataName}.filter(t => t.h > 0.4).map((b, i) => (
  <mesh key={'w' + i} ref={el => ${glowRefName}.current[i] = el} position={[b.x, b.h * 0.8, b.z + 0.065]}>
    <planeGeometry args={[0.03, 0.015]} />
    <meshBasicMaterial color="${colors[2] || '#D8B36A'}" transparent />
  </mesh>
))}`;

  return { jsx, useFrame, refs: [refName, glowRefName], comps: [], dataInit: towerDataVar };
}

function lightShaft(obj, idx) {
  const count = obj.count || 3;
  const colors = obj.colors || ['#D8B36A', '#3AE9E0', '#A33A4A'];
  const positions = obj.positions || [[0, 2, -1], [1.5, 2, -1], [-1.5, 2, -1]];
  const rotations = obj.rotations || [[0.2, 0, 0], [0.25, 0.3, 0], [0.25, -0.3, 0]];
  const opacity = obj.opacity ?? 0.05;

  const shafts = [];
  for (let i = 0; i < count; i++) {
    const col = colors[i % colors.length];
    const pos = positions[i] || [0, 2, -1];
    const rot = rotations[i] || [0.2, 0, 0];
    shafts.push(`<mesh position={[${pos.join(', ')}]} rotation={[${rot.join(', ')}]}><coneGeometry args={[0.03, 6, 4]} /><meshBasicMaterial color="${col}" transparent opacity={${opacity}} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>`);
  }

  return { jsx: `\n${shafts.join('\n')}`, useFrame: '', refs: [], comps: [] };
}

function dust(obj, idx) {
  const count = obj.count || 800;
  const size = obj.size || 0.012;
  const area = obj.area || { x: 30, y: 15, z: 35 };
  const color = obj.color || '#F7F4EE';
  const refName = `dustRef_${idx}`;

  const dustDataVar = `const dustPos_${idx} = useMemo(() => {
    const p = new Float32Array(${count} * 3);
    for (let i = 0; i < ${count}; i++) { p[i * 3] = (Math.random() - 0.5) * ${area.x}; p[i * 3 + 1] = (Math.random() - 0.5) * ${area.y}; p[i * 3 + 2] = (Math.random() - 0.5) * ${area.z} - 5; }
    return p;
  }, []);`;

  const jsx = `<points ref={${refName}}>
  <bufferGeometry><bufferAttribute attach="attributes-position" count={${count}} array={dustPos_${idx}} itemSize={3} /></bufferGeometry>
  <pointsMaterial size={${size}} color="${color}" transparent opacity={0.06} sizeAttenuation depthWrite={false} />
</points>`;

  const useFrame = `
    if (${refName}.current) ${refName}.current.material.opacity = 0.06 + g(3, 2) * 0.1;`;

  return { jsx, useFrame, refs: [refName], comps: [], dataInit: dustDataVar };
}

function stars(obj) {
  if (obj === false) return { jsx: '', useFrame: '', refs: [], comps: [] };
  const count = obj.count || 3000;
  const radius = obj.radius || 50;
  const depth = obj.depth || 60;
  const factor = obj.factor || 5;
  return { jsx: `<Stars radius={${radius}} depth={${depth}} count={${count}} factor={${factor}} saturation={0.3} fade speed={0.2} />`, useFrame: '', refs: [], comps: ['Stars'] };
}

function group(obj, idx) {
  const children = obj.children || [];
  let combined = { jsx: '', useFrame: '', refs: [], comps: [], dataInit: '' };
  // recursively process children
  combined.jsx = `<group position={[${(obj.position || [0,0,0]).join(', ')}]}>`;
  for (const child of children) {
    const res = writeObject(child, `${idx}_${child.type}`);
    combined.jsx += `\n${indent(res.jsx, 1)}`;
    if (res.useFrame) combined.useFrame += res.useFrame;
    if (res.refs) combined.refs.push(...res.refs);
    if (res.comps) combined.comps.push(...res.comps);
    if (res.dataInit) combined.dataInit += res.dataInit + '\n';
  }
  combined.jsx += '\n</group>';
  return combined;
}

function reflectiveFloor(obj, idx) {
  const args = obj.args || [20, 20];
  const pos = obj.position || [0, -0.5, 0];
  const rot = obj.rotation || [-Math.PI / 2, 0, 0];
  const mirror = obj.mirror !== false;
  const blur = obj.blur || [512, 512];
  const mixBlur = obj.mixBlur ?? 0.5;
  const mixStrength = obj.mixStrength ?? 0.8;
  const resolution = obj.resolution || 512;
  const depthScale = obj.depthScale ?? 1;
  const minDepthThreshold = obj.minDepthThreshold ?? 0.3;
  const maxDepthThreshold = obj.maxDepthThreshold ?? 1.3;
  const color = obj.color || '#05070B';
  const metalness = obj.metalness ?? 0.9;
  const roughness = obj.roughness ?? 0.1;
  const refName = `floorRef_${idx}`;

  const jsx = `
<mesh ref={${refName}} position={[${pos.join(', ')}]} rotation={[${rot.join(', ')}]}>
  <planeGeometry args={[${args.join(', ')}]} />
  <MeshReflectorMaterial
    blur={[${blur.join(', ')}]}
    resolution={${resolution}}
    mixBlur={${mixBlur}}
    mixStrength={${mixStrength}}
    depthScale={${depthScale}}
    minDepthThreshold={${minDepthThreshold}}
    maxDepthThreshold={${maxDepthThreshold}}
    color="${color}"
    metalness={${metalness}}
    roughness={${roughness}}
    reflectorOffset={0.2}
    mirror={${mirror ? 'true' : 'false'}}
  />
</mesh>`;

  return { jsx, useFrame: '', refs: [refName], comps: ['MeshReflectorMaterial'] };
}

function indent(str, level) {
  const pad = '  '.repeat(level);
  return str.split('\n').map((l, i) => l.trim() ? pad + l.trimEnd() : '').join('\n');
}
