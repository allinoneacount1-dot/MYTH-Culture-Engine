import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollStore } from './stores/scroll';
import { COLORS } from './constants/brand';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Section from './components/Section';
import Footer from './components/Footer';
import Scene from './components/Scene';

gsap.registerPlugin(ScrollTrigger);

const CHAPTER_COUNT = 6;

export default function App() {
  const rootRef = useRef(null);
  const setProgress = useScrollStore((s) => s.setProgress);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.5,
    });

    lenis.on('scroll', (e) => {
      const maxScroll = e.limit || 1;
      setProgress(Math.min(1, e.scroll / maxScroll));
      ScrollTrigger.update();
    });

    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.scrollerProxy(rootRef.current, {
      scrollTop(value) {
        if (arguments.length) lenis.scrollTo(value, { immediate: true });
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
      pinType: rootRef.current?.style.transform ? 'transform' : 'fixed',
    });

    ScrollTrigger.refresh();

    return () => {
      lenis.destroy();
      gsap.ticker.remove((t) => lenis.raf(t * 1000));
    };
  }, [setProgress]);

  return (
    <div ref={rootRef} style={{ position: 'relative', background: COLORS.void, minHeight: '100vh' }}>
      {/* Persistent 3D canvas — fixed behind content */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <Canvas
          camera={{ position: [0, 1.5, 10], fov: 45 }}
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 1.5]}
        >
          <Scene />
        </Canvas>
      </div>

      {/* HTML content overlay */}
      <div style={{ position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}>
          <Navigation />
        </div>

        <Hero />

        {Array.from({ length: CHAPTER_COUNT }, (_, i) => (
          <div key={i} data-section={i} style={{ pointerEvents: 'auto' }}>
            <Section index={i} />
          </div>
        ))}

        <div style={{ pointerEvents: 'auto' }}>
          <Footer />
        </div>
      </div>
    </div>
  );
}
