#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { parseConfig } from './config.js';
import { generate } from './generate.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const program = new Command();

program
  .name('r3f-gen')
  .description('Generate React Three Fiber Scene components from YAML/JSON config')
  .version('1.0.0');

program
  .command('init')
  .description('Create a sample config file')
  .argument('[dir]', 'Output directory', '.')
  .action((dir) => {
    const sample = `# R3F Scene Config — sample
name: MyScene
camera:
  keyframes:
    - at: 0, pos: [0, 1.5, 10], target: [0, 0, 0]
    - at: 0.5, pos: [0, 0.5, 6], target: [0, 0, 0]
    - at: 1, pos: [0, 0, 3], target: [0, 0, 0]
fog: { color: "#05070B", density: 0.015, type: exp2 }
bloom: { intensity: 0.5, threshold: 0.1, mipmapBlur: true }
objects:
  - type: torusKnot
    args: [1.2, 0.4, 180, 24]
    position: [0, 0.5, -3]
    material: { color: "#D8B36A", metalness: 0.85, roughness: 0.08, emissive: "#D8B36A" }
    animation: { rotateY: 0.12, rotateX: 0.08, float: true }
    visibility: { center: 0.3, width: 0.8 }
  - type: sphere
    args: [0.55, 48, 48]
    position: [0, 0, 0]
    material: { color: "#D8B36A", metalness: 0.9, roughness: 0.05, emissive: "#D8B36A" }
    glow: { color: "#D8B36A", intensity: 0.8, scale: 1.15 }
    animation: { breathe: true }
    visibility: { center: 2.5, width: 1 }
  - type: particleRing
    radius: 1.8
    count: 100
    color: "#3AE9E0"
    speed: 0.15
    spread: 0.2
  - type: particleRing
    radius: 2.8
    count: 120
    color: "#D8B36A"
    speed: -0.1
    spread: 0.3
  - type: dust
    count: 800
    size: 0.012
`;
    const out = join(process.cwd(), dir, 'scene.yaml');
    writeFileSync(out, sample, 'utf-8');
    console.log(`Created sample config: ${out}`);
  });

program
  .command('build')
  .description('Generate Scene.jsx from config file')
  .argument('<config>', 'Path to YAML/JSON config file')
  .option('-o, --output <path>', 'Output file path (default: Scene.jsx in current dir)')
  .option('--pretty', 'Format output with prettier (requires prettier installed)')
  .action(async (configPath, options) => {
    const cwd = process.cwd();
    const absPath = resolve(cwd, configPath);
    if (!existsSync(absPath)) {
      console.error(`Config file not found: ${absPath}`);
      process.exit(1);
    }
    const raw = readFileSync(absPath, 'utf-8');
    const config = parseConfig(raw, configPath.endsWith('.json') ? 'json' : 'yaml');
    let code = generate(config);
    if (options.pretty) {
      try {
        const prettier = await import('prettier');
        const formatted = await prettier.format(code, { parser: 'babel', singleQuote: true, trailingComma: 'all' });
        if (formatted) code = formatted;
      } catch {
        console.warn('Warning: prettier formatting failed, outputting unformatted code');
      }
    }
    const outPath = options.output ? resolve(cwd, options.output) : join(cwd, 'Scene.jsx');
    writeFileSync(outPath, code, 'utf-8');
    console.log(`Generated: ${outPath}`);
  });

program
  .command('new')
  .description('Scaffold a new R3F project with Vite')
  .argument('<name>', 'Project name')
  .option('-d, --dir <path>', 'Parent directory', '.')
  .action(async (name, options) => {
    const root = resolve(process.cwd(), options.dir, name);
    if (existsSync(root)) {
      console.error(`Directory already exists: ${root}`);
      process.exit(1);
    }

    // Create project structure
    mkdirSync(join(root, 'src', 'components'), { recursive: true });
    mkdirSync(join(root, 'src', 'stores'), { recursive: true });
    mkdirSync(join(root, 'src', 'styles'), { recursive: true });
    mkdirSync(join(root, 'src', 'constants'), { recursive: true });
    mkdirSync(join(root, 'public'), { recursive: true });

    // package.json
    writeFileSync(join(root, 'package.json'), JSON.stringify({
      name, version: '1.0.0', type: 'module',
      scripts: { dev: 'vite --port 3000', build: 'vite build', preview: 'vite preview' },
      dependencies: {
        react: '^19.0.0', 'react-dom': '^19.0.0',
        three: '^0.170.0', '@react-three/fiber': '^8.0.0',
        '@react-three/drei': '^9.0.0', '@react-three/postprocessing': '^3.0.0',
        'three-stdlib': '^2.0.0',
        zustand: '^5.0.0',
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.0.0', vite: '^6.0.0',
      },
    }, null, 2), 'utf-8');

    // vite.config.js
    writeFileSync(join(root, 'vite.config.js'), `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
});
`);

    // index.html
    writeFileSync(join(root, 'index.html'), `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name}</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
`);

    // src/main.jsx
    writeFileSync(join(root, 'src', 'main.jsx'), `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`);

    // src/App.jsx — with Lenis + ScrollTrigger wrapper
    writeFileSync(join(root, 'src', 'App.jsx'), `import { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Scene from './components/Scene.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const containerRef = useRef();

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', (e) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      useScrollStore.getState().setProgress(Math.min(e.progress, 1));
    });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    return () => { lenis.destroy(); gsap.ticker.lagSmoothing(1); };
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <Canvas camera={{ position: [0, 1.5, 10], fov: 60 }}>
          <Scene />
        </Canvas>
      </div>
      <div style={{ position: 'relative', zIndex: 1, height: '600vh' }} />
    </div>
  );
}
`);

    // Scroll store
    writeFileSync(join(root, 'src', 'stores', 'scroll.js'), `import { create } from 'zustand';

export const useScrollStore = create((set) => ({
  progress: 0,
  section: 0,
  setProgress: (p) => set((s) => {
    const sec = Math.min(Math.floor(p * 6), 6);
    return { progress: p, section: sec !== s.section ? sec : s.section };
  }),
}));
`);

    // Brand constants
    writeFileSync(join(root, 'src', 'constants', 'brand.js'), `export const COLORS = {
  black: '#05070B',
  gold: '#D8B36A',
  ivory: '#F7F4EE',
  sapphire: '#10213A',
  cyan: '#3AE9E0',
  ember: '#A33A4A',
};

export const CHAPTERS = [
  'Prologue', 'Origins', 'Structure', 'Memory', 'Relic', 'Horizon',
];
`);

    // global.css
    writeFileSync(join(root, 'src', 'styles', 'global.css'), `*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  background: #05070B;
  color: #F7F4EE;
  font-family: system-ui, sans-serif;
  overflow-x: hidden;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
`);

    // Scene placeholder with a simple scene
    writeFileSync(join(root, 'src', 'components', 'Scene.jsx'), `import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';

export default function Scene() {
  const ref = useRef();
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.1; });
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={0.5} />
      <Stars radius={50} depth={60} count={3000} factor={5} saturation={0.3} fade />
      <mesh ref={ref}>
        <torusKnotGeometry args={[1, 0.3, 128, 16]} />
        <meshStandardMaterial color="#D8B36A" metalness={0.8} roughness={0.2} />
      </mesh>
    </>
  );
}
`);

    console.log(`\n  Project "${name}" scaffolded at ${root}`);
    console.log(`\n  Next steps:`);
    console.log(`    cd ${root}`);
    console.log(`    npm install`);
    console.log(`    npm run dev`);
    console.log(`\n  Or use r3f-gen build to generate a scene from config.\n`);
  });

program.parse();
