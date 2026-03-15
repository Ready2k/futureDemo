import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BankingProvider } from './context/BankingContext';
import { FinancialSummaryCard } from './components/FinancialSummaryCard';
import { ConversationPanel } from './components/ConversationPanel';
import { PlatformOverlay } from './components/PlatformOverlay';
import { HomeScreenIntro } from './components/HomeScreenIntro';
import { BiometricAuthScreen } from './components/BiometricAuthScreen';
import { useBanking } from './context/BankingContext';
import { Home, ArrowLeftRight, CreditCard, MessageCircle, Wifi, BatteryMedium, Signal, Zap, RotateCcw, ChevronDown, Sun, Moon, Play, Pause, FastForward, Rewind, List } from 'lucide-react';

// Thin ambient header shown when header is collapsed
const CollapsedHeader = ({ time, futureMode, totalWealth, onExpand }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    onClick={onExpand}
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px',
      height: '52px',
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
function AppInner({ futureMode, headerCollapsed, onExpand }) {
  const { profile, discretionaryIncome } = useBanking();
  const isa = profile?.linked_accounts?.natwest_isa;
  const totalWealth = (profile?.accounts.current || 0) + (profile?.accounts.savings || 0) + (isa?.balance || 0);
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
                <FinancialSummaryCard />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conversation Panel — fills remaining space */}
        <ConversationPanel futureMode={futureMode} />

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
  const [darkMode, setDarkMode] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [showHomeScreen, setShowHomeScreen] = useState(false);
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [aiGlow, setAiGlow] = useState(false);
  const [demoPhaseLabel, setDemoPhaseLabel] = useState(null);
  const [demoPhase, setDemoPhase] = useState(0);
  const [demoTotal, setDemoTotal] = useState(6);
  const [demoRunning, setDemoRunning] = useState(false);
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

  const handleDemoClick = () => {
    if (demoRunning) return;
    setDemoRunning(true);
    setShowPlatformOverlay(false);
    setDemoPhaseLabel('Intro…');
    setDemoPhase(0);
    // Show home screen first — it fires START_AUTOPILOT_DEMO on completion
    setShowHomeScreen(true);
  };

  const handleHomeScreenComplete = () => {
    setShowHomeScreen(false);
    setAiGlow(false);
    setDemoPhaseLabel('Authenticating…');
    setShowAuthScreen(true);
  };

  const handleAuthComplete = () => {
    setShowAuthScreen(false);
    setDemoPhaseLabel('Starting…');
    setDemoPhase(1);
    window.dispatchEvent(new CustomEvent('START_AUTOPILOT_DEMO'));
  };

  const handleReset = () => {
    setDemoRunning(false);
    setDemoPhaseLabel(null);
    setDemoPhase(0);
    setShowPlatformOverlay(false);
    setShowHomeScreen(false);
    setShowAuthScreen(false);
    setAiGlow(false);
    setHeaderCollapsed(false);
    setDemoPlaying(true);
    window.dispatchEvent(new CustomEvent('RESET_CHAT'));
  };

  const isComplete = demoPhaseLabel && (demoPhaseLabel.startsWith('✓') || demoPhaseLabel.startsWith('Platform'));

  return (
    <BankingProvider>
      <div className={`mobile-device-wrapper ${aiGlow ? 'ai-glow' : ''}`}>
        <AppInner
          futureMode={futureMode}
          headerCollapsed={headerCollapsed}
          onExpand={() => setHeaderCollapsed(false)}
        />
        <AnimatePresence>
          {showAuthScreen && (
            <BiometricAuthScreen onComplete={handleAuthComplete} />
          )}
        </AnimatePresence>

        {/* Scene 0 — Home Screen Intro (overlays the banking app and auth) */}
        <AnimatePresence>
          {showHomeScreen && (
            <HomeScreenIntro onGlow={() => setAiGlow(true)} onComplete={handleHomeScreenComplete} />
          )}
        </AnimatePresence>
      </div>

      {/* Platform Architecture Overlay */}
      <AnimatePresence>
        {showPlatformOverlay && <PlatformOverlay onClose={() => setShowPlatformOverlay(false)} />}
      </AnimatePresence>

      {/* Presenter Controls */}
      <div style={{ position: 'fixed', top: '40px', right: '40px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end', zIndex: 9998 }}>

        {/* Dark mode toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setDarkMode(d => !d)}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              background: darkMode ? '#1a1a2e' : '#f0f0f0',
              border: `1px solid ${darkMode ? '#3d3d6d' : '#ddd'}`,
              borderRadius: '100px', padding: '10px 16px',
              color: darkMode ? '#a0a0ff' : '#555',
              display: 'flex', alignItems: 'center', gap: '8px',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)', transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* Future Mode Toggle */}
        <div
          onClick={() => setFutureMode(f => !f)}
          style={{
            background: futureMode ? 'linear-gradient(135deg, #7c3aed, #00AEEF)' : '#1a1a1a',
            border: '1px solid #3d3d3d', borderRadius: '100px',
            padding: '10px 20px', color: 'white',
            display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
            boxShadow: futureMode ? '0 8px 30px rgba(124,58,237,0.4)' : '0 6px 20px rgba(0,0,0,0.3)',
            transition: 'all 0.3s'
          }}
        >
          <Zap size={15} fill={futureMode ? 'white' : 'none'} />
          <span style={{ fontFamily: 'inherit', fontWeight: '600', fontSize: '0.9rem' }}>
            {futureMode ? 'Demo Mode: 2028' : 'Demo Mode: Today'}
          </span>
          <div style={{ width: '36px', height: '20px', borderRadius: '100px', background: futureMode ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)', position: 'relative' }}>
            <div style={{ width: '14px', height: '14px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: futureMode ? '19px' : '3px', transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
          </div>
        </div>

        {/* Demo button + progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
          {demoRunning && demoPhase > 0 && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '0.72rem', color: '#888', textAlign: 'right', fontFamily: 'inherit' }}>{demoPhaseLabel}</div>
              <div style={{ height: '3px', background: '#2a2a2a', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(demoPhase / demoTotal) * 100}%`, background: 'linear-gradient(90deg, #00395D, #00AEEF)', borderRadius: '3px', transition: 'width 0.8s ease' }} />
              </div>
            </div>
          )}
          {isComplete && !demoRunning && (
            <div style={{ fontSize: '0.72rem', color: '#4caf50', textAlign: 'right', fontFamily: 'inherit' }}>{demoPhaseLabel}</div>
          )}

          <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
            
            {/* Playback Controls (visible only when running) */}
            {(demoRunning && !isComplete) && (
               <div style={{ display: 'flex', gap: '4px', background: '#1a1a1a', borderRadius: '100px', padding: '6px', border: '1px solid #3d3d3d', boxShadow: '0 6px 20px rgba(0,0,0,0.3)' }}>
                 <button onClick={() => window.dispatchEvent(new CustomEvent('AUTOPILOT_CTRL', { detail: { action: 'jump', index: demoPhase - 2 } }))} style={{ background: 'transparent', border: 'none', color: '#aaa', padding: '10px', cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='white'} onMouseLeave={e => e.currentTarget.style.color='#aaa'} title="Previous Scene"><Rewind size={18} /></button>
                 <button onClick={() => window.dispatchEvent(new CustomEvent('AUTOPILOT_CTRL', { detail: { action: 'togglePlay' } }))} style={{ background: 'var(--brand-blue)', border: 'none', color: 'white', padding: '10px', cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,174,239,0.4)' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'} title="Play/Pause">{demoPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" />}</button>
                 <button onClick={() => window.dispatchEvent(new CustomEvent('AUTOPILOT_CTRL', { detail: { action: 'jump', index: demoPhase } }))} style={{ background: 'transparent', border: 'none', color: '#aaa', padding: '10px', cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='white'} onMouseLeave={e => e.currentTarget.style.color='#aaa'} title="Next Scene"><FastForward size={18} /></button>
               </div>
            )}

            {/* Scene Dropdown (visible only when running) */}
            {(demoRunning && !isComplete) && (
              <select 
                 onChange={(e) => {
                    const idx = parseInt(e.target.value, 10);
                    window.dispatchEvent(new CustomEvent('AUTOPILOT_CTRL', { detail: { action: 'jump', index: idx } }));
                 }}
                 value={demoPhase > 0 ? demoPhase - 1 : ""}
                 style={{ background: '#1a1a1a', color: '#ccc', border: '1px solid #3d3d3d', borderRadius: '100px', padding: '0 18px 0 14px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', boxShadow: '0 6px 20px rgba(0,0,0,0.3)', appearance: 'none' }}
              >
                 <option value="" disabled>Jump to Scene...</option>
                 <option value={0}>1. Financial Awareness</option>
                 <option value={1}>2. Spending Analysis</option>
                 <option value={2}>3. Affordability</option>
                 <option value={3}>4. Policy Guards</option>
                 <option value={4}>5. Proactive Copilot</option>
                 <option value={5}>6. Intelligent Support</option>
              </select>
            )}

            {/* Start / Jump Menu (visible when idle) */}
            {(!demoRunning || isComplete) && (
              <select 
                 onChange={(e) => {
                    const idx = parseInt(e.target.value, 10);
                    e.target.value = ""; // Reset dropdown
                    window.dispatchEvent(new CustomEvent('AUTOPILOT_CTRL', { detail: { action: 'jump', index: idx } }));
                 }}
                 value=""
                 style={{ background: '#1a1a1a', color: '#aaa', border: '1px solid #3d3d3d', borderRadius: '100px', padding: '0 18px 0 14px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', boxShadow: '0 6px 20px rgba(0,0,0,0.3)', appearance: 'none' }}
              >
                 <option value="" disabled>Jump Directly To...</option>
                 <option value={0}>1. Financial Awareness</option>
                 <option value={1}>2. Spending Analysis</option>
                 <option value={2}>3. Affordability</option>
                 <option value={3}>4. Policy Guards</option>
                 <option value={4}>5. Proactive Copilot</option>
                 <option value={5}>6. Intelligent Support</option>
              </select>
            )}

            {(demoRunning || demoPhaseLabel) && (
              <button
                onClick={handleReset}
                title="Reset Completely"
                style={{ background: '#1a1a1a', color: '#aaa', border: '1px solid #3d3d3d', padding: '16px', borderRadius: '100px', cursor: 'pointer', boxShadow: '0 6px 20px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = '#2a2a2a'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.background = '#1a1a1a'; }}
              >
                <RotateCcw size={18} />
              </button>
            )}
            
            <button
              onClick={isComplete ? handleReset : handleDemoClick}
              disabled={demoRunning && !isComplete}
              style={{
                background: isComplete ? '#0a2a0a' : demoRunning ? '#1a1a1a' : '#0F0F0F',
                color: isComplete ? '#4caf50' : 'white',
                border: `1px solid ${isComplete ? 'rgba(76,175,80,0.4)' : '#3d3d3d'}`,
                padding: '16px 28px', borderRadius: '100px',
                fontFamily: 'inherit', fontWeight: '600', fontSize: '1.05rem',
                cursor: demoRunning && !isComplete ? 'default' : 'pointer',
                boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.3s',
                opacity: demoRunning && !isComplete ? 0.75 : 1
              }}
              onMouseEnter={e => { if (!demoRunning || isComplete) e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <span style={{
                width: '12px', height: '12px',
                background: isComplete ? '#4caf50' : demoRunning ? '#ff9800' : '#00AEEF',
                borderRadius: '50%', display: 'inline-block',
                animation: demoRunning && !isComplete ? 'pulseOrange 1.2s infinite' : 'pulse 3s infinite'
              }} />
              {isComplete ? 'Restart Full Demo' : demoRunning ? 'Running…' : 'Start Full Demo'}
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0,174,239,0.6); }
          70% { box-shadow: 0 0 0 12px rgba(0,174,239,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,174,239,0); }
        }
        @keyframes pulseOrange {
          0% { box-shadow: 0 0 0 0 rgba(255,152,0,0.7); }
          70% { box-shadow: 0 0 0 8px rgba(255,152,0,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,152,0,0); }
        }
      `}} />
    </BankingProvider>
  );
}

export default App;
