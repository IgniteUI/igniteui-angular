#!/bin/bash
# Deterministic grader for theming-palette-generation
# Checks outcomes: correct SCSS structure, palette/theme calls present

set -euo pipefail

mkdir -p logs/verifier

SCORE=0
TOTAL=5
DETAILS=""

# Find the main styles file (could be styles.scss or another scss file)
STYLES_FILE=$(find src -name "styles.scss" -o -name "styles.sass" 2>/dev/null | head -1)
if [ -z "$STYLES_FILE" ]; then
  # Also check for any scss file that might contain the theme
  STYLES_FILE=$(grep -rl "palette\|theme()" src/ --include="*.scss" 2>/dev/null | head -1)
fi

if [ -z "${STYLES_FILE:-}" ]; then
  echo "0" > logs/verifier/reward.txt
  printf "FAIL: No SCSS file with theming code found\n"
  exit 1
fi

# --- Check 1: Import from igniteui-angular/theming ---
if grep -qE "@use ['\"]igniteui-angular/theming['\"]|@use ['\"]@infragistics/igniteui-angular/theming['\"]|@import ['\"]igniteui-angular/theming['\"]|@import ['\"]@infragistics/igniteui-angular/theming['\"]|@import ['\"]~igniteui-angular/lib/core/styles/themes" "$STYLES_FILE" 2>/dev/null; then
  SCORE=$((SCORE + 1))
  DETAILS="${DETAILS}PASS: Correct theming import found\n"
else
  DETAILS="${DETAILS}FAIL: Missing import from igniteui-angular/theming\n"
fi

# --- Check 2: palette() function call with primary and secondary ---
if grep -qE 'palette\(' "$STYLES_FILE" 2>/dev/null; then
  SCORE=$((SCORE + 1))
  DETAILS="${DETAILS}PASS: palette() function call found\n"
else
  DETAILS="${DETAILS}FAIL: No palette() function call found\n"
fi

# --- Check 3: theme() mixin call ---
if grep -qE '@include.*theme\(|@include.*css-vars\(' "$STYLES_FILE" 2>/dev/null; then
  SCORE=$((SCORE + 1))
  DETAILS="${DETAILS}PASS: theme() mixin call found\n"
else
  DETAILS="${DETAILS}FAIL: No theme() mixin call found\n"
fi

# --- Check 4: core() mixin call (must be before theme) ---
if grep -qE '@include.*core\(' "$STYLES_FILE" 2>/dev/null; then
  SCORE=$((SCORE + 1))
  DETAILS="${DETAILS}PASS: core() mixin call found\n"
else
  DETAILS="${DETAILS}FAIL: No core() mixin call found\n"
fi

# --- Check 5: No hardcoded CSS custom properties as the sole theming approach ---
# Allow CSS vars if palette() is also used, but fail if ONLY css vars without palette()
PALETTE_USED=$(grep -c 'palette(' "$STYLES_FILE" 2>/dev/null || echo "0")
CSS_VARS_ONLY=$(grep -cE '^\s*--ig-' "$STYLES_FILE" 2>/dev/null || echo "0")

if [ "$PALETTE_USED" -gt 0 ]; then
  SCORE=$((SCORE + 1))
  DETAILS="${DETAILS}PASS: Uses palette() function (not hardcoded CSS variables)\n"
elif [ "$CSS_VARS_ONLY" -gt 0 ]; then
  DETAILS="${DETAILS}FAIL: Only hardcoded CSS custom properties found without palette()\n"
else
  SCORE=$((SCORE + 1))
  DETAILS="${DETAILS}PASS: No hardcoded-only CSS variables approach\n"
fi

# --- Calculate reward ---
REWARD=$(echo "scale=2; $SCORE / $TOTAL" | bc)

echo "$REWARD" > logs/verifier/reward.txt
printf "Score: %d/%d (%.0f%%)\n" "$SCORE" "$TOTAL" "$(echo "$REWARD * 100" | bc)"
printf "$DETAILS"

if [ "$SCORE" -lt "$TOTAL" ]; then
  exit 1
fi
