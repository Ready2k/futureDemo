#!/usr/bin/env bash
# =============================================================================
# generate-narration.sh
# Generates MP3 narration audio files for the finTechDemo using Amazon Polly
# Neural TTS. Run this script once; output files are consumed directly by the
# demo at runtime (public/narration/scene{0-6}.mp3).
# =============================================================================

set -euo pipefail

VOICE_ID="Amy"
ENGINE="neural"
OUTPUT_FORMAT="mp3"
LANGUAGE_CODE="en-GB"
SAMPLE_RATE="24000"
REGION="${AWS_DEFAULT_REGION:-eu-west-1}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="$SCRIPT_DIR/../public/narration"

echo ""
echo "  Future Banking Demo — Narration Generator"
echo "  ─────────────────────────────────────────"
echo ""

if ! command -v aws &>/dev/null; then
  echo "  ERROR: AWS CLI not found. Install from https://aws.amazon.com/cli/"
  exit 1
fi

echo "  AWS CLI:   $(aws --version 2>&1 | head -1)"
echo "  Voice:     $VOICE_ID ($ENGINE engine, $LANGUAGE_CODE)"
echo "  Format:    $OUTPUT_FORMAT @ ${SAMPLE_RATE}Hz"
echo "  Region:    $REGION"
echo "  Output:    $OUTPUT_DIR"
echo ""

if ! aws polly describe-voices --region "$REGION" --engine "$ENGINE" \
     --language-code "$LANGUAGE_CODE" --output text &>/dev/null; then
  echo "  ERROR: Cannot reach Amazon Polly in region $REGION."
  echo "  Check your AWS credentials and that the region supports Neural voices."
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

synthesize() {
  local scene_num="$1"
  local text="$2"
  local out="$OUTPUT_DIR/scene${scene_num}.mp3"

  echo "  [${scene_num}/6] Synthesising scene${scene_num}.mp3 ..."

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

synthesize 0 '<speak>
<prosody rate="90%">What you are about to see is a banking experience where natural language replaces app navigation entirely.</prosody>
<break time="650ms"/>
<prosody rate="90%">The customer does not open menus, and does not move through screens.</prosody>
<break time="500ms"/>
<prosody rate="90%">They simply ask.</prosody>
<break time="300ms"/>
<prosody rate="90%">And the bank understands, reasons, and acts.</prosody>
<break time="650ms"/>
<prosody rate="90%">Six scenes.</prosody>
<break time="250ms"/>
<prosody rate="90%">Six different capabilities.</prosody>
<break time="700ms"/>
<prosody rate="90%">Let us begin.</prosody>
</speak>'

synthesize 1 '<speak>
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

synthesize 2 '<speak>
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

synthesize 3 '<speak>
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

synthesize 4 '<speak>
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

synthesize 5 '<speak>
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

synthesize 6 '<speak>
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

echo ""
echo "  ✓  All 7 narration files generated:"
echo ""
for f in "$OUTPUT_DIR"/*.mp3; do printf "     %-30s  %s\n" "$f" "$(du -h "$f" | cut -f1)"; done
echo ""
echo "  Files are served from /narration/scene{N}.mp3 by the Vite dev server"
echo "  and bundled automatically by npm run build."
echo ""