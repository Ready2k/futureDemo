# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**Example Future Banking Assistant** — a strategic product demo simulating an AI-native banking experience where natural language replaces app navigation. The product concept is a financial copilot, not a chatbot. It understands intent, reasons over financial context, applies policy guardrails, executes safe banking actions, and provides proactive behavioural insights. The demo is designed to make stakeholders think *"This feels like the future of banking"* and must land in under 3 minutes.

This is a **fully client-side, no-backend** React + Vite application. All assistant responses, reasoning steps, charts, and insight cards are deterministic and pre-authored. There is no live LLM or API call anywhere in the system.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Dev server (http://localhost:5173)
npm run build      # Production build → dist/
npm run preview    # Serve dist/ locally (http://localhost:4173)
npm run lint       # ESLint (flat config, ESLint 9+)
```

No test suite is present.

## Demo Flow

The full demo runs 8 phases in sequence:

| Phase | Name | Mechanism |
|-------|------|-----------|
| 0 | Ambient Entry | `HomeScreenIntro` — iPhone home screen, Apple Intelligence rainbow border, user types query |
| — | Biometric Auth | `BiometricAuthScreen` — Face ID scan, transitions to banking app |
| 1 | Financial Awareness | Chat: "How much money can I spend this month?" → Monthly breakdown card |
| 2 | Spending Insight | Chat: "Where does my money go each month?" → Category analysis with bar chart |
| 3 | Affordability Reasoning | Chat: "Can I afford a £900 holiday?" → Budget impact + savings goal delay |
| 4 | Safe Transfer | Chat: "Move £600 from savings to current" → Policy engine fires, approval required |
| 5 | Behavioural Intelligence | Proactive insight card with 3-month restaurant spend trend chart (Jan £265 → Feb £298 → Mar £420) |
| 6 | Intelligent Support | Multi-step: unknown charge → dispute → merchant block → human specialist handoff |
| 7 | Platform Overlay | `PlatformOverlay` — architecture stack + business value metrics |

Scenes 1–6 are driven by the `SCENES` array in `ConversationPanel.jsx`. Scene 0 (HomeScreen) and Auth are separate components managed by `App.jsx`.

## Architecture

### State & Data Flow

All banking state lives in `src/context/BankingContext.jsx`. It exposes the mock user profile (balances, expenses, linked accounts) and banking operations (`transferMoney`, `executeTransfer`, `checkAffordability`) via React context.

When a user sends a message:
1. `src/services/intentEngine.js` parses natural language → `{ intent, parameters }`
2. `src/services/policyEngine.js` validates against business rules → `{ status, reason }`
3. The intent handler in `ConversationPanel.jsx` executes the banking operation, builds a structured UI card, and calls `addMessage()` with both a text response and card

The intent handlers are the core of the demo. Each one builds a `trace` object (shown in the `ReasoningDrawer`) and a rich React card inline in the chat.

### Demo Orchestration

`App.jsx` owns the full demo lifecycle:
- Manages `showHomeScreen` / `showAuthScreen` / `showPlatformOverlay` visibility
- Drives `demoPhase` (1–6) and the progress bar shown in presenter controls
- Presenter controls (play/pause, prev/next, scene jump, reset) communicate with `ConversationPanel.jsx` via custom DOM events

**Custom DOM event bus** (the non-obvious wiring):
- `App.jsx` → `ConversationPanel.jsx`: `START_AUTOPILOT_DEMO`, `RESET_CHAT`, `AUTOPILOT_CTRL`
- `ConversationPanel.jsx` → `App.jsx`: `DEMO_PHASE_UPDATE`, `AUTOPILOT_PLAY_STATE`, `CHAT_STARTED`

The autopilot in `ConversationPanel.jsx` runs as an async loop using a `demoCore` ref (`{ active, playing, skip, target }`). Scene skipping works by throwing a `'Skip'` error inside the `wait()` helper, which is caught per-scene to jump to the target index. Do not break this pattern.

### Key UI Patterns

The demo's credibility rests on three UI patterns — treat these as first-class concerns:

1. **Structured cards** — every assistant response renders an inline React card (breakdown table, bar chart, action buttons). These are not text — they are JSX built inside `handleIntent()` in `ConversationPanel.jsx`.
2. **Policy indicators** — the transfer flow shows `CheckCircle` / `AlertTriangle` with explicit policy reason text. This visualises trust and guardrails.
3. **Reasoning drawer** (`ReasoningDrawer.jsx`) — anchored to the left of the phone frame. Shows the `trace` object: intent confidence, reasoning steps, financial calculations, policy outcome. This is what makes it feel like an AI system, not a UI mock. It receives `currentTrace` from `ConversationPanel.jsx`.

### 2028 / Future Mode

`futureMode` (toggled via presenter controls) changes behaviour in `ConversationPanel.jsx`:
- Transfers execute instantly without confirmation (continuous biometric auth narrative)
- Policy reasoning shows "friction waived" language
- The input bar shows an "⚡ 2028 Mode" banner
- The header shows "2028 Intelligence" sub-label
- The `ReasoningDrawer` shows `futureNote` fields explaining the contrast with today

### Component Roles

| File | Role |
|------|------|
| `src/App.jsx` | Root + demo lifecycle + presenter controls |
| `src/context/BankingContext.jsx` | Global state + banking operations |
| `src/components/ConversationPanel.jsx` | Chat UI, intent dispatch, autopilot, all scene cards |
| `src/components/FinancialSummaryCard.jsx` | Scrollable account card carousel, Safe-to-Spend |
| `src/components/HomeScreenIntro.jsx` | Timed intro animation (iPhone home screen, Apple Intelligence glow) |
| `src/components/BiometricAuthScreen.jsx` | Face ID animation sequence |
| `src/components/ReasoningDrawer.jsx` | Expandable AI reasoning panel — large file (~59KB), contains all trace display logic |
| `src/components/ComparisonAdvisor.jsx` | "Today vs 2028" side-panel — syncs to `demoPhase` and shows per-scene contrast bullets; driven by its own internal `SCENES` array parallel to `ConversationPanel.jsx`'s |
| `src/components/PlatformOverlay.jsx` | Architecture diagram + business value reveal (final scene) |
| `src/services/intentEngine.js` | Regex-based intent + parameter extraction |
| `src/services/policyEngine.js` | Transfer policy rules (min balance £1000, confirmation threshold £500) |
| `src/data/mockData.js` | **Single source of truth for all financial figures** — change balances, expenses, income, savings goal here |

### Styling

All theme variables are CSS custom properties in `src/index.css`. Light mode is the default; `[data-theme="dark"]` on the root switches the full palette. Key brand colours: `--brand-blue: #00395D`, `--brand-cyan: #00AEEF`. The iOS device frame (390×844px) is a pure-CSS wrapper with a Dynamic Island pseudo-element. Animations use Framer Motion throughout — prefer it over CSS transitions for interactive elements.

### Narration Audio

Pre-recorded MP3 files live in `public/narration/` (`scene0.mp3`–`scene6.mp3`). The app tries to load each file at scene start; if absent it falls back to the browser's Web Speech API automatically. To regenerate audio, use the scripts in `public/narration/README.md` (recommended: Amazon Polly voice `Brian`, en-GB, Neural engine).

### ESLint Notes

ESLint 9 flat config. Variables matching `/^[A-Z_]/` are exempt from `no-unused-vars`. Run `npm run lint` before committing; no `--fix` script exists.
