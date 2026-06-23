import React from 'react';
import { COLORS, TAGLINES } from '../constants/brand';

export default function Footer() {
  return (
    <footer
      style={{
        position: 'relative',
        padding: '120px 40px 60px',
        textAlign: 'center',
        background: COLORS.void,
        borderTop: `1px solid ${COLORS.gold}11`,
      }}
    >
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div
          style={{
            width: 40,
            height: 1,
            background: COLORS.gold,
            margin: '0 auto 40px',
            opacity: 0.4,
          }}
        />

        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic',
            fontSize: '13px',
            color: COLORS.gold,
            marginBottom: 16,
            opacity: 0.6,
            letterSpacing: '0.15em',
          }}
        >
          {TAGLINES.secondary}
        </p>

        <h3
          style={{
            fontSize: 'clamp(28px, 4vw, 48px)',
            color: COLORS.ivory,
            fontFamily: "'Playfair Display', serif",
            fontWeight: 600,
            lineHeight: 1.2,
            marginBottom: 32,
            letterSpacing: '-0.02em',
          }}
        >
          {TAGLINES.primary}
        </h3>

        <p
          style={{
            fontSize: '12px',
            color: 'rgba(247,244,238,0.2)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          MYTH Ω — The Culture Engine
        </p>
      </div>
    </footer>
  );
}
