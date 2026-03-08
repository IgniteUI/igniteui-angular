#!/bin/bash
# Deterministic grader for grid-basic-setup
# Checks outcomes: correct files exist, project compiles, correct selectors used

set -euo pipefail

mkdir -p logs/verifier

SCORE=0
TOTAL=5
DETAILS=""

# --- Check 1: Component file exists ---
COMPONENT_FILE=$(find src -name "employee-list.component.ts" 2>/dev/null | head -1)
if [ -n "$COMPONENT_FILE" ]; then
  SCORE=$((SCORE + 1))
  DETAILS="${DETAILS}PASS: employee-list.component.ts exists\n"
else
  DETAILS="${DETAILS}FAIL: employee-list.component.ts not found\n"
fi

# --- Check 2: igx-grid selector is present in the template ---
TEMPLATE_FILE=$(find src -name "employee-list.component.html" 2>/dev/null | head -1)
INLINE_TEMPLATE=""
if [ -z "$TEMPLATE_FILE" ] && [ -n "$COMPONENT_FILE" ]; then
  # Check for inline template
  INLINE_TEMPLATE=$(grep -l "igx-grid" "$COMPONENT_FILE" 2>/dev/null || true)
fi

if [ -n "$TEMPLATE_FILE" ] && grep -q "igx-grid" "$TEMPLATE_FILE" 2>/dev/null; then
  SCORE=$((SCORE + 1))
  DETAILS="${DETAILS}PASS: igx-grid selector found in template\n"
elif [ -n "$INLINE_TEMPLATE" ]; then
  SCORE=$((SCORE + 1))
  DETAILS="${DETAILS}PASS: igx-grid selector found in inline template\n"
else
  DETAILS="${DETAILS}FAIL: igx-grid selector not found in template\n"
fi

# --- Check 3: Correct import from igniteui-angular entry point ---
# Accepts either the OSS or licensed package path
GRID_IMPORT_PATTERN="from ['\"](@infragistics/)?igniteui-angular/grids/grid['\"]"
if [ -n "$COMPONENT_FILE" ]; then
  if grep -qE "$GRID_IMPORT_PATTERN" "$COMPONENT_FILE" 2>/dev/null; then
    SCORE=$((SCORE + 1))
    DETAILS="${DETAILS}PASS: Correct grid entry-point import found\n"
  else
    DETAILS="${DETAILS}FAIL: Missing import from igniteui-angular/grids/grid entry point\n"
  fi
else
  DETAILS="${DETAILS}FAIL: Cannot check imports — component file not found\n"
fi

# --- Check 4: No forbidden alternatives ---
ALL_TS_FILES=$(find src -name "*.ts" -o -name "*.html" 2>/dev/null)
FORBIDDEN=0
for f in $ALL_TS_FILES; do
  # Check for native table, Angular Material table, or other grid libs
  if grep -qE '<table[> ]|MatTableModule|mat-table|ag-grid|kendo-grid' "$f" 2>/dev/null; then
    FORBIDDEN=1
    break
  fi
done

if [ "$FORBIDDEN" -eq 0 ]; then
  SCORE=$((SCORE + 1))
  DETAILS="${DETAILS}PASS: No forbidden alternatives found\n"
else
  DETAILS="${DETAILS}FAIL: Forbidden alternative (native table, Material table, etc.) detected\n"
fi

# --- Check 5: Pagination is configured ---
PAGING_FOUND=0
SEARCH_FILES=""
[ -n "$TEMPLATE_FILE" ] && SEARCH_FILES="$TEMPLATE_FILE"
[ -n "$COMPONENT_FILE" ] && SEARCH_FILES="$SEARCH_FILES $COMPONENT_FILE"

for f in $SEARCH_FILES; do
  if grep -qE 'igx-paginator|IgxPaginatorComponent|paging|perPage|\[perPage\]' "$f" 2>/dev/null; then
    PAGING_FOUND=1
    break
  fi
done

if [ "$PAGING_FOUND" -eq 1 ]; then
  SCORE=$((SCORE + 1))
  DETAILS="${DETAILS}PASS: Pagination configuration found\n"
else
  DETAILS="${DETAILS}FAIL: No pagination configuration found\n"
fi

# --- Calculate reward ---
REWARD=$(echo "scale=2; $SCORE / $TOTAL" | bc)

echo "$REWARD" > logs/verifier/reward.txt
printf "Score: %d/%d (%.0f%%)\n" "$SCORE" "$TOTAL" "$(echo "$REWARD * 100" | bc)"
printf "$DETAILS"

if [ "$SCORE" -lt "$TOTAL" ]; then
  exit 1
fi
