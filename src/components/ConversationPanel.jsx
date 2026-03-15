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
        Move <strong>£{Math.round(idleBalance * 0.6).toLocaleString()}</strong> to your Everyday Saver earning <strong>3.8%</strong> AER?
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
export const ConversationPanel = ({ futureMode }) => {
  const { profile, transferMoney, executeTransfer } = useBanking();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showProactive, setShowProactive] = useState(false);
  const [currentTrace, setCurrentTrace] = useState(null);

  const futureModeRef = useRef(futureMode);
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

    // Collapse header on first message
    window.dispatchEvent(new CustomEvent('CHAT_STARTED'));

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
            window.dispatchEvent(new CustomEvent('START_AUTOPILOT_DEMO', { detail: { startIndex: e.detail.index } }));
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
      { label: 'Scene 4 of 6 — Safe Transfer', queries: ['Move £600 from savings to current.'], readTime: 18000 },
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
        for (let j = 0; j <= text.length; j++) { 
           setInput(text.substring(0, j)); 
           await wait(24); 
        }
        await wait(300);
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

    window.addEventListener('START_AUTOPILOT_DEMO', startAutopilot);
    window.addEventListener('RESET_CHAT', handleReset);
    return () => {
      window.removeEventListener('START_AUTOPILOT_DEMO', startAutopilot);
      window.removeEventListener('RESET_CHAT', handleReset);
    };
  }, []);

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
            ? `Computed in real-time across your Barclays and NatWest accounts: you have £${freshDiscretionary.toLocaleString()} available this month — with your NatWest ISA earning 4.5% AER and all committed spend factored in. Here's the full picture:`
            : `Based on your income and outgoings, you have around £${freshDiscretionary.toLocaleString()} available to spend freely this month — after bills and your savings goal are accounted for. Here's the full breakdown:`,
          card
        );
        break;
      }

      case 'transfer_money': {
        const { source_account, destination_account, amount } = intentData;

        // ── 2028 Mode: instant biometric execution ────────────────────────────
        if (futureMode) {
          executeTransfer(source_account, destination_account, amount);
          const trace = {
            confidence: 99,
            reasoning: [
              `User said: "${originalText}"`,
              `Resolved intent: transfer_money (confidence: 99%)`,
              `Parsed: source=${source_account}, dest=${destination_account}, amount=£${amount}`,
              `2028 Mode: continuous biometric session active — no friction required`,
              `Behavioural trust score: 98/100 (recognised device, normal velocity, known payee)`,
              `Policy result: INSTANT EXECUTION — biometric consent confirmed`
            ],
            policy: { amount, rule: 'Continuous biometric auth — friction waived', fraudRisk: 'Low', deviceTrust: 'Verified (Passkey)', velocityCheck: 'Pass', action: 'Executed instantly — no explicit confirmation required', actionColor: 'success' },
            modelRouting: MODEL_ROUTING.transfer_2028,
            outcome: { ok: true, verdict: 'Instant Transfer Executed', impact: `£${amount} moved without friction via persistent biometric identity.`, futureNote: '' }
          };
          setCurrentTrace(trace);
          const card = (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--success)' }}>
                <CheckCircle size={22} />
                <span style={{ fontWeight: '600', fontSize: '1.05rem' }}>Instant Transfer</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: '700', background: 'linear-gradient(90deg, #7c3aed, #00AEEF)', color: 'white', padding: '2px 8px', borderRadius: '100px' }}>2028</span>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1rem' }}>
                <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>From</span>
                  <span style={{ textTransform: 'capitalize', fontWeight: '600', color: 'var(--brand-blue)' }}>{source_account}</span>
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
          addMessage('assistant', `Done. £${amount} moved from ${source_account} to ${destination_account} — authorised instantly via your biometric session.`, card);
          break;
        }

        // ── Today Mode: policy engine with confirmation step ──────────────────
        const policyResult = transferMoney(source_account, destination_account, amount);
        const trace = {
          confidence: 96,
          reasoning: [
            `User said: "${originalText}"`,
            `Resolved intent: transfer_money (confidence: 96%)`,
            `Parsed: source=${source_account}, dest=${destination_account}, amount=£${amount}`,
            `Fraud scoring: Low (no velocity anomaly, trusted device)`,
            `Policy evaluation: amount=${amount} vs threshold=500`,
            policyResult.status === 'approved'
              ? 'Policy result: APPROVED — executing immediately'
              : 'Policy result: CONFIRMATION REQUIRED — presenting auth card'
          ],
          policy: {
            amount,
            rule: amount > 500 ? 'Transfers > £500 require confirmation' : 'Under threshold, auto-approved',
            fraudRisk: 'Low',
            deviceTrust: 'High',
            velocityCheck: 'Pass',
            action: policyResult.status === 'approved' ? 'Auto-approved by policy engine' : 'User authorisation required',
            actionColor: policyResult.status === 'approved' ? 'success' : 'warning'
          },
          outcome: {
            ok: policyResult.status === 'approved',
            verdict: policyResult.status === 'approved' ? 'Transfer Executed' : 'Authorisation Required',
            impact: policyResult.reason,
            futureNote: 'On-device Face ID combined with behavioural biometrics (typing cadence, device location, velocity pattern) creates a persistent zero-friction session — intent recognised and executed in one step, no confirmation tap required.'
          }
        };
        setCurrentTrace(trace);

        const card = (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: policyResult.status === 'approved' ? 'var(--success)' : 'var(--warning)' }}>
              {policyResult.status === 'approved' ? <CheckCircle size={22} /> : <AlertTriangle size={22} />}
              <span style={{ fontWeight: '600', fontSize: '1.05rem' }}>
                {policyResult.status === 'approved' ? 'Transfer Sent' : policyResult.status === 'confirmation_required' ? 'Authorization Required' : 'Transfer Declined'}
              </span>
            </div>
            <div style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
              <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>From</span>
                <span style={{ textTransform: 'capitalize', fontWeight: '600', color: 'var(--brand-blue)' }}>{source_account}</span>
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
                    executeTransfer(source_account, destination_account, amount);
                    addMessage('user', 'Confirm transfer.');
                    setIsTyping(true);
                    setTimeout(() => { addMessage('assistant', `Confirmed. £${amount} has been securely moved from your ${source_account} to your ${destination_account} account.`); setIsTyping(false); }, 1000);
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
          addMessage('assistant', `All sorted. I've transferred £${amount} from your ${source_account} to your ${destination_account} account.`, card);
        } else if (policyResult.status === 'confirmation_required') {
          addMessage('assistant', `For your security, transfers over £500 require your approval. Please review the details to proceed.`, card);
        } else {
          addMessage('assistant', `I could not complete this transfer.`, card);
        }
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

        const card = (
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
          affordable
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
          reasoning: [
            `User said: "${originalText}"`,
            `Resolved intent: support_dispute (confidence: 99%)`,
            `Context attached: Northline Services, £85.00`,
            `Policy: Unrecognised online charges require immediate merchant block`,
            `Action: Freeze payments, open dispute case`,
            `Generate support handoff package`
          ],
          policy: {
            amount: 85, rule: 'Unrecognised transaction reported', fraudRisk: 'Medium', deviceTrust: 'High', velocityCheck: 'Pass', action: 'Merchant blocked, dispute opened auto-approved', actionColor: 'warning'
          },
          modelRouting: futureMode ? MODEL_ROUTING.support_dispute : undefined,
          outcome: {
            ok: true, verdict: 'Dispute Initiated',
            impact: 'Merchant blocked. Funds frozen pending review.',
            futureNote: 'AI-to-AI resolution: Barclays\' dispute agent initiates a protocol with Northline\'s merchant API, presents the case evidence, and negotiates the refund — typically resolved in under 2 minutes, no human intervention required.'
          }
        };
        setCurrentTrace(trace);

        const card = (
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

            <div style={{ border: '1px solid var(--divider)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
              <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Automated Actions Taken</h5>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                <CheckCircle size={14} color="var(--success)" /> Merchant blocked
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                <CheckCircle size={14} color="var(--success)" /> Dispute case opened (#FR-2839)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                <CheckCircle size={14} color="var(--success)" /> Account monitoring enhanced
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
              <button onClick={() => processInput('Chat with fraud specialist.')} style={{ padding: '12px', background: 'var(--brand-blue)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Chat with a fraud specialist <ChevronRight size={16} />
              </button>
              <button style={{ padding: '12px', background: 'transparent', color: 'var(--brand-blue)', border: '1px solid var(--divider)', borderRadius: '10px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>Call me now</button>
              <button style={{ padding: '12px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>Schedule a call for later</button>
            </div>
          </div>
        );

        addMessage('assistant', `Understood. I've temporarily frozen payments to this merchant to prevent further charges, and I've opened a formal dispute for the £85 transaction.`, card);
        break;
      }

      case 'escalate_to_human': {
        const trace = {
          confidence: 100,
          reasoning: [
            `User requested: "${originalText}"`,
            `Resolved intent: escalate_to_human`,
            `Preparing Context Package for Human agent...`,
            `Included: Active dispute #FR-2839 (Northline Services £85)`,
            `Included: Account context (Balances, Recent Auth IP, Device ID)`,
            `Included: Fraud Risk Score (12 - Low)`,
            `Routing to Available Fraud Specialist`
          ],
          policy: { rule: 'Human escalation requested', action: 'Context transferred to live agent pool', fraudRisk: 'Monitoring', deviceTrust: 'High', velocityCheck: 'Pass', actionColor: 'success' },
          modelRouting: futureMode ? MODEL_ROUTING.escalate_human : undefined,
          outcome: { ok: true, verdict: 'Agent Connect', impact: 'User connected to Sarah (Fraud Team) with full digital context.', futureNote: 'The AI maintains your full conversation thread, dispute metadata, and risk profile as structured context — passed to Sarah as a co-pilot brief. She has everything before saying hello; you never repeat yourself.' }
        };
        setCurrentTrace(trace);

        const contextCard = (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--brand-cyan)' }}>
              <Sparkles size={18} />
              <span style={{ fontWeight: '700', fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Context Transferred</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--success)', marginRight: '4px' }}>✓</span> Dispute Details
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--success)', marginRight: '4px' }}>✓</span> Account Context
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--success)', marginRight: '4px' }}>✓</span> Fraud Risk Score
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--success)', marginRight: '4px' }}>✓</span> Merchant History
              </div>
            </div>
          </div>
        );

        addMessage('assistant', `Transferring you to a specialist now. They already have the details of this £85 charge so you won't need to repeat yourself.`, contextCard);

        // Simulate human joining
        setTimeout(() => {
          const humanCard = (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ff7c00', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>S</div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Sarah • Fraud Specialist</div>
                <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: '4px 16px 16px 16px', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)', color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  Hi James, I can see the £85 Northline Services charge you're disputing. I've already got the transaction details and the action history from the assistant, so we can jump straight in.
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
      addMessage('assistant', `Done! I've moved £${moveAmount.toLocaleString()} to your Everyday Saver. At 3.8% AER, that's an extra £${Math.round(moveAmount * 0.038).toLocaleString()} per year in interest.`);
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
