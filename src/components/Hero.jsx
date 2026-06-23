import React from 'react';
import { COLORS, TAGLINES } from '../constants/brand';

export default function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        pointerEvents: 'none',
      }}
    >
      <div style={{ maxWidth: 900, padding: '0 24px' }}>
        <p
          style={{
            fontFamily: "'Space Grotesk Variable', sans-serif",
            fontSize: '12px',
            color: COLORS.gold,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            marginBottom: 28,
            opacity: 0.5,
            fontWeight: 500,
          }}
        >
          {TAGLINES.subtitle}
        </p>

        <h1
          style={{
            fontSize: 'clamp(44px, 9vw, 100px)',
            fontWeight: 600,
            fontFamily: "'Space Grotesk Variable', sans-serif",
            color: COLORS.ivory,
            lineHeight: 1.05,
            marginBottom: 36,
            letterSpacing: '-0.03em',
            textShadow: '0 0 80px rgba(216,179,106,0.08)',
          }}
        >
          Build What<br />
          <span style={{ color: COLORS.gold, fontStyle: 'italic' }}>Time Cannot</span><br />
          Erase.
        </h1>

        <p
          style={{
            fontSize: '14px',
            color: 'rgba(247,244,238,0.4)',
            maxWidth: 560,
            margin: '0 auto',
            lineHeight: 1.7,
            fontWeight: 300,
            letterSpacing: '0.02em',
            fontFamily: "'Inter Variable', sans-serif",
          }}
        >
          The first Culture Engine. Infrastructure for digital civilizations.
        </p>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 36,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{
          color: COLORS.gold, fontSize: '9px', letterSpacing: '0.25em',
          textTransform: 'uppercase', opacity: 0.3,
          fontFamily: "'Space Grotesk Variable', sans-serif",
          fontWeight: 500,
        }}>
          Scroll
        </span>
        <div style={{
          width: 1, height: 24,
          background: `linear-gradient(to bottom, ${COLORS.gold}, transparent)`,
        }} />
      </div>
    </section>
  );
}
