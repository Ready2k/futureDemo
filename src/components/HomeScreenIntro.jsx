import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Signal, Wifi, BatteryMedium, Search } from 'lucide-react';

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

const SPOTLIGHT_QUERY = "Barclays";
const SPOT_CHAR_MS    = 80;
const CHAR_MS         = 50;
const WORD_MS         = 300;

export const HomeScreenIntro = ({
  onGlow,
  onComplete,
  playing,
  futureMode,
  query     = "How much money can I spend this month?",
  voiceQuery = "Hey Siri, how much can I spend this month?",
  inputMode = 'typed',
}) => {
  const activeQuery = inputMode === 'voice' ? voiceQuery : query;

  // Timing — computed from active query so each scene has correct durations
  const typingUnits = inputMode === 'voice' ? activeQuery.split(' ').length : activeQuery.length;
  const T_GLOW  = 1500;
  const T_BAR   = 2100;
  const T_TYPE  = 2700;
  const T_DONE  = T_TYPE + typingUnits * (inputMode === 'voice' ? WORD_MS : CHAR_MS);
  const T_EXIT_FUTURE   = T_DONE + 750;
  const T_FINISH_FUTURE = T_EXIT_FUTURE + 800;
  const T_SIRI_RESP     = T_DONE + 900;
  const T_BAR_DISMISS   = T_SIRI_RESP + 1800;
  const T_SPOTLIGHT     = T_BAR_DISMISS + 600;
  const T_SPOT_TYPE     = T_SPOTLIGHT + 500;
  const T_SPOT_DONE     = T_SPOT_TYPE + SPOTLIGHT_QUERY.length * SPOT_CHAR_MS;
  const T_TAP           = T_SPOT_DONE + 700;
  const T_EXIT_TODAY    = T_TAP + 500;
  const T_FINISH_TODAY  = T_EXIT_TODAY + 800;

  const [phase, setPhase]           = useState(0);
  const [typedText, setTypedText]   = useState('');
  const [spotlightText, setSpotlightText] = useState('');
  const [exiting, setExiting]       = useState(false);

  const [displayTime] = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })
  );
  const [displayDate] = useState(() =>
    new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  );

  const futureModeRef = useRef(futureMode);
  const elapsedRef    = useRef(0);
  const lastResumeRef = useRef(Date.now());
  const timersRef     = useRef([]);
  const typingRef     = useRef({ interval: null, charCount: 0 });
  const spotTypingRef = useRef({ interval: null, charCount: 0 });
  const phaseRef      = useRef(0);

  useEffect(() => { futureModeRef.current = futureMode; }, [futureMode]);

  const stopTyping = () => {
    if (typingRef.current.interval) { clearInterval(typingRef.current.interval); typingRef.current.interval = null; }
  };

  const startTyping = () => {
    stopTyping();
    if (inputMode === 'voice') {
      const words = activeQuery.split(' ');
      const iv = setInterval(() => {
        typingRef.current.charCount++;
        setTypedText(words.slice(0, typingRef.current.charCount).join(' '));
        if (typingRef.current.charCount >= words.length) { clearInterval(iv); typingRef.current.interval = null; }
      }, WORD_MS);
      typingRef.current.interval = iv;
    } else {
      const iv = setInterval(() => {
        typingRef.current.charCount++;
        setTypedText(activeQuery.substring(0, typingRef.current.charCount));
        if (typingRef.current.charCount >= activeQuery.length) { clearInterval(iv); typingRef.current.interval = null; }
      }, CHAR_MS);
      typingRef.current.interval = iv;
    }
  };

  const stopSpotTyping = () => {
    if (spotTypingRef.current.interval) { clearInterval(spotTypingRef.current.interval); spotTypingRef.current.interval = null; }
  };
  const startSpotTyping = () => {
    stopSpotTyping();
    const iv = setInterval(() => {
      spotTypingRef.current.charCount++;
      setSpotlightText(SPOTLIGHT_QUERY.substring(0, spotTypingRef.current.charCount));
      if (spotTypingRef.current.charCount >= SPOTLIGHT_QUERY.length) { clearInterval(iv); spotTypingRef.current.interval = null; }
    }, SPOT_CHAR_MS);
    spotTypingRef.current.interval = iv;
  };

  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };

  const schedule = (elapsed) => {
    clearTimers();
    const fm = futureModeRef.current;
    const bump = (p, fn) => () => { phaseRef.current = p; setPhase(p); fn && fn(); };

    const STEPS = fm ? [
      { t: T_GLOW,          fn: bump(1, () => { if (onGlow) onGlow(); }) },
      { t: T_BAR,           fn: bump(2) },
      { t: T_TYPE,          fn: bump(3, startTyping) },
      { t: T_EXIT_FUTURE,   fn: () => setExiting(true) },
      { t: T_FINISH_FUTURE, fn: () => onComplete(query) },
    ] : [
      { t: T_GLOW,          fn: bump(1) },
      { t: T_BAR,           fn: bump(2) },
      { t: T_TYPE,          fn: bump(3, startTyping) },
      { t: T_SIRI_RESP,     fn: bump(4) },
      { t: T_BAR_DISMISS,   fn: bump(5) },
      { t: T_SPOTLIGHT,     fn: bump(6) },
      { t: T_SPOT_TYPE,     fn: bump(7, startSpotTyping) },
      { t: T_TAP,           fn: bump(8) },
      { t: T_EXIT_TODAY,    fn: () => setExiting(true) },
      { t: T_FINISH_TODAY,  fn: onComplete },
    ];

    timersRef.current = STEPS
      .filter(s => s.t > elapsed)
      .map(s => setTimeout(s.fn, s.t - elapsed));
    lastResumeRef.current = Date.now();
  };

  useEffect(() => {
    schedule(0);
    return () => { clearTimers(); stopTyping(); stopSpotTyping(); };
  }, []);

  useEffect(() => {
    if (playing === false) {
      elapsedRef.current += Date.now() - lastResumeRef.current;
      clearTimers(); stopTyping(); stopSpotTyping();
    } else if (playing === true && elapsedRef.current > 0) {
      schedule(elapsedRef.current);
      if (phaseRef.current === 3 && typingRef.current.charCount < typingUnits) startTyping();
      if (phaseRef.current === 7 && spotTypingRef.current.charCount < SPOTLIGHT_QUERY.length) startSpotTyping();
    }
  }, [playing]);

  const isTypingDone  = typedText === activeQuery;
  const isSpotDone    = spotlightText.length === SPOTLIGHT_QUERY.length;
  const glowVisible   = futureMode ? phase >= 1 : (phase >= 1 && phase < 5);
  const siriBarVisible = futureMode ? phase >= 2 : (phase >= 2 && phase < 5);
  const siriCantHelp  = !futureMode && phase === 4;
  const spotlightOpen = !futureMode && phase >= 6;
  const spotlightTapped = !futureMode && phase >= 8;

  // Voice mode: style "Hey Siri, " prefix differently
  const renderQueryText = () => {
    if (!typedText) return null;
    if (inputMode === 'voice') {
      const m = typedText.match(/^(Hey Siri,?\s*)/i);
      if (m) {
        const prefix = m[1];
        const rest = typedText.slice(prefix.length);
        return <><span style={{ color: 'rgba(255,255,255,0.38)', fontStyle: 'italic', fontSize: '0.82rem' }}>{prefix}</span>{rest}</>;
      }
    }
    return typedText;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: exiting ? 0.85 : 0.45 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 1100,
        background: 'linear-gradient(165deg, #08061a 0%, #130e36 50%, #0c1828 100%)',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Open Sans', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Apple Intelligence border glow */}
      <motion.div
        animate={{ opacity: glowVisible ? 1 : 0 }}
        transition={{ duration: 0.7 }}
        style={{ position: 'absolute', inset: 0, zIndex: 30, pointerEvents: 'none', borderRadius: '38px', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: 'linear-gradient(90deg, #00aaff, #a259ff, #ff2d9e, #ff7c00, #00aaff)',
          backgroundSize: '300% 100%', animation: 'aiEdgeH 2.2s linear infinite' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px',
          background: 'linear-gradient(90deg, #ff7c00, #ff2d9e, #a259ff, #00aaff, #ff7c00)',
          backgroundSize: '300% 100%', animation: 'aiEdgeH 2.2s linear infinite' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px',
          background: 'linear-gradient(180deg, #00aaff, #a259ff, #ff2d9e, #ff7c00)',
          backgroundSize: '100% 300%', animation: 'aiEdgeV 2.2s linear infinite' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '4px',
          background: 'linear-gradient(180deg, #ff7c00, #ff2d9e, #a259ff, #00aaff)',
          backgroundSize: '100% 300%', animation: 'aiEdgeV 2.2s linear infinite reverse' }} />
        <div style={{ position: 'absolute', top: -10, left: -10, width: '80px', height: '80px',
          background: 'radial-gradient(circle, rgba(0,170,255,0.35), transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: -10, right: -10, width: '80px', height: '80px',
          background: 'radial-gradient(circle, rgba(162,89,255,0.32), transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -10, left: -10, width: '80px', height: '80px',
          background: 'radial-gradient(circle, rgba(255,45,158,0.3), transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -10, right: -10, width: '80px', height: '80px',
          background: 'radial-gradient(circle, rgba(0,170,255,0.28), transparent 70%)', borderRadius: '50%' }} />
      </motion.div>

      <motion.div
        animate={{ background: glowVisible ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0)' }}
        transition={{ duration: 0.6 }}
        style={{ position: 'absolute', inset: 0, zIndex: 29, pointerEvents: 'none' }}
      />

      {/* Ambient wallpaper orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
        <div style={{ position: 'absolute', top: '18%', left: '8%', width: '240px', height: '240px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,140,255,0.09) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '52%', right: '-5%', width: '200px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(130,80,255,0.07) 0%, transparent 70%)' }} />
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
              width: '60px', height: '60px', borderRadius: '15px', background: app.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem', boxShadow: '0 4px 14px rgba(0,0,0,0.45)',
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
          WebkitBackdropFilter: 'blur(20px)', borderRadius: '26px',
          display: 'flex', justifyContent: 'space-around', position: 'relative', zIndex: 40,
        }}
      >
        {DOCK_APPS.map((app, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 + i * 0.05 }}>
            <div style={{
              width: '54px', height: '54px', borderRadius: '14px', background: app.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', boxShadow: '0 3px 10px rgba(0,0,0,0.4)',
            }}>{app.icon}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Siri / Apple Intelligence input bar */}
      <motion.div
        initial={{ opacity: 0, y: 48, scale: 0.97 }}
        animate={siriBarVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 48, scale: 0.97 }}
        transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        style={{
          margin: '10px 14px 30px',
          background: 'rgba(255,255,255,0.13)',
          backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
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
          {/* Siri orb */}
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
            background: phase >= 1
              ? 'conic-gradient(from 0deg, #00aaff 0%, #a259ff 30%, #ff2d9e 60%, #ff7c00 80%, #00aaff 100%)'
              : 'rgba(255,255,255,0.18)',
            animation: phase >= 1 ? 'aiOrbSpin 3.5s linear infinite' : 'none',
            transition: 'background 0.6s',
            boxShadow: phase >= 1 ? '0 0 14px rgba(162,89,255,0.5)' : 'none',
          }} />

          {/* Text */}
          <div style={{ flex: 1, fontSize: '0.92rem', color: 'white', minHeight: '20px', letterSpacing: '0.01em' }}>
            {phase >= 3 ? (
              <>
                {renderQueryText()}
                {/* Typed mode: blinking cursor. Voice mode: pulsing mic dot */}
                {!isTypingDone && inputMode === 'typed' && (
                  <span style={{
                    display: 'inline-block', width: '2px', height: '15px',
                    background: 'rgba(255,255,255,0.85)', marginLeft: '1px',
                    verticalAlign: 'middle', animation: 'blink 0.6s step-end infinite',
                  }} />
                )}
                {!isTypingDone && inputMode === 'voice' && (
                  <span style={{
                    display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%',
                    background: 'rgba(162,89,255,0.9)', marginLeft: '4px',
                    verticalAlign: 'middle', animation: 'blink 0.5s ease-in-out infinite',
                  }} />
                )}
              </>
            ) : (
              <span style={{ color: 'rgba(255,255,255,0.32)', fontStyle: 'normal', fontSize: '0.88rem' }}>
                {inputMode === 'voice' ? 'Listening…' : 'Ask me anything…'}
              </span>
            )}
          </div>

          {/* Mic / send */}
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
            <Mic
              size={17}
              color={inputMode === 'voice' && phase >= 1 ? 'rgba(162,89,255,0.9)' : 'rgba(255,255,255,0.38)'}
              style={{ flexShrink: 0, animation: inputMode === 'voice' && phase >= 1 && !isTypingDone ? 'blink 1.2s ease-in-out infinite' : 'none' }}
            />
          )}
        </div>

        {/* Today: Siri "can't help" */}
        <AnimatePresence>
          {siriCantHelp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                marginTop: '12px', paddingTop: '12px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', gap: '9px', alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: '0.9rem', flexShrink: 0, marginTop: '1px' }}>🚫</span>
                <span style={{ color: 'rgba(255,255,255,0.52)', fontSize: '0.79rem', lineHeight: 1.55 }}>
                  Sorry, I can't access your banking information. You'll need to open your Barclays app directly.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Spotlight — Today mode only */}
      {spotlightOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28 }}
          style={{
            position: 'absolute', inset: 0, zIndex: 45,
            background: 'rgba(8,6,22,0.88)', backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
            display: 'flex', flexDirection: 'column',
            padding: '62px 14px 0',
            fontFamily: "-apple-system, 'Open Sans', sans-serif",
          }}
        >
          <div style={{
            background: 'rgba(255,255,255,0.14)', borderRadius: '14px', padding: '11px 14px',
            display: 'flex', alignItems: 'center', gap: '10px',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            <Search size={15} color="rgba(255,255,255,0.42)" />
            <span style={{ flex: 1, color: 'white', fontSize: '1rem', letterSpacing: '-0.01em', minHeight: '20px' }}>
              {spotlightText}
              {!isSpotDone && phase === 7 && (
                <span style={{
                  display: 'inline-block', width: '2px', height: '15px',
                  background: 'rgba(255,255,255,0.85)', marginLeft: '1px',
                  verticalAlign: 'middle', animation: 'blink 0.6s step-end infinite',
                }} />
              )}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', flexShrink: 0 }}>Cancel</span>
          </div>

          {spotlightText.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.72rem', fontWeight: '600',
                letterSpacing: '0.06em', textTransform: 'uppercase', margin: '16px 4px 8px' }}>
                Applications
              </div>
              <motion.div
                animate={spotlightTapped ? { scale: 0.97, background: 'rgba(0,174,239,0.15)' } : { scale: 1, background: 'rgba(255,255,255,0.09)' }}
                transition={{ duration: 0.12 }}
                style={{
                  borderRadius: '14px', padding: '12px 14px',
                  display: 'flex', alignItems: 'center', gap: '13px',
                  border: `1px solid ${spotlightTapped ? 'rgba(0,174,239,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  transition: 'border 0.15s',
                }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '11px', flexShrink: 0,
                  background: 'linear-gradient(155deg, #00AEEF 0%, #00395D 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem', fontWeight: '800', color: 'white',
                  boxShadow: '0 3px 12px rgba(0,174,239,0.35)',
                }}>B</div>
                <div>
                  <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: '600', letterSpacing: '-0.01em' }}>Barclays</div>
                  <div style={{ color: 'rgba(255,255,255,0.36)', fontSize: '0.72rem', marginTop: '2px' }}>Banking &amp; Savings</div>
                </div>
                <div style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.26)', fontSize: '0.72rem' }}>Open</div>
              </motion.div>
            </motion.div>
          )}

          {spotlightText.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '36px', color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>
              Siri Suggestions
            </div>
          )}
        </motion.div>
      )}

      <style>{`
        @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes aiEdgeH   { 0%{background-position:0% 50%} 100%{background-position:300% 50%} }
        @keyframes aiEdgeV   { 0%{background-position:50% 0%} 100%{background-position:50% 300%} }
        @keyframes aiOrbSpin { from{filter:hue-rotate(0deg)} to{filter:hue-rotate(360deg)} }
      `}</style>
    </motion.div>
  );
};
