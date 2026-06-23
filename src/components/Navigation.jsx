import React, { useState, useEffect } from 'react';
import { COLORS, CHAPTERS } from '../constants/brand';

const linkBase = {
  color: COLORS.ivory,
  textDecoration: 'none',
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  background: 'none',
  border: 'none',
  fontFamily: "'Space Grotesk Variable', sans-serif",
  cursor: 'pointer',
  transition: 'opacity 0.3s',
  padding: 0,
};

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const handle = () => {
      setScrolled(window.scrollY > 80);
      const sections = document.querySelectorAll('[data-section]');
      let cur = 0;
      sections.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.4) cur = i;
      });
      setActive(cur);
    };
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: scrolled ? 'rgba(5,7,11,0.8)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        transition: 'background 0.5s, backdrop-filter 0.5s',
      }}
    >
      <span style={{ ...linkBase, fontSize: '11px', fontWeight: 600, letterSpacing: '0.2em', cursor: 'default' }}>
        MYTH Ω
      </span>

      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        {CHAPTERS.map((ch, i) => (
          <button
            key={ch.id}
            onClick={() => {
              const el = document.querySelector(`[data-section="${i}"]`);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ ...linkBase, opacity: active === i ? 1 : 0.3 }}
          >
            {ch.title}
          </button>
        ))}
      </div>
    </nav>
  );
}
