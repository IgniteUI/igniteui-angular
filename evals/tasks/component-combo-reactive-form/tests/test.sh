#!/bin/bash
# Deterministic grader for component-combo-reactive-form
# Checks outcomes: correct files exist, correct selectors, reactive form usage

set -euo pipefail

mkdir -p logs/verifier

SCORE=0
TOTAL=5
DETAILS=""

# --- Check 1: Component file exists ---
COMPONENT_FILE=$(find src -name "user-settings.component.ts" 2>/dev/null | head -1)
if [ -n "$COMPONENT_FILE" ]; then
  SCORE=$((SCORE + 1))
  DETAILS="${DETAILS}PASS: user-settings.component.ts exists\n"
else
  DETAILS="${DETAILS}FAIL: user-settings.component.ts not found\n"
fi

# --- Check 2: igx-combo selector is present in the template ---
TEMPLATE_FILE=$(find src -name "user-settings.component.html" 2>/dev/null | head -1)
COMBO_FOUND=0

if [ -n "${TEMPLATE_FILE:-}" ] && grep -q "igx-combo" "$TEMPLATE_FILE" 2>/dev/null; then
  COMBO_FOUND=1
elif [ -n "${COMPONENT_FILE:-}" ] && grep -q "igx-combo" "$COMPONENT_FILE" 2>/dev/null; then
  COMBO_FOUND=1
fi

if [ "$COMBO_FOUND" -eq 1 ]; then
  SCORE=$((SCORE + 1))
  DETAILS="${DETAILS}PASS: igx-combo selector found\n"
else
  DETAILS="${DETAILS}FAIL: igx-combo selector not found in template\n"
fi

# --- Check 3: Reactive form usage (FormGroup, FormControl, or formControlName) ---
REACTIVE_FOUND=0
SEARCH_FILES=""
[ -n "${TEMPLATE_FILE:-}" ] && SEARCH_FILES="$TEMPLATE_FILE"
[ -n "${COMPONENT_FILE:-}" ] && SEARCH_FILES="$SEARCH_FILES $COMPONENT_FILE"

for f in $SEARCH_FILES; do
  if grep -qE 'FormGroup|FormControl|formControlName|formControl|ReactiveFormsModule' "$f" 2>/dev/null; then
    REACTIVE_FOUND=1
    break
  fi
done

if [ "$REACTIVE_FOUND" -eq 1 ]; then
  SCORE=$((SCORE + 1))
  DETAILS="${DETAILS}PASS: Reactive form usage found\n"
else
  DETAILS="${DETAILS}FAIL: No reactive form usage found\n"
fi

# --- Check 4: No forbidden alternatives ---
ALL_FILES=$(find src -name "*.ts" -o -name "*.html" 2>/dev/null)
FORBIDDEN=0
for f in $ALL_FILES; do
  if grep -qE '<select[> ].*multiple|mat-select|MatSelectModule|igx-select' "$f" 2>/dev/null; then
    FORBIDDEN=1
    break
  fi
done

if [ "$FORBIDDEN" -eq 0 ]; then
  SCORE=$((SCORE + 1))
  DETAILS="${DETAILS}PASS: No forbidden alternatives found\n"
else
  DETAILS="${DETAILS}FAIL: Forbidden alternative (native select, mat-select, igx-select) detected\n"
fi

# --- Check 5: Correct import from igniteui-angular ---
IMPORT_FOUND=0
if [ -n "${COMPONENT_FILE:-}" ]; then
  if grep -qE "from ['\"]igniteui-angular|from ['\"]@infragistics/igniteui-angular" "$COMPONENT_FILE" 2>/dev/null; then
    IMPORT_FOUND=1
  fi
fi

if [ "$IMPORT_FOUND" -eq 1 ]; then
  SCORE=$((SCORE + 1))
  DETAILS="${DETAILS}PASS: igniteui-angular import found\n"
else
  DETAILS="${DETAILS}FAIL: No igniteui-angular import found\n"
fi

# --- Calculate reward ---
REWARD=$(echo "scale=2; $SCORE / $TOTAL" | bc)

echo "$REWARD" > logs/verifier/reward.txt
printf "Score: %d/%d (%.0f%%)\n" "$SCORE" "$TOTAL" "$(echo "$REWARD * 100" | bc)"
printf "$DETAILS"

if [ "$SCORE" -lt "$TOTAL" ]; then
  exit 1
fi
