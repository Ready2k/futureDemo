import React from 'react';

const CHIP_CONFIGS = {
  barclays: { label: 'Executed by Barclays', color: '#00395D', bg: 'rgba(0,57,93,0.09)', dot: '#00AEEF' },
  visa: { label: 'Credential via Visa', color: '#1A1F71', bg: 'rgba(26,31,113,0.07)', dot: '#F7B600' },
  natwest: { label: 'NatWest Open Banking', color: '#6C1F85', bg: 'rgba(108,31,133,0.07)', dot: '#9C5DB1' },
  fraud: { label: 'Fraud monitoring active', color: '#065F46', bg: 'rgba(6,95,70,0.08)', dot: '#10B981' },
  consent: { label: 'Consent layer ✓', color: '#92400E', bg: 'rgba(146,64,14,0.07)', dot: '#F59E0B' },
  ai: { label: 'Personal AI orchestrator', color: '#4C1D95', bg: 'rgba(76,29,149,0.07)', dot: '#7C3AED' },
};

export const ProviderExecutionChip = ({ provider, label: customLabel }) => {
  const cfg = CHIP_CONFIGS[provider] || { label: provider, color: '#4B5563', bg: 'rgba(75,85,99,0.08)', dot: '#9CA3AF' };
  const label = customLabel || cfg.label;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: cfg.bg, border: `1px solid ${cfg.color}22`,
      borderRadius: '100px', padding: '3px 10px 3px 7px',
      fontSize: '0.67rem', fontWeight: '600', color: cfg.color, flexShrink: 0,
    }}>
      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {label}
    </div>
  );
};
