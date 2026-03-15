# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A single-page React + Vite demo application simulating a modern banking platform with an AI assistant. It is designed for live presenter demos, showcasing conversational banking UX with intent detection, policy enforcement, and an automated 6-scene autopilot walkthrough. Built with a Barclays visual identity and an iOS/Apple Intelligence aesthetic.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Dev server (http://localhost:5173)
npm run build      # Production build → dist/
npm run preview    # Serve dist/ locally (http://localhost:4173)
npm run lint       # ESLint (flat config, ESLint 9+)
```

No test suite is present.

## Architecture

### State & Data Flow

All banking state lives in `src/context/BankingContext.jsx`. It exposes the mock user profile (balances, expenses, linked accounts) and banking operations (`transferMoney`, `checkAffordability`, `getTransactions`, etc.) via a React context that wraps the entire app.

When a user sends a message in the chat:
1. `src/services/intentEngine.js` parses natural language → `{ intent, parameters }`
2. `src/services/policyEngine.js` validates the action against business rules (min balance limits, confirmation thresholds, fraud checks) → `{ status, reason }`
3. The banking operation runs and updates `BankingContext` state
4. The response renders in `ConversationPanel` with optional reasoning drawer disclosure

### Demo Orchestration

`App.jsx` owns the demo lifecycle. It manages:
- `demoRunning` / scene index state for the 6-scene autopilot
- Presenter controls (play/pause, previous/next, scene jump, reset)
- Global UI toggles: `darkMode`, `futureMode`, `headerCollapsed`
- Custom DOM event listeners that scenes use to signal completion

Demo scene order: `HomeScreenIntro` (typing animation) → `BiometricAuthScreen` (Face ID) → `ConversationPanel` scenes 1–6 → `PlatformOverlay` (architecture reveal).

### Component Roles

| File | Role |
|------|------|
| `src/App.jsx` | Root + demo orchestration + presenter controls |
| `src/context/BankingContext.jsx` | Global state + banking operations |
| `src/components/ConversationPanel.jsx` | Chat UI, intent dispatch, animated message bubbles |
| `src/components/FinancialSummaryCard.jsx` | Scrollable account card carousel, Safe-to-Spend |
| `src/components/HomeScreenIntro.jsx` | Timed intro animation (iPhone home screen) |
| `src/components/BiometricAuthScreen.jsx` | Face ID animation sequence |
| `src/components/ReasoningDrawer.jsx` | Expandable panel showing AI reasoning + policy results |
| `src/components/PlatformOverlay.jsx` | Architecture diagram reveal (final scene) |
| `src/services/intentEngine.js` | NLP-style intent + parameter extraction |
| `src/services/policyEngine.js` | Business rule enforcement |
| `src/data/mockData.js` | Initial user profile + discretionary income calculation |

### Styling

All theme variables are CSS custom properties defined in `src/index.css`. Light mode is the default; `[data-theme="dark"]` on the root element switches the full palette. Key brand colours: `--brand-blue: #00395D`, `--brand-cyan: #00AEEF`. The iOS device frame (390×844px) is a pure-CSS wrapper with a Dynamic Island pseudo-element.

Animations use Framer Motion throughout — prefer it over CSS transitions for interactive elements.

### ESLint Notes

Uses ESLint 9 flat config. Variables matching `/^[A-Z_]/` are exempt from `no-unused-vars` (used for constants). Run `npm run lint` before committing; there is no `--fix` script, so fix manually.
