import React from 'react';
import { COLORS } from '../constants/brand';

export default function Logo() {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 2,
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '11px',
          color: COLORS.gold,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          opacity: 0.3,
        }}
      >
        MYTH Ω
      </span>
      <span
        style={{
          fontSize: '8px',
          color: COLORS.ivory,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          opacity: 0.15,
        }}
      >
        The Culture Engine
      </span>
    </div>
  );
}
