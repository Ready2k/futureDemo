import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles } from 'lucide-react';

const SCENES = [
  {
    phase: 0,
    scene: null,
    heading: 'Today · 2028 · 2030',
    subheading: null,
    intro: "Today: banking is something you open.\n2028: banking is something you ask.\n2030: banking is something that happens around you.",
    today: null,
    future: null,
    year2030: null,
    insight: null,
  },
  {
    phase: 1,
    scene: 'Financial Awareness',
    heading: 'Reactive → Proactive → Ambient',
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
    year2030: {
      points: [
        'Cross-provider total surfaced automatically',
        '7-day predictive buffer always visible',
        '3 active automations shown at a glance',
        'Monitoring runs continuously — no query needed',
      ],
    },
    insight: 'Today you open the app. In 2028 you ask. In 2030 the answer is already there — the bank has become ambient infrastructure.',
  },
  {
    phase: 2,
    scene: 'Spending Insight',
    heading: 'Historical → Live → Pre-empted',
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
    year2030: {
      points: [
        'Live cross-provider feed — Barclays + NatWest',
        'Anomaly detection fires before 80% of limit',
        'Continuous monitoring badge always active',
        'Restaurant spike already flagged before you ask',
      ],
    },
    insight: 'When the AI knows before you do, banking shifts from self-service to financial co-pilot.',
  },
  {
    phase: 3,
    scene: 'Affordability Reasoning',
    heading: 'Calculation → Reasoning → Orchestration',
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
    year2030: {
      points: [
        '92% confidence across 14 financial signals',
        'Funding route recommended automatically',
        'Emergency buffer and savings goal both preserved',
        'Single-tap approval — AI proposes the full plan',
      ],
    },
    insight: 'In 2030 the AI doesn\'t just answer — it proposes a plan, checks your goals, and executes the optimal path. Banking happens around you.',
  },
  {
    phase: 4,
    scene: 'Safe Transfer',
    heading: 'Manual → Smart Routing → Delegated',
    subheading: '"Move £600 from savings to current"',
    today: {
      points: [
        'Two savings accounts — user must choose',
        'No yield reasoning — user picks manually',
        'Policy confirmation required above £500',
        'Three steps: select, enter amount, approve',
      ],
    },
    future: {
      points: [
        'AI evaluates all accounts by yield automatically',
        'NatWest ISA (3.2%) used to preserve Barclays (4.75%)',
        'Continuous biometric auth — instant execution',
        'No user steps beyond the initial request',
      ],
    },
    year2030: {
      points: [
        'Executed within pre-authorised delegated limits',
        'No disambiguation, no confirmation required',
        'Trust chain: AI → consent → Barclays → Visa',
        'Full audit trail visible on demand',
      ],
    },
    insight: 'Delegation is the next frontier — the AI acts within guardrails the user has set, with a verifiable audit trail.',
  },
  {
    phase: 5,
    scene: 'Behavioural Intelligence',
    heading: 'Threshold-Triggered → Always-On → Pre-empted',
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
    year2030: {
      points: [
        'AI detected anomaly and pre-drafted adjustment',
        'Alert fires before 80% of any limit is hit',
        'Automation already watching the category',
        'No user initiation — protection is ambient',
      ],
    },
    insight: 'Ambient protection doesn\'t ask for permission first — it acts within pre-set guardrails and reports back.',
  },
  {
    phase: 6,
    scene: 'Intelligent Support',
    heading: 'Manual Capture → Rich Handoff → AI-Resolved',
    subheading: 'Unknown charge on account',
    today: {
      points: [
        'Dispute opened — only case reference passed',
        'Transaction history not pre-loaded for advisor',
        'Sarah must ask clarifying questions',
        'Customer repeats information shared with AI',
      ],
    },
    future: {
      points: [
        'Full context package transferred to Sarah',
        'AI secures provisional refund before she joins',
        'No re-capture — Sarah confirms with one message',
        'AI thread maintained throughout the session',
      ],
    },
    year2030: {
      points: [
        'AI flagged merchant 3 days before user asked',
        'Payments paused and dispute drafted proactively',
        'AI-to-AI negotiation: refund agreed in <90s',
        'Human specialist joins with zero-recap context',
      ],
    },
    insight: 'In 2030 the bank doesn\'t wait to be asked — it detects, acts, and reports. Support becomes ambient protection that happens around the customer.',
  },
];

// Map mode strings to the data field in each SCENE entry
const MODE_FIELD = { today: 'today', '2028': 'future', '2030': 'year2030' };

// Styling config per mode
const MODE_STYLE = {
  today: {
    dotColor: '#00AEEF',
    labelColor: '#00AEEF',
    label: 'Today',
    bg: 'rgba(0,57,93,0.2)',
    border: 'rgba(0,174,239,0.2)',
    textColor: '#a8c8e0',
    bulletColor: '#00AEEF',
    icon: null,
  },
  '2028': {
    dotColor: '#a78bfa',
    labelColor: '#a78bfa',
    label: '2028',
    bg: 'rgba(124,58,237,0.12)',
    border: 'rgba(124,58,237,0.28)',
    textColor: '#d4c4ff',
    bulletColor: '#a78bfa',
    icon: 'zap',
  },
  '2030': {
    dotColor: '#C4B5FD',
    labelColor: '#C4B5FD',
    label: '2030',
    bg: 'rgba(76,29,149,0.14)',
    border: 'rgba(76,29,149,0.32)',
    textColor: '#DDD6FE',
    bulletColor: '#C4B5FD',
    icon: 'sparkles',
  },
};

function ModeSection({ mode, points }) {
  const s = MODE_STYLE[mode];
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '10px', padding: '11px 13px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        {s.icon === 'zap'      && <Zap size={10} fill={s.dotColor} stroke="none" style={{ flexShrink: 0 }} />}
        {s.icon === 'sparkles' && <Sparkles size={10} color={s.dotColor} style={{ flexShrink: 0 }} />}
        {!s.icon               && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.dotColor, flexShrink: 0 }} />}
        <span style={{ fontSize: '0.62rem', fontWeight: '800', letterSpacing: '0.14em', color: s.labelColor, textTransform: 'uppercase' }}>{s.label}</span>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {points.map((pt, i) => (
          <li key={i} style={{ fontSize: '0.69rem', color: s.textColor, display: 'flex', gap: '6px', alignItems: 'flex-start', lineHeight: 1.4 }}>
            <span style={{ color: s.bulletColor, flexShrink: 0, marginTop: '1px', fontWeight: '700' }}>›</span>
            {pt}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ComparisonAdvisor({ phase, leftMode = 'today', rightMode = '2028' }) {
  const idx = Math.min(Math.max(phase, 0), SCENES.length - 1);
  const data = SCENES[idx];
  const leftPoints  = data[MODE_FIELD[leftMode]];
  const rightPoints = data[MODE_FIELD[rightMode]];

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
      <div style={{ textAlign: 'center', padding: '0 0 10px', flexShrink: 0 }}>
        <span style={{ fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.18em', color: '#666', textTransform: 'uppercase' }}>
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
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px', padding: '14px 16px', textAlign: 'center',
          }}>
            {data.scene && (
              <div style={{ fontSize: '0.58rem', fontWeight: '700', letterSpacing: '0.14em', color: '#00AEEF', textTransform: 'uppercase', marginBottom: '5px' }}>
                {data.scene}
              </div>
            )}
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'white', lineHeight: 1.3, marginBottom: data.subheading ? '5px' : 0 }}>
              {data.heading}
            </div>
            {data.subheading && (
              <div style={{ fontSize: '0.68rem', color: '#888', fontStyle: 'italic' }}>{data.subheading}</div>
            )}
          </div>

          {/* Intro text (idle state) */}
          {data.intro && (
            <div style={{ fontSize: '0.74rem', color: '#999', lineHeight: 1.65, padding: '4px 6px', textAlign: 'center' }}>
              {data.intro}
            </div>
          )}

          {/* Two-era comparison — renders only the modes being compared */}
          {leftPoints && rightPoints && (
            <>
              <ModeSection mode={leftMode} points={leftPoints.points} />

              {/* Delta divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.3))' }} />
                <span style={{ fontSize: '0.55rem', fontWeight: '700', letterSpacing: '0.12em', color: '#7c5cbf', textTransform: 'uppercase', flexShrink: 0 }}>Intelligence Delta</span>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(124,58,237,0.3), transparent)' }} />
              </div>

              <ModeSection mode={rightMode} points={rightPoints.points} />

              {/* Key insight */}
              {data.insight && (
                <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)', borderRadius: '10px', padding: '11px 13px' }}>
                  <div style={{ fontSize: '0.58rem', fontWeight: '700', letterSpacing: '0.12em', color: '#f59e0b', textTransform: 'uppercase', marginBottom: '6px' }}>Key Insight</div>
                  <p style={{ margin: 0, fontSize: '0.69rem', color: '#c9a84c', lineHeight: 1.6 }}>{data.insight}</p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
