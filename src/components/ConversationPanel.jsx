import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, AlertTriangle, ChevronRight, Sparkles, X } from 'lucide-react';
import { useBanking } from '../context/BankingContext';
import { detectIntent } from '../services/intentEngine';
import { ReasoningDrawer } from './ReasoningDrawer';

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
export const ConversationPanel = ({ futureMode, startEventName = 'START_AUTOPILOT_DEMO' }) => {
  const { profile, transferMoney, executeTransfer } = useBanking();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showProactive, setShowProactive] = useState(false);
  const [currentTrace, setCurrentTrace] = useState(null);

  const futureModeRef = useRef(futureMode);
  const awaitingAccountSelectRef = useRef(null); // {complete: fn} — set when disambiguation card awaits a response
  const [showFutureBanner, setShowFutureBanner] = useState(false);
  useEffect(() => {
    futureModeRef.current = futureMode;
    if (futureMode) {
      setShowFutureBanner(true);
      const t = setTimeout(() => setShowFutureBanner(false), 4000);
      return () => clearTimeout(t);
    } else {
      setShowFutureBanner(false);
    }
  }, [futureMode]);

  const makeInitialMsg = () => ({
    id: 1, role: 'assistant',
    text: futureModeRef.current
      ? "Good morning James. You have £8,240 across your Barclays and NatWest accounts, with £160 discretionary this month after bills and savings. I'm already tracking a restaurant spend spike — you're 47% above your 3-month average. Where would you like to start?"
      : "Hello! I can help you check your balances, make transfers, or analyze if you can afford that new purchase. What's on your mind?"
  });

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
      { label: 'Scene 1 of 6 — Financial Awareness', queries: ['How much money can I spend this month?'], readTime: 18000 },
      { label: 'Scene 2 of 6 — Spending Insight', queries: ['Where does my money go each month?'], readTime: 18000 },
      { label: 'Scene 3 of 6 — Affordability Reasoning', queries: ['Can I afford a £900 holiday?'], readTime: 18000 },
      { label: 'Scene 4 of 6 — Safe Transfer', queries: ['Move £600 from savings to current.'], readTime: 20000, readTimeToday: 10000, accountSelect: true },
      { label: 'Scene 5 of 6 — Behavioural Intelligence', queries: null, readTime: 16000, proactive: true },
      { label: 'Scene 6 of 6 — Intelligent Support', queries: ['What is this £85 charge from Northline Services?'], readTime: 24000, multiStep: true },
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
      let siriHandoff = e?.detail?.pendingQuery || null; // consumed once for seamless 2028 handoff

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
        if (futureModeRef.current) {
          // Future mode: text appears pre-populated instantly (local AI handed it off)
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
                resetChat();
                dispatch(scene.label, { phase: i + 1, total: SCENES.length });
                await wait(700);
                setMessages([makeInitialMsg(), { id: Date.now(), role: 'assistant', text: null, card: sceneCard(scene) }]);
                await wait(1800);

                if (scene.proactive) {
                  const is2028 = futureModeRef.current;
                  const insightCard = (
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
                        {[{ m: 'Jan', v: 265 }, { m: 'Feb', v: 298 }, { m: 'Mar', v: 420 }].map(({ m, v }) => (
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
                  setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', text: is2028 ? "I've been monitoring your spending patterns continuously. Your restaurant category crossed my anomaly threshold this week — you're 47% above your 3-month baseline and trending higher. I've already drafted a budget adjustment for your review." : "I've noticed your restaurant spending has been trending upward over the past three months. This is the kind of pattern that's easy to miss month-to-month but adds up quickly.", card: insightCard }]);
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
                  if (futureModeRef.current) {
                    // Future mode: AI selects source automatically — single query
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
                    if (siriHandoff) {
                      siriHandoff = null; // consume — Siri already captured this query
                      await wait(500);
                      processInputRef.current(query);
                      await wait(2200);
                    } else {
                      await typeText(query);
                    }
                  }
                }
                
                await wait(!futureModeRef.current && scene.readTimeToday != null ? scene.readTimeToday : scene.readTime);
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
        const isa = futureMode ? profile.linked_accounts?.natwest_isa : null;
        const totalWealth = profile.accounts.current + profile.accounts.savings + (isa?.balance || 0);

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
                    ? `Hi James, the AI has already done the heavy lifting — I can see the £85 Northline dispute and a provisional refund has been agreed. Just say the word and I'll finalise it right now. No forms, no hold music.`
                    : `Hi James, I've been passed your case reference #FR-2839. To investigate this charge, I'll need to ask you a few questions — could you confirm the merchant name, the transaction date, and the exact amount you're disputing?`}
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

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'hidden', position: 'relative' }}>

      {/* AI Reasoning Drawer — anchored left */}
      <ReasoningDrawer trace={currentTrace} futureMode={futureMode} />

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
      <div style={{ padding: '0.75rem 1rem 1rem', borderTop: '1px solid var(--divider)', background: 'var(--bg-secondary)' }}>
        <AnimatePresence>
          {showFutureBanner && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 6 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.4 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ fontSize: '0.7rem', color: '#7c3aed', fontWeight: '600', textAlign: 'center', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
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
            style={{ width: '40px', height: '40px', borderRadius: '50%', background: input.trim() ? 'var(--brand-blue)' : '#ddd', border: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
          >
            <Send size={16} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
};
