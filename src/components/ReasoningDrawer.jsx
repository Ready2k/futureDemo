import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Shield, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Section = ({ title, icon: Icon, iconColor, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: '1rem' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0.5rem 0',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: iconColor || '#00AEEF' }}>
          <Icon size={15} />
          <span style={{ fontWeight: '700', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#bbb' }}>{title}</span>
        </div>
        {open ? <ChevronUp size={14} color="#666" /> : <ChevronDown size={14} color="#666" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ paddingTop: '0.75rem' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Row = ({ label, value, highlight, color }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
    background: highlight ? 'rgba(0,174,239,0.05)' : 'transparent',
    borderRadius: highlight ? '4px' : '0', paddingLeft: highlight ? '4px' : '0'
  }}>
    <span style={{ fontSize: '0.82rem', color: '#888' }}>{label}</span>
    <span style={{ fontSize: '0.82rem', fontWeight: '600', color: color || '#e0e0e0', fontFamily: 'monospace' }}>{value}</span>
  </div>
);

const PolicyBadge = ({ label, value, good }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px',
    background: good ? 'rgba(0,138,0,0.12)' : 'rgba(229,114,0,0.12)',
    borderRadius: '8px', marginBottom: '6px',
    border: `1px solid ${good ? 'rgba(0,138,0,0.25)' : 'rgba(229,114,0,0.25)'}`
  }}>
    <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {good ? <CheckCircle size={13} color="#4caf50" /> : <AlertCircle size={13} color="#ff9800" />}
      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: good ? '#4caf50' : '#ff9800' }}>{value}</span>
    </div>
  </div>
);

export const ReasoningDrawer = ({ trace, futureMode }) => {
  const [expanded, setExpanded] = useState(false);

  if (!trace) return null;

  return (
    <div style={{
      position: 'absolute',
      left: '-320px',
      top: '80px',
      width: '300px',
      fontFamily: "'Open Sans', sans-serif"
    }}>
      {/* Toggle Tab */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          position: 'absolute',
          top: 0,
          right: expanded ? '-1px' : '-1px',
          background: '#161B22',
          border: '1px solid #30363d',
          borderRight: expanded ? '1px solid #161B22' : '1px solid #30363d',
          borderRadius: expanded ? '8px 0 0 8px' : '8px',
          color: '#00AEEF',
          padding: '10px 14px',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '0.8rem', fontWeight: '700',
          whiteSpace: 'nowrap',
          zIndex: 10
        }}
      >
        <Brain size={15} />
        {expanded ? '← AI Trace' : 'AI Trace →'}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{
              position: 'absolute',
              top: 0,
              right: '-301px',
              width: '300px',
              background: '#0D1117',
              border: '1px solid #30363d',
              borderRadius: '0 12px 12px 12px',
              padding: '1rem',
              maxHeight: '75vh',
              overflowY: 'auto',
              boxShadow: '4px 0 30px rgba(0,0,0,0.5)',
              scrollbarWidth: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <Brain size={16} color="#00AEEF" />
              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#e0e0e0' }}>AI Decision Process</span>
              {futureMode && (
                <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: '700', background: 'linear-gradient(90deg, #7c3aed, #00AEEF)', color: 'white', padding: '2px 8px', borderRadius: '100px' }}>2028 MODE</span>
              )}
            </div>

            {/* Confidence Indicator */}
            {trace.confidence && (
              <div style={{ background: 'rgba(0,174,239,0.06)', border: '1px solid rgba(0,174,239,0.15)', borderRadius: '10px', padding: '10px 12px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>Intent Confidence</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '800', color: trace.confidence >= 95 ? '#4caf50' : '#ff9800', fontFamily: 'monospace' }}>{trace.confidence}%</span>
                </div>
                <div style={{ height: '4px', background: '#1e2433', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${trace.confidence}%`, background: trace.confidence >= 95 ? '#4caf50' : '#ff9800', borderRadius: '4px', transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#555', marginTop: '4px' }}>
                  {trace.confidence >= 95 ? 'High confidence — executing immediately' : 'Moderate confidence — awaiting confirmation'}
                </div>
              </div>
            )}


            {trace.reasoning && (
              <Section title="Reasoning Chain" icon={Brain} iconColor="#00AEEF">
                {trace.reasoning.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                    <div style={{
                      minWidth: '20px', height: '20px', background: '#00AEEF',
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', fontWeight: '700', color: 'white', marginTop: '1px'
                    }}>{i + 1}</div>
                    <span style={{ fontSize: '0.82rem', color: '#aaa', lineHeight: 1.4 }}>{step}</span>
                  </div>
                ))}
              </Section>
            )}

            {/* Financial Calculation */}
            {trace.financials && (
              <Section title="Financial Context" icon={Info} iconColor="#4caf50">
                {Object.entries(trace.financials).map(([k, v]) => (
                  <Row key={k} label={k} value={v.value} highlight={v.highlight} color={v.color} />
                ))}
              </Section>
            )}

            {/* Policy Trace */}
            {trace.policy && (
              <Section title="Policy Engine Trace" icon={Shield} iconColor="#ff9800" defaultOpen={true}>
                <Row label="Transfer amount" value={`£${trace.policy.amount}`} />
                <Row label="Rule triggered" value={trace.policy.rule} />
                <div style={{ height: '0.5rem' }} />
                <PolicyBadge label="Fraud risk score" value={trace.policy.fraudRisk} good={trace.policy.fraudRisk === 'Low'} />
                <PolicyBadge label="Device trust" value={trace.policy.deviceTrust} good={trace.policy.deviceTrust === 'High'} />
                <PolicyBadge label="Velocity check" value={trace.policy.velocityCheck} good={trace.policy.velocityCheck === 'Pass'} />
                <div style={{
                  marginTop: '0.75rem', padding: '8px 12px',
                  background: trace.policy.actionColor === 'warning' ? 'rgba(229,114,0,0.1)' : 'rgba(0,138,0,0.1)',
                  border: `1px solid ${trace.policy.actionColor === 'warning' ? 'rgba(229,114,0,0.3)' : 'rgba(0,138,0,0.3)'}`,
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '2px' }}>Action</div>
                  <div style={{
                    fontSize: '0.85rem', fontWeight: '700',
                    color: trace.policy.actionColor === 'warning' ? '#ff9800' : '#4caf50'
                  }}>{trace.policy.action}</div>
                </div>
              </Section>
            )}

            {/* Outcome */}
            {trace.outcome && (
              <Section title="Outcome" icon={CheckCircle} iconColor={trace.outcome.ok ? '#4caf50' : '#ff9800'}>
                <div style={{
                  padding: '10px 12px',
                  background: trace.outcome.ok ? 'rgba(0,138,0,0.1)' : 'rgba(229,114,0,0.1)',
                  borderRadius: '8px', border: `1px solid ${trace.outcome.ok ? 'rgba(0,138,0,0.25)' : 'rgba(229,114,0,0.25)'}`
                }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: trace.outcome.ok ? '#4caf50' : '#ff9800', marginBottom: '4px' }}>
                    {trace.outcome.verdict}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>{trace.outcome.impact}</div>
                </div>
                {futureMode && trace.outcome.futureNote && (
                  <div style={{
                    marginTop: '8px', padding: '8px 10px',
                    background: 'rgba(124,58,237,0.1)', borderRadius: '8px',
                    border: '1px solid rgba(124,58,237,0.25)'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#9c6fef', fontWeight: '700', marginBottom: '2px' }}>⚡ 2028 Mode</div>
                    <div style={{ fontSize: '0.78rem', color: '#888' }}>{trace.outcome.futureNote}</div>
                  </div>
                )}
              </Section>
            )}

            <div style={{ marginTop: '0.5rem', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.72rem', color: '#555', textAlign: 'center' }}>
              Trace generated by AI Governance Layer v1.0
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
