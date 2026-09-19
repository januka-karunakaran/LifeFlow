import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

/* ─── Tiny SVG Icons ─────────────────────────────────────────────── */
const Icon = {
  Brain: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  ),
  Activity: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  Target: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  ),
  Zap: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-amber-400">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Menu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  XIcon: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

const FEATURES = [
  {
    icon: <Icon.Brain />,
    title: 'AI Productivity Engine',
    description: 'Our ML model analyses your sleep, exercise, and screen time patterns to generate precise productivity scores and actionable recommendations.',
    accentColor: '#6366f1',
  },
  {
    icon: <Icon.Activity />,
    title: 'Real-Time Analytics',
    description: 'Interactive charts surface hidden correlations in your daily data — understand exactly what drives your best and worst performance days.',
    accentColor: '#8b5cf6',
  },
  {
    icon: <Icon.Target />,
    title: 'Precision Goal Tracking',
    description: 'Set measurable targets, log progress with smart forms, and watch your streaks build momentum through an intelligent gamification system.',
    accentColor: '#0ea5e9',
  },
  {
    icon: <Icon.Zap />,
    title: 'What-If Simulator',
    description: 'Model the impact of lifestyle changes before you make them. Adjust sleep, exercise, or screen time and see AI-predicted productivity outcomes instantly.',
    accentColor: '#a78bfa',
  },
];

const STATS = [
  { value: '94%', label: 'Prediction Accuracy' },
  { value: '12K+', label: 'Active Users' },
  { value: '3.2M', label: 'Days Tracked' },
  { value: '4.9★', label: 'User Rating' },
];

const TESTIMONIALS = [
  {
    name: 'Aditya R.',
    role: 'Software Engineer',
    text: "LifeFlow's AI literally predicted my burnout two weeks before I felt it. The what-if simulator helped me redesign my daily routine.",
    avatar: 'AR',
  },
  {
    name: 'Priya K.',
    role: 'Product Manager',
    text: "I've tried every habit tracker. LifeFlow is the only one that connects the dots between sleep, focus, and output with real ML intelligence.",
    avatar: 'PK',
  },
  {
    name: 'Marcus T.',
    role: 'Founder & CEO',
    text: "The analytics dashboard alone is worth it. I now make data-driven decisions about my own life the same way I do for my company.",
    avatar: 'MT',
  },
];

function ProductivityRing({ score = 82 }) {
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative flex items-center justify-center w-36 h-36 mx-auto">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center z-10">
        <p className="text-3xl font-bold text-white tracking-tight">{score}</p>
        <p className="text-xs text-white/40 uppercase tracking-widest mt-0.5">Score</p>
      </div>
    </div>
  );
}

function MetricPill({ label, value, trend }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px',
      padding: '10px 14px',
    }}>
      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{value}</p>
        {trend !== undefined && (
          <span style={{
            fontSize: '11px', fontWeight: 500, padding: '2px 6px', borderRadius: '6px',
            background: trend > 0 ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)',
            color: trend > 0 ? '#34d399' : '#f87171',
          }}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, accentColor, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: hovered ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '20px',
        padding: '28px',
        cursor: 'default',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08)`
          : '0 4px 20px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        animationDelay: `${index * 0.1}s`,
      }}
    >
      {/* top shine line */}
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
        background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)`,
        opacity: hovered ? 1 : 0, transition: 'opacity 0.3s',
      }} />
      {/* ambient glow */}
      <div style={{
        position: 'absolute', top: '-30px', left: '-30px', width: '120px', height: '120px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${accentColor}22 0%, transparent 70%)`,
        opacity: hovered ? 1 : 0, transition: 'opacity 0.4s',
        pointerEvents: 'none',
      }} />
      <div style={{
        display: 'inline-flex', padding: '12px', borderRadius: '12px',
        background: `linear-gradient(135deg, ${accentColor}18, ${accentColor}08)`,
        border: `1px solid ${accentColor}20`,
        marginBottom: '18px',
        color: accentColor,
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.88)', marginBottom: '8px', lineHeight: 1.4 }}>{title}</h3>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.7 }}>{description}</p>
    </div>
  );
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const S = {
    root: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #070711 0%, #0a0a18 40%, #0d0820 100%)',
      color: '#fff',
      fontFamily: "'Inter', 'system-ui', sans-serif",
      position: 'relative',
      overflowX: 'hidden',
    },
    blob1: {
      position: 'fixed', top: '-15%', left: '-10%', width: '55vw', height: '55vw',
      borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
      background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 65%)',
      filter: 'blur(40px)',
    },
    blob2: {
      position: 'fixed', bottom: '-10%', right: '-10%', width: '50vw', height: '50vw',
      borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
      background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 65%)',
      filter: 'blur(40px)',
    },
    blob3: {
      position: 'fixed', top: '40%', left: '30%', width: '40vw', height: '40vw',
      borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
      background: 'radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 65%)',
      filter: 'blur(60px)',
    },
    navbar: {
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(7,7,17,0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    },
    navInner: {
      maxWidth: '1100px', margin: '0 auto', padding: '0 24px',
      height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    },
    container: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 },
    hero: { paddingTop: '140px', paddingBottom: '80px', position: 'relative' },
    heroAmbient: {
      position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
      width: '700px', height: '400px', pointerEvents: 'none',
      background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 65%)',
      filter: 'blur(20px)',
    },
    badge: {
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      padding: '6px 16px', borderRadius: '100px',
      background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
      fontSize: '11px', fontWeight: 500, color: 'rgba(167,139,250,0.9)',
      letterSpacing: '0.03em', marginBottom: '28px',
    },
    badgeDot: {
      width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1',
      boxShadow: '0 0 8px rgba(99,102,241,0.8)',
    },
    heroTitle: {
      fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.12,
      letterSpacing: '-0.025em', textAlign: 'center', marginBottom: '20px',
      color: 'rgba(255,255,255,0.95)',
    },
    gradientText: {
      background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #c4b5fd 100%)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    heroSubtitle: {
      fontSize: '15px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.75,
      maxWidth: '520px', margin: '0 auto 40px', textAlign: 'center',
    },
    btnPrimary: {
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      color: '#fff', fontWeight: 600, fontSize: '14px',
      padding: '13px 28px', borderRadius: '12px', border: 'none', cursor: 'pointer',
      textDecoration: 'none', boxShadow: '0 4px 24px rgba(99,102,241,0.35)',
      transition: 'all 0.2s',
    },
    btnGhost: {
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
      color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '14px',
      padding: '13px 28px', borderRadius: '12px', cursor: 'pointer',
      textDecoration: 'none', backdropFilter: 'blur(10px)',
      transition: 'all 0.2s',
    },
    focalCard: {
      position: 'relative', borderRadius: '24px', padding: '32px',
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
      border: '1px solid rgba(255,255,255,0.09)',
      boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
      overflow: 'hidden',
    },
    focalCardGlow: {
      position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
      width: '300px', height: '200px', pointerEvents: 'none',
      background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)',
      filter: 'blur(20px)',
    },
    section: { padding: '80px 0' },
    glassSubtle: {
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.07)',
    },
    glassCard: {
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.07)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
    },
    ctaBanner: {
      position: 'relative', overflow: 'hidden', borderRadius: '28px',
      padding: '64px 40px', textAlign: 'center',
      background: 'rgba(99,102,241,0.08)',
      backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
      border: '1px solid rgba(99,102,241,0.2)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
    },
    ctaBannerGlow: {
      position: 'absolute', top: '-40%', left: '50%', transform: 'translateX(-50%)',
      width: '600px', height: '300px', pointerEvents: 'none',
      background: 'radial-gradient(ellipse, rgba(99,102,241,0.22) 0%, transparent 70%)',
      filter: 'blur(30px)',
    },
  };

  return (
    <div style={S.root}>
      {/* Ambient blobs */}
      <div style={S.blob1} />
      <div style={S.blob2} />
      <div style={S.blob3} />

      {/* ── NAVBAR ── */}
      <header style={S.navbar}>
        <div style={S.navInner}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }} id="nav-logo">
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #6366f1, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="white" style={{ width: 16, height: 16 }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.9)' }}>
              Life<span style={{ ...S.gradientText }}>Flow</span>
            </span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="hidden-mobile">
            {['Features', 'Analytics', 'Pricing'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.85)'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}
              >{item}</a>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="hidden-mobile">
            <Link to="/login" id="nav-login-btn"
              style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontWeight: 500, padding: '8px 16px', borderRadius: '10px', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.target.style.color = 'rgba(255,255,255,0.85)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.5)'; e.target.style.background = 'transparent'; }}
            >Sign In</Link>
            <Link to="/register" id="nav-register-btn" style={S.btnPrimary}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.35)'; }}
            >Get Started Free</Link>
          </div>

          <button
            style={{ display: 'none', background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '8px' }}
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            id="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {menuOpen ? <Icon.XIcon /> : <Icon.Menu />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            background: 'rgba(7,7,17,0.95)', backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px 24px 20px',
          }}>
            {['Features', 'Analytics', 'Pricing'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.6)', padding: '10px 0', textDecoration: 'none' }}
                onClick={() => setMenuOpen(false)}
              >{item}</a>
            ))}
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '8px 0' }} />
            <Link to="/login" style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.6)', padding: '10px 0', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Sign In</Link>
            <Link to="/register" style={{ ...S.btnPrimary, display: 'flex', justifyContent: 'center', marginTop: '8px', width: '100%', boxSizing: 'border-box' }} onClick={() => setMenuOpen(false)}>Get Started Free</Link>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section style={S.hero} id="hero">
        <div style={S.heroAmbient} />
        <div style={S.container}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
              <span style={S.badge}>
                <span style={S.badgeDot} />
                AI-Powered Lifestyle Intelligence
              </span>
            </div>
            <h1 style={S.heroTitle}>
              Intelligent Lifestyle
              <br />
              <span style={S.gradientText}>Optimisation with AI</span>
            </h1>
            <p style={S.heroSubtitle}>
              LifeFlow analyses your daily habits, predicts productivity outcomes,
              and surfaces the precise changes that will unlock your peak performance.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '56px' }}>
              <Link to="/register" id="hero-cta-primary" style={S.btnPrimary}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(99,102,241,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.35)'; }}
              >
                Start Tracking Free
                <Icon.ArrowRight />
              </Link>
              <Link to="/login" id="hero-cta-secondary" style={S.btnGhost}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                Sign In
                <Icon.ChevronRight />
              </Link>
            </div>
          </div>

          {/* Focal card */}
          <div style={{ ...S.focalCard, maxWidth: '680px', margin: '0 auto' }} id="productivity-terminal">
            <div style={S.focalCardGlow} />
            {/* Shine line */}
            <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>Productivity Terminal</p>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Today's Snapshot</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px rgba(52,211,153,0.7)', display: 'block' }} />
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Live</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }} className="terminal-grid">
                <div>
                  <ProductivityRing score={82} />
                  <p style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '12px' }}>AI Productivity Score</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <MetricPill label="Sleep" value="7.5 hrs" trend={8} />
                  <MetricPill label="Exercise" value="42 min" trend={15} />
                  <MetricPill label="Screen" value="3.8 hrs" trend={-12} />
                  <MetricPill label="Focus" value="5 blocks" trend={5} />
                </div>
              </div>
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Link to="/register" id="focal-card-cta" style={{ ...S.btnPrimary, width: '100%', justifyContent: 'center', boxSizing: 'border-box' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.35)'; }}
                >
                  Analyse My Lifestyle with AI
                  <Icon.ArrowRight />
                </Link>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginTop: '28px' }}>
            {['✦ No credit card required', '✦ Free forever plan', '✦ 12,000+ users'].map(t => (
              <span key={t} style={{ ...S.glassSubtle, fontSize: '11px', color: 'rgba(255,255,255,0.35)', padding: '7px 16px', borderRadius: '100px' }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={S.section} id="analytics">
        <div style={S.container}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {STATS.map(s => (
              <div key={s.label} style={{ ...S.glassSubtle, textAlign: 'center', padding: '28px 20px', borderRadius: '20px' }}>
                <p style={{ ...S.gradientText, fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '6px' }}>{s.value}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={S.section} id="features">
        <div style={S.container}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(129,140,248,0.8)', marginBottom: '12px' }}>Core Capabilities</p>
            <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 700, color: 'rgba(255,255,255,0.9)', lineHeight: 1.25, marginBottom: '16px' }}>
              Everything you need to<br />
              <span style={S.gradientText}>live at peak performance</span>
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.38)', maxWidth: '420px', margin: '0 auto', lineHeight: 1.75 }}>
              Four intelligent systems working together to analyse, predict, and optimise your daily life.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {FEATURES.map((f, i) => <FeatureCard key={f.title} {...f} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={S.section}>
        <div style={S.container}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(129,140,248,0.8)', marginBottom: '12px' }}>What Users Say</p>
            <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 700, color: 'rgba(255,255,255,0.9)', lineHeight: 1.25 }}>
              Trusted by <span style={S.gradientText}>performance-driven</span> people
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ ...S.glassCard, borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => <Icon.Star key={i} />)}
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, flex: 1 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{t.name}</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={S.section} id="pricing">
        <div style={S.container}>
          <div style={S.ctaBanner}>
            <div style={S.ctaBannerGlow} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(167,139,250,0.7)', marginBottom: '16px' }}>Get Started Today</p>
              <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.5rem)', fontWeight: 800, color: 'rgba(255,255,255,0.95)', marginBottom: '14px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                Start your journey to<br />
                <span style={S.gradientText}>peak performance</span>
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px', maxWidth: '380px', margin: '0 auto 32px', lineHeight: 1.75 }}>
                Join thousands of professionals who use LifeFlow to design better, data-driven daily routines.
              </p>
              <Link to="/register" id="cta-banner-btn" style={S.btnPrimary}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(99,102,241,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.35)'; }}
              >
                Create Free Account
                <Icon.ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '32px 0' }}>
        <div style={{ ...S.container, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: 'linear-gradient(135deg, #6366f1, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="white" style={{ width: 12, height: 12 }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
              Life<span style={{ color: '#818cf8' }}>Flow</span>
            </span>
          </Link>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>© {new Date().getFullYear()} LifeFlow. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <Link key={l} to="/login" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.25)'}
              >{l}</Link>
            ))}
          </div>
        </div>
      </footer>

      {/* Responsive overrides */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #070711 !important; }
        .hidden-mobile { display: flex !important; }
        .mobile-menu-btn { display: none !important; }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .terminal-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
