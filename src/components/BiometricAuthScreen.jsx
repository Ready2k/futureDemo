import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScanFace, CheckCircle2 } from 'lucide-react';

export const BiometricAuthScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState(0); // 0=logo, 1=scanning, 2=success, 3=exit

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),    // Start scan
      setTimeout(() => setPhase(2), 2200),   // Scan success
      setTimeout(() => setPhase(3), 3000),   // Success hold
      setTimeout(onComplete, 3500),          // Exit
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: phase === 3 ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 400,
        background: 'var(--brand-blue)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Open Sans', sans-serif",
      }}
    >
      {/* Barclays Logo & Branding */}
      <motion.div
        animate={{ y: phase >= 1 ? -60 : 0, scale: phase >= 1 ? 0.9 : 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
      >
        <div style={{
          width: '72px', height: '72px', borderRadius: '18px',
          background: 'linear-gradient(135deg, #00AEEF, #00395D)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          color: 'white', fontSize: '2.5rem', fontWeight: '800'
        }}>
          B
        </div>
        <div style={{ color: 'white', fontSize: '1.4rem', fontWeight: '700', letterSpacing: '0.02em' }}>
          Barclays
        </div>
      </motion.div>

      {/* Face ID Scanner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: phase >= 1 ? 1 : 0, scale: phase >= 1 ? 1 : 0.8 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem'
        }}
      >
        <div style={{ position: 'relative', width: '80px', height: '80px' }}>
          {/* Base Face Icon */}
          <ScanFace 
            size={80} 
            color={phase === 2 ? 'var(--success)' : 'rgba(255,255,255,0.2)'} 
            strokeWidth={1.5}
            style={{ transition: 'color 0.3s' }}
          />

          {/* Scanning Line overlay */}
          {phase === 1 && (
            <motion.div
              initial={{ top: 0 }}
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 1.4, ease: 'linear', repeat: Infinity }}
              style={{
                position: 'absolute', left: 0, right: 0, height: '4px',
                background: 'var(--brand-cyan)',
                boxShadow: '0 0 12px var(--brand-cyan)',
                borderRadius: '4px'
              }}
            />
          )}

          {/* Success Check overlay */}
          {phase === 2 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.6 }}
              style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,57,93,0.8)', borderRadius: '50%'
              }}
            >
              <CheckCircle2 size={48} color="var(--success)" fill="white" />
            </motion.div>
          )}
        </div>

        <div style={{ color: phase === 2 ? 'var(--success)' : 'white', fontSize: '0.95rem', fontWeight: '600', letterSpacing: '0.02em' }}>
          {phase === 0 ? '' : phase === 1 ? 'Authenticating...' : 'Verified'}
        </div>
      </motion.div>
    </motion.div>
  );
};
