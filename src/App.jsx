import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BankingProvider } from './context/BankingContext';
import { FinancialSummaryCard } from './components/FinancialSummaryCard';
import { ConversationPanel } from './components/ConversationPanel';
import { PlatformOverlay } from './components/PlatformOverlay';
import { HomeScreenIntro } from './components/HomeScreenIntro';
import { BiometricAuthScreen } from './components/BiometricAuthScreen';
import { useBanking } from './context/BankingContext';
import { Home, ArrowLeftRight, CreditCard, MessageCircle, Wifi, BatteryMedium, Signal, Zap, RotateCcw, ChevronDown, Sun, Moon, Play, Pause, FastForward, Rewind, List, Columns2 } from 'lucide-react';
import { ComparisonAdvisor } from './components/ComparisonAdvisor';

// Thin ambient header shown when header is collapsed
const CollapsedHeader = ({ time, futureMode, totalWealth, onExpand }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    onClick={onExpand}
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '47px 20px 0',
      height: '91px',
      background: futureMode
        ? 'linear-gradient(90deg, #0D0025, #00395D)'
        : 'var(--brand-blue)',
      cursor: 'pointer',
      flexShrink: 0,
    }}
  >
    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'white', letterSpacing: '0.05em' }}>BARCLAYS</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {futureMode && (
        <span style={{ fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.15em', color: '#00AEEF', textTransform: 'uppercase' }}>2028</span>
      )}
      <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '100px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'white' }}>£{totalWealth?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>
      <ChevronDown size={14} color="rgba(255,255,255,0.5)" />
    </div>
  </motion.div>
);

// Inner app so we can use useBanking for the collapsed header balance
function AppInner({ futureMode, headerCollapsed, onExpand, startEventName = 'START_AUTOPILOT_DEMO', side = null }) {
  const { profile, discretionaryIncome } = useBanking();
  const isa = profile?.linked_accounts?.natwest_isa;
  const totalWealth = (profile?.accounts.current || 0) + (profile?.accounts.savings || 0) + (futureMode ? (isa?.balance || 0) : 0);
  const [time] = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })
  );

  const headerBg = futureMode
    ? 'linear-gradient(135deg, #0D0025 0%, #00395D 100%)'
    : 'var(--brand-blue)';

  return (
    <>
      {/* iOS Status Bar — always visible */}
      <div className="ios-status-bar" style={{ background: futureMode ? 'linear-gradient(90deg, #1a0035, #003555)' : undefined }}>
        <div className="time">{time}</div>
        <div className="icons">
          <Signal size={14} fill="white" />
          <Wifi size={14} />
          <BatteryMedium size={18} fill="white" />
        </div>
      </div>

      <div className="app-container">
        {/* ── Collapsible Header ─────────────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {headerCollapsed ? (
            // Collapsed: just a thin ambient strip with total balance
            <CollapsedHeader
              key="collapsed"
              futureMode={futureMode}
              totalWealth={totalWealth}
              onExpand={onExpand}
              time={time}
            />
          ) : (
            // Expanded: full Barclays header + account cards
            <motion.div
              key="expanded"
              initial={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              style={{ flexShrink: 0 }}
            >
              {/* Nav bar */}
              <div className="header" style={{ paddingTop: '65px', background: headerBg }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingBottom: '10px' }}>
                  <div style={{ width: '28px' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '1.2rem', fontWeight: '600', letterSpacing: '-0.5px' }}>BARCLAYS</h1>
                    {futureMode && (
                      <span style={{ fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.15em', color: '#00AEEF', textTransform: 'uppercase', marginTop: '1px' }}>2028 Intelligence</span>
                    )}
                  </div>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>DC</div>
                </div>
              </div>

              {/* Account Cards */}
              <div style={{ background: headerBg, borderRadius: '0 0 24px 24px', zIndex: 10, flexShrink: 0 }}>
                <FinancialSummaryCard futureMode={futureMode} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conversation Panel — fills remaining space */}
        <ConversationPanel futureMode={futureMode} startEventName={startEventName} side={side} />

        {/* Bottom Nav */}
        <div className="bottom-nav">
          <div className="nav-item"><Home size={22} /><span>Home</span></div>
          <div className="nav-item"><ArrowLeftRight size={22} /><span>Pay & Transfer</span></div>
          <div className="nav-item active"><MessageCircle size={22} /><span>Assistant</span></div>
          <div className="nav-item"><CreditCard size={22} /><span>Cards</span></div>
        </div>
      </div>
    </>
  );
}

function App() {
  const [futureMode, setFutureMode] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [showHomeScreen, setShowHomeScreen] = useState(false);
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const pendingQueryRef = useRef(null);
  const [aiGlow, setAiGlow] = useState(false);
  const [demoPhaseLabel, setDemoPhaseLabel] = useState(null);
  const [demoPhase, setDemoPhase] = useState(0);
  const [demoTotal, setDemoTotal] = useState(6);
  const [demoRunning, setDemoRunning] = useState(false);
  const comparisonGateRef = useRef({ today: false, future: false });
  const [showTodayHomeScreen, setShowTodayHomeScreen] = useState(false);
  const [showTodayAuthScreen, setShowTodayAuthScreen] = useState(false);
  const [showFutureHomeScreen, setShowFutureHomeScreen] = useState(false);
  const [showFutureAuthScreen, setShowFutureAuthScreen] = useState(false);
  const [showPlatformOverlay, setShowPlatformOverlay] = useState(true);
  const [demoPlaying, setDemoPlaying] = useState(true);

  // Time ticker
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 60000);
    return () => clearInterval(timer);
  }, []);

  // Apply dark mode to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Scale phone to always fit full height (and width in comparison mode)
  useEffect(() => {
    const setZoom = () => {
      const heightScale = (window.innerHeight - 90) / 844;
      let scale;
      if (comparisonMode) {
        // Two phones (390px each) + advisor (264px) + gaps (3 × 16px) + side padding (40px)
        const widthScale = (window.innerWidth - 264 - 48 - 40) / (2 * 390);
        scale = Math.min(1, heightScale, widthScale);
      } else {
        scale = Math.min(1, heightScale);
      }
      document.documentElement.style.setProperty('--phone-zoom', Math.max(0.38, scale));
    };
    setZoom();
    window.addEventListener('resize', setZoom);
    return () => window.removeEventListener('resize', setZoom);
  }, [comparisonMode]);

  // Collapse header when user sends first message
  useEffect(() => {
    const onChatStarted = () => setHeaderCollapsed(true);
    const onReset = () => setHeaderCollapsed(false);
    window.addEventListener('CHAT_STARTED', onChatStarted);
    window.addEventListener('RESET_CHAT', onReset);
    return () => {
      window.removeEventListener('CHAT_STARTED', onChatStarted);
      window.removeEventListener('RESET_CHAT', onReset);
    };
  }, []);

  useEffect(() => {
    const onPhaseUpdate = (e) => {
      const { label, phase, total, showPlatform } = e.detail;
      setDemoPhaseLabel(label);
      if (total) setDemoTotal(total);
      setDemoPhase(phase || 0);
      if (phase === 0) {
        setDemoRunning(false);
        if (showPlatform) setTimeout(() => setShowPlatformOverlay(true), 600);
      }
    };
    window.addEventListener('DEMO_PHASE_UPDATE', onPhaseUpdate);
    return () => window.removeEventListener('DEMO_PHASE_UPDATE', onPhaseUpdate);
  }, []);

  // Sync play/pause button icon with autopilot state
  useEffect(() => {
    const onPlayState = (e) => setDemoPlaying(e.detail.playing);
    window.addEventListener('AUTOPILOT_PLAY_STATE', onPlayState);
    return () => window.removeEventListener('AUTOPILOT_PLAY_STATE', onPlayState);
  }, []);

  // Comparison mode: gate coordinator — fires COMPARISON_PROCEED when both panels finish scene 1
  useEffect(() => {
    const onDone = (e) => {
      const gate = comparisonGateRef.current;
      gate[e.detail.side] = true;
      if (gate.today && gate.future) {
        gate.today = false;
        gate.future = false;
        window.dispatchEvent(new CustomEvent('COMPARISON_PROCEED'));
      }
    };
    const onReset = () => { comparisonGateRef.current = { today: false, future: false }; };
    window.addEventListener('COMPARISON_SCENE1_DONE', onDone);
    window.addEventListener('RESET_CHAT', onReset);
    return () => {
      window.removeEventListener('COMPARISON_SCENE1_DONE', onDone);
      window.removeEventListener('RESET_CHAT', onReset);
    };
  }, []);

  const handleDemoClick = () => {
    if (demoRunning) return;
    setDemoRunning(true);
    setShowPlatformOverlay(false);
    if (comparisonMode) {
      setDemoPhaseLabel('Scene 0 — Ambient Entry');
      setDemoPhase(0);
      // Both phones show HomeScreenIntro — Future's completes ~5.5s faster (no Siri failure/Spotlight)
      setShowTodayHomeScreen(true);
      setShowFutureHomeScreen(true);
    } else {
      setDemoPhaseLabel('Scene 0 — Ambient Entry');
      setDemoPhase(0);
      // Show home screen first — it fires START_AUTOPILOT_DEMO on completion
      setShowHomeScreen(true);
    }
  };

  const handleHomeScreenComplete = (query) => {
    setShowHomeScreen(false);
    setAiGlow(false);
    setDemoPhaseLabel('Scene 0 — Authenticating…');
    pendingQueryRef.current = query || null;
    setShowAuthScreen(true);
  };

  const handleAuthComplete = () => {
    setShowAuthScreen(false);
    setDemoPhaseLabel('Starting…');
    setDemoPhase(1);
    window.dispatchEvent(new CustomEvent('START_AUTOPILOT_DEMO', { detail: { pendingQuery: pendingQueryRef.current } }));
    pendingQueryRef.current = null;
  };

  const handleTodayHomeComplete = () => {
    setShowTodayHomeScreen(false);
    setShowTodayAuthScreen(true);
  };

  const handleFutureHomeComplete = () => {
    setShowFutureHomeScreen(false);
    setShowFutureAuthScreen(true);
  };

  const handleTodayAuthComplete = () => {
    setShowTodayAuthScreen(false);
    window.dispatchEvent(new CustomEvent('START_AUTOPILOT_DEMO_TODAY'));
  };

  const handleFutureAuthComplete = () => {
    setShowFutureAuthScreen(false);
    window.dispatchEvent(new CustomEvent('START_AUTOPILOT_DEMO_FUTURE'));
  };

  const handleReset = () => {
    setDemoRunning(false);
    setDemoPhaseLabel(null);
    setDemoPhase(0);
    setShowPlatformOverlay(false);
    setShowHomeScreen(false);
    setShowAuthScreen(false);
    setShowTodayHomeScreen(false);
    setShowTodayAuthScreen(false);
    setShowFutureHomeScreen(false);
    setShowFutureAuthScreen(false);
    setAiGlow(false);
    setHeaderCollapsed(false);
    setDemoPlaying(true);
    window.dispatchEvent(new CustomEvent('RESET_CHAT'));
  };

  const isComplete = demoPhaseLabel && (demoPhaseLabel.startsWith('✓') || demoPhaseLabel.startsWith('Platform'));

  const SCENE_OPTIONS = [
    { value: 0, label: '1. Financial Awareness' },
    { value: 1, label: '2. Spending Insight' },
    { value: 2, label: '3. Affordability Reasoning' },
    { value: 3, label: '4. Safe Transfer' },
    { value: 4, label: '5. Behavioural Intelligence' },
    { value: 5, label: '6. Intelligent Support' },
  ];

  return (
    <BankingProvider>

      {/* ── Presenter Header Bar ──────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9998,
        background: 'rgba(8,13,20,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        height: '58px', display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: '12px', fontFamily: 'inherit',
      }}>

        {/* Left — branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#00AEEF', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Future Banking</span>
          <div style={{ width: '1px', height: '14px', background: '#2a2a2a' }} />
          <span style={{ fontSize: '0.68rem', color: '#444', letterSpacing: '0.05em' }}>Presenter Demo</span>
        </div>

        {/* Centre — progress bar */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', padding: '0 28px' }}>
          {demoRunning && demoPhaseLabel && !isComplete && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', color: demoPlaying ? '#888' : '#f59e0b', fontFamily: 'inherit', transition: 'color 0.2s' }}>
                  {demoPlaying ? demoPhaseLabel : `⏸  ${demoPhaseLabel}`}
                </span>
                <span style={{ fontSize: '0.66rem', color: '#444' }}>{demoPhase} / {demoTotal}</span>
              </div>
              <div style={{ height: '3px', background: '#222', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(demoPhase / demoTotal) * 100}%`, background: demoPlaying ? 'linear-gradient(90deg, #00395D, #00AEEF)' : '#f59e0b', borderRadius: '3px', transition: 'background 0.3s, width 0.8s ease' }} />
              </div>
            </>
          )}
          {isComplete && (
            <span style={{ fontSize: '0.68rem', color: '#4caf50', fontFamily: 'inherit' }}>{demoPhaseLabel}</span>
          )}
        </div>

        {/* Right — controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

          {/* Dark mode */}
          <button
            onClick={() => setDarkMode(d => !d)}
            style={{
              background: 'transparent', border: '1px solid #272727',
              borderRadius: '100px', padding: '7px 14px',
              color: '#777', display: 'flex', alignItems: 'center', gap: '6px',
              cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit',
            }}
          >
            {darkMode ? <Sun size={13} /> : <Moon size={13} />}
            {darkMode ? 'Light' : 'Dark'}
          </button>

          {/* Future mode */}
          <div
            onClick={() => setFutureMode(f => !f)}
            style={{
              background: futureMode ? 'linear-gradient(135deg, #7c3aed, #00AEEF)' : '#1a1a1a',
              border: `1px solid ${futureMode ? 'transparent' : '#272727'}`,
              borderRadius: '100px', padding: '7px 14px', color: 'white',
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
              fontSize: '0.78rem', fontFamily: 'inherit',
              boxShadow: futureMode ? '0 4px 16px rgba(124,58,237,0.35)' : 'none',
              transition: 'all 0.25s',
            }}
          >
            <Zap size={13} fill={futureMode ? 'white' : 'none'} />
            <span>{futureMode ? '2028 Mode' : 'Today'}</span>
            <div style={{ width: '26px', height: '15px', borderRadius: '100px', background: 'rgba(255,255,255,0.2)', position: 'relative', flexShrink: 0 }}>
              <div style={{ width: '11px', height: '11px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: futureMode ? '13px' : '2px', transition: 'left 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
            </div>
          </div>

          {/* Compare mode */}
          <div
            onClick={() => setComparisonMode(c => !c)}
            style={{
              background: comparisonMode ? 'rgba(0,174,239,0.15)' : '#1a1a1a',
              border: `1px solid ${comparisonMode ? 'rgba(0,174,239,0.4)' : '#272727'}`,
              borderRadius: '100px', padding: '7px 14px', color: comparisonMode ? '#00AEEF' : '#555',
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
              fontSize: '0.78rem', fontFamily: 'inherit',
              transition: 'all 0.25s',
            }}
          >
            <Columns2 size={13} />
            <span>Compare</span>
            <div style={{ width: '26px', height: '15px', borderRadius: '100px', background: 'rgba(255,255,255,0.1)', position: 'relative', flexShrink: 0 }}>
              <div style={{ width: '11px', height: '11px', background: comparisonMode ? '#00AEEF' : '#333', borderRadius: '50%', position: 'absolute', top: '2px', left: comparisonMode ? '13px' : '2px', transition: 'left 0.25s, background 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
            </div>
          </div>

          <div style={{ width: '1px', height: '24px', background: '#1e1e1e' }} />

          {/* Playback controls — while running */}
          {demoRunning && !isComplete && (
            <>
              <div style={{ display: 'flex', gap: '2px', background: '#1a1a1a', borderRadius: '100px', padding: '4px', border: '1px solid #272727' }}>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('AUTOPILOT_CTRL', { detail: { action: 'jump', index: demoPhase - 2 } }))}
                  title="Previous scene"
                  style={{ background: 'transparent', border: 'none', color: '#666', padding: '7px 9px', cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center' }}
                >
                  <Rewind size={15} />
                </button>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('AUTOPILOT_CTRL', { detail: { action: 'togglePlay' } }))}
                  title={demoPlaying ? 'Pause' : 'Resume'}
                  style={{ background: '#00395D', border: 'none', color: 'white', padding: '7px 9px', cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center', boxShadow: '0 0 10px rgba(0,174,239,0.3)' }}
                >
                  {demoPlaying ? <Pause size={15} fill="white" /> : <Play size={15} fill="white" />}
                </button>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('AUTOPILOT_CTRL', { detail: { action: 'jump', index: demoPhase } }))}
                  title="Next scene"
                  style={{ background: 'transparent', border: 'none', color: '#666', padding: '7px 9px', cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center' }}
                >
                  <FastForward size={15} />
                </button>
              </div>

              <select
                onChange={(e) => {
                  const idx = parseInt(e.target.value, 10);
                  window.dispatchEvent(new CustomEvent('AUTOPILOT_CTRL', { detail: { action: 'jump', index: idx } }));
                }}
                value={demoPhase > 0 ? demoPhase - 1 : ''}
                style={{ background: '#1a1a1a', color: '#bbb', border: '1px solid #272727', borderRadius: '100px', padding: '8px 14px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem', appearance: 'none' }}
              >
                <option value="" disabled>Jump to…</option>
                {SCENE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              <button
                onClick={handleReset}
                title="Reset demo"
                style={{ background: 'transparent', border: '1px solid #272727', color: '#555', padding: '8px 10px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <RotateCcw size={14} />
              </button>
            </>
          )}

          {/* Jump dropdown — when idle or complete */}
          {(!demoRunning || isComplete) && (
            <select
              onChange={(e) => {
                const idx = parseInt(e.target.value, 10);
                e.target.value = '';
                window.dispatchEvent(new CustomEvent('AUTOPILOT_CTRL', { detail: { action: 'jump', index: idx } }));
              }}
              value=""
              style={{ background: '#1a1a1a', color: '#666', border: '1px solid #272727', borderRadius: '100px', padding: '8px 14px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem', appearance: 'none' }}
            >
              <option value="" disabled>Jump Directly To…</option>
              {SCENE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )}

          {/* Reset — when complete */}
          {isComplete && (
            <button
              onClick={handleReset}
              title="Reset demo"
              style={{ background: 'transparent', border: '1px solid #272727', color: '#555', padding: '8px 10px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <RotateCcw size={14} />
            </button>
          )}

          {/* Start / Restart */}
          <button
            onClick={isComplete ? handleReset : handleDemoClick}
            disabled={demoRunning && !isComplete}
            style={{
              background: isComplete ? '#0a2a0a' : demoRunning ? '#1a1a1a' : '#0F0F0F',
              color: isComplete ? '#4caf50' : 'white',
              border: `1px solid ${isComplete ? 'rgba(76,175,80,0.4)' : '#3d3d3d'}`,
              padding: '8px 18px', borderRadius: '100px',
              fontFamily: 'inherit', fontWeight: '600', fontSize: '0.85rem',
              cursor: demoRunning && !isComplete ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              opacity: demoRunning && !isComplete ? 0.55 : 1,
              transition: 'all 0.2s',
            }}
          >
            <span style={{
              width: '9px', height: '9px', flexShrink: 0,
              background: isComplete ? '#4caf50' : demoRunning ? '#ff9800' : '#00AEEF',
              borderRadius: '50%',
              animation: demoRunning && !isComplete ? 'pulseOrange 1.2s infinite' : 'pulse 3s infinite',
            }} />
            {isComplete ? 'Restart' : demoRunning ? 'Running…' : 'Start Full Demo'}
          </button>

        </div>
      </div>

      {/* ── Page content — offset below fixed header ─────────────────────── */}
      <div style={{
        paddingTop: '58px', height: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxSizing: 'border-box',
        background: 'radial-gradient(ellipse at 50% 56%, rgba(0,57,93,0.22) 0%, rgba(0,174,239,0.04) 35%, transparent 65%)',
        gap: '16px',
        padding: '58px 20px 0',
      }}>

        {comparisonMode ? (
          /* ── Comparison layout: Today | Advisor | Future ── */
          <>
            {/* Today phone */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <div style={{
                fontSize: '0.6rem', fontWeight: '800', letterSpacing: '0.18em',
                color: '#00AEEF', textTransform: 'uppercase',
                background: 'rgba(0,174,239,0.08)', border: '1px solid rgba(0,174,239,0.2)',
                borderRadius: '100px', padding: '3px 12px',
              }}>
                Today
              </div>
              <BankingProvider>
                <div className="mobile-device-wrapper">
                  <AppInner
                    futureMode={false}
                    headerCollapsed={headerCollapsed}
                    onExpand={() => setHeaderCollapsed(false)}
                    startEventName="START_AUTOPILOT_DEMO_TODAY"
                    side="today"
                  />
                  {(showTodayHomeScreen || showTodayAuthScreen) && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 1050, background: '#000' }} />
                  )}
                  <AnimatePresence>
                    {showTodayAuthScreen && (
                      <BiometricAuthScreen onComplete={handleTodayAuthComplete} playing={demoPlaying} />
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {showTodayHomeScreen && (
                      <HomeScreenIntro
                        futureMode={false}
                        playing={demoPlaying}
                        onGlow={() => {}}
                        onComplete={handleTodayHomeComplete}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </BankingProvider>
            </div>

            {/* Comparison advisor */}
            <ComparisonAdvisor phase={demoPhase} running={demoRunning} />

            {/* Future / 2028 phone */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <div style={{
                fontSize: '0.6rem', fontWeight: '800', letterSpacing: '0.18em',
                color: '#a78bfa', textTransform: 'uppercase',
                background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: '100px', padding: '3px 12px',
              }}>
                2028
              </div>
              <BankingProvider>
                <div className="mobile-device-wrapper">
                  <AppInner
                    futureMode={true}
                    headerCollapsed={headerCollapsed}
                    onExpand={() => setHeaderCollapsed(false)}
                    startEventName="START_AUTOPILOT_DEMO_FUTURE"
                    side="future"
                  />
                  {(showFutureHomeScreen || showFutureAuthScreen) && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 1050, background: '#000' }} />
                  )}
                  <AnimatePresence>
                    {showFutureAuthScreen && (
                      <BiometricAuthScreen onComplete={handleFutureAuthComplete} playing={demoPlaying} />
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {showFutureHomeScreen && (
                      <HomeScreenIntro
                        futureMode={true}
                        playing={demoPlaying}
                        onGlow={() => {}}
                        onComplete={handleFutureHomeComplete}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </BankingProvider>
            </div>
          </>
        ) : (
          /* ── Single phone layout (default) ── */
          <div className={`mobile-device-wrapper ${aiGlow ? 'ai-glow' : ''}`}>
            <AppInner
              futureMode={futureMode}
              headerCollapsed={headerCollapsed}
              onExpand={() => setHeaderCollapsed(false)}
            />
            {/* Black backdrop — covers AppInner for the full Scene 0 sequence so
                account data never shows through between overlay transitions */}
            {(showHomeScreen || showAuthScreen) && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 1050, background: '#000' }} />
            )}
            <AnimatePresence>
              {showAuthScreen && (
                <BiometricAuthScreen onComplete={handleAuthComplete} playing={demoPlaying} />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {showHomeScreen && (
                <HomeScreenIntro onGlow={() => setAiGlow(true)} onComplete={handleHomeScreenComplete} playing={demoPlaying} futureMode={futureMode} />
              )}
            </AnimatePresence>
          </div>
        )}

      </div>

      {/* Platform Architecture Overlay */}
      <AnimatePresence>
        {showPlatformOverlay && <PlatformOverlay onClose={() => setShowPlatformOverlay(false)} />}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0,174,239,0.6); }
          70% { box-shadow: 0 0 0 10px rgba(0,174,239,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,174,239,0); }
        }
        @keyframes pulseOrange {
          0% { box-shadow: 0 0 0 0 rgba(255,152,0,0.7); }
          70% { box-shadow: 0 0 0 7px rgba(255,152,0,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,152,0,0); }
        }
      `}} />
    </BankingProvider>
  );
}

export default App;
