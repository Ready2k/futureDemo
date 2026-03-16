import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, TrendingUp, ShieldCheck, Landmark } from 'lucide-react';

// ── Architecture Evolution: Three Eras ───────────────────────────────────────

const ERA_STACKS = [
  {
    era: 'Today',
    tagline: 'Banking is something you open',
    emoji: '📱',
    borderColor: 'rgba(0,174,239,0.45)',
    labelColor: '#00AEEF',
    taglineColor: '#5bb8e0',
    layerColors: ['#0e4a72', '#0d5580', '#0b618f', '#096d9d', '#0779ac', '#0585bb'],
    layers: [
      { label: 'Dedicated Bank App Shell',   sub: 'Manual navigation · Forms · Buttons' },
      { label: 'Hardcoded Business Rules',   sub: 'Workflows · Static Logic' },
      { label: 'Raw Account Data',           sub: 'Transaction History · Balances' },
      { label: 'Standard Auth',             sub: 'Session Management · PIN / Password' },
      { label: 'Internal Bank APIs',         sub: 'Proprietary · Closed' },
      { label: 'Core Banking Systems',       sub: 'Ledger · Settlement' },
    ],
    ownership: 'Bank owns interface + logic',
  },
  {
    era: '2028',
    tagline: 'Banking is something you ask',
    emoji: '⚡',
    borderColor: 'rgba(129,140,248,0.5)',
    labelColor: '#818cf8',
    taglineColor: '#a5b4fc',
    layerColors: ['#1e2d6b', '#2a2a7a', '#362789', '#422498', '#4e21a7', '#5a1eb6'],
    layers: [
      { label: 'User Interface (Bank-Owned)', sub: 'Mobile · Voice · Wearable' },
      { label: 'Agentic AI Orchestration',   sub: 'Intent Routing · Multi-step Reasoning' },
      { label: 'Financial Context Graph',    sub: 'Account Data + Semantic Understanding' },
      { label: 'Policy & Risk Guardrails',   sub: 'Compliance Rules · Audit Trails' },
      { label: 'Bank Capability APIs',       sub: 'Payments · Transfers · Products' },
      { label: 'Core Banking Systems',       sub: 'Ledger · Settlement · Record of Truth' },
    ],
    ownership: 'Bank owns interface + AI',
  },
  {
    era: '2030',
    tagline: 'Banking happens around you',
    emoji: '✨',
    borderColor: 'rgba(196,181,253,0.5)',
    labelColor: '#C4B5FD',
    taglineColor: '#ddd6fe',
    layerColors: ['#2d1069', '#3a0d7c', '#470a8f', '#5407a2', '#6104b5', '#6e01c8'],
    layers: [
      { label: 'Personal AI / Device Assistant', sub: 'OS-level · Siri · Android AI' },
      { label: 'Financial Agent Orchestrator',   sub: "Bank's agent in the AI ecosystem" },
      { label: 'Preference & Goal Memory',       sub: 'Cross-provider contextual memory' },
      { label: 'Consent / Policy / Risk Layer',  sub: 'Delegated authority · Cryptographic trust' },
      { label: 'Payment Networks / Open Banking',sub: 'Commerce APIs · Multi-provider' },
      { label: 'Core Banking + Human Escalation',sub: 'Trusted financial execution layer' },
    ],
    ownership: 'OS owns interface; Bank owns execution',
  },
];

const SHIFT_ROWS = [
  {
    layer: 'Interface',
    today: 'Bank App (closed)',
    y2028: 'Bank App + AI Assistant',
    y2030: 'OS / Personal AI',
    shift: 'Moves out of bank control',
  },
  {
    layer: 'Context',
    today: 'Single-bank data',
    y2028: 'Bank data + AI reasoning',
    y2030: 'Cross-provider + life goals',
    shift: 'Scope expands radically',
  },
  {
    layer: 'Policy',
    today: 'Fraud checks',
    y2028: 'AI guardrails',
    y2030: 'Delegated consent contracts',
    shift: 'Elevates to trust architecture',
  },
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
            The interface layer is moving.
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--overlay-sub)' }}>The 6-layer stack stays the same. Ownership and scope change everything.</p>
        </div>

        {/* ── Architecture Evolution: Three Eras ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: '2rem' }}
        >
          <p style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--overlay-muted)', marginBottom: '1.25rem', textAlign: 'center' }}>
            Architecture Evolution
          </p>

          {/* Three columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
            {ERA_STACKS.map((era, ei) => (
              <motion.div
                key={era.era}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + ei * 0.12 }}
                style={{ border: `1px solid ${era.borderColor}`, borderRadius: '14px', overflow: 'hidden' }}
              >
                {/* Era header */}
                <div style={{ padding: '12px 14px', textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderBottom: `1px solid ${era.borderColor}` }}>
                  <div style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{era.emoji}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.14em', color: era.labelColor, textTransform: 'uppercase', marginBottom: '4px' }}>{era.era}</div>
                  <div style={{ fontSize: '0.64rem', color: era.taglineColor, fontStyle: 'italic', lineHeight: 1.3 }}>{era.tagline}</div>
                </div>

                {/* Layer stack */}
                <div>
                  {era.layers.map((layer, li) => (
                    <div key={li} style={{
                      background: era.layerColors[li],
                      padding: '9px 12px',
                      borderBottom: li < era.layers.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                    }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#fff', lineHeight: 1.3 }}>{layer.label}</div>
                      <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.55)', marginTop: '2px', lineHeight: 1.3 }}>{layer.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Ownership footer */}
                <div style={{ padding: '8px 12px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: '700', color: era.labelColor, opacity: 0.85 }}>{era.ownership}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Structural Shift Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--overlay-border)', borderRadius: '12px', overflow: 'hidden' }}
          >
            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--overlay-border)', display: 'grid', gridTemplateColumns: '90px 1fr 1fr 1fr', gap: '12px' }}>
              {['Layer', 'Today', '2028', '2030'].map((h, i) => (
                <div key={h} style={{ fontSize: '0.6rem', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: i === 0 ? 'var(--overlay-muted)' : ERA_STACKS[i - 1]?.labelColor || 'var(--overlay-muted)' }}>{h}</div>
              ))}
            </div>
            {SHIFT_ROWS.map((row, ri) => (
              <div key={ri} style={{ padding: '9px 16px', borderBottom: ri < SHIFT_ROWS.length - 1 ? '1px solid var(--overlay-border)' : 'none', display: 'grid', gridTemplateColumns: '90px 1fr 1fr 1fr', gap: '12px', alignItems: 'center' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--overlay-text)' }}>{row.layer}</div>
                <div style={{ fontSize: '0.63rem', color: '#5bb8e0' }}>{row.today}</div>
                <div style={{ fontSize: '0.63rem', color: '#a5b4fc' }}>{row.y2028}</div>
                <div style={{ fontSize: '0.63rem', color: '#ddd6fe' }}>{row.y2030}</div>
              </div>
            ))}
            <div style={{ padding: '8px 16px', background: 'rgba(245,158,11,0.04)', borderTop: '1px solid rgba(245,158,11,0.12)' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: '700', color: '#f59e0b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>Structural Shift</div>
              <div style={{ fontSize: '0.67rem', color: '#c9a84c', lineHeight: 1.5 }}>
                The 6-layer stack remains identical across all three eras. What changes is <strong style={{ color: '#f59e0b' }}>ownership</strong> and <strong style={{ color: '#f59e0b' }}>scope</strong> — the interface migrates out of the bank, context expands cross-provider, and policy evolves into delegated trust contracts.
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div style={{ height: '1px', background: 'var(--overlay-border)', margin: '0 0 2rem 0' }} />

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
