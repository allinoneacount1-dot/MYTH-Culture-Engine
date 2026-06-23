import React from 'react';
import { COLORS, TAGLINES } from '../constants/brand';

export default function Footer() {
  return (
    <footer
      data-section="footer"
      style={{
        position: 'relative',
        padding: '100px 40px 50px',
        textAlign: 'center',
        borderTop: `1px solid ${COLORS.gold}11`,
      }}
    >
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ width: 32, height: 1, background: COLORS.gold, margin: '0 auto 32px', opacity: 0.3 }} />

        <p
          style={{
            fontFamily: "'Space Grotesk Variable', sans-serif",
            fontStyle: 'italic',
            fontSize: '12px',
            color: COLORS.gold,
            marginBottom: 16,
            opacity: 0.5,
            letterSpacing: '0.1em',
          }}
        >
          {TAGLINES.secondary}
        </p>

        <h3
          style={{
            fontSize: 'clamp(24px, 3.5vw, 40px)',
            color: COLORS.ivory,
            fontFamily: "'Space Grotesk Variable', sans-serif",
            fontWeight: 600,
            lineHeight: 1.2,
            marginBottom: 28,
            letterSpacing: '-0.02em',
          }}
        >
          {TAGLINES.primary}
        </h3>

        <p
          style={{
            fontSize: '10px',
            color: 'rgba(247,244,238,0.15)',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            fontFamily: "'Space Grotesk Variable', sans-serif",
            fontWeight: 400,
          }}
        >
          MYTH Ω — The Culture Engine
        </p>
      </div>
    </footer>
  );
}
