import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

const SCENES = [
  {
    phase: 0,
    scene: null,
    heading: 'Today vs 2028',
    subheading: null,
    intro: "Start the demo to see how the same intent — expressed in natural language — plays out across today's AI experience and a 2028 vision where friction has been engineered away.",
    today: null,
    future: null,
    insight: null,
  },
  {
    phase: 1,
    scene: 'Financial Awareness',
    heading: 'Reactive → Proactive',
    subheading: '"How much can I spend this month?"',
    today: {
      points: [
        'Query triggered by user on demand',
        'Discretionary income calculated at point of ask',
        'Current account and savings only',
        'Snapshot view, no predictive context',
      ],
    },
    future: {
      points: [
        'AI surfaces the insight before you ask',
        'Continuous cashflow monitoring already active',
        'All linked accounts included automatically',
        'Predictive view with upcoming bills modelled',
      ],
    },
    insight: 'The shift from reactive to proactive is the single biggest unlock in AI-native banking — it changes the relationship from tool to advisor.',
  },
  {
    phase: 2,
    scene: 'Spending Insight',
    heading: 'Historical → Live',
    subheading: '"Where does my money go each month?"',
    today: {
      points: [
        'Category breakdown generated on request',
        'Historical data, previous month focus',
        'Pattern analysis is retrospective',
        'User must initiate the conversation',
      ],
    },
    future: {
      points: [
        'Continuous monitoring already running',
        'Live picture, updated in real-time',
        'Anomalies detected as they happen',
        'Trends flagged before they become problems',
      ],
    },
    insight: 'Real-time awareness transforms spending insight from a report into a compass — always pointing at what matters now.',
  },
  {
    phase: 3,
    scene: 'Affordability Reasoning',
    heading: 'Calculation → Reasoning',
    subheading: '"Can I afford a £900 holiday?"',
    today: {
      points: [
        'Available balance minus safety buffer',
        'Binary yes / no with budget impact shown',
        'Savings goal delay surfaced as a consequence',
        'Straightforward financial maths',
      ],
    },
    future: {
      points: [
        'Multi-dimensional affordability score',
        'Lifestyle context and seasonality factored in',
        'Personalised goal-timeline modelling',
        'Confidence level, not just a binary answer',
      ],
    },
    insight: 'Moving from calculation to reasoning means the AI understands trade-offs — not just whether you can afford it, but whether you should.',
  },
  {
    phase: 4,
    scene: 'Safe Transfer',
    heading: 'Manual Selection → Smart Routing',
    subheading: '"Move £600 from savings to current"',
    today: {
      points: [
        'Two savings accounts detected — user must choose',
        'Barclays Everyday Saver (4.75% AER) shown alongside NatWest ISA (3.2%)',
        'No yield reasoning — user picks manually',
        'Policy confirmation required for transfers over £500',
      ],
    },
    future: {
      points: [
        'AI evaluates all accounts by yield automatically',
        'NatWest ISA (3.2% AER) selected as source',
        'Barclays savings (4.75% AER) fully preserved',
        'Continuous biometric auth: instant execution, no tap',
      ],
    },
    insight: "Every transfer is an optimisation opportunity. In 2028 the AI picks the lowest-yield source — your money always works as hard as possible, silently.",
  },
  {
    phase: 5,
    scene: 'Behavioural Intelligence',
    heading: 'Threshold-Triggered → Always-On',
    subheading: 'Proactive spending insight',
    today: {
      points: [
        'Insight card triggered when threshold is crossed',
        'Surfaced after pattern becomes notable',
        'User sees trend in retrospect',
        'Manual limit-setting required to act',
      ],
    },
    future: {
      points: [
        'Always-on behavioural monitoring active',
        'Patterns caught in real-time as they form',
        'Nudge delivered at moment of maximum impact',
        'Automated adjustment available with one tap',
      ],
    },
    insight: 'Catching a habit as it forms is exponentially more effective than reporting it after the damage is done.',
  },
  {
    phase: 6,
    scene: 'Intelligent Support',
    heading: 'Manual Capture → Rich Handoff',
    subheading: 'Unknown charge on account',
    today: {
      points: [
        'Dispute opened — only case reference passed to advisor',
        'Transaction details, account history not pre-loaded',
        'Sarah must ask clarifying questions to proceed',
        'Customer repeats information already shared with AI',
      ],
    },
    future: {
      points: [
        'AI initiates negotiation with merchant system directly',
        'Full context package: dispute, history, risk score, evidence',
        'AI secures provisional refund before Sarah joins',
        'Sarah has everything — confirms with one message, no re-capture',
      ],
    },
    insight: "Context continuity is the hidden cost of today's support. In 2028, the AI carries the full thread — the human expert just makes the final call.",
  },
];

export function ComparisonAdvisor({ phase }) {
  const idx = Math.min(Math.max(phase, 0), SCENES.length - 1);
  const data = SCENES[idx];

  return (
    <div style={{
      width: '264px',
      flexShrink: 0,
      height: `calc(844px * var(--phone-zoom, 1))`,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
      scrollbarWidth: 'none',
    }}>
      {/* Advisor label */}
      <div style={{
        textAlign: 'center',
        padding: '0 0 10px',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.18em',
          color: '#333', textTransform: 'uppercase',
        }}>
          Strategy Advisor
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={data.phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}
        >
          {/* Scene heading card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '14px 16px',
            textAlign: 'center',
          }}>
            {data.scene && (
              <div style={{
                fontSize: '0.58rem', fontWeight: '700', letterSpacing: '0.14em',
                color: '#00AEEF', textTransform: 'uppercase', marginBottom: '5px',
              }}>
                {data.scene}
              </div>
            )}
            <div style={{
              fontSize: '0.88rem', fontWeight: '700', color: 'white',
              lineHeight: 1.25, marginBottom: data.subheading ? '5px' : 0,
            }}>
              {data.heading}
            </div>
            {data.subheading && (
              <div style={{ fontSize: '0.68rem', color: '#555', fontStyle: 'italic' }}>
                {data.subheading}
              </div>
            )}
          </div>

          {/* Intro text (idle state) */}
          {data.intro && (
            <div style={{
              fontSize: '0.74rem', color: '#555', lineHeight: 1.65,
              padding: '4px 6px', textAlign: 'center',
            }}>
              {data.intro}
            </div>
          )}

          {/* Today vs Future comparison */}
          {data.today && data.future && (
            <>
              {/* Today */}
              <div style={{
                background: 'rgba(0,57,93,0.2)',
                border: '1px solid rgba(0,174,239,0.2)',
                borderRadius: '10px',
                padding: '11px 13px',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px',
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00AEEF', flexShrink: 0 }} />
                  <span style={{
                    fontSize: '0.62rem', fontWeight: '800', letterSpacing: '0.14em',
                    color: '#00AEEF', textTransform: 'uppercase',
                  }}>
                    Today
                  </span>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {data.today.points.map((pt, i) => (
                    <li key={i} style={{
                      fontSize: '0.69rem', color: '#7a9db5',
                      display: 'flex', gap: '6px', alignItems: 'flex-start', lineHeight: 1.4,
                    }}>
                      <span style={{ color: '#00395D', flexShrink: 0, marginTop: '1px', fontWeight: '700' }}>›</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Delta divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.3))' }} />
                <span style={{
                  fontSize: '0.55rem', fontWeight: '700', letterSpacing: '0.12em',
                  color: '#4a2080', textTransform: 'uppercase', flexShrink: 0,
                }}>
                  Intelligence Delta
                </span>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(124,58,237,0.3), transparent)' }} />
              </div>

              {/* 2028 */}
              <div style={{
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.28)',
                borderRadius: '10px',
                padding: '11px 13px',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px',
                }}>
                  <Zap size={10} fill="#a78bfa" stroke="none" style={{ flexShrink: 0 }} />
                  <span style={{
                    fontSize: '0.62rem', fontWeight: '800', letterSpacing: '0.14em',
                    color: '#a78bfa', textTransform: 'uppercase',
                  }}>
                    2028
                  </span>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {data.future.points.map((pt, i) => (
                    <li key={i} style={{
                      fontSize: '0.69rem', color: '#b8a4e8',
                      display: 'flex', gap: '6px', alignItems: 'flex-start', lineHeight: 1.4,
                    }}>
                      <span style={{ color: '#7c3aed', flexShrink: 0, marginTop: '1px', fontWeight: '700' }}>›</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key insight */}
              {data.insight && (
                <div style={{
                  background: 'rgba(245,158,11,0.06)',
                  border: '1px solid rgba(245,158,11,0.18)',
                  borderRadius: '10px',
                  padding: '11px 13px',
                }}>
                  <div style={{
                    fontSize: '0.58rem', fontWeight: '700', letterSpacing: '0.12em',
                    color: '#f59e0b', textTransform: 'uppercase', marginBottom: '6px',
                  }}>
                    Key Insight
                  </div>
                  <p style={{ margin: 0, fontSize: '0.69rem', color: '#8a7040', lineHeight: 1.6 }}>
                    {data.insight}
                  </p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
