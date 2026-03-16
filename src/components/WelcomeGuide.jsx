import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Sparkles, Columns2, Volume2, Play, ChevronRight,
  Type, BrainCircuit, X, Clock,
} from 'lucide-react';

const FEATURES = [
  {
    icon: <Clock size={18} />,
    accent: '#00AEEF',
    title: 'Era Modes',
    body: 'Switch between Today, 2028, and 2030 using the toolbar buttons to show how AI banking evolves across three technology horizons.',
  },
  {
    icon: <Columns2 size={18} />,
    accent: '#a78bfa',
    title: 'Compare Mode',
    body: 'Toggle Compare to show two eras side-by-side with a live Advisor panel highlighting the differences scene-by-scene.',
  },
  {
    icon: <Play size={18} />,
    accent: '#4caf50',
    title: 'Auto-Pilot Demo',
    body: 'Press "Start Full Demo" to run all 6 scenes automatically. Use play/pause, prev/next, or jump directly to any scene mid-run.',
  },
  {
    icon: <Volume2 size={18} />,
    accent: '#00AEEF',
    title: 'Narration',
    body: 'Each scene plays a pre-recorded audio track. Toggle the Narrate button on/off — if an MP3 is missing the browser\'s speech engine steps in.',
  },
  {
    icon: <Type size={18} />,
    accent: '#f59e0b',
    title: 'Input Mode',
    body: 'Switch between Typed and Voice UI modes so the demo feels natural for different audience contexts — boardroom or hands-on workshop.',
  },
  {
    icon: <BrainCircuit size={18} />,
    accent: '#a78bfa',
    title: 'Reasoning Drawer',
    body: 'The panel to the left of the phone shows the AI\'s live reasoning — intent confidence, policy checks, and financial calculations — for every action.',
  },
];

const ERA_BADGES = [
  { label: 'Today', color: '#888', bg: 'rgba(100,100,100,0.12)', border: 'rgba(100,100,100,0.25)', desc: 'Manual banking — you do the reasoning.' },
  { label: '2028', color: '#00AEEF', bg: 'rgba(0,174,239,0.1)', border: 'rgba(0,174,239,0.3)', icon: <Zap size={11} fill="#00AEEF" />, desc: 'AI assistant inside the bank app.' },
  { label: '2030', color: '#a78bfa', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.3)', icon: <Sparkles size={11} color="#a78bfa" />, desc: 'Ambient intelligence — banking around you.' },
];

export function WelcomeGuide({ onDismiss, onStart }) {
  return (
    <AnimatePresence>
      <motion.div
        key="welcome-guide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onDismiss}
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(4,6,10,0.88)',
          backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
          overflowY: 'auto',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
          onClick={e => e.stopPropagation()}
          style={{
            background: '#0D1117',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '36px 40px',
            maxWidth: '780px',
            width: '100%',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
            position: 'relative',
          }}
        >
          {/* Close */}
          <button
            onClick={onDismiss}
            style={{
              position: 'absolute', top: '18px', right: '18px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '50%', width: '32px', height: '32px',
              color: '#888', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={15} />
          </button>

          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{
                fontSize: '0.68rem', fontWeight: '800', letterSpacing: '0.2em',
                textTransform: 'uppercase', color: '#00AEEF',
              }}>
                Future Banking Demo
              </span>
              <div style={{ width: '1px', height: '12px', background: '#2a2a2a' }} />
              <span style={{ fontSize: '0.68rem', color: '#777', letterSpacing: '0.05em' }}>Presenter Guide</span>
            </div>
            <h2 style={{
              fontSize: '1.6rem', fontWeight: '700', color: '#E8EAF0',
              letterSpacing: '-0.03em', lineHeight: 1.2, margin: 0,
            }}>
              Welcome. Here's what you can do.
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#9EA3B0', marginTop: '8px', lineHeight: 1.6 }}>
              This demo simulates an AI-native banking experience across three technology eras.
              Use the toolbar at the top to control every aspect of the presentation.
            </p>
          </div>

          {/* Era badges */}
          <div style={{
            display: 'flex', gap: '10px', marginBottom: '28px',
            padding: '16px 18px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#888', alignSelf: 'center', marginRight: '4px' }}>Three eras:</span>
            {ERA_BADGES.map(b => (
              <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: b.bg, border: `1px solid ${b.border}`,
                  borderRadius: '100px', padding: '4px 12px',
                  fontSize: '0.75rem', fontWeight: '700', color: b.color,
                }}>
                  {b.icon}{b.label}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#9EA3B0' }}>{b.desc}</span>
              </div>
            ))}
          </div>

          {/* Feature grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '12px',
            marginBottom: '28px',
          }}>
            {FEATURES.map(f => (
              <div
                key={f.title}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '16px 18px',
                }}
              >
                <div style={{
                  width: '34px', height: '34px', borderRadius: '10px',
                  background: `${f.accent}14`,
                  border: `1px solid ${f.accent}28`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: f.accent, marginBottom: '10px',
                }}>
                  {f.icon}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#E2E4EA', marginBottom: '5px' }}>{f.title}</div>
                <div style={{ fontSize: '0.76rem', color: '#9EA3B0', lineHeight: 1.55 }}>{f.body}</div>
              </div>
            ))}
          </div>

          {/* Demo flow hint */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 16px',
            background: 'rgba(0,174,239,0.05)',
            border: '1px solid rgba(0,174,239,0.15)',
            borderRadius: '10px',
            marginBottom: '24px',
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: '0.73rem', fontWeight: '700', color: '#00AEEF', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>6-scene flow:</span>
            {['Financial Awareness', 'Spending Insight', 'Affordability', 'Safe Transfer', 'Behavioural Intel', 'Intelligent Support'].map((s, i) => (
              <React.Fragment key={s}>
                <span style={{ fontSize: '0.72rem', color: '#9EA3B0', whiteSpace: 'nowrap' }}>{s}</span>
                {i < 5 && <ChevronRight size={11} color="#555" />}
              </React.Fragment>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={onStart}
              style={{
                background: 'linear-gradient(135deg, #00395D, #00AEEF)',
                border: 'none', borderRadius: '100px',
                padding: '12px 28px',
                color: 'white', fontWeight: '700', fontSize: '0.88rem',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 4px 20px rgba(0,174,239,0.25)',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Start Exploring
              <ChevronRight size={15} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
