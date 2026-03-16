#!/usr/bin/env bash
# =============================================================================
# generate-narration.sh
# Generates MP3 narration audio for all three demo modes (today / 2028 / 2030).
# Output: public/narration/{mode}/scene{0-6}.mp3
# At runtime the app loads narration/{demoMode}/scene{N}.mp3 and falls back to
# Web Speech API if the file is absent.
# =============================================================================

set -euo pipefail

VOICE_ID="Amy"
ENGINE="neural"
OUTPUT_FORMAT="mp3"
LANGUAGE_CODE="en-GB"
SAMPLE_RATE="24000"
REGION="${AWS_DEFAULT_REGION:-eu-west-1}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$SCRIPT_DIR/../public/narration"

echo ""
echo "  Future Banking Demo — Narration Generator (3-mode)"
echo "  ───────────────────────────────────────────────────"
echo ""

if ! command -v aws &>/dev/null; then
  echo "  ERROR: AWS CLI not found. Install from https://aws.amazon.com/cli/"
  exit 1
fi

echo "  AWS CLI:   $(aws --version 2>&1 | head -1)"
echo "  Voice:     $VOICE_ID ($ENGINE engine, $LANGUAGE_CODE)"
echo "  Format:    $OUTPUT_FORMAT @ ${SAMPLE_RATE}Hz"
echo "  Region:    $REGION"
echo "  Output:    $BASE_DIR/{today,2028,2030}/"
echo ""

if ! aws polly describe-voices --region "$REGION" --engine "$ENGINE" \
     --language-code "$LANGUAGE_CODE" --output text &>/dev/null; then
  echo "  ERROR: Cannot reach Amazon Polly in region $REGION."
  echo "  Check your AWS credentials and that the region supports Neural voices."
  exit 1
fi

mkdir -p "$BASE_DIR/today" "$BASE_DIR/2028" "$BASE_DIR/2030"
mkdir -p "$BASE_DIR/compare-today-2028" "$BASE_DIR/compare-today-2030" "$BASE_DIR/compare-2028-2030"

synthesize() {
  local mode="$1"
  local scene_num="$2"
  local text="$3"
  local out="$BASE_DIR/${mode}/scene${scene_num}.mp3"

  echo "  [${mode}/scene${scene_num}] Synthesising ..."

  aws polly synthesize-speech \
    --region          "$REGION"        \
    --output-format   "$OUTPUT_FORMAT" \
    --voice-id        "$VOICE_ID"      \
    --engine          "$ENGINE"        \
    --language-code   "$LANGUAGE_CODE" \
    --sample-rate     "$SAMPLE_RATE"   \
    --text-type       "ssml"           \
    --text            "$text"          \
    "$out"

  local size
  size=$(du -h "$out" | cut -f1)
  echo "         ✓  Saved  ($size)"
}

# ─────────────────────────────────────────────────────────────────────────────
# TODAY — manual banking, user does all the reasoning
# ─────────────────────────────────────────────────────────────────────────────

echo "  ── TODAY ─────────────────────────────────────────────────────────────"

synthesize today 0 '<speak>
<prosody rate="90%">What you are about to see is how most people bank today.</prosody>
<break time="500ms"/>
<prosody rate="90%">You open the app, navigate to your accounts, and make sense of the numbers yourself.</prosody>
<break time="450ms"/>
<prosody rate="90%">Every insight requires a manual step.</prosody>
<break time="500ms"/>
<prosody rate="90%">Six scenes. The same scenarios. No AI, no assistance.</prosody>
<break time="500ms"/>
<prosody rate="90%">Let us begin.</prosody>
</speak>'

synthesize today 1 '<speak>
<prosody rate="91%">Scene one.</prosody>
<break time="350ms"/>
<prosody rate="82%">Financial Awareness.</prosody>
<break time="550ms"/>
<prosody rate="91%">To find out how much is safe to spend this month, you open the app, check your current account, look at your savings, and mentally subtract what is coming up.</prosody>
<break time="500ms"/>
<prosody rate="91%">The data is there.</prosody>
<break time="250ms"/>
<prosody rate="91%">The reasoning is yours to do.</prosody>
</speak>'

synthesize today 2 '<speak>
<prosody rate="91%">Scene two.</prosody>
<break time="350ms"/>
<prosody rate="82%">Spending Insight.</prosody>
<break time="550ms"/>
<prosody rate="91%">You want to know where your money goes.</prosody>
<break time="400ms"/>
<prosody rate="91%">You scroll through transactions, filter by category, and spot the patterns yourself.</prosody>
<break time="500ms"/>
<prosody rate="91%">The information exists.</prosody>
<break time="250ms"/>
<prosody rate="91%">Finding it takes time.</prosody>
</speak>'

synthesize today 3 '<speak>
<prosody rate="91%">Scene three.</prosody>
<break time="350ms"/>
<prosody rate="82%">Affordability Reasoning.</prosody>
<break time="550ms"/>
<prosody rate="91%">Can you afford a <say-as interpret-as="cardinal">900</say-as> pound holiday?</prosody>
<break time="400ms"/>
<prosody rate="91%">You check your balance, estimate upcoming bills, and make a judgement call.</prosody>
<break time="500ms"/>
<prosody rate="91%">A binary decision, with no cashflow modelling behind it.</prosody>
</speak>'

synthesize today 4 '<speak>
<prosody rate="91%">Scene four.</prosody>
<break time="350ms"/>
<prosody rate="82%">Safe Transfer.</prosody>
<break time="550ms"/>
<prosody rate="91%">You want to move <say-as interpret-as="cardinal">600</say-as> pounds from savings to current.</prosody>
<break time="400ms"/>
<prosody rate="91%">Select the account, enter the amount, confirm.</prosody>
<break time="350ms"/>
<prosody rate="91%">Three steps, one action.</prosody>
<break time="400ms"/>
<prosody rate="91%">Which account to use — that decision is entirely yours.</prosody>
</speak>'

synthesize today 5 '<speak>
<prosody rate="91%">Scene five.</prosody>
<break time="350ms"/>
<prosody rate="82%">Behavioural Intelligence.</prosody>
<break time="550ms"/>
<prosody rate="91%">Your spending has crept up.</prosody>
<break time="350ms"/>
<prosody rate="91%">The bank shows an insight card once a threshold is crossed — useful context, but it surfaces after the pattern has already formed.</prosody>
<break time="500ms"/>
<prosody rate="91%">You see the trend in retrospect.</prosody>
</speak>'

synthesize today 6 '<speak>
<prosody rate="91%">Scene six.</prosody>
<break time="350ms"/>
<prosody rate="82%">Intelligent Support.</prosody>
<break time="550ms"/>
<prosody rate="91%">An unknown charge appears on your account.</prosody>
<break time="400ms"/>
<prosody rate="91%">You open a support ticket, explain the situation from scratch, and wait for resolution.</prosody>
<break time="500ms"/>
<prosody rate="91%">Every handoff means repeating yourself.</prosody>
</speak>'

# ─────────────────────────────────────────────────────────────────────────────
# 2028 — AI assistant embedded inside the bank app
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "  ── 2028 ──────────────────────────────────────────────────────────────"

synthesize 2028 0 '<speak>
<prosody rate="90%">What you are about to see is a banking experience where natural language replaces app navigation entirely.</prosody>
<break time="650ms"/>
<prosody rate="90%">The customer does not open menus, and does not move through screens.</prosody>
<break time="500ms"/>
<prosody rate="90%">They simply ask.</prosody>
<break time="300ms"/>
<prosody rate="90%">And the AI understands, reasons, and acts.</prosody>
<break time="650ms"/>
<prosody rate="90%">Six scenes.</prosody>
<break time="250ms"/>
<prosody rate="90%">Six different capabilities.</prosody>
<break time="700ms"/>
<prosody rate="90%">Let us begin.</prosody>
</speak>'

synthesize 2028 1 '<speak>
<prosody rate="91%">Scene one.</prosody>
<break time="350ms"/>
<prosody rate="82%">Financial Awareness.</prosody>
<break time="550ms"/>
<prosody rate="91%">The assistant calculates exactly how much is safe to spend this month.</prosody>
<break time="450ms"/>
<prosody rate="91%">Live balances, upcoming bills, and savings goals, brought together in under a second.</prosody>
<break time="500ms"/>
<prosody rate="91%">No app switching.</prosody>
<break time="250ms"/>
<prosody rate="91%">No manual maths.</prosody>
</speak>'

synthesize 2028 2 '<speak>
<prosody rate="91%">Scene two.</prosody>
<break time="350ms"/>
<prosody rate="82%">Spending Insight.</prosody>
<break time="550ms"/>
<prosody rate="91%">One question reveals twelve months of categorised spending.</prosody>
<break time="450ms"/>
<prosody rate="91%">Housing, transport, restaurants, and subscriptions.</prosody>
<break time="500ms"/>
<prosody rate="91%">Patterns that would normally take time to uncover, surfaced instantly.</prosody>
</speak>'

synthesize 2028 3 '<speak>
<prosody rate="91%">Scene three.</prosody>
<break time="350ms"/>
<prosody rate="82%">Affordability Reasoning.</prosody>
<break time="550ms"/>
<prosody rate="91%">The assistant does not just check the balance.</prosody>
<break time="450ms"/>
<prosody rate="91%">It models the full impact of a <say-as interpret-as="cardinal">900</say-as> pound holiday on cash flow and future savings goals.</prosody>
<break time="550ms"/>
<prosody rate="91%">This is reasoning, not simple retrieval.</prosody>
</speak>'

synthesize 2028 4 '<speak>
<prosody rate="91%">Scene four.</prosody>
<break time="350ms"/>
<prosody rate="82%">Safe Transfer.</prosody>
<break time="550ms"/>
<prosody rate="91%">A transfer request triggers the policy engine automatically.</prosody>
<break time="450ms"/>
<prosody rate="91%">Minimum balance rules, confirmation thresholds, and a full audit trail all activate in the background.</prosody>
<break time="550ms"/>
<prosody rate="91%">Protection and control, without adding friction.</prosody>
</speak>'

synthesize 2028 5 '<speak>
<prosody rate="91%">Scene five.</prosody>
<break time="350ms"/>
<prosody rate="82%">Behavioural Intelligence.</prosody>
<break time="550ms"/>
<prosody rate="91%">The assistant spots an unusual increase in restaurant spending before the customer asks.</prosody>
<break time="450ms"/>
<prosody rate="91%">This is the shift from reactive service to proactive support.</prosody>
<break time="550ms"/>
<prosody rate="91%">The bank becoming a true financial copilot.</prosody>
</speak>'

synthesize 2028 6 '<speak>
<prosody rate="91%">Scene six.</prosody>
<break time="350ms"/>
<prosody rate="82%">Intelligent Support.</prosody>
<break time="550ms"/>
<prosody rate="91%">An unknown charge becomes a dispute, a merchant block, and a rich handoff to a human specialist.</prosody>
<break time="500ms"/>
<prosody rate="91%">All orchestrated within a single conversation.</prosody>
<break time="550ms"/>
<prosody rate="91%">This is the future of customer support.</prosody>
</speak>'

# ─────────────────────────────────────────────────────────────────────────────
# 2030 — ambient AI, banking happens around you
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "  ── 2030 ──────────────────────────────────────────────────────────────"

synthesize 2030 0 '<speak>
<prosody rate="90%">What you are about to see is banking that happens around you.</prosody>
<break time="550ms"/>
<prosody rate="90%">No app to open.</prosody>
<break time="300ms"/>
<prosody rate="90%">No question to ask.</prosody>
<break time="500ms"/>
<prosody rate="90%">A personal AI that has already been working — monitoring, protecting, and optimising across all your financial providers.</prosody>
<break time="650ms"/>
<prosody rate="90%">Six scenes.</prosody>
<break time="250ms"/>
<prosody rate="90%">Ambient intelligence in action.</prosody>
<break time="700ms"/>
<prosody rate="90%">Let us begin.</prosody>
</speak>'

synthesize 2030 1 '<speak>
<prosody rate="91%">Scene one.</prosody>
<break time="350ms"/>
<prosody rate="82%">Financial Awareness.</prosody>
<break time="550ms"/>
<prosody rate="91%">Before the customer says a word, their personal AI has already assessed the full picture — current account, savings, and ISA combined, with three active automations already running.</prosody>
<break time="550ms"/>
<prosody rate="91%">The answer is already there.</prosody>
</speak>'

synthesize 2030 2 '<speak>
<prosody rate="91%">Scene two.</prosody>
<break time="350ms"/>
<prosody rate="82%">Spending Insight.</prosody>
<break time="550ms"/>
<prosody rate="91%">The AI has already caught a fifty-eight percent spike in dining spend and pre-drafted an adjustment.</prosody>
<break time="450ms"/>
<prosody rate="91%">It has also found a broadband deal saving two hundred and sixteen pounds a year.</prosody>
<break time="500ms"/>
<prosody rate="91%">Two insights surfaced — without being asked.</prosody>
</speak>'

synthesize 2030 3 '<speak>
<prosody rate="91%">Scene three.</prosody>
<break time="350ms"/>
<prosody rate="82%">Affordability Reasoning.</prosody>
<break time="550ms"/>
<prosody rate="91%">The AI runs affordability across fourteen financial signals, identifies the optimal funding route, and preserves both the emergency buffer and the savings goal.</prosody>
<break time="550ms"/>
<prosody rate="91%">Ready for a single approval tap.</prosody>
</speak>'

synthesize 2030 4 '<speak>
<prosody rate="91%">Scene four.</prosody>
<break time="350ms"/>
<prosody rate="82%">Safe Transfer.</prosody>
<break time="550ms"/>
<prosody rate="91%">The transfer executes within pre-authorised delegated limits.</prosody>
<break time="400ms"/>
<prosody rate="91%">No disambiguation.</prosody>
<break time="250ms"/>
<prosody rate="91%">No confirmation required.</prosody>
<break time="450ms"/>
<prosody rate="91%">A trust chain from AI to bank to payment network — with a full audit trail available on demand.</prosody>
</speak>'

synthesize 2030 5 '<speak>
<prosody rate="91%">Scene five.</prosody>
<break time="350ms"/>
<prosody rate="82%">Behavioural Intelligence.</prosody>
<break time="550ms"/>
<prosody rate="91%">Ambient protection fires before any limit is reached.</prosody>
<break time="400ms"/>
<prosody rate="91%">The AI pre-drafts adjustments, monitors categories continuously, and reports back.</prosody>
<break time="500ms"/>
<prosody rate="91%">No user initiation.</prosody>
<break time="250ms"/>
<prosody rate="91%">Protection just works.</prosody>
</speak>'

synthesize 2030 6 '<speak>
<prosody rate="91%">Scene six.</prosody>
<break time="350ms"/>
<prosody rate="82%">Intelligent Support.</prosody>
<break time="550ms"/>
<prosody rate="91%">The AI flagged the suspicious merchant three days before the customer noticed, paused payments, and drafted the dispute.</prosody>
<break time="500ms"/>
<prosody rate="91%">When a human specialist joins, they arrive with zero-recap context already loaded.</prosody>
</speak>'

echo ""
echo "  ── COMPARISONS ───────────────────────────────────────────────────────"

for pair in "today-2028" "today-2030" "2028-2030"; do
  mode="compare-$pair"
  left=$(echo $pair | cut -d'-' -f1)
  right=$(echo $pair | cut -d'-' -f2)

  synthesize "$mode" 0 "<speak><prosody rate='90%'>On the left, we see ${left}. On the right, we see ${right}. Notice the difference in the initial experience.</prosody></speak>"
  synthesize "$mode" 1 "<speak><prosody rate='90%'>Here we examine financial awareness. The left side uses ${left} patterns, while the right displays ${right} intelligence.</prosody></speak>"
  synthesize "$mode" 2 "<speak><prosody rate='90%'>When investigating spending insights, the ${left} approach requires manual retrieval, whereas ${right} highlights proactive analysis.</prosody></speak>"
  synthesize "$mode" 3 "<speak><prosody rate='90%'>For affordability reasoning, the contrast is clear. ${left} shows basic calculation, while ${right} models the full impact.</prosody></speak>"
  synthesize "$mode" 4 "<speak><prosody rate='90%'>In safe transfer, ${left} expects user disambiguation. ${right} delegates within pre-authorised limits.</prosody></speak>"
  synthesize "$mode" 5 "<speak><prosody rate='90%'>Behavioural intelligence is reactive in ${left}, but ambient and proactive in ${right}.</prosody></speak>"
  synthesize "$mode" 6 "<speak><prosody rate='90%'>Finally, support. The ${left} experience requires recapping, while the ${right} model provides rich hand-offs.</prosody></speak>"
done

echo ""
echo "  ✓  All narration files generated:"
echo ""
for mode in today 2028 2030 compare-today-2028 compare-today-2030 compare-2028-2030; do
  echo "  $mode/"
  for f in "$BASE_DIR/$mode"/*.mp3; do
    [ -f "$f" ] && printf "     %-40s  %s\n" "$(basename "$f")" "$(du -h "$f" | cut -f1)"
  done
done
echo ""
echo "  Files are served from /narration/{mode}/scene{N}.mp3"
echo "  by the Vite dev server and bundled by npm run build."
echo ""
