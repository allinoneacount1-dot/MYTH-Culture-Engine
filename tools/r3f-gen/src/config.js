import * as yaml from 'js-yaml';

const VALID_TYPES = [
  'torusKnot', 'sphere', 'sphereGlow', 'relic', 'particleRing',
  'galaxy', 'glyphs', 'towers', 'lightShaft', 'dust', 'stars',
  'reflectiveFloor', 'group'
];

const DEFAULTS = {
  fog: { color: '#05070B', density: 0.015, type: 'exp2' },
  bloom: { intensity: 0.5, threshold: 0.1, mipmapBlur: true },
  ambient: { intensity: 0.05, color: '#F7F4EE' },
  keyLight: { position: [5, 10, 5], intensity: 0.12, color: '#D8B36A' },
  rimLight: { position: [-5, 3, -5], intensity: 0.25, color: '#3AE9E0' },
};

export function parseConfig(raw, format = 'yaml') {
  const doc = format === 'json' ? JSON.parse(raw) : yaml.load(raw);
  if (!doc || typeof doc !== 'object') throw new Error('Invalid config: must be a YAML/JSON object');

  const config = {
    name: doc.name || 'GeneratedScene',
    camera: parseCamera(doc.camera),
    fog: { ...DEFAULTS.fog, ...(doc.fog || {}) },
    bloom: { ...DEFAULTS.bloom, ...(doc.bloom || {}) },
    ambient: { ...DEFAULTS.ambient, ...(doc.ambient || {}) },
    keyLight: { ...DEFAULTS.keyLight, ...(doc.keyLight || {}) },
    rimLight: { ...DEFAULTS.rimLight, ...(doc.rimLight || {}) },
    extraLights: doc.extraLights || [],
    toneMapping: doc.toneMapping || null,
    environment: doc.environment || null,
    vignette: doc.vignette || null,
    softShadows: doc.softShadows || null,
    hemisphere: doc.hemisphere || null,
    store: doc.store || null,
    storeImport: doc.storeImport || null,
    objects: [],
  };

  if (doc.objects && Array.isArray(doc.objects)) {
    for (const obj of doc.objects) {
      const validated = validateObject(obj);
      if (validated) config.objects.push(validated);
    }
  }

  return config;
}

function parseCamera(cam) {
  if (!cam || !cam.keyframes || !Array.isArray(cam.keyframes) || cam.keyframes.length < 2) {
    throw new Error('Camera must have at least 2 keyframes');
  }
  const keyframes = cam.keyframes.map((k, i) => {
    let at, pos, target;
    if (typeof k === 'string') {
      const parts = k.split('|').map(s => s.trim());
      at = parseFloat(parts[0]) || i;
      pos = JSON.parse(parts[1] || '[0,0,0]');
      target = JSON.parse(parts[2] || '[0,0,0]');
    } else {
      at = k.at ?? i / Math.max(1, cam.keyframes.length - 1);
      pos = k.pos || [0, 0, 0];
      target = k.target || [0, 0, 0];
    }
    return { at, pos, target };
  });
  return keyframes;
}

function validateObject(obj) {
  if (!obj || !obj.type) return null;
  if (!VALID_TYPES.includes(obj.type)) {
    console.warn(`Unknown object type: "${obj.type}" — skipping`);
    return null;
  }

  const out = { ...obj };

  if (out.material && typeof out.material === 'string') {
    out.material = { color: out.material };
  }

  if (out.visibility) {
    const vis = out.visibility;
    if (typeof vis === 'number') {
      out.visibility = { center: vis, width: 0.5 };
    } else if (Array.isArray(vis)) {
      out.visibility = { center: vis[0], width: vis[1] || 0.5 };
    }
  }

  if (out.animation && typeof out.animation === 'boolean') {
    out.animation = out.animation ? { rotateY: 0.1 } : {};
  }

  return out;
}
