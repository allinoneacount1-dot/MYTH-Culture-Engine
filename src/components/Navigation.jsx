import React, { useState, useEffect } from 'react';
import { COLORS, CHAPTERS } from '../constants/brand';

const linkStyle = {
  color: COLORS.gold,
  textDecoration: 'none',
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  transition: 'opacity 0.3s',
  cursor: 'pointer',
};

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
      const sections = document.querySelectorAll('[data-chapter]');
      let current = 0;
      sections.forEach((s, i) => {
        const rect = s.getBoundingClientRect();
        if (rect.top < window.innerHeight / 2) current = i;
      });
      setActive(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '24px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: scrolled ? 'rgba(5,7,11,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        transition: 'background 0.6s, backdrop-filter 0.6s',
      }}
    >
      <div style={{ ...linkStyle, fontSize: '13px', fontWeight: 600, letterSpacing: '0.2em' }}>
        MYTH
      </div>

      <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
        {CHAPTERS.map((ch, i) => (
          <button
            key={ch.id}
            onClick={() => {
              const el = document.querySelector(`[data-chapter="${i}"]`);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              ...linkStyle,
              opacity: active === i ? 1 : 0.4,
              background: 'none',
              border: 'none',
              font: 'inherit',
              padding: 0,
            }}
          >
            {ch.title}
          </button>
        ))}
      </div>
    </nav>
  );
}
