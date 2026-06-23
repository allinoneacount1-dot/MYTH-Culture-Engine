import { writeObject } from './writers.js';
import {
  buildImports, FRESNEL_SHADER, PARTICLE_RING, UTILS,
  PREFERS_REDUCED, CAMERA_VARS, cameraKeyframes, useFrameBlock
} from './templates.js';

export function generate(config) {
  const useRefs = [];
  const useMemoBlocks = [];
  const usedComps = new Set();

  const objectJsxs = [];
  const objectFrames = [];

  config.objects.forEach((obj, i) => {
    const res = writeObject(obj, i);
    if (res.jsx) objectJsxs.push(res.jsx);
    if (res.useFrame) objectFrames.push(res.useFrame);
    if (res.refs) useRefs.push(...res.refs.map(r => ({ ref: r, type: 'ref' })));
    if (res.comps) res.comps.forEach(c => usedComps.add(c));
    if (res.dataInit) useMemoBlocks.push(res.dataInit);
  });

  const hasFog = !!config.fog;
  const hasBloom = !!config.bloom;
  const hasVignette = !!config.vignette;
  const hasHemi = !!config.hemisphere;
  const hasEnv = !!config.environment;
  const hasToneMapping = !!config.toneMapping;
  const hasSoftShadows = !!config.softShadows;
  const needsFresnel = config.objects.some(o => o.type === 'sphere' && o.glow || o.type === 'relic');
  const needsParticleRing = config.objects.some(o => o.type === 'particleRing');
  const needsFloat = usedComps.has('Float');
  const needsStars = usedComps.has('Stars');
  const needsReflector = usedComps.has('MeshReflectorMaterial');
  const needsEnvironment = usedComps.has('Environment') || hasEnv;

  const memoDecls = useMemoBlocks.join('\n\n');
  const frameBlock = useFrameBlock(objectFrames.join('\n'), true, hasFog, true);

  const refDecls = [
    '  const ambientRef = useRef();',
    '  const keyLightRef = useRef();',
    '  const rimLightRef = useRef();',
    ...useRefs.filter(r => !r.ref.startsWith('glyphRefs') && !r.ref.startsWith('towerRefs') && !r.ref.startsWith('towerGlowRefs')).map(r => `  const ${r.ref} = useRef();`),
    ...[...new Set(useRefs.filter(r => r.ref.startsWith('glyphRefs') || r.ref.startsWith('towerRefs') || r.ref.startsWith('towerGlowRefs')).map(r => r.ref))].map(name => `  const ${name} = useRef([]);`),
  ];

  // Lights JSX
  const lightsJsx = [
    `<ambientLight ref={ambientRef} intensity={${config.ambient.intensity}} color="${config.ambient.color}" />`,
    `<directionalLight ref={keyLightRef} position={[${config.keyLight.position.join(', ')}]} intensity={${config.keyLight.intensity}} color={"${config.keyLight.color}"} />`,
    `<directionalLight ref={rimLightRef} position={[${config.rimLight.position.join(', ')}]} intensity={${config.rimLight.intensity}} color={"${config.rimLight.color}"} />`,
  ];
  if (hasHemi) {
    const h = config.hemisphere;
    lightsJsx.push(`<hemisphereLight args={["${h.skyColor || '#87CEEB'}", "${h.groundColor || '#362907'}", ${h.intensity || 0.3}]} />`);
  }
  if (config.extraLights) {
    config.extraLights.forEach((l) => {
      lightsJsx.push(`<directionalLight position={[${(l.position || [0,0,0]).join(', ')}]} intensity={${l.intensity || 0.08}} color={"${l.color || '#A33A4A'}"} />`);
    });
  }

  // Postprocessing
  const pp = [];
  if (hasBloom) pp.push(`        <Bloom luminanceThreshold={${config.bloom.threshold}} luminanceSmoothing={0.9} intensity={${config.bloom.intensity}} mipmapBlur={${config.bloom.mipmapBlur}} />`);
  if (hasVignette) pp.push(`        <Vignette offset={${config.vignette.offset ?? 0.3}} darkness={${config.vignette.darkness ?? 0.7}} />`);
  const ppJsx = pp.length ? `      <EffectComposer>\n${pp.join('\n')}\n      </EffectComposer>` : '';

  const fogJsx = hasFog ? `      <fogExp2 attach="fog" args={['${config.fog.color}', ${config.fog.density}]} />` : '';
  const envJsx = needsEnvironment ? `\n      <Environment preset="${config.environment?.preset || 'night'}" background={${config.environment?.background ? 'true' : 'false'}} blur={${config.environment?.blur ?? 0.5}} />` : '';
  const shadowJsx = hasSoftShadows ? `\n      <ContactShadows position={[0, ${config.softShadows?.yOffset ?? -0.4}, 0]} opacity={${config.softShadows?.opacity ?? 0.6}} scale={${config.softShadows?.scale ?? 15}} blur={${config.softShadows?.blur ?? 3}} far={${config.softShadows?.far ?? 5}} />` : '';
  const toneMappingCode = hasToneMapping ? `  camera.toneMapping = THREE.ACESFilmicToneMapping;\n  camera.toneMappingExposure = ${config.toneMapping?.exposure ?? 1.2};` : '';
  const storeImport = config.storeImport || `import { useScrollStore } from '${config.store || '../stores/scroll'}';`;
  const indent6 = (s) => s.split('\n').map(l => l ? '      ' + l : '').join('\n');

  const fresnelCode = needsFresnel ? `\n${FRESNEL_SHADER}\n` : '';
  const particleRingCode = needsParticleRing ? `\n${PARTICLE_RING}\n` : '';

  // Build drei import list including ContactShadows
  const dreiNeeds = {
    float: needsFloat, stars: needsStars || hasSoftShadows,
    bloom: hasBloom, vignette: hasVignette,
    reflector: needsReflector,
    environment: needsEnvironment,
    toneMapping: hasToneMapping,
    contactShadows: hasSoftShadows,
  };

  const code = `${buildImports(dreiNeeds)}
${storeImport}

${UTILS}
${fresnelCode}${particleRingCode}
${cameraKeyframes(config.camera)}

export default function ${config.name}() {
  ${PREFERS_REDUCED}
  const { progress } = useScrollStore();
  const { camera } = useThree();

${toneMappingCode ? toneMappingCode + '\n' : ''}  // Refs
${refDecls.join('\n')}

  // Memoized data
${memoDecls ? `\n${memoDecls}` : ''}

${frameBlock}

  return (
    <>
${ppJsx}
${fogJsx}
${envJsx}${shadowJsx}
      ${lightsJsx.join('\n      ')}

${objectJsxs.map(jsx => indent6(jsx)).join('\n\n')}
    </>
  );
}
`;

  return code;
}
