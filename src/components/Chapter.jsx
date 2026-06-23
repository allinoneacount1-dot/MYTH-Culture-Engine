import React, { useRef, useEffect } from 'react';
import { COLORS, CHAPTERS } from '../constants/brand';

const sectionStyle = {
  position: 'relative',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
};

const contentStyle = {
  position: 'relative',
  zIndex: 2,
  maxWidth: 680,
  padding: '80px 60px',
};

const numberStyle = {
  fontSize: '12px',
  color: COLORS.gold,
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  marginBottom: 16,
  fontFamily: "'Inter', sans-serif",
  fontWeight: 500,
  opacity: 0.5,
};

const titleStyle = {
  fontSize: 'clamp(32px, 5vw, 56px)',
  color: COLORS.ivory,
  fontFamily: "'Playfair Display', serif",
  fontWeight: 600,
  lineHeight: 1.15,
  marginBottom: 16,
  letterSpacing: '-0.02em',
};

const subtitleStyle = {
  fontSize: '15px',
  color: COLORS.gold,
  fontFamily: "'Playfair Display', serif",
  fontStyle: 'italic',
  marginBottom: 24,
  opacity: 0.8,
};

const bodyStyle = {
  fontSize: '14px',
  color: 'rgba(247,244,238,0.55)',
  lineHeight: 1.8,
  fontWeight: 300,
  letterSpacing: '0.01em',
};

export default function Chapter({ index, children }) {
  const data = CHAPTERS[index];
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          sectionRef.current?.classList.add('visible');
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-chapter={index}
      style={{
        ...sectionStyle,
        flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
      }}
    >
      <div style={{ ...contentStyle, maxWidth: 500 }}>
        <div style={numberStyle}>Chapter {String(index + 1).padStart(2, '0')}</div>
        <h2 style={titleStyle}>{data.title}</h2>
        <p style={subtitleStyle}>{data.subtitle}</p>
        <p style={bodyStyle}>{data.description}</p>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: '60vh',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.8,
          }}
        >
          {children}
        </div>
      </div>

      <style>{`
        [data-chapter] {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        [data-chapter].visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
}
