import React, { useRef, useEffect } from 'react';
import { COLORS, CHAPTERS } from '../constants/brand';

const titleStyle = {
  fontFamily: "'Space Grotesk Variable', sans-serif",
  color: COLORS.ivory,
  fontWeight: 600,
  lineHeight: 1.1,
  letterSpacing: '-0.02em',
};

const subtitleStyle = {
  fontFamily: "'Space Grotesk Variable', sans-serif",
  fontStyle: 'italic',
  color: COLORS.gold,
  fontWeight: 300,
};

const bodyStyle = {
  fontSize: '14px',
  color: 'rgba(247,244,238,0.55)',
  lineHeight: 1.8,
  fontWeight: 300,
  letterSpacing: '0.01em',
  maxWidth: '65ch',
};

function useReveal(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.classList.add('revealed');
      },
      { threshold: 0.2 }
    );
    o.observe(el);
    return () => o.disconnect();
  }, [ref]);
}

// Layout 0: Centered manifesto — Ch1: Forgetting (WITH eyebrow — 1 of 2)
function LayoutCentered({ data, i }) {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section ref={ref} className="section-reveal" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center', padding: '80px 40px'
    }}>
      <div style={{ maxWidth: 800 }}>
        <div style={{
          fontFamily: "'Space Grotesk Variable', monospace",
          fontSize: '11px', color: COLORS.gold, letterSpacing: '0.25em',
          textTransform: 'uppercase', fontWeight: 500, marginBottom: 24,
        }}>Genesis</div>
        <h2 style={{ ...titleStyle, fontSize: 'clamp(36px, 5vw, 64px)', marginBottom: 20 }}>{data.title}</h2>
        <p style={{ ...subtitleStyle, fontSize: '17px', marginBottom: 28 }}>{data.subtitle}</p>
        <p style={{ ...bodyStyle, margin: '0 auto' }}>{data.description}</p>
      </div>
    </section>
  );
}

// Layout 1: Left text — Ch2: Stories (no eyebrow)
function LayoutLeftText({ data, i }) {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section ref={ref} className="section-reveal" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '80px 40px'
    }}>
      <div style={{ maxWidth: 680 }}>
        <h2 style={{ ...titleStyle, fontSize: 'clamp(32px, 4vw, 52px)', marginBottom: 16 }}>{data.title}</h2>
        <p style={{ ...subtitleStyle, fontSize: '16px', marginBottom: 28 }}>{data.subtitle}</p>
        <p style={bodyStyle}>{data.description}</p>
      </div>
    </section>
  );
}

// Layout 2: Text overlay on scene — Ch3: Culture (no eyebrow)
function LayoutOverlay({ data, i }) {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section ref={ref} className="section-reveal" style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', textAlign: 'center',
      padding: '80px 40px'
    }}>
      <div style={{ maxWidth: 720, backdropFilter: 'blur(2px)', padding: '40px 60px' }}>
        <h2 style={{ ...titleStyle, fontSize: 'clamp(32px, 4.5vw, 52px)', marginBottom: 20 }}>{data.title}</h2>
        <p style={{ ...subtitleStyle, fontSize: '16px', marginBottom: 24 }}>{data.subtitle}</p>
        <p style={{ ...bodyStyle, margin: '0 auto' }}>{data.description}</p>
      </div>
    </section>
  );
}

// Layout 3: Minimal — Ch4: Civilizations (WITH eyebrow — 2 of 2)
function LayoutMinimal({ data, i }) {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section ref={ref} className="section-reveal" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center', padding: '80px 40px'
    }}>
      <div style={{ maxWidth: 700 }}>
        <div style={{
          fontFamily: "'Space Grotesk Variable', monospace",
          fontSize: '11px', color: COLORS.gold, letterSpacing: '0.25em',
          textTransform: 'uppercase', fontWeight: 500, marginBottom: 20,
        }}>Manifesto</div>
        <h2 style={{ ...titleStyle, fontSize: 'clamp(28px, 3.5vw, 48px)', marginBottom: 16 }}>{data.title}</h2>
        <p style={{ ...subtitleStyle, fontSize: '15px', marginBottom: 24 }}>{data.subtitle}</p>
        <p style={{ ...bodyStyle, margin: '0 auto' }}>{data.description}</p>
      </div>
    </section>
  );
}

// Layout 4: Horizontal text bar — Ch5: Engine (no eyebrow)
function LayoutBar({ data, i }) {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section ref={ref} className="section-reveal" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'flex-end', padding: 0
    }}>
      <div style={{
        width: '100%', padding: '60px 80px',
        borderTop: `1px solid ${COLORS.gold}22`
      }}>
        <div style={{ maxWidth: 900 }}>
          <h2 style={{ ...titleStyle, fontSize: 'clamp(28px, 4vw, 48px)', marginBottom: 12 }}>{data.title}</h2>
          <p style={{ ...subtitleStyle, fontSize: '15px', marginBottom: 20 }}>{data.subtitle}</p>
          <p style={{ ...bodyStyle, maxWidth: 700 }}>{data.description}</p>
        </div>
      </div>
    </section>
  );
}

// Layout 5: Centered closing — Ch6: Future (no eyebrow)
function LayoutClosing({ data, i }) {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section ref={ref} className="section-reveal" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center', padding: '80px 40px'
    }}>
      <div style={{ maxWidth: 700 }}>
        <div style={{ width: 40, height: 1, background: COLORS.gold, margin: '0 auto 32px', opacity: 0.3 }} />
        <h2 style={{ ...titleStyle, fontSize: 'clamp(30px, 4vw, 50px)', marginBottom: 24 }}>
          {data.title}
        </h2>
        <p style={{ ...subtitleStyle, fontSize: '16px', marginBottom: 24, maxWidth: 500, margin: '0 auto 24px' }}>
          {data.subtitle}
        </p>
        <p style={{ ...bodyStyle, margin: '0 auto' }}>{data.description}</p>
      </div>
    </section>
  );
}

const layouts = [
  LayoutCentered,
  LayoutLeftText,
  LayoutOverlay,
  LayoutMinimal,
  LayoutBar,
  LayoutClosing,
];

export default function Section({ index }) {
  const data = CHAPTERS[index];
  const Layout = layouts[index % layouts.length];
  return <Layout data={data} i={index} />;
}
