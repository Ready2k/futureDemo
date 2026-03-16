import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BankingProvider } from './context/BankingContext';
import { FinancialSummaryCard } from './components/FinancialSummaryCard';
import { ConversationPanel } from './components/ConversationPanel';
import { PlatformOverlay } from './components/PlatformOverlay';
import { HomeScreenIntro } from './components/HomeScreenIntro';
import { BiometricAuthScreen } from './components/BiometricAuthScreen';
import { useBanking } from './context/BankingContext';
import { Home, ArrowLeftRight, CreditCard, MessageCircle, Wifi, BatteryMedium, Signal, Zap, Sparkles, RotateCcw, ChevronDown, Sun, Moon, Play, Pause, FastForward, Rewind, List, Columns2, Mic, Type, Volume2, VolumeX } from 'lucide-react';
import { ComparisonAdvisor } from './components/ComparisonAdvisor';

// Thin ambient header shown when header is collapsed
const CollapsedHeader = ({ time, demoMode, totalWealth, onExpand }) => {
  const futureMode = demoMode === '2028';
  return (
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
};

// Inner app so we can use useBanking for the collapsed header balance
function AppInner({ demoMode = 'today', headerCollapsed, onExpand, startEventName = 'START_AUTOPILOT_DEMO', side = null }) {
  const futureMode = demoMode === '2028';
  const is2030 = demoMode === '2030';
  const { profile } = useBanking();
  const isa = profile?.linked_accounts?.natwest_isa;
  const totalWealth = (profile?.accounts.current || 0) + (profile?.accounts.savings || 0) + (futureMode ? (isa?.balance || 0) : 0);
  const [time] = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })
  );

  const headerBg = futureMode
    ? 'linear-gradient(135deg, #0D0025 0%, #00395D 100%)'
    : 'var(--brand-blue)';

  if (is2030 && side !== 'today') {
    return (
      <div className="assistant-2030-canvas">
        {/* Ambient AI header */}
        <AnimatePresence initial={false}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '2rem 1.75rem 1.25rem',
              borderBottom: '1px solid var(--a2030-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              zIndex: 10
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366F1, #A855F7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
              }}>
                <Sparkles size={22} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--a2030-text)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Financial Intelligence</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--a2030-subtext)', fontWeight: '500', opacity: 0.6, letterSpacing: '-0.01em' }}>Personal Intelligence Layer</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <ConversationPanel demoMode={demoMode} startEventName={startEventName} side={side} />
        </div>
      </div>
    );
  }

  // ── Today / 2028: Bank app chrome ────────────────────────────────────────
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
              demoMode={demoMode}
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
        <ConversationPanel demoMode={demoMode} startEventName={startEventName} side={side} />

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

// ─────────────────────────────────────────────────────────────────────────────
// Narration scripts — keyed by phase 0 (intro) through 6 (scenes).
// Drop a pre-recorded file at /public/narration/scene{N}.mp3 to replace the
// Web Speech API fallback with high-quality audio (Polly / Nova Sonic / Gemini).
// ─────────────────────────────────────────────────────────────────────────────
const NARRATIONS = {
  // ── Today: manual banking — user does all the reasoning ──────────────────
  today: {
    0: "What you're about to see is how most people bank today. You open the app, navigate to your accounts, and make sense of the numbers yourself. Every insight requires a manual step. Six scenes, the same scenarios — no AI, no assistance. Let's begin.",
    1: "Scene one — Financial Awareness. To find out how much is safe to spend this month, you open the app, check your current account, look at your savings, and mentally subtract what's coming up. The data is there — the reasoning is yours to do.",
    2: "Scene two — Spending Insight. You want to know where your money goes. You scroll through transactions, filter by category, and spot the patterns yourself. The information exists — finding it takes time.",
    3: "Scene three — Affordability Reasoning. Can you afford a nine hundred pound holiday? You check your balance, estimate upcoming bills, and make a judgement call. A binary decision, with no cashflow modelling behind it.",
    4: "Scene four — Safe Transfer. You want to move six hundred pounds from savings to current. Select the account, enter the amount, confirm. Three steps, one action. Which account to use — that decision is entirely yours.",
    5: "Scene five — Behavioural Intelligence. Your spending has crept up. The bank shows an insight card once a threshold is crossed — useful context, but it surfaces after the pattern has already formed. You see the trend in retrospect.",
    6: "Scene six — Intelligent Support. An unknown charge appears on your account. You open a support ticket, explain the situation from scratch, and wait for resolution. Every handoff means repeating yourself.",
  },
  // ── 2028: AI assistant inside the bank app ───────────────────────────────
  '2028': {
    0: "What you're about to see is a banking experience where natural language replaces app navigation entirely. The customer never opens a menu, never taps through screens. They simply ask — and the AI reasons, acts, and responds. Six scenes. Each one shows a different capability. Let's begin.",
    1: "Scene one — Financial Awareness. The assistant computes exactly how much is safe to spend this month. Live balances, committed bills, and savings goals — all aggregated in under a second. No app switching, no manual maths.",
    2: "Scene two — Spending Insight. One question surfaces twelve months of categorised transactions. Housing, transport, restaurants, subscriptions — patterns that would take an hour to find, answered instantly.",
    3: "Scene three — Affordability Reasoning. The assistant doesn't just check the balance. It models the full impact of a nine hundred pound holiday on cashflow and future savings goals. Reasoning, not just retrieval.",
    4: "Scene four — Safe Transfer. A transfer request hits the policy engine automatically. Minimum balance rules, confirmation thresholds, and a full audit trail fire in the background. Protection, without adding friction.",
    5: "Scene five — Behavioural Intelligence. The assistant surfaces a restaurant spend anomaly before the customer asks. This is the shift from reactive to proactive — the bank acting as a true financial copilot.",
    6: "Scene six — Intelligent Support. An unknown charge becomes a dispute, a merchant block, and a rich handoff to a human specialist — orchestrated entirely in one conversation. The future of customer support.",
  },
  // ── 2030: ambient AI — bank happens around you ───────────────────────────
  '2030': {
    0: "What you're about to see is banking that happens around you. No app to open. No question to ask. A personal AI that's already been working — monitoring, protecting, and optimising across all your financial providers. Six scenes. Ambient intelligence in action. Let's begin.",
    1: "Scene one — Financial Awareness. Before the customer says a word, their personal AI has already assessed the full picture — current account, savings, and ISA combined, with three active automations already running. The answer is already there.",
    2: "Scene two — Spending Insight. The AI has already caught a fifty-eight percent spike in dining spend and pre-drafted an adjustment. It's also found a broadband deal saving two hundred and sixteen pounds a year. Two insights surfaced — without being asked.",
    3: "Scene three — Affordability Reasoning. The AI runs affordability across fourteen financial signals, identifies the optimal funding route, and preserves both the emergency buffer and the savings goal — ready for a single approval tap.",
    4: "Scene four — Safe Transfer. The transfer executes within pre-authorised delegated limits. No disambiguation, no confirmation required. A trust chain from AI to bank to payment network — with a full audit trail available on demand.",
    5: "Scene five — Behavioural Intelligence. Ambient protection fires before any limit is reached. The AI pre-drafts adjustments, monitors categories continuously, and reports back. No user initiation — protection just works.",
    6: "Scene six — Intelligent Support. The AI flagged the suspicious merchant three days before the customer noticed, paused payments, and drafted the dispute. When a human specialist joins, they arrive with zero-recap context already loaded.",
  },
};

function App() {
  const [demoMode, setDemoMode] = useState('2028'); // 'today' | '2028' | '2030' (right side in comp)
  const futureMode = demoMode === '2028'; // backwards-compat for comparison mode + narrator
  const demoModeRef = useRef(demoMode);
  // Compare state
  const [comparisonMode, setComparisonMode] = useState(false);
  const comparisonModeRef = useRef(comparisonMode);
  const [comparisonLeftMode, setComparisonLeftMode] = useState('today');
  const comparisonLeftModeRef = useRef(comparisonLeftMode);

  useEffect(() => { demoModeRef.current = demoMode; }, [demoMode]);
  useEffect(() => { comparisonModeRef.current = comparisonMode; }, [comparisonMode]);
  useEffect(() => { comparisonLeftModeRef.current = comparisonLeftMode; }, [comparisonLeftMode]);
  const [darkMode, setDarkMode] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [inputMode, setInputMode] = useState('typed'); // 'typed' | 'voice'
  const [introQuery, setIntroQuery] = useState({ typed: '', voice: '' });
  const [showHomeScreen, setShowHomeScreen] = useState(false);
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [aiGlow, setAiGlow] = useState(false);
  const comparisonIntroRequestRef = useRef({ today: null, future: null });
  const comparisonAuthDoneRef = useRef({ today: false, future: false });
  const [demoPhaseLabel, setDemoPhaseLabel] = useState(null);
  const [demoPhase, setDemoPhase] = useState(0);
  const [demoTotal, setDemoTotal] = useState(6);
  const [demoRunning, setDemoRunning] = useState(false);
  const [showTodayHomeScreen, setShowTodayHomeScreen] = useState(false);
  const [showTodayAuthScreen, setShowTodayAuthScreen] = useState(false);
  const [showFutureHomeScreen, setShowFutureHomeScreen] = useState(false);
  const [showFutureAuthScreen, setShowFutureAuthScreen] = useState(false);
  const [showPlatformOverlay, setShowPlatformOverlay] = useState(true);
  const [demoPlaying, setDemoPlaying] = useState(true);
  const [narratorEnabled, setNarratorEnabled] = useState(true);
  const narratorEnabledRef = useRef(true);
  useEffect(() => { narratorEnabledRef.current = narratorEnabled; }, [narratorEnabled]);
  const currentAudioRef = useRef(null);
  const lastNarratedPhaseRef = useRef(0);

  const stopNarration = () => {
    window.speechSynthesis?.cancel();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = '';
      currentAudioRef.current = null;
    }
  };

  const speakNarration = async (phase) => {
    let activeKey = demoModeRef.current;
    if (comparisonModeRef.current) {
        activeKey = `compare-${comparisonLeftModeRef.current}-${demoModeRef.current}`;
    }

    const text = NARRATIONS[activeKey]?.[phase];
    if (!text) return;
    stopNarration();

    const audioPath = `${import.meta.env.BASE_URL}narration/${activeKey}/scene${phase}.mp3`;

    // HEAD request confirms the file exists before we try to play it.
    // This avoids the catch-calls-onerror race that triggered TTS when
    // play() rejected before the audio element had finished loading.
    try {
      const res = await fetch(audioPath, { method: 'HEAD' });
      if (!res.ok) throw new Error('not found');

      const audio = new Audio(audioPath);
      currentAudioRef.current = audio;
      await audio.play();
    } catch {
      // File absent or play blocked — fall back to Web Speech API
      currentAudioRef.current = null;
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 0.92;
      utt.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find(v => v.name === 'Daniel') ||
        voices.find(v => v.name.includes('Google UK English Male')) ||
        voices.find(v => v.lang === 'en-GB') ||
        voices.find(v => v.lang.startsWith('en'));
      if (preferred) utt.voice = preferred;
      window.speechSynthesis.speak(utt);
    }
  };

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

  // Collapse header when user sends first message (not in 2030 — no collapsible header)
  useEffect(() => {
    const onChatStarted = () => { if (demoModeRef.current !== '2030') setHeaderCollapsed(true); };
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
        stopNarration();
        if (showPlatform) setTimeout(() => setShowPlatformOverlay(true), 600);
      } else if (phase !== lastNarratedPhaseRef.current) {
        // Deduplicated — fires once even when two panels dispatch the same phase (comparison mode)
        lastNarratedPhaseRef.current = phase;
        if (narratorEnabledRef.current) {
          setTimeout(() => speakNarration(phase), 1500);
        }
      }
    };
    window.addEventListener('DEMO_PHASE_UPDATE', onPhaseUpdate);
    return () => window.removeEventListener('DEMO_PHASE_UPDATE', onPhaseUpdate);
  }, []);

  // Sync play/pause button icon with autopilot state; stop narration on pause
  useEffect(() => {
    const onPlayState = (e) => {
      setDemoPlaying(e.detail.playing);
      if (!e.detail.playing) stopNarration();
    };
    window.addEventListener('AUTOPILOT_PLAY_STATE', onPlayState);
    return () => window.removeEventListener('AUTOPILOT_PLAY_STATE', onPlayState);
  }, []);

  // SCENE_INTRO_REQUEST: show HomeScreen intro before each scene
  useEffect(() => {
    const onRequest = (e) => {
      const { side, typedQuery, voiceQuery } = e.detail;
      if (side) {
        // Comparison mode — wait for both panels to request before showing any HomeScreen
        comparisonIntroRequestRef.current[side] = e.detail;
        const { today, future } = comparisonIntroRequestRef.current;
        if (today && future && today.sceneIndex === future.sceneIndex) {
          comparisonIntroRequestRef.current = { today: null, future: null };
          comparisonAuthDoneRef.current = { today: false, future: false };
          setIntroQuery({ typed: typedQuery, voice: voiceQuery });
          setShowTodayHomeScreen(true);
          setShowFutureHomeScreen(true);
        }
      } else {
        // Single phone
        if (demoModeRef.current === '2030') {
          // 2030: Siri ambient view handles everything — skip HomeScreen and Auth entirely
          window.dispatchEvent(new CustomEvent('SCENE_INTRO_COMPLETE'));
        } else {
          setIntroQuery({ typed: typedQuery, voice: voiceQuery });
          setShowHomeScreen(true);
        }
      }
    };
    const onReset = () => {
      comparisonIntroRequestRef.current = { today: null, future: null };
      comparisonAuthDoneRef.current = { today: false, future: false };
    };
    window.addEventListener('SCENE_INTRO_REQUEST', onRequest);
    window.addEventListener('RESET_CHAT', onReset);
    return () => {
      window.removeEventListener('SCENE_INTRO_REQUEST', onRequest);
      window.removeEventListener('RESET_CHAT', onReset);
    };
  }, []);


  const handleDemoClick = () => {
    if (demoRunning) return;
    lastNarratedPhaseRef.current = 0;
    setDemoRunning(true);
    setDemoPhase(0);
    setDemoPhaseLabel('Starting…');
    setShowPlatformOverlay(false);
    if (narratorEnabledRef.current) speakNarration(0);
    if (comparisonMode) {
      window.dispatchEvent(new CustomEvent('START_AUTOPILOT_DEMO_TODAY'));
      window.dispatchEvent(new CustomEvent('START_AUTOPILOT_DEMO_FUTURE'));
    } else {
      window.dispatchEvent(new CustomEvent('START_AUTOPILOT_DEMO'));
    }
  };

  // Single phone: HomeScreen → BiometricAuth → SCENE_INTRO_COMPLETE
  const handleHomeScreenComplete = () => {
    setShowHomeScreen(false);
    setAiGlow(false);
    setShowAuthScreen(true);
  };
  const handleAuthComplete = () => {
    setShowAuthScreen(false);
    window.dispatchEvent(new CustomEvent('SCENE_INTRO_COMPLETE'));
  };

  // Comparison: HomeScreen → BiometricAuth; both auths done → fire SCENE_INTRO_COMPLETE for each side
  const handleTodayHomeComplete = () => { setShowTodayHomeScreen(false); setShowTodayAuthScreen(true); };
  const handleFutureHomeComplete = () => { setShowFutureHomeScreen(false); setShowFutureAuthScreen(true); };

  const handleTodayAuthComplete = () => {
    setShowTodayAuthScreen(false);
    comparisonAuthDoneRef.current.today = true;
    if (comparisonAuthDoneRef.current.future) {
      comparisonAuthDoneRef.current = { today: false, future: false };
      window.dispatchEvent(new CustomEvent('SCENE_INTRO_COMPLETE_TODAY'));
      window.dispatchEvent(new CustomEvent('SCENE_INTRO_COMPLETE_FUTURE'));
    }
  };
  const handleFutureAuthComplete = () => {
    setShowFutureAuthScreen(false);
    comparisonAuthDoneRef.current.future = true;
    if (comparisonAuthDoneRef.current.today) {
      comparisonAuthDoneRef.current = { today: false, future: false };
      window.dispatchEvent(new CustomEvent('SCENE_INTRO_COMPLETE_TODAY'));
      window.dispatchEvent(new CustomEvent('SCENE_INTRO_COMPLETE_FUTURE'));
    }
  };

  const handleReset = () => {
    stopNarration();
    lastNarratedPhaseRef.current = 0;
    setDemoRunning(false);
    setDemoPhaseLabel(null);
    setDemoPhase(0);
    setShowPlatformOverlay(false);
    setShowHomeScreen(false);
    setShowAuthScreen(false);
    setAiGlow(false);
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

          {/* Era mode selector */}
          <div style={{ display: 'flex', background: '#1a1a1a', border: '1px solid #272727', borderRadius: '100px', padding: '3px', gap: '2px' }}>
            {comparisonMode && (
               <select
                 value={comparisonLeftMode}
                 onChange={(e) => setComparisonLeftMode(e.target.value)}
                 style={{
                   background: 'transparent',
                   border: 'none',
                   color: '#a78bfa',
                   fontSize: '0.78rem',
                   fontFamily: 'inherit',
                   outline: 'none',
                   cursor: 'pointer',
                   padding: '0 5px 0 10px',
                   fontWeight: '700',
                   appearance: 'none',
                 }}
               >
                 <option value="today">Today</option>
                 <option value="2028">2028</option>
                 <option value="2030">2030</option>
               </select>
            )}

            {comparisonMode && (
               <span style={{color: '#555', fontSize: '0.78rem', display: 'flex', alignItems: 'center', padding: '0 4px', fontWeight: 'bold'}}>vs</span>
            )}
            
            {[
              { key: 'today', label: 'Today', icon: null },
              { key: '2028', label: '2028', icon: <Zap size={11} fill="white" /> },
              { key: '2030', label: '2030', icon: <Sparkles size={11} /> },
            ].map(({ key, label, icon }) => {
              const active = demoMode === key;
              const gradients = { '2028': 'linear-gradient(135deg, #7c3aed, #00AEEF)', '2030': 'linear-gradient(135deg, #4C1D95, #1E40AF)' };
              return (
                <button
                  key={key}
                  disabled={comparisonMode && key === comparisonLeftMode}
                  onClick={() => setDemoMode(key)}
                  style={{
                    background: active ? (gradients[key] || '#3d3d3d') : 'transparent',
                    border: 'none', borderRadius: '100px', padding: '5px 13px',
                    color: active ? 'white' : '#555', cursor: 'pointer',
                    fontSize: '0.78rem', fontFamily: 'inherit', fontWeight: active ? '700' : '400',
                    display: 'flex', alignItems: 'center', gap: '5px',
                    transition: 'all 0.2s',
                    boxShadow: active && key !== 'today' ? '0 2px 8px rgba(124,58,237,0.3)' : 'none',
                    opacity: (comparisonMode && key === comparisonLeftMode) ? 0.3 : 1,
                  }}
                >
                  {icon}{label}
                </button>
              );
            })}
          </div>

          {/* Input mode: Typed / Voice */}
          <div
            onClick={() => setInputMode(m => m === 'typed' ? 'voice' : 'typed')}
            style={{
              background: inputMode === 'voice' ? 'rgba(162,89,255,0.15)' : '#1a1a1a',
              border: `1px solid ${inputMode === 'voice' ? 'rgba(162,89,255,0.4)' : '#272727'}`,
              borderRadius: '100px', padding: '7px 14px',
              color: inputMode === 'voice' ? '#a78bfa' : '#555',
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
              fontSize: '0.78rem', fontFamily: 'inherit', transition: 'all 0.25s',
            }}
          >
            {inputMode === 'voice' ? <Mic size={13} /> : <Type size={13} />}
            <span>{inputMode === 'voice' ? 'Voice' : 'Typed'}</span>
          </div>

          {/* Narrator toggle */}
          <div
            onClick={() => { setNarratorEnabled(n => !n); if (narratorEnabled) stopNarration(); }}
            title={narratorEnabled ? 'Narration on — click to mute' : 'Narration off — click to enable'}
            style={{
              background: narratorEnabled ? 'rgba(0,174,239,0.12)' : '#1a1a1a',
              border: `1px solid ${narratorEnabled ? 'rgba(0,174,239,0.35)' : '#272727'}`,
              borderRadius: '100px', padding: '7px 14px',
              color: narratorEnabled ? '#00AEEF' : '#444',
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
              fontSize: '0.78rem', fontFamily: 'inherit', transition: 'all 0.25s',
            }}
          >
            {narratorEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span>Narrate</span>
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
            {/* Left phone */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <div style={{
                fontSize: '0.6rem', fontWeight: '800', letterSpacing: '0.18em',
                color: '#00AEEF', textTransform: 'uppercase',
                background: 'rgba(0,174,239,0.08)', border: '1px solid rgba(0,174,239,0.2)',
                borderRadius: '100px', padding: '3px 12px',
              }}>
                {comparisonLeftMode}
              </div>
              <BankingProvider>
                <div className="mobile-device-wrapper">
                  <AppInner
                    demoMode={comparisonLeftMode}
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
                        query={introQuery.typed}
                        voiceQuery={introQuery.voice}
                        inputMode={inputMode}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </BankingProvider>
            </div>

            {/* Comparison advisor */}
            <ComparisonAdvisor phase={demoPhase} running={demoRunning} leftMode={comparisonLeftMode} rightMode={demoMode} />

            {/* Right phone */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <div style={{
                fontSize: '0.6rem', fontWeight: '800', letterSpacing: '0.18em',
                color: '#a78bfa', textTransform: 'uppercase',
                background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: '100px', padding: '3px 12px',
              }}>
                {demoMode}
              </div>
              <BankingProvider>
                <div className="mobile-device-wrapper">
                  <AppInner
                    demoMode={demoMode}
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
                        query={introQuery.typed}
                        voiceQuery={introQuery.voice}
                        inputMode={inputMode}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </BankingProvider>
            </div>
          </>
        ) : (
          <div className={`mobile-device-wrapper ${aiGlow ? 'ai-glow' : ''}`}>
            <AppInner
              demoMode={demoMode}
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
                <HomeScreenIntro
                  onGlow={() => setAiGlow(true)}
                  onComplete={handleHomeScreenComplete}
                  playing={demoPlaying}
                  futureMode={futureMode}
                  demoMode={demoMode}
                  query={introQuery.typed}
                  voiceQuery={introQuery.voice}
                  inputMode={inputMode}
                />
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
