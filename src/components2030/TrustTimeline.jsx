import React from 'react';
import { CheckCircle } from 'lucide-react';

export const TrustTimeline = ({ steps }) => (
  <div style={{
    background: 'rgba(241,245,249,0.9)', border: '1px solid rgba(148,163,184,0.2)',
    borderRadius: '12px', padding: '12px 14px', marginTop: '1rem',
  }}>
    <div style={{
      fontSize: '0.66rem', fontWeight: '700', textTransform: 'uppercase',
      letterSpacing: '0.09em', color: '#94A3B8', marginBottom: '10px',
    }}>
      Execution Chain
    </div>
    {steps.map((step, i) => (
      <div key={i} style={{
        display: 'flex', alignItems: 'flex-start', gap: '8px',
        paddingBottom: i < steps.length - 1 ? '8px' : 0,
        marginBottom: i < steps.length - 1 ? '8px' : 0,
        borderBottom: i < steps.length - 1 ? '1px solid rgba(148,163,184,0.15)' : 'none',
      }}>
        <CheckCircle size={12} color="#10B981" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.77rem', fontWeight: '600', color: '#1E293B' }}>{step.label}</div>
          {step.detail && (
            <div style={{ fontSize: '0.67rem', color: '#64748B', marginTop: '1px', lineHeight: 1.4 }}>
              {step.detail}
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);
