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
        background: COLORS.void,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '1px',
          height: '20vh',
          background: `linear-gradient(to bottom, transparent, ${COLORS.gold}44, transparent)`,
        }}
      />

      <div style={{ maxWidth: 900, padding: '0 24px', position: 'relative' }}>
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic',
            fontSize: '14px',
            color: COLORS.gold,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginBottom: 32,
            opacity: 0.7,
          }}
        >
          {TAGLINES.subtitle}
        </p>

        <h1
          style={{
            fontSize: 'clamp(48px, 10vw, 120px)',
            fontWeight: 600,
            fontFamily: "'Playfair Display', serif",
            color: COLORS.ivory,
            lineHeight: 1.05,
            marginBottom: 40,
            letterSpacing: '-0.03em',
          }}
        >
          Build What<br />
          <span style={{ color: COLORS.gold, fontStyle: 'italic' }}>Time Cannot</span><br />
          Erase.
        </h1>

        <p
          style={{
            fontSize: '16px',
            color: 'rgba(247,244,238,0.5)',
            maxWidth: 600,
            margin: '0 auto',
            lineHeight: 1.7,
            fontWeight: 300,
            letterSpacing: '0.02em',
          }}
        >
          The first Culture Engine. Infrastructure for digital civilizations.
        </p>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ color: COLORS.gold, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.4 }}>
          Scroll to explore
        </span>
        <div
          style={{
            width: 1,
            height: 30,
            background: `linear-gradient(to bottom, ${COLORS.gold}, transparent)`,
          }}
        />
      </div>
    </section>
  );
}
