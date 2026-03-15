import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, TrendingUp, ShieldCheck, Landmark } from 'lucide-react';

const LAYERS = [
  { label: 'User Interface',          sub: 'Mobile · Voice · Wearable · Web',                          color: '#00AEEF' },
  { label: 'Agentic AI Orchestration', sub: 'Intent Routing · Tool Selection · Multi-step Reasoning',     color: '#0077aa' },
  { label: 'Financial Context Graph', sub: 'Account Data · Spending Patterns · Goals · History',         color: '#005580' },
  { label: 'Policy & Risk Guardrails',sub: 'Compliance Rules · Fraud Scoring · Audit Trail',             color: '#003d66' },
  { label: 'Bank Capability APIs',    sub: 'Payments · Transfers · Products · Data',                     color: '#00264d' },
  { label: 'Core Banking Systems',    sub: 'Ledger · Settlement · Record of Truth',                      color: '#001a33' },
];

const BANK_ADVANTAGES = [
  { icon: '🏗️', label: 'Payments infrastructure' },
  { icon: '🛡️', label: 'Regulatory trust' },
  { icon: '⚖️', label: 'Risk management' },
];

const WHY_MATTERS = [
  { icon: TrendingUp, label: 'Daily engagement',           detail: 'Monthly logins become daily AI touchpoints — the most valuable shift in banking UX in a decade', primary: true },
  { icon: Layers,     label: 'Financial insights platform', detail: 'Proprietary behavioural data at scale — the raw material for advisory and product intelligence'    },
  { icon: TrendingUp, label: 'New advisory revenue',        detail: 'AI-surfaced products in context, not push campaigns — higher conversion, lower acquisition cost'    },
  { icon: ShieldCheck,label: 'Reduced operational cost',    detail: 'AI resolves most intents autonomously; humans handle only escalations'                              },
];


const FUTURES = [
  {
    emoji: '🏦',
    title: 'Bank-owned',
    desc: 'Bank builds the AI relationship layer. Customer loyalty stays with the institution.',
    highlight: true,
    advantage: ['Payments infrastructure', 'Regulatory trust', 'Risk management'],
  },
  {
    emoji: '📱',
    title: 'Device ecosystem',
    desc: 'Apple / Google absorbs financial intent. Banks become background APIs.',
    highlight: false,
    advantage: null,
  },
  {
    emoji: '🤖',
    title: 'Independent AI',
    desc: 'A model provider becomes the primary financial interface. Banks commoditised.',
    highlight: false,
    advantage: null,
  },
];

export const PlatformOverlay = ({ onClose }) => {
  const [visibleLayers, setVisibleLayers] = useState(0);

  useEffect(() => {
    const timers = LAYERS.map((_, i) =>
      setTimeout(() => setVisibleLayers(v => Math.max(v, i + 1)), i * 280)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'var(--overlay-bg)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '2rem',
        fontFamily: "'Open Sans', sans-serif",
        overflowY: 'auto',          /* ← page-level scroll */
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.96, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        style={{
          background: 'var(--overlay-card)',
          border: '1px solid var(--overlay-border)',
          borderRadius: '20px',
          padding: '2.5rem',
          maxWidth: '960px',
          width: '100%',
          position: 'relative',
          margin: 'auto',           /* centres vertically when content is short */
        }}
      >

        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(128,128,128,0.12)', border: '1px solid var(--overlay-border)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--overlay-sub)', display: 'flex' }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '0.75rem' }}>
            <Layers size={22} color="#00AEEF" />
            <span style={{ fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#00AEEF' }}>Platform Architecture</span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--overlay-text)', marginBottom: '0.5rem' }}>
            This isn't a feature.
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--overlay-sub)' }}>It's a new banking interface layer.</p>
        </div>

        {/* ── Architecture Stack ─────────────────────────────────────────── */}
        <div style={{ marginBottom: '2.5rem' }}>
          {LAYERS.map((layer, i) => (
            <motion.div
              key={layer.label}
              initial={{ opacity: 0, x: -20 }}
              animate={visibleLayers > i ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.3 }}
            >
              <div style={{
                background: layer.color,
                borderRadius: i === 0 ? '12px 12px 0 0' : i === LAYERS.length - 1 ? '0 0 12px 12px' : '0',
                padding: '14px 20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: i < LAYERS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none'
              }}>
                <div>
                  <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.95rem' }}>{layer.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>{layer.sub}</div>
                </div>
                {visibleLayers > i && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <div style={{ width: '8px', height: '8px', background: '#00AEEF', borderRadius: '50%', boxShadow: '0 0 8px #00AEEF' }} />
                  </motion.div>
                )}
              </div>
              {i < LAYERS.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2px 0' }}>
                  <div style={{ width: '1px', height: '8px', background: 'rgba(0,174,239,0.4)' }} />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <div style={{ height: '1px', background: 'var(--overlay-border)', margin: '0 0 2rem 0' }} />

        {/* ── Why This Matters for Banks ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ marginBottom: '2.5rem' }}
        >
          <p style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--overlay-muted)', marginBottom: '1.25rem', textAlign: 'center' }}>
            Why This Matters for Banks
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            {WHY_MATTERS.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                style={{
                  background: item.primary ? 'rgba(0,174,239,0.12)' : 'rgba(0,174,239,0.05)',
                  border: item.primary ? '1px solid rgba(0,174,239,0.4)' : '1px solid rgba(0,174,239,0.15)',
                  borderRadius: '12px',
                  padding: '1rem 0.75rem',
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                {item.primary && (
                  <div style={{ position: 'absolute', top: '-9px', left: '50%', transform: 'translateX(-50%)', background: '#00AEEF', borderRadius: '100px', padding: '1px 10px', fontSize: '0.6rem', fontWeight: '800', color: 'white', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                    KEY DRIVER
                  </div>
                )}
                <item.icon size={18} color={item.primary ? '#00AEEF' : '#4a9bbe'} style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: item.primary ? '#e0e0e0' : '#ccc', marginBottom: '4px', lineHeight: 1.3 }}>{item.label}</div>
                <div style={{ fontSize: '0.68rem', color: item.primary ? '#777' : '#555', lineHeight: 1.4 }}>{item.detail}</div>
              </motion.div>

            ))}
          </div>
        </motion.div>

        {/* ── Strategic Question ─────────────────────────────────────────── */}
        <div style={{ height: '1px', background: 'var(--overlay-border)', margin: '0 0 2rem 0' }} />
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--overlay-muted)', marginBottom: '0.75rem' }}>The Strategic Question</p>
          <p style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--overlay-text)', lineHeight: 1.5 }}>
            "If AI becomes the primary banking interface —<br />
            <span style={{ color: '#00AEEF' }}>who should own it?"</span>
          </p>
        </div>

        {/* ── Three Futures ──────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {FUTURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.15 }}
              style={{
                background: f.highlight ? 'rgba(0,174,239,0.07)' : 'rgba(128,128,128,0.05)',
                border: f.highlight ? '1px solid rgba(0,174,239,0.35)' : '1px solid var(--overlay-border)',
                borderRadius: '12px',
                padding: '1.25rem',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              {f.highlight && (
                <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg, #00395D, #00AEEF)', borderRadius: '100px', padding: '2px 12px', fontSize: '0.65rem', fontWeight: '800', color: 'white', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                  STRATEGIC IMPERATIVE
                </div>
              )}
              <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{f.emoji}</div>
              <div style={{ fontWeight: '700', color: f.highlight ? '#00AEEF' : 'var(--overlay-text)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{f.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--overlay-sub)', lineHeight: 1.5, marginBottom: f.advantage ? '0.9rem' : 0 }}>{f.desc}</div>
              {f.advantage && (
                <div style={{ borderTop: '1px solid rgba(0,174,239,0.2)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {f.advantage.map(a => (
                    <div key={a} style={{ fontSize: '0.72rem', color: '#00AEEF', fontWeight: '600' }}>✓ {a}</div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--overlay-muted)' }}>
          The interface layer is being claimed. The only question is whether banks claim it first.
        </p>
      </motion.div>
    </motion.div>
  );
};
