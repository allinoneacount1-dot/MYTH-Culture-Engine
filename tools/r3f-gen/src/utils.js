export function toPropStr(val) {
  if (typeof val === 'string') return `"${val}"`;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (Array.isArray(val)) return `{${val.map(v => toPropStr(v)).join(', ')}}`;
  return String(val);
}

export function materialComponent(m) {
  return m?.type === 'physical' ? 'meshPhysicalMaterial' : 'meshStandardMaterial';
}

export function materialProps(m) {
  const parts = [];
  if (m.color) parts.push(`color={new THREE.Color("${m.color}")}`);
  if (m.metalness != null) parts.push(`metalness={${m.metalness}}`);
  if (m.roughness != null) parts.push(`roughness={${m.roughness}}`);
  if (m.emissive) parts.push(`emissive={new THREE.Color("${m.emissive}")}`);
  if (m.emissiveIntensity != null) parts.push(`emissiveIntensity={${m.emissiveIntensity}}`);
  if (m.opacity != null) parts.push(`opacity={${m.opacity}}`);
  if (m.transparent === true || m.opacity != null) parts.push('transparent');
  if (m.wireframe) parts.push('wireframe');
  if (m.side != null) parts.push(`side={THREE.${m.side}}`);
  // MeshPhysicalMaterial extras
  if (m.type === 'physical') {
    if (m.clearcoat != null) parts.push(`clearcoat={${m.clearcoat}}`);
    if (m.clearcoatRoughness != null) parts.push(`clearcoatRoughness={${m.clearcoatRoughness}}`);
    if (m.sheen != null) parts.push(`sheen={${m.sheen}}`);
    if (m.sheenColor) parts.push(`sheenColor={new THREE.Color("${m.sheenColor}")}`);
    if (m.anisotropy != null) parts.push(`anisotropy={${m.anisotropy}}`);
    if (m.anisotropyRotation != null) parts.push(`anisotropyRotation={${m.anisotropyRotation}}`);
    if (m.envMapIntensity != null) parts.push(`envMapIntensity={${m.envMapIntensity}}`);
    if (m.ior != null) parts.push(`ior={${m.ior}}`);
    if (m.transmission != null) parts.push(`transmission={${m.transmission}}`);
    if (m.thickness != null) parts.push(`thickness={${m.thickness}}`);
  }
  return parts.join(' ');
}

export function wrapInFloat(jsx, anim) {
  if (!anim || !anim.float) return jsx;
  const speed = anim.floatSpeed || 0.4;
  const ri = anim.rotationIntensity || 0.08;
  const fi = anim.floatIntensity || 0.2;
  return `<Float speed={${speed}} rotationIntensity={${ri}} floatIntensity={${fi}}>\n${indent(jsx, 1)}\n</Float>`;
}

export function visibilityCode(center, width) {
  return `g(${center}, ${width})`;
}

export function fadeVar(obj, prefix) {
  if (!obj.visibility) return { varName: null, code: '' };
  const vn = `_vis_${prefix}`.replace(/\./g, '_');
  return {
    varName: vn,
    code: `const ${vn} = g(${obj.visibility.center}, ${obj.visibility.width});`
  };
}

export function animationCode(anim, refName, prefix = '') {
  if (!anim) return '';
  const lines = [];
  if (anim.rotateY) lines.push(`${refName}.current.rotation.y${prefix}= delta * ${anim.rotateY};`);
  if (anim.rotateX) lines.push(`${refName}.current.rotation.x${prefix}= delta * ${anim.rotateX};`);
  if (anim.breathe) lines.push(`${refName}.current.scale.setScalar(1 + Math.sin(t * 0.3) * 0.02${prefix});`);
  return lines.map(l => `      ${l}`).join('\n');
}

export function indent(str, level) {
  const pad = '  '.repeat(level);
  return str.split('\n').map((l, i) => l.trim() ? pad + l.trimEnd() : '').join('\n');
}
