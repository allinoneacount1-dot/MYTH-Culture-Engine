import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll } from '@react-three/drei';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { COLORS } from './constants/brand';
import Navigation from './components/Navigation';
import Chapter from './components/Chapter';
import Hero from './components/Hero';
import Logo from './components/Logo';
import Footer from './components/Footer';
import Scene1 from './components/scenes/Scene1';
import Scene2 from './components/scenes/Scene2';
import Scene3 from './components/scenes/Scene3';
import Scene4 from './components/scenes/Scene4';
import Scene5 from './components/scenes/Scene5';
import Scene6 from './components/scenes/Scene6';

gsap.registerPlugin(ScrollTrigger);

const scenes = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6];

export default function App() {
  const containerRef = useRef(null);
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.6,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.scrollerProxy(containerRef.current, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: containerRef.current.style.transform ? 'transform' : 'fixed',
    });

    ScrollTrigger.refresh();

    return () => {
      lenis.destroy();
      gsap.ticker.remove((t) => lenis.raf(t * 1000));
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', background: COLORS.void }}>
      <Navigation />
      <Hero />
      <Logo />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {scenes.map((Scene, i) => (
          <Chapter key={i} index={i}>
            <Scene />
          </Chapter>
        ))}
      </div>

      <Footer />
    </div>
  );
}
