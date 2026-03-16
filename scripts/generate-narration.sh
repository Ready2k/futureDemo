#!/usr/bin/env bash
# =============================================================================
# generate-narration.sh
# Generates MP3 narration audio files for the finTechDemo using Amazon Polly
# Neural TTS. Run this script once; output files are consumed directly by the
# demo at runtime (public/narration/scene{1-6}.mp3).
#
# Requirements:
#   - AWS CLI v2 installed  (aws --version)
#   - AWS credentials configured with polly:SynthesizeSpeech permission
#     (either via environment variables, ~/.aws/credentials, or IAM role)
#
# Usage:
#   chmod +x scripts/generate-narration.sh
#   ./scripts/generate-narration.sh
#
# Optional — use a named AWS profile:
#   AWS_PROFILE=my-profile ./scripts/generate-narration.sh
# =============================================================================

set -euo pipefail

# ── Voice / Engine Configuration ─────────────────────────────────────────────
#
# Voice:   Brian  — British English male, measured and authoritative tone.
#                   Well-suited for professional product demos.
#
# Engine:  neural — Amazon Polly Neural TTS. Significantly more natural than
#                   'standard'. Required for the best output quality.
#                   NOTE: Neural voices incur slightly higher Polly costs.
#
# Format:  mp3    — Universally supported in browsers via <audio> elements.
#
# Sample:  24000  — 24 kHz. Good balance of file size and audio quality for
#                   demo narration. Could use 16000 to reduce file size further.
#
# Region:  Brian (Neural) is available in the following AWS regions:
#            us-east-1 | eu-west-1 | eu-central-1 | us-west-2
#            ap-southeast-1 | ap-northeast-1 | ca-central-1
#          Change REGION below if you are working from a different geography.
# ─────────────────────────────────────────────────────────────────────────────
VOICE_ID="Amy"
ENGINE="neural"
OUTPUT_FORMAT="mp3"
LANGUAGE_CODE="en-GB"
SAMPLE_RATE="24000"
REGION="${AWS_DEFAULT_REGION:-eu-west-1}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="$SCRIPT_DIR/../public/narration/today"

# ── Pre-flight checks ─────────────────────────────────────────────────────────
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

# Verify Polly access with a dry-run (describe-voices is free and confirms creds)
if ! aws polly describe-voices --region "$REGION" --engine "$ENGINE" \
     --language-code "$LANGUAGE_CODE" --output text &>/dev/null; then
  echo "  ERROR: Cannot reach Amazon Polly in region $REGION."
  echo "  Check your AWS credentials and that the region supports Neural voices."
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

# ── Synthesise helper ─────────────────────────────────────────────────────────
# Usage: synthesize <scene_number> <text>
# The AWS CLI writes the audio binary directly to the output path.
# ─────────────────────────────────────────────────────────────────────────────
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
    --text            "$text"          \
    "$out"

  local size
  size=$(du -h "$out" | cut -f1)
  echo "         ✓  Saved  ($size)"
}

# ── Scene narration scripts ───────────────────────────────────────────────────
# Pacing notes:
#   - Sentences are intentionally short. Polly Neural Amy handles pauses at
#     full stops well. Em dashes have been replaced with commas or full stops
#     so the TTS engine produces natural breath points rather than rushing.
#   - Avoid special characters: no £ signs (spell out "pound"), no smart quotes.
#   - Keep each script under 400 characters to stay comfortably within Polly's
#     free tier per-request limit (1500 chars) and to match the target duration.
# ─────────────────────────────────────────────────────────────────────────────

# Scene 0 — Opening / intro narration. Plays immediately when Start Full Demo
# is clicked, while the phone home screen animation is loading.
synthesize 0 \
  "What you are about to see is a banking experience where natural language replaces app navigation entirely. \
The customer never opens a menu, never taps through screens. \
They simply ask. And the bank reasons, acts, and responds. \
Six scenes. Each one shows a different capability. \
Let us begin."

synthesize 1 \
  "Scene one. Financial Awareness. \
The assistant computes exactly how much is safe to spend this month. \
Live balances, committed bills, and savings goals, all aggregated in under a second. \
No app switching. No manual maths."

synthesize 2 \
  "Scene two. Spending Insight. \
One question surfaces twelve months of categorised transactions. \
Housing, transport, restaurants, subscriptions. \
Patterns that would take an hour to find, answered instantly."

synthesize 3 \
  "Scene three. Affordability Reasoning. \
The assistant does not just check the balance. \
It models the full impact of a nine hundred pound holiday on cashflow and future savings goals. \
Reasoning, not just retrieval."

synthesize 4 \
  "Scene four. Safe Transfer. \
A transfer request hits the policy engine automatically. \
Minimum balance rules, confirmation thresholds, and a full audit trail, \
all firing without the customer ever knowing they are there."

synthesize 5 \
  "Scene five. Behavioural Intelligence. \
The assistant surfaces a restaurant spend anomaly before the customer asks. \
This is the shift from reactive to proactive. \
The bank acting as a true financial copilot."

synthesize 6 \
  "Scene six. Intelligent Support. \
An unknown charge becomes a dispute, a merchant block, and a rich handoff to a human specialist. \
Orchestrated entirely in one conversation. \
This is the future of customer support."

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "  ✓  All 7 narration files generated:"
echo ""
ls -lh "$OUTPUT_DIR"/*.mp3 | awk '{printf "     %-20s  %s\n", $9, $5}'
echo ""
echo "  Files are served from /narration/today/scene{N}.mp3 by the Vite dev server"
echo "  and bundled automatically by 'npm run build'."
echo ""
