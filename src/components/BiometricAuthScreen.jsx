import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ScanFace } from 'lucide-react';

export const BiometricAuthScreen = ({ onComplete, playing }) => {
  const [phase, setPhase] = useState(0); // 0=initial 1=scanning 2=success 3=exit

  // Pauseable timer state
  const elapsedRef     = useRef(0);
  const lastResumeRef  = useRef(Date.now());
  const timersRef      = useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const schedule = (elapsed) => {
    clearTimers();
    const STEPS = [
      { t: 700,  fn: () => setPhase(1) },
      { t: 2100, fn: () => setPhase(2) },
      { t: 3000, fn: () => setPhase(3) },
      { t: 3500, fn: onComplete },
    ];
    timersRef.current = STEPS
      .filter(s => s.t > elapsed)
      .map(s => setTimeout(s.fn, s.t - elapsed));
    lastResumeRef.current = Date.now();
  };

  // Initial schedule on mount
  useEffect(() => {
    schedule(0);
    return clearTimers;
  }, []);

  // Pause / resume
  useEffect(() => {
    if (playing === false) {
      elapsedRef.current += Date.now() - lastResumeRef.current;
      clearTimers();
    } else if (playing === true && elapsedRef.current > 0) {
      schedule(elapsedRef.current);
    }
  }, [playing]);

  const scanColor   = phase === 2 ? '#34c759' : phase >= 1 ? '#00AEEF' : 'rgba(255,255,255,0.18)';
  const statusLabel = phase >= 2 ? 'Face ID Verified' : 'Sign in with Face ID';
  const statusSub   = phase === 0 ? 'Position your face to authenticate'
                    : phase === 1 ? 'Scanning…'
                    : 'Welcome back';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: phase === 3 ? 0 : 1 }}
      transition={{ duration: 0.45 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 400,
        background: '#000',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Open Sans', sans-serif",
      }}
    >

      {/* App pill — anchored near top, below Dynamic Island */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        style={{
          position: 'absolute', top: '72px',
          display: 'flex', alignItems: 'center', gap: '9px',
        }}
      >
        <div style={{
          width: '28px', height: '28px', borderRadius: '7px',
          background: 'linear-gradient(155deg, #00AEEF 0%, #00395D 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.85rem', fontWeight: '800', color: 'white',
          boxShadow: '0 2px 10px rgba(0,174,239,0.35)',
        }}>B</div>
        <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem', fontWeight: '500', letterSpacing: '-0.01em' }}>
          Barclays
        </span>
      </motion.div>

      {/* ── Centred scanner + labels ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px' }}
      >
        {/* Face ID icon */}
        <div style={{ position: 'relative', width: '108px', height: '108px' }}>
          <ScanFace
            size={108}
            color={scanColor}
            strokeWidth={1.1}
            style={{ transition: 'color 0.35s ease', display: 'block' }}
          />

          {/* Scan line — only during phase 1 */}
          {phase === 1 && (
            <motion.div
              initial={{ top: '12px' }}
              animate={{ top: ['12px', '94px', '12px'] }}
              transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
              style={{
                position: 'absolute', left: '11px', right: '11px', height: '2px',
                background: 'linear-gradient(90deg, transparent, rgba(0,174,239,0.95), transparent)',
                boxShadow: '0 0 10px rgba(0,174,239,0.65)',
                borderRadius: '1px',
              }}
            />
          )}

          {/* Success checkmark — springs in during phase 2 */}
          {phase >= 2 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 290, damping: 18 }}
              style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
                <circle cx="23" cy="23" r="21" fill="#34c759" />
                <path d="M14 23l7 7 11-14" stroke="white" strokeWidth="2.8"
                      strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          )}
        </div>

        {/* Status labels */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <motion.div
            key={statusLabel}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              color: phase >= 2 ? '#34c759' : 'white',
              fontSize: '1.05rem', fontWeight: '600',
              letterSpacing: '-0.015em',
              transition: 'color 0.3s',
            }}
          >
            {statusLabel}
          </motion.div>
          <motion.div
            key={statusSub}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ color: 'rgba(255,255,255,0.36)', fontSize: '0.8rem', fontWeight: '400' }}
          >
            {statusSub}
          </motion.div>
        </div>
      </motion.div>

      {/* Privacy footnote */}
      <div style={{
        position: 'absolute', bottom: '52px',
        color: 'rgba(255,255,255,0.18)', fontSize: '0.7rem',
        textAlign: 'center', lineHeight: 1.5,
      }}>
        Face data never leaves your device
      </div>
    </motion.div>
  );
};
