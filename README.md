# Example Future Banking Assistant — Demo

> **Not production banking software.** This is a strategic product demo built to illustrate what an AI-native banking experience could look like. It contains no real financial data, no live APIs, and makes no actual transactions.

A fully client-side React demo simulating an AI-powered financial copilot. Natural language replaces app navigation — the assistant understands intent, reasons over financial context, applies policy guardrails, and executes safe banking actions. Designed to land in under 3 minutes with stakeholders.

---

## Running It

```bash
npm install
npm run dev        # http://localhost:5173
```

No environment variables, no backend, no API keys. Everything is pre-authored and deterministic.

```bash
npm run build      # Production build → dist/
npm run preview    # Serve dist/ at http://localhost:4173
npm run lint       # ESLint (flat config, ESLint 9+)
```

---

## Demo Flow

The demo runs 8 phases in sequence, controlled by the presenter panel (bottom of screen).

| # | Scene | What Happens |
|---|-------|-------------|
| 0 | **Ambient Entry** | iPhone home screen with Apple Intelligence rainbow border. User types a query to Siri. |
| — | **Biometric Auth** | Face ID scan animation. In 2028 mode the Siri query passes through automatically — no re-entry. |
| 1 | **Financial Awareness** | *"How much money can I spend this month?"* → Monthly breakdown card with Safe-to-Spend figure. |
| 2 | **Spending Insight** | *"Where does my money go each month?"* → Category analysis with animated bar chart. |
| 3 | **Affordability Reasoning** | *"Can I afford a £900 holiday?"* → Budget impact, savings goal delay, AI reasoning trace. |
| 4 | **Safe Transfer** | *"Move £600 from savings to current"* → Policy engine fires, approval confirmation required. |
| 5 | **Behavioural Intelligence** | Proactive insight card — 3-month restaurant spend trend (Jan £265 → Feb £298 → Mar £420). |
| 6 | **Intelligent Support** | Multi-step: unknown charge → dispute → merchant block → human specialist handoff. |
| 7 | **Platform Overlay** | Architecture stack + business value metrics. Strategic framing for decision-makers. |

### 2028 / Future Mode

Toggle via the presenter controls. Transfers execute without confirmation (continuous biometric session narrative). Policy reasoning shows "friction waived" language. The Siri query from Scene 0 flows directly into Scene 1 without the user re-typing it.

---

## Architecture

**Stack:** React 19 + Vite + Framer Motion. No backend. No state management library.

```
src/
├── App.jsx                    # Root — demo lifecycle, presenter controls
├── context/BankingContext.jsx # Global state + mock banking operations
├── services/
│   ├── intentEngine.js        # Regex NLU → { intent, parameters }
│   └── policyEngine.js        # Transfer rules (min balance £1000, confirm > £500)
├── data/mockData.js           # Single source of truth for all financial figures
└── components/
    ├── ConversationPanel.jsx  # Chat UI, autopilot, all scene cards
    ├── ReasoningDrawer.jsx    # AI reasoning trace panel (left of phone frame)
    ├── HomeScreenIntro.jsx    # Timed iPhone home screen animation
    ├── BiometricAuthScreen.jsx# Face ID sequence
    ├── FinancialSummaryCard.jsx
    └── PlatformOverlay.jsx    # Final architecture + business value slide
```

Scene state, autopilot, and presenter controls communicate via a **custom DOM event bus** (`START_AUTOPILOT_DEMO`, `RESET_CHAT`, `AUTOPILOT_CTRL`, `DEMO_PHASE_UPDATE`). There are no live LLM calls anywhere.

---

## Presenter Controls

The control bar at the bottom of the screen (visible during the demo) provides:

- **Play / Pause** — autopilot runs each scene automatically with realistic typing delays
- **Prev / Next** — jump between scenes
- **Scene selector** — jump to any specific scene
- **Reset** — return to the home screen
- **2028 toggle** — switch to the future-mode narrative
- **Dark / Light** — theme toggle

---

## Screenshots / Recording

> Add a short screen recording (`demo.gif` or `demo.mp4`) and an architecture diagram (`architecture.png`) to the repo root for stakeholder sharing. Neither is included in this commit — capture them from a running instance with `npm run dev`.

---

## Customising the Demo

All financial figures (balances, expenses, income, savings goal) live in `src/data/mockData.js`. Change numbers there and they propagate everywhere — charts, breakdowns, and reasoning text all reference the same source.

Brand colours are CSS custom properties in `src/index.css`: `--brand-blue: #00395D`, `--brand-cyan: #00AEEF`.
