# Narration Audio Files

Drop pre-recorded MP3 files here to replace the Web Speech API fallback.

The app tries to load `scene{N}.mp3` for each scene. If the file is not found,
it automatically falls back to the browser's Web Speech API.

## File naming

| File | Trigger | Scene |
|------|---------|-------|
| `scene0.mp3` | Start Full Demo clicked | Opening / intro |
| `scene1.mp3` | Scene 1 starts | Financial Awareness |
| `scene2.mp3` | Scene 2 starts | Spending Insight |
| `scene3.mp3` | Scene 3 starts | Affordability Reasoning |
| `scene4.mp3` | Scene 4 starts | Safe Transfer |
| `scene5.mp3` | Scene 5 starts | Behavioural Intelligence |
| `scene6.mp3` | Scene 6 starts | Intelligent Support |

## Scripts (feed these to Polly / Nova Sonic / Gemini TTS)

**Scene 0 — Opening**
> What you are about to see is a banking experience where natural language replaces app navigation entirely. The customer never opens a menu, never taps through screens. They simply ask. And the bank reasons, acts, and responds. Six scenes. Each one shows a different capability. Let us begin.

**Scene 1 — Financial Awareness**
> Scene one — Financial Awareness. The assistant computes exactly how much is safe to spend this month. Live balances, committed bills, and savings goals — all aggregated in under a second. No app switching, no manual maths.

**Scene 2 — Spending Insight**
> Scene two — Spending Insight. One question surfaces twelve months of categorised transactions. Housing, transport, restaurants, subscriptions — patterns that would take an hour to find, answered instantly.

**Scene 3 — Affordability Reasoning**
> Scene three — Affordability Reasoning. The assistant doesn't just check the balance. It models the full impact of a nine hundred pound holiday on cashflow and future savings goals. Reasoning, not just retrieval.

**Scene 4 — Safe Transfer**
> Scene four — Safe Transfer. A transfer request hits the policy engine automatically. Minimum balance rules, confirmation thresholds, and a full audit trail fire without the customer ever knowing they're there.

**Scene 5 — Behavioural Intelligence**
> Scene five — Behavioural Intelligence. The assistant surfaces a restaurant spend anomaly before the customer asks. This is the shift from reactive to proactive — the bank acting as a true financial copilot.

**Scene 6 — Intelligent Support**
> Scene six — Intelligent Support. An unknown charge becomes a dispute, a merchant block, and a rich handoff to a human specialist — orchestrated entirely in one conversation. This is the future of customer support.

## Recommended voice settings

- **Amazon Polly**: Voice `Brian` (en-GB), Neural engine, standard speed
- **ElevenLabs / Nova Sonic**: Professional male, calm cadence, slight slowdown (-10%)
- **Gemini TTS**: `en-GB-Wavenet-D` or similar British male, speaking rate 0.9
