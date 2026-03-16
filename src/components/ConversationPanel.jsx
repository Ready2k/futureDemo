import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, AlertTriangle, ChevronRight, Sparkles, X } from 'lucide-react';
import { useBanking } from '../context/BankingContext';
import { detectIntent } from '../services/intentEngine';
import { ReasoningDrawer } from './ReasoningDrawer';
import { ProviderExecutionChip } from '../components2030/ProviderExecutionChip';
import { TrustTimeline } from '../components2030/TrustTimeline';

// ─────────────────────────────────────────────────────────────────────────────
// Proactive Notification
// ─────────────────────────────────────────────────────────────────────────────
const ProactiveNotification = ({ profile, onAccept, onDismiss }) => {
  const idleBalance = profile.accounts.current - 800;
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15 }}
      style={{ margin: '0 1rem 1rem', background: 'white', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 6px 24px rgba(0,0,0,0.1)', border: '1px solid rgba(0,174,239,0.15)', position: 'relative' }}
    >
      <button onClick={onDismiss} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
        <X size={16} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #00395D, #00AEEF)', borderRadius: '8px', padding: '6px', display: 'flex' }}>
          <Sparkles size={14} color="white" />
        </div>
        <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#00395D' }}>Assistant Insight</span>
      </div>
      <p style={{ fontSize: '0.88rem', color: '#555', lineHeight: 1.5, marginBottom: '1rem' }}>
        You currently have <strong>£{idleBalance.toLocaleString()}</strong> idle in your Current Account.<br />
        Move <strong>£{Math.round(idleBalance * 0.6).toLocaleString()}</strong> to your Everyday Saver earning <strong>{profile.savings_account?.rate || 4.75}%</strong> AER?
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={onAccept} style={{ flex: 1, padding: '10px', background: 'var(--brand-blue)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>Move Money</button>
        <button onClick={onDismiss} style={{ flex: 1, padding: '10px', background: '#F4F6F8', color: '#555', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>Ignore</button>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Message Bubble
// ─────────────────────────────────────────────────────────────────────────────
const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', marginBottom: '1rem', width: '100%' }}>
      {msg.text && (
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className={`chat-bubble ${isUser ? 'user' : 'assistant'}`}>
          {msg.text}
        </motion.div>
      )}
      {msg.card && (
        msg.role === 'system_human' ? (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} style={{ width: '100%' }}>
            {msg.card}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--card-border)',
              borderRadius: '16px', padding: '1.25rem',
              width: '95%', alignSelf: 'center',
              boxShadow: 'var(--card-shadow)', marginTop: '0.25rem',
              color: 'var(--text-primary)'
            }}>
            {msg.card}
          </motion.div>
        )
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Panel
// ─────────────────────────────────────────────────────────────────────────────
export const ConversationPanel = ({ demoMode = 'today', startEventName = 'START_AUTOPILOT_DEMO', side = null }) => {
  const futureMode = demoMode === '2028';
  const is2030 = demoMode === '2030';
  const { profile, transferMoney, executeTransfer } = useBanking();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showProactive, setShowProactive] = useState(false);
  const [currentTrace, setCurrentTrace] = useState(null);

  const demoModeRef = useRef(demoMode);
  const sideRef = useRef(side);
  useEffect(() => { sideRef.current = side; }, [side]);
  useEffect(() => { demoModeRef.current = demoMode; }, [demoMode]);
  const awaitingAccountSelectRef = useRef(null); // {complete: fn} — set when disambiguation card awaits a response
  const [showModeBanner, setShowModeBanner] = useState(false);
  useEffect(() => {
    if (demoMode !== 'today') {
      setShowModeBanner(true);
      const t = setTimeout(() => setShowModeBanner(false), 4000);
      return () => clearTimeout(t);
    } else {
      setShowModeBanner(false);
    }
  }, [demoMode]);
  // Keep legacy showFutureBanner reference for compatibility with the banner JSX below
  const showFutureBanner = showModeBanner;

  const makeInitialMsg = () => {
    const mode = demoModeRef.current;
    const text = mode === '2030'
      ? "Good morning, Joe. I've been managing things while you were away — I paused a suspicious charge from Northline Services, your £340 direct debit clears Friday so your buffer stays healthy, and you're 8 weeks ahead on your ISA goal. Three automations are running. What would you like to focus on?"
      : mode === '2028'
        ? "Good morning Joe. You have £8,240 across your Barclays and NatWest accounts, with £160 discretionary this month after bills and savings. I'm already tracking a restaurant spend spike — you're 47% above your 3-month average. Where would you like to start?"
        : "Hello! I can help you check your balances, make transfers, or analyze if you can afford that new purchase. What's on your mind?";
    return { id: 1, role: 'assistant', text };
  };

  const INITIAL_MESSAGE = makeInitialMsg();

  const MODEL_ROUTING = {
    check_balance: {
      intent: 'On-device SLM — 8ms', reasoning: 'Barclays Financial LLM (cloud)',
      sources: ['Barclays Core Banking API', 'NatWest Open Banking API', 'Payroll pattern model'],
      tools: ['balance_aggregate', 'expense_classify', 'discretionary_compute'],
    },
    analyse_spending: {
      intent: 'On-device SLM — 6ms', reasoning: 'Barclays Spending Intelligence LLM',
      sources: ['Transaction history (24mo)', 'Open Banking merchant categories'],
      tools: ['transaction_classify', 'trend_analysis', 'budget_optimise'],
    },
    affordability_check: {
      intent: 'On-device SLM — 11ms', reasoning: 'Barclays Reasoning Agent (CoT)',
      sources: ['Live balances', 'Committed future spend model', 'Savings goal tracker'],
      tools: ['affordability_compute', 'savings_impact_model', 'cashflow_simulate'],
    },
    transfer_2028: {
      intent: 'On-device SLM — 4ms', reasoning: 'On-device policy engine (no cloud call)',
      sources: ['Biometric session token', 'Device trust score', 'Velocity model'],
      tools: ['intent_parse', 'biometric_verify', 'transfer_execute'],
    },
    support_query: {
      intent: 'On-device SLM — 9ms', reasoning: 'Barclays Fraud & Risk LLM',
      sources: ['Transaction history (24mo)', 'Merchant risk database', 'Behaviour model'],
      tools: ['transaction_match', 'merchant_classify', 'anomaly_score'],
    },
    support_dispute: {
      intent: 'On-device SLM — 3ms', reasoning: 'Barclays Dispute Agent + Merchant API Agent',
      sources: ['Fraud risk DB', 'Account statement', 'Merchant API handshake'],
      tools: ['dispute_open', 'merchant_block', 'agent_negotiate'],
    },
    escalate_human: {
      intent: 'Escalation trigger — 2ms', reasoning: 'Context packaging model',
      sources: ['Full conversation thread', 'Dispute metadata #FR-2839', 'Risk score'],
      tools: ['context_package', 'agent_handoff', 'co_pilot_brief'],
    },
  };

  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const endOfMessagesRef = useRef(null);
  const proactiveTimerRef = useRef(null);
  const processInputRef = useRef(null);

  // Compute discretionary income fresh every render (avoids stale closure)
  const freshDiscretionary = profile
    ? profile.income - Object.values(profile.expenses).reduce((a, b) => a + b, 0) - profile.savings_goal
    : 0;

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, showProactive]);

  // Proactive notification after 8s idle
  useEffect(() => {
    proactiveTimerRef.current = setTimeout(() => setShowProactive(true), 8000);
    return () => clearTimeout(proactiveTimerRef.current);
  }, []);

  const addMessage = (role, text, card = null) => {
    setMessages(prev => [...prev, { id: Date.now(), role, text, card }]);
  };

  const processInput = (overrideInput = null) => {
    const textToProcess = overrideInput !== null ? overrideInput : input;
    if (!textToProcess.trim()) return;
    setShowProactive(false);
    clearTimeout(proactiveTimerRef.current);
    window.dispatchEvent(new CustomEvent('CHAT_STARTED'));

    // Account selection intercept — today mode disambiguation response
    if (awaitingAccountSelectRef.current) {
      const { complete } = awaitingAccountSelectRef.current;
      awaitingAccountSelectRef.current = null;
      addMessage('user', textToProcess);
      if (overrideInput === null) setInput('');
      setIsTyping(true);
      setTimeout(() => { complete(); setIsTyping(false); }, 1500);
      return;
    }

    addMessage('user', textToProcess);
    const intentData = detectIntent(textToProcess);
    if (overrideInput === null) setInput('');
    setIsTyping(true);
    setTimeout(() => {
      handleIntent(intentData, textToProcess);
      setIsTyping(false);
    }, 1500);
  };


  // Keep ref current to avoid stale closure in autopilot
  useEffect(() => { processInputRef.current = processInput; });

  const resetChat = () => {
    setMessages([makeInitialMsg()]);
    setCurrentTrace(null);
    setInput('');
    setIsTyping(false);
    setShowProactive(false);
  };

  // ── Full Multi-Phase Autopilot ─────────────────────────────────────────────
  // resumeGate: a Promise resolver held while paused — called immediately on resume
  const demoCore = useRef({ active: false, playing: true, skip: false, target: null, resumeGate: null });

  useEffect(() => {
    const handleCtrl = (e) => {
      const action = e.detail?.action;
      if (action === 'togglePlay') {
        demoCore.current.playing = !demoCore.current.playing;
        // Immediately unblock the gate promise if resuming
        if (demoCore.current.playing && demoCore.current.resumeGate) {
          const resolve = demoCore.current.resumeGate;
          demoCore.current.resumeGate = null;
          resolve();
        }
        window.dispatchEvent(new CustomEvent('AUTOPILOT_PLAY_STATE', { detail: { playing: demoCore.current.playing } }));
      }
      if (action === 'jump') {
        if (!demoCore.current.active) {
          // Start it at specific index if not running
          window.dispatchEvent(new CustomEvent(startEventName, { detail: { startIndex: e.detail.index } }));
        } else {
          demoCore.current.target = Math.max(0, Math.min(5, e.detail.index));
          demoCore.current.skip = true;
        }
      }
      if (action === 'stop') {
        demoCore.current.active = false;
      }
    };
    window.addEventListener('AUTOPILOT_CTRL', handleCtrl);
    return () => window.removeEventListener('AUTOPILOT_CTRL', handleCtrl);
  }, []);

  useEffect(() => {
    const SCENES = [
      { label: 'Scene 1 of 6 — Financial Awareness', queries: ['How much money can I spend this month?'], introTypedQuery: 'How much money can I spend this month?', introVoiceQuery: 'Hey Siri, how much can I spend this month?', readTime: 18000 },
      { label: 'Scene 2 of 6 — Spending Insight', queries: ['Where does my money go each month?'], introTypedQuery: 'Where does my money go each month?', introVoiceQuery: 'Hey Siri, where does all my money go?', readTime: 18000 },
      { label: 'Scene 3 of 6 — Affordability Reasoning', queries: ['Can I afford a £900 holiday?'], introTypedQuery: 'Can I afford a £900 holiday?', introVoiceQuery: 'Hey Siri, I want to go on holiday — can I afford it? About £900.', readTime: 18000 },
      { label: 'Scene 4 of 6 — Safe Transfer', queries: ['Move £600 from savings to current.'], introTypedQuery: 'Move £600 from savings to current', introVoiceQuery: 'Hey Siri, move £600 from my savings to my current account', readTime: 20000, accountSelect: true },
      { label: 'Scene 5 of 6 — Behavioural Intelligence', queries: null, readTime: 16000, proactive: true },
      { label: 'Scene 6 of 6 — Intelligent Support', queries: ['What is this £85 charge from Northline Services?'], introTypedQuery: 'What is this £85 charge from Northline Services?', introVoiceQuery: "Hey Siri, what's this £85 charge on my account from Northline?", readTime: 24000, multiStep: true },
    ];

    const dispatch = (label, extra = {}) =>
      window.dispatchEvent(new CustomEvent('DEMO_PHASE_UPDATE', { detail: { label, ...extra } }));

    const startAutopilot = async (e) => {
      if (demoCore.current.active) return;
      demoCore.current.active = true;
      demoCore.current.playing = true;
      demoCore.current.skip = false;
      demoCore.current.target = null;

      window.dispatchEvent(new CustomEvent('AUTOPILOT_PLAY_STATE', { detail: { playing: true } }));

      let i = e?.detail?.startIndex || 0;

      // Wait for App.jsx to show HomeScreen intro + BiometricAuth for this scene
      const waitForIntro = async (sceneIndex, typedQuery, voiceQuery) => {
        const completeEvent = sideRef.current
          ? `SCENE_INTRO_COMPLETE_${sideRef.current.toUpperCase()}`
          : 'SCENE_INTRO_COMPLETE';
        let done = false;
        const handler = () => { done = true; };
        window.addEventListener(completeEvent, handler);
        window.dispatchEvent(new CustomEvent('SCENE_INTRO_REQUEST', {
          detail: { side: sideRef.current, sceneIndex, typedQuery, voiceQuery },
        }));
        while (!done) { await wait(100); }
        window.removeEventListener(completeEvent, handler);
      };

      const wait = async (ms) => {
        let elapsed = 0;
        const step = 100;
        while (elapsed < ms) {
          if (!demoCore.current.active) throw new Error('Abort');
          if (demoCore.current.skip) throw new Error('Skip');
          if (!demoCore.current.playing) {
            // Block here until resume is called — no polling, immediate response
            await new Promise(resolve => { demoCore.current.resumeGate = resolve; });
            continue;
          }
          await new Promise(r => setTimeout(r, step));
          elapsed += step;
        }
      };

      const typeText = async (text) => {
        setInput('');
        if (demoModeRef.current !== 'today') {
          // 2028 / 2030: text appears pre-populated instantly (AI handed it off)
          setInput(text);
          await wait(800);
        } else {
          for (let j = 0; j <= text.length; j++) {
            setInput(text.substring(0, j));
            await wait(24);
          }
          await wait(300);
        }
        setInput('');
        processInputRef.current(text); // Doesn't await processing intentionally
        await wait(2200);
      };

      const sceneCard = (scene) => (
        <div style={{ textAlign: 'center', padding: '0.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#00AEEF', marginBottom: '6px' }}>
            Demo {scene.label.split('—')[0].trim()}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--brand-blue)' }}>
            {scene.label.split('—')[1]?.trim()}
          </div>
        </div>
      );

      try {
        while (i < SCENES.length && demoCore.current.active) {
          const scene = SCENES[i];

          try {
            // Show HomeScreen intro + BiometricAuth before every scene (except proactive)
            if (!scene.proactive) {
              await waitForIntro(i, scene.introTypedQuery, scene.introVoiceQuery);
            }
            resetChat();
            dispatch(scene.label, { phase: i + 1, total: SCENES.length });
            await wait(700);
            setMessages([makeInitialMsg(), { id: Date.now(), role: 'assistant', text: null, card: sceneCard(scene) }]);
            await wait(1800);

            if (scene.proactive) {
              const currentMode = demoModeRef.current;
              const is2028 = currentMode === '2028';
              const is2030snap = currentMode === '2030';
              const barData = [{ m: 'Jan', v: 265 }, { m: 'Feb', v: 298 }, { m: 'Mar', v: 420 }];
              const insightCard = is2030snap ? (
                <div>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: '8px', height: '8px', background: '#f59e0b', borderRadius: '50%', boxShadow: '0 0 6px rgba(245,158,11,0.6)' }} />
                    <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI spotted 2 things</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: '700', background: 'linear-gradient(90deg, #4C1D95, #1E40AF)', color: 'white', padding: '2px 8px', borderRadius: '100px' }}>2030 · Ambient</span>
                  </div>

                  {/* Monitoring status */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '0.75rem', padding: '6px 10px', background: 'rgba(16,185,129,0.06)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.72rem', color: '#065F46' }}>Continuous monitoring active · Anomaly threshold crossed · Action pre-drafted</span>
                  </div>

                  {/* Thing 1: Spending insight */}
                  <div style={{ border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '1rem', marginBottom: '0.75rem', background: 'rgba(245,158,11,0.04)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>① Dining spend</div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', marginBottom: '0.75rem', height: '44px' }}>
                      {barData.map(({ m, v }) => (
                        <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                          <div style={{ width: '100%', background: v === 420 ? '#f59e0b' : 'rgba(245,158,11,0.25)', borderRadius: '4px 4px 0 0', height: `${(v / 420) * 38}px` }} />
                          <span style={{ fontSize: '0.6rem', color: '#aaa' }}>{m}</span>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#78350f', margin: '0 0 3px' }}>+58% over 3 months — £420 in March alone</p>
                    <p style={{ fontSize: '0.78rem', color: '#92400e', lineHeight: 1.5, margin: 0 }}>Budget adjustment pre-drafted. I'll block overspend automatically at 80% of your limit.</p>
                    <button style={{ marginTop: '0.65rem', width: '100%', padding: '9px', background: 'linear-gradient(135deg, #4C1D95, #1E40AF)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>Apply Adjustment</button>
                  </div>

                  {/* Thing 2: AI negotiation — the financial advocate moment */}
                  <div style={{ border: '1px solid rgba(16,185,129,0.25)', borderRadius: '12px', padding: '1rem', marginBottom: '0.75rem', background: 'rgba(16,185,129,0.04)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>② Better deal found</div>
                    <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3a2a', margin: '0 0 4px' }}>Your broadband just renewed at £52/month</p>
                    <p style={{ fontSize: '0.78rem', color: '#374151', lineHeight: 1.5, margin: '0 0 0.65rem' }}>I found an equivalent plan at <strong>£34/month</strong> — saving you <strong>£216/year</strong> with the same speed and no contract lock-in.</p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button style={{ flex: 2, padding: '9px', background: 'linear-gradient(135deg, #059669, #047857)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>Switch provider</button>
                      <button style={{ flex: 1, padding: '9px', background: 'transparent', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: '8px', fontWeight: '500', fontSize: '0.85rem', cursor: 'pointer' }}>Not now</button>
                    </div>
                  </div>

                  {/* Execution chain — always visible */}
                  <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.03)', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.07)' }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '7px' }}>Execution chain</div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {[
                        { label: 'AI decision', color: '#6366F1' },
                        { label: 'Your approval', color: '#8B5CF6' },
                        { label: 'Barclays', color: '#00395D' },
                        { label: 'Fraud active', color: '#10B981' },
                      ].map((c, i) => (
                        <span key={i} style={{ fontSize: '0.67rem', fontWeight: '600', color: c.color, background: `${c.color}12`, border: `1px solid ${c.color}25`, borderRadius: '100px', padding: '2px 8px' }}>✓ {c.label}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ width: '8px', height: '8px', background: '#f59e0b', borderRadius: '50%', boxShadow: '0 0 6px rgba(245,158,11,0.6)' }} />
                    <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Behavioural Insight</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: '700', background: is2028 ? 'linear-gradient(90deg, #7c3aed, #00AEEF)' : 'rgba(245,158,11,0.15)', color: is2028 ? 'white' : '#b45309', padding: '2px 8px', borderRadius: '100px' }}>{is2028 ? '⚡ 2028 — Continuous monitoring' : '3-month trend'}</span>
                  </div>
                  {is2028 && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '0.75rem', padding: '6px 10px', background: 'rgba(124,58,237,0.06)', borderRadius: '8px', border: '1px solid rgba(124,58,237,0.15)' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7c3aed', animation: 'pulse 1.5s infinite' }} />
                      <span style={{ fontSize: '0.72rem', color: '#9c6fef' }}>On-device SLM detected anomaly · Spending Intelligence LLM confirmed · Alert surfaced proactively</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', marginBottom: '1rem', height: '48px' }}>
                    {barData.map(({ m, v }) => (
                      <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '100%', background: v === 420 ? '#f59e0b' : 'rgba(245,158,11,0.25)', borderRadius: '4px 4px 0 0', height: `${(v / 420) * 42}px`, transition: 'height 0.4s' }} />
                        <span style={{ fontSize: '0.65rem', color: '#aaa' }}>{m}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#78350f', marginBottom: '0.5rem' }}>
                      Restaurant spending up <strong>+58%</strong> over 3 months.
                    </p>
                    <p style={{ fontSize: '0.88rem', color: '#92400e', lineHeight: 1.6 }}>
                      Jan £265 → Feb £298 → Mar <strong>£420</strong><br />
                      {is2028
                        ? <>This month is 47% above your 3-month average. <strong>I've drafted a suggested budget adjustment</strong> — I'll alert you when you approach 80% of any category limit.</>
                        : <>This month alone is 46% above your 3-month average.<br />Would you like me to set a dining limit or adjust your budget?</>
                      }
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button style={{ flex: 1, padding: '11px', background: is2028 ? 'linear-gradient(135deg, #7c3aed, #00395D)' : '#00395D', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>{is2028 ? 'Apply Budget Adjustment' : 'Set Dining Limit'}</button>
                    <button style={{ flex: 1, padding: '11px', background: 'rgba(0,0,0,0.04)', color: 'var(--text-secondary)', border: '1px solid #ddd', borderRadius: '10px', fontWeight: '500', fontSize: '0.9rem', cursor: 'pointer' }}>Dismiss</button>
                  </div>
                  {!is2028 && (
                    <button style={{ width: '100%', marginTop: '0.6rem', padding: '10px', background: 'transparent', color: '#00395D', border: '1px solid rgba(0,57,93,0.2)', borderRadius: '10px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>
                      Monitor Dining Spend
                    </button>
                  )}
                </div>
              );
              await wait(1000);
              setIsTyping(true);
              await wait(1800);
              setIsTyping(false);
              const proactiveText = is2030snap
                ? "I spotted two things while you were away. Your dining spend is 58% above baseline — I've pre-drafted an adjustment. I also found a broadband deal saving you £216 a year. I haven't acted on either yet — your call."
                : is2028
                  ? "I've been monitoring your spending patterns continuously. Your restaurant category crossed my anomaly threshold this week — you're 47% above your 3-month baseline and trending higher. I've already drafted a budget adjustment for your review."
                  : "I've noticed your restaurant spending has been trending upward over the past three months. This is the kind of pattern that's easy to miss month-to-month but adds up quickly.";
              setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', text: proactiveText, card: insightCard }]);
            } else if (scene.multiStep) {
              await typeText(scene.queries[0]);
              await wait(5000);
              await typeText("I don't recognise this.");
              await wait(7000);
              setIsTyping(true);
              await wait(800);
              setIsTyping(false);
              processInputRef.current('Chat with fraud specialist.');
            } else if (scene.accountSelect) {
              if (demoModeRef.current !== 'today') {
                // 2028 / 2030: AI selects source automatically — single query
                await typeText(scene.queries[0]);
              } else {
                // Today mode: ambiguous — disambiguation card appears, then user picks Barclays
                await typeText(scene.queries[0]);
                await wait(3500);
                await typeText('Barclays savings please.');
                await wait(3500);
              }
            } else {
              for (const query of scene.queries) {
                await typeText(query);
              }
            }

            await wait(scene.readTime);
            i++;
          } catch (err) {
            if (err.message === 'Abort') throw err;
            if (err.message === 'Skip') {
              demoCore.current.skip = false;
              if (demoCore.current.target !== null) {
                i = demoCore.current.target;
                demoCore.current.target = null;
              } else {
                i++; // Default skip to next if no target
              }
            }
          }
        }

        if (i >= SCENES.length && demoCore.current.active) {
          dispatch('Platform Architecture — opening…', { phase: 0, total: SCENES.length, showPlatform: true });
        }
      } catch (err) {
        // Silently catch Abort
      } finally {
        demoCore.current.active = false;
        window.dispatchEvent(new CustomEvent('AUTOPILOT_PLAY_STATE', { detail: { playing: false } }));
      }
    };

    const handleReset = () => {
      demoCore.current.active = false;
      resetChat();
    };

    window.addEventListener(startEventName, startAutopilot);
    window.addEventListener('RESET_CHAT', handleReset);
    return () => {
      window.removeEventListener(startEventName, startAutopilot);
      window.removeEventListener('RESET_CHAT', handleReset);
    };
  }, [startEventName]);

  // ── Intent Handlers ──────────────────────────────────────────────────────
  const handleIntent = (intentData, originalText) => {
    switch (intentData.intent) {

      case 'check_balance': {
        const expensesTotal = Object.values(profile.expenses).reduce((a, b) => a + b, 0);
        const isa = (futureMode || is2030) ? profile.linked_accounts?.natwest_isa : null;
        const totalWealth = profile.accounts.current + profile.accounts.savings + (isa?.balance || 0);

        // ── 2030 Mode ─────────────────────────────────────────────────────────
        if (is2030) {
          const trace = {
            confidence: 99,
            reasoning: [
              `Cross-provider balance aggregation: Barclays + NatWest`,
              `Barclays Current: £${profile.accounts.current.toLocaleString()} · Savings: £${profile.accounts.savings.toLocaleString()}`,
              `NatWest Cash ISA: £${isa?.balance?.toLocaleString()}`,
              `Monthly buffer: £${profile.income} income − £${expensesTotal} expenses − £${profile.savings_goal} savings goal = £${freshDiscretionary}`,
              `Predictive: 3 upcoming direct debits (£340 total) factored in`,
              `3 active automations monitored`,
            ],
            outcome: { ok: true, verdict: 'Cross-provider view', impact: `£${totalWealth.toLocaleString()} total · £${freshDiscretionary} discretionary` }
          };
          setCurrentTrace(trace);
          const card = (
            <div style={{ padding: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                <span style={{ fontWeight: '600', fontSize: '1.1rem', color: '#1E293B', letterSpacing: '-0.02em' }}>Live Portfolio</span>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#10B981', background: 'rgba(16,185,129,0.08)', borderRadius: '100px', padding: '3px 10px', marginLeft: 'auto', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Live</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { label: 'Barclays Current', value: `£${profile.accounts.current.toLocaleString()}`, sub: 'Day-to-day spending' },
                  { label: 'Everyday Saver', value: `£${profile.accounts.savings.toLocaleString()}`, sub: `Barclays · ${profile.savings_account?.rate || 4.75}% AER` },
                  { label: 'NatWest Cash ISA', value: `£${isa?.balance?.toLocaleString()}`, sub: `NatWest · ${isa?.rate || 3.2}% AER` },
                ].map(({ label, value, sub }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: '#1E293B', fontWeight: '600', fontSize: '0.95rem' }}>{label}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '1px', fontWeight: '400' }}>{sub}</div>
                    </div>
                    <span style={{ fontWeight: '700', color: '#1E293B', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '1.5rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
                <span style={{ fontWeight: '500', fontSize: '0.95rem', color: '#64748B' }}>Total Aggregated Wealth</span>
                <span style={{ fontWeight: '700', fontSize: '1.25rem', color: '#1E293B', letterSpacing: '-0.02em' }}>£{totalWealth.toLocaleString()}</span>
              </div>
              <div style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)', borderRadius: '16px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '8px' }}>
                  <span style={{ color: '#065F46', fontWeight: '500' }}>Current Discretionary</span>
                  <span style={{ fontWeight: '700', color: '#10B981' }}>£{freshDiscretionary.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#065F46', opacity: 0.6, lineHeight: 1.4 }}>Factoring committed spend, savings targets, and 3 upcoming direct debits.</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '1.25rem' }}>
                <ProviderExecutionChip provider="barclays" />
                <ProviderExecutionChip provider="natwest" />
              </div>
            </div>
          );
          addMessage('assistant',
            `Across Barclays and NatWest you're holding £${totalWealth.toLocaleString()} in total. Your monthly discretionary sits at £${freshDiscretionary.toLocaleString()} — I've factored in your committed spend and 3 upcoming direct debits. Here's the live picture:`,
            card
          );
          break;
        }

        const trace = {
          confidence: 97,
          reasoning: [
            `User asked: "${originalText}"`,
            `Resolved intent: check_balance (confidence: 97%)`,
            `Fetched balances: Barclays Current £${profile.accounts.current.toLocaleString()}, Savings £${profile.accounts.savings.toLocaleString()}`,
            isa ? `Linked account detected: ${isa.institution} ${isa.name} £${isa.balance.toLocaleString()}` : null,
            `Aggregated fixed expenses: ${Object.keys(profile.expenses).join(', ')}`,
            `Computed: £${profile.income} income − £${expensesTotal} expenses − £${profile.savings_goal} savings goal`,
            `Result: £${freshDiscretionary.toLocaleString()} safe-to-spend`
          ].filter(Boolean),
          financials: {
            'Salary income': { value: `£${profile.income.toLocaleString()}` },
            'Fixed expenses': { value: `-£${expensesTotal.toLocaleString()}`, color: '#ef5350' },
            'Savings goal': { value: `-£${profile.savings_goal.toLocaleString()}`, color: '#ef5350' },
            'Safe-to-Spend': { value: `£${freshDiscretionary.toLocaleString()}`, highlight: true, color: '#00AEEF' }
          },
          modelRouting: futureMode ? MODEL_ROUTING.check_balance : undefined,
          outcome: {
            ok: true,
            verdict: 'Budget Calculated',
            impact: `Discretionary income is £${freshDiscretionary.toLocaleString()} / month.`,
            futureNote: 'Your financial copilot runs this using an on-device SLM (<10ms) cross-referenced with your Barclays and NatWest accounts via Open Banking. It surfaces this insight proactively — alerting you 72 hours before a cash flow issue, not after you ask.'
          }
        };
        setCurrentTrace(trace);

        const card = (
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--brand-blue)', fontWeight: '600' }}>Monthly Breakdown</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Income</span>
              <span style={{ color: 'var(--success)', fontWeight: '600' }}>£{profile.income.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Fixed Expenses & Bills</span>
              <span style={{ color: '#ef5350', fontWeight: '600' }}>−£{expensesTotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Savings Goal</span>
              <span style={{ color: '#ef5350', fontWeight: '600' }}>−£{profile.savings_goal.toLocaleString()}</span>
            </div>
            <div style={{ height: '1px', background: 'rgba(0,0,0,0.08)', marginBottom: '1rem' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontWeight: '600', color: 'var(--brand-blue)' }}>Safe-to-Spend</span>
              <span style={{ fontWeight: '700', fontSize: '1.4rem', color: 'var(--brand-cyan)' }}>£{freshDiscretionary.toLocaleString()}</span>
            </div>
            {isa && (
              <div style={{ background: 'rgba(107,31,31,0.04)', border: '1px solid rgba(107,31,31,0.12)', borderRadius: '10px', padding: '10px 14px', fontSize: '0.82rem', color: '#6b1f1f' }}>
                <strong>Across your Barclays and {isa.institution} accounts</strong> you currently hold <strong>£{totalWealth.toLocaleString()}</strong> in total.
              </div>
            )}
          </div>
        );

        addMessage('assistant',
          futureMode
            ? `Computed in real-time across your Barclays and NatWest accounts: you have £${freshDiscretionary.toLocaleString()} available this month — with your NatWest ISA and all committed spend factored in. Here's the full picture:`
            : `Based on your income and outgoings, you have around £${freshDiscretionary.toLocaleString()} available to spend freely this month — after bills and your savings goal are accounted for. Here's the full breakdown:`,
          card
        );
        break;
      }

      case 'transfer_money': {
        const { source_account, destination_account, amount } = intentData;
        const barclaysRate = profile.savings_account?.rate || 4.75;
        const natwestRate = profile.linked_accounts?.natwest_isa?.rate || 3.2;
        const natwestISA = profile.linked_accounts?.natwest_isa;

        // ── 2030 Mode: Delegated execution within pre-authorised limits ────────
        if (is2030) {
          executeTransfer(source_account, destination_account, amount);
          const interestSaved = Math.round(amount * (barclaysRate - natwestRate) / 100);
          const trace = {
            confidence: 100,
            reasoning: [
              `Transfer request: £${amount} to ${destination_account}`,
              `Delegated execution: within pre-authorised limits (< £1,000 routine transfers)`,
              `Source optimisation: NatWest ISA (${natwestRate}% AER) preserves Barclays (${barclaysRate}% AER)`,
              `Consent layer: standing delegated authority active`,
              `Barclays Payment API: executed in 340ms`,
              `Visa network: transaction credentialed`,
              `Fraud monitoring: no anomaly detected`,
            ],
            outcome: { ok: true, verdict: 'Delegated Execution', impact: `£${amount} transferred. NatWest ISA used — Barclays savings preserved.` }
          };
          setCurrentTrace(trace);
          const card = (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <CheckCircle size={20} color="#10B981" />
                <span style={{ fontWeight: '700', fontSize: '1rem', color: '#10B981' }}>Transfer Complete</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: '700', background: 'linear-gradient(135deg, #4C1D95, #1E40AF)', color: 'white', padding: '2px 8px', borderRadius: '100px' }}>Delegated</span>
              </div>
              <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' }}>
                {[
                  { label: 'From', value: 'NatWest Cash ISA', detail: `${natwestRate}% AER — lower yield, used as source` },
                  { label: 'To', value: `Barclays ${destination_account}`, detail: null },
                  { label: 'Amount', value: `£${amount}`, detail: null },
                ].map(({ label, value, detail }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                    <div>
                      <div style={{ color: '#475569' }}>{label}</div>
                      {detail && <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '2px' }}>{detail}</div>}
                    </div>
                    <span style={{ fontWeight: '700', color: '#1E293B', fontSize: label === 'Amount' ? '1.3rem' : '0.95rem' }}>{value}</span>
                  </div>
                ))}
                <div style={{ fontSize: '0.72rem', color: '#10B981', fontStyle: 'italic', marginTop: '4px' }}>
                  ~£{interestSaved}/yr extra interest retained by preserving Barclays savings
                </div>
              </div>
              <TrustTimeline steps={[
                { label: 'Personal AI orchestrator', detail: 'Transfer intent resolved, source optimised' },
                { label: 'Consent & delegated authority', detail: 'Standing authority active — within pre-authorised limits' },
                { label: 'Barclays Payment API', detail: 'Executed in 340ms' },
                { label: 'Visa network credential', detail: 'Transaction credentialed, settlement T+0' },
                { label: 'Fraud monitoring', detail: 'No anomaly — velocity check passed' },
              ]} />
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                <ProviderExecutionChip provider="ai" />
                <ProviderExecutionChip provider="barclays" />
                <ProviderExecutionChip provider="visa" />
                <ProviderExecutionChip provider="fraud" />
              </div>
            </div>
          );
          addMessage('assistant',
            `Done. I've moved £${amount} from your NatWest Cash ISA (${natwestRate}% AER) — your Barclays Everyday Saver stays intact at ${barclaysRate}% AER. This was within your delegated limits; no confirmation needed.`,
            card
          );
          break;
        }

        // ── 2028 Mode: AI selects optimal source account automatically ─────────
        if (futureMode) {
          // Barclays Everyday Saver earns more → use NatWest ISA as source to preserve it
          executeTransfer(source_account, destination_account, amount);
          const interestSaved = Math.round(amount * (barclaysRate - natwestRate) / 100);
          const trace = {
            confidence: 99,
            reasoning: [
              `User said: "${originalText}"`,
              `Resolved intent: transfer_money (confidence: 99%)`,
              `Evaluating source accounts for £${amount} transfer`,
              `Barclays Everyday Saver: ${barclaysRate}% AER — highest yield, preserve`,
              `NatWest Cash ISA: ${natwestRate}% AER — lower yield, use as source`,
              `Rate optimisation: NatWest ISA selected — saves ~£${interestSaved}/yr in lost interest`,
              `2028 Mode: continuous biometric session active — no friction required`,
              `Policy result: INSTANT EXECUTION — optimal source confirmed`
            ],
            policy: { amount, rule: `Rate optimisation: NatWest ISA (${natwestRate}%) used, Barclays (${barclaysRate}%) preserved`, fraudRisk: 'Low', deviceTrust: 'Verified (Passkey)', velocityCheck: 'Pass', action: 'AI selected lowest-yield source — no user input needed', actionColor: 'success' },
            modelRouting: MODEL_ROUTING.transfer_2028,
            outcome: { ok: true, verdict: 'Smart Transfer Executed', impact: `NatWest ISA used as source — Barclays Everyday Saver (${barclaysRate}% AER) fully preserved.`, futureNote: `AI evaluates all savings accounts by yield before every transfer, automatically routing from the lowest-rate source to maximise your returns. Continuous biometric auth removes all friction.` }
          };
          setCurrentTrace(trace);
          const card = (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--success)' }}>
                <CheckCircle size={22} />
                <span style={{ fontWeight: '600', fontSize: '1.05rem' }}>Smart Transfer</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: '700', background: 'linear-gradient(90deg, #7c3aed, #00AEEF)', color: 'white', padding: '2px 8px', borderRadius: '100px' }}>2028</span>
              </div>
              <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.18)', borderRadius: '12px', padding: '12px 14px', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>AI Rate Optimisation</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ flex: 1, background: 'rgba(124,58,237,0.1)', borderRadius: '8px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '0.65rem', color: '#9c6fef', marginBottom: '2px' }}>NatWest Cash ISA</div>
                    <div style={{ fontWeight: '700', color: '#7c3aed', fontSize: '0.9rem' }}>{natwestRate}% AER</div>
                    <div style={{ fontSize: '0.62rem', color: '#a78bfa', marginTop: '2px' }}>Used for transfer ✓</div>
                  </div>
                  <div style={{ fontSize: '1rem', color: '#9c6fef' }}>→</div>
                  <div style={{ flex: 1, background: 'rgba(0,57,93,0.08)', borderRadius: '8px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '0.65rem', color: '#00395D', marginBottom: '2px' }}>Barclays Everyday Saver</div>
                    <div style={{ fontWeight: '700', color: 'var(--brand-blue)', fontSize: '0.9rem' }}>{barclaysRate}% AER</div>
                    <div style={{ fontSize: '0.62rem', color: '#00AEEF', marginTop: '2px' }}>Preserved ↗</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#7c3aed', fontStyle: 'italic' }}>
                  ~£{interestSaved}/yr extra interest retained by keeping Barclays savings intact
                </div>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1rem' }}>
                <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>From</span>
                  <span style={{ fontWeight: '600', color: '#7c3aed' }}>NatWest Cash ISA</span>
                </p>
                <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>To</span>
                  <span style={{ textTransform: 'capitalize', fontWeight: '600', color: 'var(--brand-blue)' }}>{destination_account}</span>
                </p>
                <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '0.75rem 0' }} />
                <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Amount</span>
                  <span style={{ fontWeight: '700', fontSize: '1.4rem', color: 'var(--brand-blue)' }}>£{amount}</span>
                </p>
              </div>
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(0,174,239,0.08))', border: '1px solid rgba(124,58,237,0.2)', fontSize: '0.8rem', color: '#7c3aed', textAlign: 'center' }}>
                ⚡ Authorised via continuous biometric session — no tap required
              </div>
            </div>
          );
          addMessage('assistant', `Done. I've taken the £${amount} from your NatWest Cash ISA (${natwestRate}% AER) instead of your Barclays Everyday Saver — your Barclays savings earn ${barclaysRate}% AER, so it's better value to keep those working for you. Authorised via your biometric session.`, card);
          break;
        }

        // ── Today Mode: account disambiguation ────────────────────────────────
        // source_account is 'savings' — user has two savings accounts, ask which one
        const completeTodayTransfer = (chosenSource) => {
          const displayName = chosenSource === 'savings' ? `Barclays Everyday Saver` : (natwestISA?.name || 'NatWest ISA');
          const policyResult = transferMoney(chosenSource, destination_account, amount);
          const traceInner = {
            confidence: 96,
            reasoning: [
              `User selected: ${displayName}`,
              `Resolved intent: transfer_money (account confirmed)`,
              `Source: ${displayName}, Dest: ${destination_account}, Amount: £${amount}`,
              `Fraud scoring: Low (no velocity anomaly, trusted device)`,
              `Policy evaluation: amount=${amount} vs threshold=500`,
              policyResult.status === 'approved' ? 'Policy result: APPROVED — executing immediately' : 'Policy result: CONFIRMATION REQUIRED — presenting auth card'
            ],
            policy: {
              amount,
              rule: amount > 500 ? 'Transfers > £500 require confirmation' : 'Under threshold, auto-approved',
              fraudRisk: 'Low', deviceTrust: 'High', velocityCheck: 'Pass',
              action: policyResult.status === 'approved' ? 'Auto-approved by policy engine' : 'User authorisation required',
              actionColor: policyResult.status === 'approved' ? 'success' : 'warning'
            },
            outcome: {
              ok: policyResult.status === 'approved',
              verdict: policyResult.status === 'approved' ? 'Transfer Executed' : 'Authorisation Required',
              impact: policyResult.reason,
              futureNote: `AI rate optimisation automatically picks the lowest-yield account as source (NatWest ISA at ${natwestRate}% AER), preserving your Barclays savings at ${barclaysRate}% AER. Continuous biometric auth removes the confirmation step entirely.`
            }
          };
          setCurrentTrace(traceInner);
          const transferCard = (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: policyResult.status === 'approved' ? 'var(--success)' : 'var(--warning)' }}>
                {policyResult.status === 'approved' ? <CheckCircle size={22} /> : <AlertTriangle size={22} />}
                <span style={{ fontWeight: '600', fontSize: '1.05rem' }}>
                  {policyResult.status === 'approved' ? 'Transfer Sent' : policyResult.status === 'confirmation_required' ? 'Authorisation Required' : 'Transfer Declined'}
                </span>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
                <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>From</span>
                  <span style={{ fontWeight: '600', color: 'var(--brand-blue)' }}>{displayName}</span>
                </p>
                <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>To</span>
                  <span style={{ textTransform: 'capitalize', fontWeight: '600', color: 'var(--brand-blue)' }}>{destination_account}</span>
                </p>
                <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '1rem 0' }} />
                <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Amount</span>
                  <span style={{ fontWeight: '700', fontSize: '1.4rem', color: 'var(--brand-blue)' }}>£{amount}</span>
                </p>
              </div>
              {policyResult.status === 'confirmation_required' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button
                    onClick={() => {
                      executeTransfer(chosenSource, destination_account, amount);
                      addMessage('user', 'Confirm transfer.');
                      setIsTyping(true);
                      setTimeout(() => { addMessage('assistant', `Confirmed. £${amount} has been moved from your ${displayName} to your ${destination_account} account.`); setIsTyping(false); }, 1000);
                    }}
                    style={{ width: '100%', padding: '14px', background: 'var(--brand-blue)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                  >
                    Approve £{amount}<ChevronRight size={18} />
                  </button>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>{policyResult.reason}</p>
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Policy: {policyResult.reason}</p>
              )}
            </div>
          );
          if (policyResult.status === 'approved') {
            addMessage('assistant', `All sorted. I've transferred £${amount} from your ${displayName} to your ${destination_account} account.`, transferCard);
          } else if (policyResult.status === 'confirmation_required') {
            addMessage('assistant', `For your security, transfers over £500 require your approval. Please confirm the details below.`, transferCard);
          } else {
            addMessage('assistant', `I could not complete this transfer.`, transferCard);
          }
        };

        // Set up intercept so the next message (autopilot or user) completes the transfer
        awaitingAccountSelectRef.current = { complete: () => completeTodayTransfer('savings') };

        const disambigCard = (
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              You have savings in two accounts. Which would you like to move <strong>£{amount}</strong> from?
            </div>
            <div
              onClick={() => {
                awaitingAccountSelectRef.current = null;
                addMessage('user', 'Barclays savings please.');
                setIsTyping(true);
                setTimeout(() => { completeTodayTransfer('savings'); setIsTyping(false); }, 1500);
              }}
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '14px', marginBottom: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '3px' }}>Barclays Everyday Saver</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--brand-cyan)', fontWeight: '600' }}>{barclaysRate}% AER</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '2px' }}>£{profile.accounts.savings.toLocaleString()}</div>
                <ChevronRight size={15} color="#ccc" />
              </div>
            </div>
            {natwestISA && (
              <div
                onClick={() => {
                  awaitingAccountSelectRef.current = null;
                  addMessage('user', 'NatWest ISA please.');
                  setIsTyping(true);
                  setTimeout(() => { completeTodayTransfer('natwest_isa'); setIsTyping(false); }, 1500);
                }}
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '3px' }}>{natwestISA.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{natwestISA.rate}% AER</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '2px' }}>£{natwestISA.balance.toLocaleString()}</div>
                  <ChevronRight size={15} color="#ccc" />
                </div>
              </div>
            )}
          </div>
        );
        addMessage('assistant', `You have savings in two accounts. Which would you like to move the £${amount} from?`, disambigCard);
        break;
      }

      case 'analyse_spending': {
        const expenses = profile.expenses;
        const expensesTotal = Object.values(expenses).reduce((a, b) => a + b, 0);
        const categories = Object.entries(expenses).map(([k, v]) => ({
          name: k.charAt(0).toUpperCase() + k.slice(1), amount: v, pct: Math.round((v / profile.income) * 100)
        }));
        const sortedCats = [...categories].sort((a, b) => b.amount - a.amount);

        if (is2030) {
          const trace = {
            confidence: 97,
            reasoning: [
              `Cross-provider spending analysis: Barclays + NatWest`,
              `Total committed: £${expensesTotal.toLocaleString()} (${Math.round(expensesTotal / profile.income * 100)}% of income)`,
              `Largest category: ${sortedCats[0].name} at £${sortedCats[0].amount}`,
              `Anomaly detected: Restaurants 58% above 3-month baseline`,
              `Continuous monitoring: live transaction feed, updated in real-time`,
            ],
            outcome: { ok: true, verdict: 'Live cross-provider analysis', impact: `£${expensesTotal.toLocaleString()} committed · £${freshDiscretionary.toLocaleString()} discretionary` }
          };
          setCurrentTrace(trace);
          const card = (
            <div style={{ padding: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                <span style={{ fontWeight: '600', fontSize: '1.1rem', color: '#1E293B', letterSpacing: '-0.02em' }}>Spending Analysis</span>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#10B981', background: 'rgba(16,185,129,0.08)', borderRadius: '100px', padding: '3px 10px', marginLeft: 'auto', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Live</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {sortedCats.map(cat => (
                  <div key={cat.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#64748B', fontWeight: '500' }}>{cat.name}</span>
                        {cat.name === 'Food' && <span style={{ fontSize: '0.65rem', color: '#F59E0B', fontWeight: '700', background: 'rgba(245,158,11,0.08)', borderRadius: '100px', padding: '2px 8px' }}>+58% ↑</span>}
                      </div>
                      <span style={{ fontWeight: '600', color: '#1E293B' }}>£{cat.amount} <span style={{ color: '#94A3B8', fontWeight: '400', fontSize: '0.8rem' }}>• {cat.pct}%</span></span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(30,41,59,0.04)', borderRadius: '100px' }}>
                      <div style={{ height: '100%', width: `${Math.min(cat.pct * 2, 100)}%`, background: cat.name === 'Food' ? 'linear-gradient(90deg, #F59E0B, #D97706)' : 'linear-gradient(90deg, #6366F1, #A855F7)', borderRadius: '100px', transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '1.5rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', alignItems: 'baseline' }}>
                <span style={{ fontWeight: '500', fontSize: '0.95rem', color: '#64748B' }}>Total Committed Monthly</span>
                <span style={{ fontWeight: '700', fontSize: '1.2rem', color: '#1E293B', letterSpacing: '-0.02em' }}>£{expensesTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <ProviderExecutionChip provider="barclays" />
                <ProviderExecutionChip provider="natwest" />
              </div>
            </div>
          );
          addMessage('assistant',
            `Your spending is tracked continuously across both accounts. Restaurants are flagged — 58% above your 3-month average and climbing. Everything else looks stable. Your biggest commitment remains ${sortedCats[0].name.toLowerCase()} at £${sortedCats[0].amount}/month. Here's the live picture:`,
            card
          );
          break;
        }

        const trace = {
          confidence: 94,
          reasoning: [
            `User said: "${originalText}"`,
            `Resolved intent: analyse_spending (confidence: 94%)`,
            `Fetched expense categories from financial profile`,
            `Total fixed outgoings: £${expensesTotal.toLocaleString()} (${Math.round(expensesTotal / profile.income * 100)}% of income)`,
            `Largest category: ${sortedCats[0].name} at £${sortedCats[0].amount}`,
            `Remaining after expenses + savings goal: £${freshDiscretionary.toLocaleString()}`
          ],
          financials: Object.fromEntries(sortedCats.map(c => [c.name, { value: `£${c.amount} (${c.pct}%)` }])),
          modelRouting: futureMode ? MODEL_ROUTING.analyse_spending : undefined,
          outcome: {
            ok: true, verdict: 'Spending Analysis Complete',
            impact: `£${expensesTotal.toLocaleString()} committed monthly (${Math.round(expensesTotal / profile.income * 100)}% of income). £${freshDiscretionary.toLocaleString()} discretionary.`,
            futureNote: 'Every transaction is classified in real-time by an on-device SLM using a bank-trained merchant taxonomy. A cloud reasoning model runs monthly re-optimisation across all your accounts — including pensions and investments — surfacing rebalancing suggestions before you fall off budget.'
          }
        };
        setCurrentTrace(trace);

        const card = (
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--brand-blue)', fontWeight: '600' }}>Spending Analysis</h4>
            {sortedCats.map(cat => (
              <div key={cat.name} style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{cat.name}</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>£{cat.amount} <span style={{ color: '#aaa', fontWeight: '400' }}>({cat.pct}%)</span></span>
                </div>
                <div style={{ height: '4px', background: '#eee', borderRadius: '4px' }}>
                  <div style={{ height: '100%', width: `${Math.min(cat.pct * 2, 100)}%`, background: 'var(--brand-blue)', borderRadius: '4px', transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
            <div style={{ height: '1px', background: 'rgba(0,0,0,0.08)', margin: '1rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--brand-blue)' }}>Total Committed</span>
              <span style={{ fontWeight: '700', color: 'var(--brand-blue)' }}>£{expensesTotal.toLocaleString()}</span>
            </div>
          </div>
        );

        addMessage('assistant',
          `Your biggest monthly commitment is ${sortedCats[0].name.toLowerCase()} at £${sortedCats[0].amount} — that alone is ${sortedCats[0].pct}% of your income. Once all fixed costs and your savings goal are covered, £${freshDiscretionary.toLocaleString()} remains as genuinely discretionary. Here's the full picture:`,
          card
        );
        break;
      }

      case 'affordability_check': {
        const { cost } = intentData;
        const affordable = cost <= freshDiscretionary;
        const deficit = affordable ? 0 : cost - freshDiscretionary;
        const monthsDelayed = Math.ceil(deficit / profile.savings_goal);

        if (is2030) {
          const trace = {
            confidence: 92,
            reasoning: [
              `User asked about £${cost} holiday affordability`,
              `Cross-provider balance: Barclays + NatWest = £${(profile.accounts.current + profile.accounts.savings + (profile.linked_accounts?.natwest_isa?.balance || 0)).toLocaleString()}`,
              `Monthly discretionary: £${freshDiscretionary.toLocaleString()}`,
              `Goal impact: savings goal unaffected — recommend funding from travel budget`,
              `Seasonality model: summer spend +18% factored in`,
              `AI recommendation: approve, fund from travel budget (£340 available)`,
            ],
            outcome: { ok: true, verdict: 'Approved — goal-aware recommendation', impact: 'Fund from travel budget. Emergency buffer preserved.' }
          };
          setCurrentTrace(trace);
          const card = (
            <div style={{ padding: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                <CheckCircle size={20} color="#10B981" weight="bold" />
                <span style={{ fontWeight: '600', fontSize: '1.1rem', color: '#10B981', letterSpacing: '-0.02em' }}>Book with confidence</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: '700', color: '#6366F1', background: 'rgba(99,102,241,0.08)', borderRadius: '100px', padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>92% Score</span>
              </div>
              <div style={{ background: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.1)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', opacity: 0.6 }}>Analysis Factors</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: 'Travel budget', value: '£340 allocated ✓', color: '#10B981' },
                    { label: 'Emergency buffer', value: 'Preserved ✓', color: '#10B981' },
                    { label: 'Savings goal', value: 'Stay on track ✓', color: '#10B981' },
                    { label: 'Summer seasonality', value: '18% spike modelled', color: '#F59E0B' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', alignItems: 'center' }}>
                      <span style={{ color: '#64748B', fontWeight: '500' }}>{label}</span>
                      <span style={{ fontWeight: '600', color }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <TrustTimeline steps={[
                { label: 'Personal AI analysis', detail: `Continuous re-computation across 14 signals` },
                { label: 'Future commitment check', detail: 'Direct debits & scheduled spend factored' },
              ]} />
              <button style={{ width: '100%', marginTop: '1.25rem', padding: '14px', background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)', transition: 'transform 0.2s' }}>
                Execute Transfer & Booking
              </button>
            </div>
          );
          addMessage('assistant',
            `Yes — book it. I'm 92% confident this is the right call. Fund it from your travel budget (£340 available) and your emergency buffer and savings goal stay completely intact. Summer seasonality is factored in. Here's the full plan:`,
            card
          );
          break;
        }

        const trace = {
          confidence: 98,
          reasoning: [
            `User said: "${originalText}"`,
            `Resolved intent: affordability_check (confidence: 98%)`,
            `Extracted cost: £${cost}`,
            `Retrieved safe-to-spend: £${freshDiscretionary}`,
            affordable
              ? `£${cost} ≤ £${freshDiscretionary} — within budget`
              : `£${cost} > £${freshDiscretionary} — exceeds budget by £${deficit}`,
            affordable
              ? 'Outcome: Affordable. No savings impact.'
              : `Outcome: Affordable but will delay savings goal by ~${monthsDelayed} month(s).`
          ],
          financials: {
            'Safe-to-Spend': { value: `£${freshDiscretionary.toLocaleString()}` },
            'Purchase Cost': { value: `£${cost.toLocaleString()}`, color: '#ef5350' },
            'Savings Impact': {
              value: affordable ? 'None' : `+${monthsDelayed} month delay`,
              color: affordable ? 'var(--success)' : '#f59e0b'
            }
          },
          modelRouting: futureMode ? MODEL_ROUTING.affordability_check : undefined,
          outcome: {
            ok: affordable,
            verdict: affordable ? 'Affordable' : 'Affordable (with impact)',
            impact: affordable ? `£${cost} falls within your discretionary budget.` : `Savings goal delayed by ~${monthsDelayed} month(s). Holiday costs £${deficit} more than your current free budget.`,
            futureNote: 'Affordability is a continuous model state, not a one-time query. The reasoning agent holds your committed future spend — direct debits, subscriptions, scheduled payments — in context and recomputes your real discretionary budget every time a new transaction clears.'
          }
        };
        setCurrentTrace(trace);

        const card = futureMode ? (
          <div>
            {/* Future: multi-dimensional affordability score */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <CheckCircle size={20} color="#10b981" />
              <span style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--success)' }}>Affordable — high confidence</span>
            </div>
            {/* Confidence score bar */}
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '12px', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Affordability Score</span>
                <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#10b981' }}>87%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(0,0,0,0.08)', borderRadius: '3px', marginBottom: '4px' }}>
                <div style={{ width: '87%', height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: '3px' }} />
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Based on 14 financial signals</span>
            </div>
            {/* Context factors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '0.75rem' }}>
              {[
                { label: 'Budget headroom', value: `£${freshDiscretionary.toLocaleString()} available`, color: '#10b981' },
                { label: 'Seasonality', value: 'Summer — typical spend +18%', color: '#f59e0b' },
                { label: 'Goal timeline', value: 'Savings target unaffected', color: '#10b981' },
                { label: 'Upcoming commitments', value: '£340 direct debits cleared', color: 'var(--text-secondary)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontWeight: '600', color }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.18)', borderRadius: '10px', padding: '10px 12px' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#7c3aed', lineHeight: 1.5 }}>
                <strong>Personalised insight:</strong> You historically spend 23% more in summer. Budget now and your £1,000 goal stays on track by August.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: affordable ? 'var(--success)' : 'var(--warning)' }}>
              {affordable ? <CheckCircle size={22} /> : <AlertTriangle size={22} />}
              <span style={{ fontWeight: '600', fontSize: '1.05rem' }}>{affordable ? 'Yes, you can afford this' : 'Affordable — with impact'}</span>
            </div>
            <div style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Purchase</span>
                <span style={{ fontWeight: '700', fontSize: '1.4rem', color: 'var(--brand-blue)' }}>£{cost}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Safe-to-Spend</span>
                <span style={{ fontWeight: '600', color: 'var(--success)' }}>£{freshDiscretionary.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Savings impact</span>
                <span style={{ fontWeight: '600', color: affordable ? 'var(--success)' : 'var(--warning)' }}>
                  {affordable ? 'None' : `+${monthsDelayed} month delay`}
                </span>
              </div>
            </div>
            {!affordable && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                You can afford the £{cost} holiday using this month's discretionary budget. However, it will delay your savings goal by approximately {monthsDelayed} month.
              </p>
            )}
            {affordable && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cost falls within your £{freshDiscretionary.toLocaleString()} spending capacity.</p>}
          </div>
        );

        addMessage('assistant',
          futureMode
            ? `Based on 14 financial signals, I'm 87% confident this is the right time to book. Your summer spending pattern is factored in — here's the full picture:`
            : affordable
              ? `Yes — based on your current discretionary budget of £${freshDiscretionary.toLocaleString()}, a £${cost} holiday is within reach and won't touch your savings goal. Here's how it stacks up:`
              : `You can afford the £${cost} holiday, but it's £${deficit} more than your current free budget. The trade-off is your savings goal slips by roughly ${monthsDelayed} month — worth knowing before you book:`,
          card
        );
        break;
      }

      case 'analyse_spending':
        // handled above — intentional duplicate prevention
        break;

      case 'support_transaction_query': {
        if (is2030) {
          const trace = {
            confidence: 99,
            reasoning: [
              `Continuous monitoring flagged Northline Services as anomalous 3 days ago`,
              `Transaction: £85.00 · Northline Services · Yesterday 14:22`,
              `Risk profile: unrecognised recurring charge, merchant not in approved list`,
              `AI pre-action: future payments paused pending user confirmation`,
              `Dispute draft prepared and ready for single-tap submission`,
            ],
            outcome: { ok: true, verdict: 'Anomaly pre-flagged', impact: 'Future payments paused. Dispute ready to submit.' }
          };
          setCurrentTrace(trace);
          const card = (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(239,68,68,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#DC2626' }}>NS</div>
                <div>
                  <div style={{ fontWeight: '600', color: '#1E293B' }}>Northline Services</div>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Online Subscription · Yesterday, 14:22</div>
                </div>
                <div style={{ marginLeft: 'auto', fontWeight: '700', fontSize: '1.1rem', color: '#DC2626' }}>−£85.00</div>
              </div>
              <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 12px', marginBottom: '1rem', fontSize: '0.82rem', color: '#7F1D1D' }}>
                I flagged this 3 days ago — it's not in your approved merchant list. I've already paused future payments from this merchant pending your decision.
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <button onClick={() => processInput("I don't recognise this")} style={{ flex: 1, padding: '10px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>Submit Dispute</button>
                <button style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.04)', color: '#475569', border: '1px solid #E2E8F0', borderRadius: '10px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>I Recognise This</button>
              </div>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                <ProviderExecutionChip provider="fraud" />
                <ProviderExecutionChip provider="barclays" />
              </div>
            </div>
          );
          addMessage('assistant',
            `I flagged Northline Services 3 days ago — it's not a merchant you've approved. I've already paused future payments. Would you like me to submit the dispute now?`,
            card
          );
          break;
        }

        const trace = {
          confidence: 96,
          reasoning: [
            `User asked: "${originalText}"`,
            `Resolved intent: support_transaction_query (confidence: 96%)`,
            `Matched transaction: £85.00 'Northline Services' on Current Account`,
            `Category analysis: Recurring online subscription`,
            `User sentiment check: Confused / concerned`,
            `Action: Present transaction details and offer dispute options`
          ],
          financials: {
            'Matched Transaction': { value: '£85.00', color: '#ef5350' },
            'Merchant': { value: 'Northline Services' },
            'Status': { value: 'Cleared' }
          },
          modelRouting: futureMode ? MODEL_ROUTING.support_query : undefined,
          outcome: {
            ok: true, verdict: 'Transaction Located',
            impact: 'Transaction details prepared. Standing by for user recognition confirm.',
            futureNote: 'The on-device SLM pattern-matches your 24-month transaction history in under 50ms, flagging anomalous merchants before they clear — surfacing this to you proactively, before you even open the app.'
          }
        };
        setCurrentTrace(trace);

        const card = (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(0,57,93,0.06)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--brand-blue)' }}>NS</div>
              <div>
                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Northline Services</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Online Subscription • Yesterday, 14:22</div>
              </div>
              <div style={{ marginLeft: 'auto', fontWeight: '700', fontSize: '1.1rem', color: '#ef5350' }}>−£85.00</div>
            </div>
            <div style={{ height: '1px', background: 'var(--divider)', margin: '1rem 0' }} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ flex: 1, padding: '10px', background: 'var(--brand-blue)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>Review Merchant</button>
              <button onClick={() => processInput("I don't recognise this")} style={{ flex: 1, padding: '10px', background: 'rgba(211,47,47,0.1)', color: 'var(--danger)', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>Dispute Charge</button>
            </div>
          </div>
        );

        addMessage('assistant', `I can see the £85 charge from Northline Services yesterday at 14:22. It appears to be an online subscription payment. Would you like to review the merchant, dispute the charge, or block future payments?`, card);
        break;
      }

      case 'support_dispute': {
        if (is2030) {
          const trace = {
            confidence: 100,
            reasoning: [
              `Dispute submitted for Northline Services £85.00`,
              `Merchant already blocked (paused 3 days ago, now confirmed)`,
              `AI-to-AI negotiation initiated: contacting Northline merchant API with evidence`,
              `Provisional refund: agreed in principle (< 90 seconds)`,
              `Dispute reference: #FR-2839`,
              `Fraud monitoring: enhanced monitoring active on account`,
            ],
            outcome: { ok: true, verdict: 'Dispute filed · Refund in progress', impact: 'AI negotiation secured provisional refund. Confirm with Sarah to finalise.' }
          };
          setCurrentTrace(trace);
          const card = (
            <div style={{ padding: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', color: '#10B981' }}>
                <CheckCircle size={20} weight="bold" />
                <span style={{ fontWeight: '600', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Dispute secured</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.62rem', fontWeight: '700', background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: 'white', padding: '3px 10px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>AI Resolved</span>
              </div>
              <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid rgba(0,0,0,0.03)' }}>
                {[
                  { label: 'Merchant', value: 'Northline Services' },
                  { label: 'Amount', value: '£85.00', color: '#DC2626' },
                  { label: 'Case ref', value: '#FR-2839' },
                  { label: 'AI Status', value: 'Provisional refund agreed', color: '#10B981' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem', alignItems: 'center' }}>
                    <span style={{ color: '#64748B', fontWeight: '500' }}>{label}</span>
                    <span style={{ fontWeight: '600', color: color || '#1E293B' }}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(99,102,241,0.03)', border: '1px solid rgba(99,102,241,0.1)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6366F1', marginBottom: '12px', opacity: 0.8 }}>System Protection Active</div>
                {['Merchant blocked permanent', 'AI negotiation confirmed refund', 'Monitoring enhanced'].map(a => (
                  <div key={a} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: '#1E293B', marginBottom: '8px' }}>
                    <div style={{ width: '6px', height: '6px', background: '#10B981', borderRadius: '50%' }} /> {a}
                  </div>
                ))}
              </div>
              <button onClick={() => processInput('Chat with fraud specialist.')} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }}>
                Finalise with Sarah <ChevronRight size={18} />
              </button>
            </div>
          );
          addMessage('assistant',
            `Done. Merchant blocked, dispute filed, and I've already opened AI-to-AI negotiation with Northline's system — a provisional refund has been agreed in principle. Connect with Sarah to finalise it.`,
            card
          );
          break;
        }

        const trace = {
          confidence: 99,
          reasoning: futureMode ? [
            `User said: "${originalText}"`,
            `Resolved intent: support_dispute (confidence: 99%)`,
            `Context attached: Northline Services, £85.00`,
            `Policy: Unrecognised online charges — auto-dispute protocol activated`,
            `Action: Freeze payments, open dispute, initiate AI-to-AI resolution`,
            `Contacting Northline merchant API with evidence package...`,
            `AI negotiation in progress — estimated 2 min to resolution`
          ] : [
            `User said: "${originalText}"`,
            `Resolved intent: support_dispute (confidence: 99%)`,
            `Context attached: Northline Services, £85.00`,
            `Policy: Unrecognised online charges require immediate merchant block`,
            `Action: Freeze payments, open dispute case`,
            `Note: Manual review required — advisor will need additional transaction details`
          ],
          policy: {
            amount: 85, rule: 'Unrecognised transaction reported', fraudRisk: 'Medium', deviceTrust: 'High', velocityCheck: 'Pass',
            action: futureMode ? 'Merchant blocked, dispute opened, AI-to-AI resolution initiated' : 'Merchant blocked, dispute opened — manual review pending',
            actionColor: 'warning'
          },
          modelRouting: futureMode ? MODEL_ROUTING.support_dispute : undefined,
          outcome: {
            ok: true, verdict: 'Dispute Initiated',
            impact: futureMode ? 'AI-to-AI negotiation in progress — no user action needed.' : 'Merchant blocked. Manual review required.',
            futureNote: futureMode ? 'Barclays\' dispute agent contacts Northline\'s merchant API directly, presents evidence, and negotiates the refund — typically resolved in under 2 minutes, no human needed.' : ''
          }
        };
        setCurrentTrace(trace);

        const card = futureMode ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--success)' }}>
              <CheckCircle size={22} />
              <span style={{ fontWeight: '600', fontSize: '1.05rem' }}>Dispute Opened</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: '700', background: 'linear-gradient(90deg, #7c3aed, #00AEEF)', color: 'white', padding: '2px 8px', borderRadius: '100px' }}>2028</span>
            </div>
            <div style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Merchant</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Northline Services</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Amount</span>
                <span style={{ fontWeight: '600', color: '#ef5350' }}>£85.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                <span style={{ fontWeight: '600', color: 'var(--warning)' }}>Under Investigation</span>
              </div>
            </div>
            <div style={{ border: '1px solid var(--divider)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
              <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Automated Actions</h5>
              {['Merchant blocked', 'Dispute case opened (#FR-2839)', 'Account monitoring enhanced', 'AI-to-AI negotiation initiated'].map(a => (
                <div key={a} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  <CheckCircle size={14} color="var(--success)" /> {a}
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '10px', padding: '11px 13px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7c3aed', flexShrink: 0, animation: 'pulse 1.5s infinite' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#7c3aed' }}>AI resolution in progress</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#9c6fef', lineHeight: 1.5 }}>
                Contacting Northline merchant system · Presenting dispute evidence · Negotiating refund
              </div>
            </div>
            <button onClick={() => processInput('Chat with fraud specialist.')} style={{ width: '100%', padding: '12px', background: 'var(--brand-blue)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Chat with specialist to confirm <ChevronRight size={16} />
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--success)' }}>
              <CheckCircle size={22} />
              <span style={{ fontWeight: '600', fontSize: '1.05rem' }}>Dispute Opened</span>
            </div>
            <div style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Merchant</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Northline Services</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Amount</span>
                <span style={{ fontWeight: '600', color: '#ef5350' }}>£85.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                <span style={{ fontWeight: '600', color: 'var(--warning)' }}>Under Investigation</span>
              </div>
            </div>
            <div style={{ border: '1px solid var(--divider)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
              <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Actions Taken</h5>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                <CheckCircle size={14} color="var(--success)" /> Merchant payments blocked
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                <CheckCircle size={14} color="var(--success)" /> Dispute case opened (#FR-2839)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#f59e0b' }}>
                <AlertTriangle size={14} color="#f59e0b" /> Manual review required
              </div>
            </div>
            <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '10px 13px', marginBottom: '1rem', fontSize: '0.78rem', color: '#92400e', lineHeight: 1.5 }}>
              Please have your case reference ready when speaking with our team: <strong>#FR-2839</strong>
            </div>
            <button onClick={() => processInput('Chat with fraud specialist.')} style={{ width: '100%', padding: '12px', background: 'var(--brand-blue)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Connect to fraud advisor <ChevronRight size={16} />
            </button>
          </div>
        );

        addMessage('assistant',
          futureMode
            ? `Understood. Merchant blocked and dispute opened — I've also initiated AI-to-AI negotiation with Northline's merchant system. This typically resolves in under 2 minutes without any further action from you.`
            : `Understood. I've blocked payments to this merchant and opened a formal dispute (Ref: #FR-2839). A member of our fraud team will need to review the details with you.`,
          card);
        break;
      }

      case 'escalate_to_human': {
        if (is2030) {
          const trace = {
            confidence: 100,
            reasoning: [
              `Connecting to Sarah (Fraud Specialist)`,
              `Full context package: dispute #FR-2839 + AI negotiation status + provisional refund`,
              `Transaction history (24mo), account context, device ID — all pre-loaded`,
              `Fraud risk score: 12 (Low) · AI thread maintained throughout`,
              `Sarah has everything — no re-capture needed`,
            ],
            outcome: { ok: true, verdict: '2030 Rich Handoff', impact: 'Sarah has full context + provisional refund confirmation ready.' }
          };
          setCurrentTrace(trace);
          const contextCard = (
            <div style={{ padding: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', color: '#6366F1' }}>
                <CheckCircle size={20} weight="bold" />
                <span style={{ fontWeight: '600', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Unified handoff</span>
              </div>
              <TrustTimeline steps={[
                { label: 'Context transferred to Sarah', detail: 'No re-capture needed — she has everything' },
              ]} />
              <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '500', marginTop: '1.25rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live Connection</div>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '1.1rem', flexShrink: 0, boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)' }}>S</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '6px', fontWeight: '600' }}>Sarah · Fraud Specialist</div>
                  <div style={{ background: '#F8FAFC', border: '1px solid rgba(0,0,0,0.03)', borderRadius: '0 16px 16px 16px', padding: '14px', fontSize: '0.92rem', color: '#1E293B', lineHeight: 1.5 }}>
                    Hi Joe — I can see everything. The AI has already negotiated a provisional refund from Northline and your account is fully protected. Just say the word and I'll confirm the refund now. No forms, no hold music.
                  </div>
                </div>
              </div>
            </div>
          );
          addMessage('assistant',
            `Connecting you to Sarah now — she already has your full case, the dispute evidence, AI negotiation status, and a provisional refund is agreed. She just needs your word to finalise it.`,
            contextCard
          );
          setTimeout(() => {
            const humanCard = (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#4C1D95', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', flexShrink: 0 }}>S</div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>Sarah · Fraud Specialist</div>
                  <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '4px 16px 16px 16px', border: '1px solid #E2E8F0', color: '#1E293B', fontSize: '0.9rem', lineHeight: 1.55 }}>
                    Hi Joe — I can see everything. The AI has already negotiated a provisional refund from Northline and your account is fully protected. Just say the word and I'll confirm the refund now. No forms, no hold music, no re-explaining anything.
                  </div>
                </div>
              </div>
            );
            setMessages(prev => [...prev, { id: Date.now(), role: 'system_human', card: humanCard }]);
          }, 1800);
          break;
        }

        const trace = {
          confidence: 100,
          reasoning: futureMode ? [
            `User requested: "${originalText}"`,
            `Resolved intent: escalate_to_human`,
            `Compiling rich context package for Sarah (Fraud Specialist)...`,
            `Included: Dispute #FR-2839 (Northline, £85) + full evidence package`,
            `Included: Full transaction history, account context, device ID`,
            `Included: Fraud Risk Score (12 — Low), Merchant risk profile`,
            `Included: AI resolution status — provisional refund agreed`,
            `Routing to Sarah — context pre-loaded, no re-capture needed`
          ] : [
            `User requested: "${originalText}"`,
            `Resolved intent: escalate_to_human`,
            `Routing to available fraud specialist...`,
            `Passed: Case reference #FR-2839`,
            `Note: Transaction details, account history not pre-populated`,
            `Advisor will need to capture details from customer`
          ],
          policy: { rule: 'Human escalation requested', action: futureMode ? 'Full context package transferred to specialist' : 'Case reference passed — advisor to gather details', fraudRisk: 'Monitoring', deviceTrust: 'High', velocityCheck: 'Pass', actionColor: 'success' },
          modelRouting: futureMode ? MODEL_ROUTING.escalate_human : undefined,
          outcome: {
            ok: true, verdict: futureMode ? 'Rich Context Handoff' : 'Advisor Connected',
            impact: futureMode ? 'Sarah has full case context + AI resolution status. No re-capture needed.' : 'Connected to Sarah. Advisor will need to ask clarifying questions.',
            futureNote: futureMode ? 'The AI maintains the full conversation thread, dispute metadata, AI negotiation status, and risk profile as a structured co-pilot brief — Sarah has everything before she says hello. You never repeat yourself.' : ''
          }
        };
        setCurrentTrace(trace);

        const contextCard = futureMode ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--brand-cyan)' }}>
              <Sparkles size={18} />
              <span style={{ fontWeight: '700', fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Context Transferred</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: '700', background: 'linear-gradient(90deg, #7c3aed, #00AEEF)', color: 'white', padding: '2px 8px', borderRadius: '100px' }}>2028</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              {['Dispute: Northline £85', 'Full Account Context', 'Transaction History', 'Fraud Score: 12 (Low)', 'Merchant Risk Profile', 'AI Status: Refund agreed'].map(item => (
                <div key={item} style={{ background: 'var(--bg-primary)', padding: '9px 10px', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)', marginRight: '4px' }}>✓</span> {item}
                </div>
              ))}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Sarah has everything — no questions needed.</div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: '700', fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>Connecting to Advisor</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '9px 10px', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--success)', marginRight: '4px' }}>✓</span> Case Reference
              </div>
              <div style={{ background: 'rgba(245,158,11,0.06)', padding: '9px 10px', borderRadius: '8px', fontSize: '0.75rem', color: '#92400e' }}>
                <span style={{ color: '#f59e0b', marginRight: '4px' }}>!</span> Transaction Details
              </div>
              <div style={{ background: 'rgba(245,158,11,0.06)', padding: '9px 10px', borderRadius: '8px', fontSize: '0.75rem', color: '#92400e' }}>
                <span style={{ color: '#f59e0b', marginRight: '4px' }}>!</span> Account History
              </div>
              <div style={{ background: 'rgba(245,158,11,0.06)', padding: '9px 10px', borderRadius: '8px', fontSize: '0.75rem', color: '#92400e' }}>
                <span style={{ color: '#f59e0b', marginRight: '4px' }}>!</span> Merchant Profile
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              The advisor will need to ask you some questions to gather the missing details.
            </div>
          </div>
        );

        addMessage('assistant',
          futureMode
            ? `Connecting you to Sarah now — she already has your full case, the dispute evidence, and the AI has secured a provisional refund. She just needs your confirmation to finalise it.`
            : `Connecting you to a fraud advisor now. Please have your case reference ready: #FR-2839.`,
          contextCard);

        setTimeout(() => {
          const humanCard = (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ff7c00', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', flexShrink: 0 }}>S</div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Sarah • Fraud Specialist</div>
                <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: '4px 16px 16px 16px', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)', color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.55 }}>
                  {futureMode
                    ? `Hi Joe, the AI has already done the heavy lifting — I can see the £85 Northline dispute and a provisional refund has been agreed. Just say the word and I'll finalise it right now. No forms, no hold music.`
                    : `Hi Joe, I've been passed your case reference #FR-2839. To investigate this charge, I'll need to ask you a few questions — could you confirm the merchant name, the transaction date, and the exact amount you're disputing?`}
                </div>
              </div>
            </div>
          );
          setMessages(prev => [...prev, { id: Date.now(), role: 'system_human', card: humanCard }]);
        }, 1800);

        break;
      }

      default:
        addMessage('assistant', "I'm able to help with balances, transfers, spending analysis and affordability checks.");
    }
  };

  const handleProactiveAccept = () => {
    const idleBalance = profile.accounts.current - 800;
    const moveAmount = Math.round(idleBalance * 0.6);
    setShowProactive(false);
    addMessage('user', `Move £${moveAmount.toLocaleString()} to savings.`);
    setIsTyping(true);
    setTimeout(() => {
      executeTransfer('current', 'savings', moveAmount);
      const savRate = profile.savings_account?.rate || 4.75;
      addMessage('assistant', `Done! I've moved £${moveAmount.toLocaleString()} to your Everyday Saver. At ${savRate}% AER, that's an extra £${Math.round(moveAmount * savRate / 100).toLocaleString()} per year in interest.`);
      setIsTyping(false);
    }, 1200);
  };

  // ── 2030: Siri-style ambient view ──────────────────────────────────────
  if (is2030) {
    const lastUserMsg  = [...messages].reverse().find(m => m.role === 'user');
    const lastAiMsg    = [...messages].reverse().find(m => m.role === 'assistant');
    const lastCard     = [...messages].reverse().find(m => m.card)?.card;
    const currentQuery = input.trim() || lastUserMsg?.text || null;
    const isActive     = isTyping || messages.length > 0 || !!input.trim();
    const inConversation = messages.length > 0 || !!input.trim();

    const WAVE_BARS = [
      { color: '#34d399', delay: 0,    lo: 6,  hi: 30 },
      { color: '#22d3ee', delay: 0.12, lo: 10, hi: 42 },
      { color: '#818cf8', delay: 0.22, lo: 18, hi: 52 },
      { color: '#a78bfa', delay: 0.06, lo: 24, hi: 48 },
      { color: '#c084fc', delay: 0.16, lo: 16, hi: 44 },
      { color: '#f472b6', delay: 0.26, lo: 10, hi: 36 },
      { color: '#fb7185', delay: 0.09, lo: 6,  hi: 28 },
    ];

    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: 'var(--a2030-bg)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Ambient orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '5%', left: '-5%', width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: '15%', right: '-15%', width: '380px', height: '380px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        </div>

        {/* ── IDLE STATE ── */}
        <AnimatePresence>
          {!inConversation && !showProactive && (
            <motion.div key="idle"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                padding: '0 1.25rem', gap: '14px', position: 'relative', zIndex: 1 }}
            >
              <div style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--a2030-text)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                Good morning, Joe.
                <br />
                <span style={{ opacity: 0.4, fontSize: '1.4rem', fontWeight: '400', letterSpacing: '-0.01em' }}>Your financial orchestrator is active.</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { icon: '💰', text: '£1,840 available safely',      bg: 'rgba(16,185,129,0.11)', border: 'rgba(16,185,129,0.2)',   color: '#6ee7b7' },
                  { icon: '⚡', text: '3 active automations running',  bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.2)',   color: '#a5b4fc' },
                  { icon: '🔍', text: 'Northline Services flagged',    bg: 'rgba(239,68,68,0.09)', border: 'rgba(239,68,68,0.18)',   color: '#fca5a5' },
                ].map((b, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.09 }}
                    style={{ background: b.bg, border: `1px solid ${b.border}`, borderRadius: '12px',
                      padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}
                  >
                    <span style={{ fontSize: '1rem' }}>{b.icon}</span>
                    <span style={{ fontSize: '0.82rem', color: b.color, fontWeight: '500' }}>{b.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PROACTIVE NOTIFICATION ── */}
        <AnimatePresence>
          {showProactive && (
            <motion.div key="proactive"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem 0', position: 'relative', zIndex: 1, scrollbarWidth: 'none' }}
            >
              <ProactiveNotification
                profile={profile}
                onAccept={handleProactiveAccept}
                onDismiss={() => setShowProactive(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CONVERSATION STATE ── */}
        {inConversation && !showProactive && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}>

            {/* PINNED HEADER — query + AI response text, always visible */}
            <div style={{ padding: '2rem 1.75rem 1rem', flexShrink: 0 }}>
              {/* Current query — live input or last user message */}
              <AnimatePresence mode="wait">
                {currentQuery && (
                  <motion.div key={currentQuery}
                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    style={{
                      fontSize: '0.95rem', color: 'var(--a2030-subtext)',
                      fontWeight: '500', marginBottom: '1.5rem', lineHeight: 1.4,
                      display: 'flex', alignItems: 'flex-start', gap: '10px',
                      opacity: 0.6
                    }}
                  >
                    <span style={{ color: 'var(--a2030-accent)', fontWeight: '700', fontSize: '1.1rem', marginTop: '-2px' }}>›</span>
                    {currentQuery}
                  </motion.div>
                )}
              </AnimatePresence>

            {/* AI response text */}
            <AnimatePresence mode="wait">
              {lastAiMsg && (
                <motion.div key={lastAiMsg.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="ambient-ai-text"
                  style={{ fontSize: '1.45rem', fontWeight: '500', marginBottom: '32px' }}
                >
                  {lastAiMsg.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Thinking dots */}
            {isTyping && !lastCard && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ display: 'flex', gap: '5px', alignItems: 'center', marginBottom: '16px' }}
              >
                {[0, 1, 2].map(i => (
                  <motion.div key={i}
                    style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(0,0,0,0.1)' }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                  />
                ))}
              </motion.div>
            )}
            </div>

            {/* SCROLLABLE CARD AREA */}
            {lastCard ? (
              <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 1.25rem 1rem' }}>
                <AnimatePresence mode="wait">
                  <motion.div key={messages.length}
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.65)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      borderRadius: '24px',
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
                      border: '1px solid var(--a2030-border)',
                    }}>
                    {lastCard}
                  </motion.div>
                </AnimatePresence>

                {/* Execution chain — always shown after any completed action */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  style={{ marginTop: '12px', padding: '10px 14px',
                    background: 'rgba(0,0,0,0.04)',
                    borderRadius: '14px', border: '1px solid rgba(0,0,0,0.07)' }}
                >
                  <div style={{ fontSize: '0.58rem', fontWeight: '700', color: '#9CA3AF',
                    textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '7px' }}>
                    What just happened
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0', flexWrap: 'wrap' }}>
                    {[
                      { label: 'AI decision', dot: '#6366F1' },
                      { label: 'Your approval', dot: '#8B5CF6' },
                      { label: 'Barclays executed', dot: '#0369A1' },
                      { label: 'Visa network', dot: '#0891B2' },
                      { label: 'Fraud monitoring', dot: '#059669' },
                    ].map((step, i, arr) => (
                      <React.Fragment key={i}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: step.dot, flexShrink: 0 }} />
                          <span style={{ fontSize: '0.67rem', color: '#374151', fontWeight: '500' }}>{step.label}</span>
                        </div>
                        {i < arr.length - 1 && (
                          <span style={{ color: '#D1D5DB', fontSize: '0.7rem', margin: '0 4px' }}>→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </motion.div>

                <div ref={endOfMessagesRef} />
              </div>
            ) : (
              <div style={{ flex: 1 }} ref={endOfMessagesRef} />
            )}
          </div>
        )}

        {/* ── WAVEFORM + INPUT (fixed bottom) ── */}
        <div style={{ padding: '2px 1.25rem 0.875rem', position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>

          {/* Siri waveform */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '42px', gap: '3.5px' }}>
            {WAVE_BARS.map((bar, i) => (
              <motion.div key={i}
                style={{ width: '4px', borderRadius: '4px', background: bar.color }}
                animate={isActive
                  ? { height: [bar.lo, bar.hi, bar.lo], opacity: [0.6, 1, 0.6] }
                  : { height: bar.lo, opacity: 0.22 }
                }
                transition={isActive
                  ? { repeat: Infinity, duration: 1.0, delay: bar.delay, ease: 'easeInOut' }
                  : { duration: 0.6 }
                }
              />
            ))}
          </div>

          {/* Input */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'white',
            border: '1px solid var(--a2030-border)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            borderRadius: '22px', padding: '10px 14px',
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && processInput()}
              placeholder="Ask your financial AI…"
              style={{ flex: 1, border: 'none', background: 'transparent',
                fontSize: '0.92rem', color: 'var(--a2030-text)', outline: 'none' }}
            />
            <button
              onClick={() => processInput()}
              style={{
                width: '34px', height: '34px', borderRadius: '50%', border: 'none', flexShrink: 0,
                background: input.trim()
                  ? 'linear-gradient(135deg, #6366F1, #A855F7)'
                  : 'rgba(0,0,0,0.05)',
                cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.3s',
              }}
            >
              <Send size={14} color={input.trim() ? 'white' : '#94A3B8'} />
            </button>
          </div>
        </div>
      </div>
    );
  }
  // ── end 2030 view ────────────────────────────────────────────────────

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'hidden', position: 'relative' }}>

      {/* AI Reasoning Drawer — single mode only (hidden in comparison) */}
      {!side && <ReasoningDrawer trace={currentTrace} futureMode={futureMode} />}

      {/* Chat feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1rem 1rem', background: 'var(--bg-primary)' }}>
        <AnimatePresence>
          {showProactive && (
            <ProactiveNotification
              profile={profile}
              onAccept={handleProactiveAccept}
              onDismiss={() => setShowProactive(false)}
            />
          )}
        </AnimatePresence>

        {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}

        {isTyping && (
          <div className="chat-bubble assistant" style={{ display: 'inline-flex', gap: '4px', padding: '14px 18px' }}>
            {[0, 1, 2].map(i => (
              <motion.div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#aaa' }}
                animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
            ))}
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input bar */}
      <div style={{
        padding: '0.75rem 1rem 1rem',
        borderTop: '1px solid var(--divider)',
        background: 'var(--bg-secondary)',
      }}>
        <AnimatePresence>
          {showFutureBanner && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 6 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.4 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                fontSize: '0.7rem', fontWeight: '600', textAlign: 'center',
                letterSpacing: '0.03em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                color: '#7c3aed',
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#7c3aed', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                On-device SLM · Cloud reasoning · Continuous biometric session · Zero friction
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="chat-input-wrap">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && processInput()}
            placeholder="Ask your assistant…"
            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '0.95rem', color: 'var(--text-primary)', outline: 'none' }}
          />
          <button
            onClick={() => processInput()}
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: input.trim() ? 'var(--brand-blue)' : '#ddd',
              border: 'none', cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s',
            }}
          >
            <Send size={16} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
};
