import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Signal, Wifi, BatteryMedium } from 'lucide-react';

// Standard iPhone home apps - no banking, no branding
const HOME_APPS = [
  { name: 'Weather',  bg: 'linear-gradient(160deg, #1a6fa4, #32ade6)', icon: '🌤️' },
  { name: 'Maps',     bg: 'linear-gradient(160deg, #2b6cb0, #4299e1)', icon: '🗺️' },
  { name: 'Photos',   bg: 'linear-gradient(160deg, #c05621, #ed8936)', icon: '📸' },
  { name: 'Calendar', bg: 'linear-gradient(160deg, #c53030, #fc5454)', icon: '📅' },
  { name: 'Mail',     bg: 'linear-gradient(160deg, #2b6cb0, #3182ce)', icon: '✉️' },
  { name: 'Health',   bg: 'linear-gradient(160deg, #9b2c2c, #fc5454)', icon: '❤️' },
  { name: 'Finance',  bg: 'linear-gradient(160deg, #276749, #48bb78)', icon: '📊' },
  { name: 'Settings', bg: 'linear-gradient(160deg, #4a5568, #718096)', icon: '⚙️' },
];

const DOCK_APPS = [
  { icon: '💬', bg: 'linear-gradient(160deg, #276749, #43d854)' },
  { icon: '📞', bg: 'linear-gradient(160deg, #276749, #43d854)' },
  { icon: '🧭', bg: 'linear-gradient(160deg, #1a56db, #60a0ff)' },
  { icon: '📷', bg: 'linear-gradient(160deg, #2d3748, #4a5568)' },
];

const QUERY = "How much money can I spend this month?";

// Timing (ms)
const T_GLOW   = 1500;  // Apple Intelligence border activates
const T_BAR    = 2100;  // Input bar slides up
const T_TYPE   = 2700;  // Typing begins
const CHAR_MS  = 50;
const T_DONE   = T_TYPE + QUERY.length * CHAR_MS;  // ~4.6s
const T_EXIT   = T_DONE + 750;
const T_FINISH = T_EXIT + 800;

export const HomeScreenIntro = ({ onGlow, onComplete }) => {
  const [phase, setPhase]         = useState(0);
  const [typedText, setTypedText] = useState('');
  const [exiting, setExiting]     = useState(false);

  const [displayTime] = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })
  );
  const [displayDate] = useState(() =>
    new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  );

  useEffect(() => {
    const timers = [
      setTimeout(() => { setPhase(1); if (onGlow) onGlow(); }, T_GLOW),
      setTimeout(() => setPhase(2), T_BAR),
      setTimeout(() => setPhase(3), T_TYPE),
      setTimeout(() => setExiting(true), T_EXIT),
      setTimeout(onComplete, T_FINISH),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase !== 3) return;
    let i = 0;
    const iv = setInterval(() => {
      setTypedText(QUERY.substring(0, ++i));
      if (i >= QUERY.length) clearInterval(iv);
    }, CHAR_MS);
    return () => clearInterval(iv);
  }, [phase]);

  const isTypingDone = typedText.length === QUERY.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: exiting ? 0.85 : 0.45 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 500,
        background: 'linear-gradient(165deg, #08061a 0%, #130e36 50%, #0c1828 100%)',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Open Sans', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* ── Apple Intelligence border glow ──────────────────────────────────
          Matches iOS 18.1+ "rainbow aurora" border that appears when
          Apple Intelligence / Siri activates. Animated shifting gradient
          travels around all four screen edges simultaneously.          */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 1 ? 1 : 0 }}
        transition={{ duration: 0.7 }}
        style={{ position: 'absolute', inset: 0, zIndex: 30, pointerEvents: 'none', borderRadius: '38px', overflow: 'hidden' }}
      >
        {/* Top edge */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: 'linear-gradient(90deg, #00aaff, #a259ff, #ff2d9e, #ff7c00, #00aaff)',
          backgroundSize: '300% 100%', animation: 'aiEdgeH 2.2s linear infinite' }} />
        {/* Bottom edge */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px',
          background: 'linear-gradient(90deg, #ff7c00, #ff2d9e, #a259ff, #00aaff, #ff7c00)',
          backgroundSize: '300% 100%', animation: 'aiEdgeH 2.2s linear infinite' }} />
        {/* Left edge */}
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px',
          background: 'linear-gradient(180deg, #00aaff, #a259ff, #ff2d9e, #ff7c00)',
          backgroundSize: '100% 300%', animation: 'aiEdgeV 2.2s linear infinite' }} />
        {/* Right edge */}
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '4px',
          background: 'linear-gradient(180deg, #ff7c00, #ff2d9e, #a259ff, #00aaff)',
          backgroundSize: '100% 300%', animation: 'aiEdgeV 2.2s linear infinite reverse' }} />

        {/* Corner bloom glows */}
        <div style={{ position: 'absolute', top: -10, left: -10, width: '80px', height: '80px',
          background: 'radial-gradient(circle, rgba(0,170,255,0.35), transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: -10, right: -10, width: '80px', height: '80px',
          background: 'radial-gradient(circle, rgba(162,89,255,0.32), transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -10, left: -10, width: '80px', height: '80px',
          background: 'radial-gradient(circle, rgba(255,45,158,0.3), transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -10, right: -10, width: '80px', height: '80px',
          background: 'radial-gradient(circle, rgba(0,170,255,0.28), transparent 70%)', borderRadius: '50%' }} />
      </motion.div>

      {/* Subtle screen dim when AI activates */}
      <motion.div
        animate={{ background: phase >= 1 ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0)' }}
        transition={{ duration: 0.6 }}
        style={{ position: 'absolute', inset: 0, zIndex: 29, pointerEvents: 'none' }}
      />

      {/* Ambient wallpaper orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
        <div style={{ position: 'absolute', top: '18%', left: '8%',  width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,140,255,0.09) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '52%', right: '-5%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(130,80,255,0.07) 0%, transparent 70%)' }} />
      </div>

      {/* Status bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 26px 0', color: 'white', fontSize: '13px', fontWeight: '600',
        position: 'relative', zIndex: 40,
      }}>
        <span style={{ marginTop: '5px' }}>{displayTime}</span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '5px' }}>
          <Signal size={13} fill="white" />
          <Wifi size={13} />
          <BatteryMedium size={17} fill="white" />
        </div>
      </div>

      {/* Large clock */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.18 }}
        style={{ textAlign: 'center', paddingTop: '26px', marginBottom: '26px', position: 'relative', zIndex: 40 }}
      >
        <div style={{ fontSize: '5.5rem', fontWeight: '100', letterSpacing: '-3px', color: 'white', lineHeight: 1 }}>
          {displayTime}
        </div>
        <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.48)', marginTop: '7px', letterSpacing: '0.02em' }}>
          {displayDate}
        </div>
      </motion.div>

      {/* App grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '14px 8px', padding: '0 18px',
        flex: 1, position: 'relative', zIndex: 40,
      }}>
        {HOME_APPS.map((app, i) => (
          <motion.div
            key={app.name}
            initial={{ scale: 0.76, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.08 + i * 0.055, duration: 0.38, ease: 'easeOut' }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}
          >
            <div style={{
              width: '60px', height: '60px', borderRadius: '15px',
              background: app.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem',
              boxShadow: '0 4px 14px rgba(0,0,0,0.45)',
            }}>{app.icon}</div>
            <span style={{ fontSize: '0.63rem', color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
              {app.name}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Dock */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
        style={{
          margin: '12px 18px 0', padding: '10px 16px',
          background: 'rgba(255,255,255,0.09)', backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '26px', display: 'flex', justifyContent: 'space-around',
          position: 'relative', zIndex: 40,
        }}
      >
        {DOCK_APPS.map((app, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 + i * 0.05 }}>
            <div style={{
              width: '54px', height: '54px', borderRadius: '14px',
              background: app.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', boxShadow: '0 3px 10px rgba(0,0,0,0.4)',
            }}>{app.icon}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Apple Intelligence / Siri input bar ──────────────────────────────
          Matches the iOS 18 Siri text-input panel that appears at the bottom
          of the screen after the rainbow border activates. Clean pill shape,
          no branding, waveform orb on the left.                            */}
      <motion.div
        initial={{ opacity: 0, y: 48, scale: 0.97 }}
        animate={phase >= 2 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 48, scale: 0.97 }}
        transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        style={{
          margin: '10px 14px 30px',
          background: 'rgba(255,255,255,0.13)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderRadius: '22px',
          border: `1.5px solid ${phase >= 3 ? 'rgba(162,89,255,0.55)' : 'rgba(255,255,255,0.18)'}`,
          padding: '14px 16px',
          boxShadow: phase >= 3
            ? '0 0 50px rgba(162,89,255,0.22), 0 12px 32px rgba(0,0,0,0.35)'
            : '0 12px 32px rgba(0,0,0,0.35)',
          transition: 'border 0.35s, box-shadow 0.35s',
          position: 'relative', zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Siri waveform orb — conic gradient, spins on glow activation */}
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
            background: phase >= 1
              ? 'conic-gradient(from 0deg, #00aaff 0%, #a259ff 30%, #ff2d9e 60%, #ff7c00 80%, #00aaff 100%)'
              : 'rgba(255,255,255,0.18)',
            animation: phase >= 1 ? 'aiOrbSpin 3.5s linear infinite' : 'none',
            transition: 'background 0.6s',
            boxShadow: phase >= 1 ? '0 0 14px rgba(162,89,255,0.5)' : 'none',
          }} />

          {/* Text area */}
          <div style={{ flex: 1, fontSize: '0.92rem', color: 'white', minHeight: '20px', letterSpacing: '0.01em' }}>
            {phase >= 3 ? (
              <>
                {typedText}
                {!isTypingDone && (
                  <span style={{
                    display: 'inline-block', width: '2px', height: '15px',
                    background: 'rgba(255,255,255,0.85)',
                    marginLeft: '1px', verticalAlign: 'middle',
                    animation: 'blink 0.6s step-end infinite',
                  }} />
                )}
              </>
            ) : (
              <span style={{ color: 'rgba(255,255,255,0.32)', fontStyle: 'normal', fontSize: '0.88rem' }}>
                Ask me anything…
              </span>
            )}
          </div>

          {/* Mic → send transition */}
          {isTypingDone ? (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #a259ff, #00aaff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, boxShadow: '0 2px 12px rgba(162,89,255,0.5)',
              }}
            >
              <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: '700' }}>↑</span>
            </motion.div>
          ) : (
            <Mic size={17} color="rgba(255,255,255,0.38)" style={{ flexShrink: 0 }} />
          )}
        </div>
      </motion.div>

      {/* Keyframes */}
      <style>{`
        @keyframes blink       { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes aiEdgeH     { 0%{background-position:0% 50%} 100%{background-position:300% 50%} }
        @keyframes aiEdgeV     { 0%{background-position:50% 0%} 100%{background-position:50% 300%} }
        @keyframes aiOrbSpin   { from{filter:hue-rotate(0deg)} to{filter:hue-rotate(360deg)} }
      `}</style>
    </motion.div>
  );
};
