#!/bin/bash
# run-eval.sh — Self-contained eval runner for Ignite UI Angular skills.
# Inspired by https://github.com/mgechev/skill-eval (a reference architecture,
# not an installable package).
#
# Usage:
#   bash run-eval.sh <task-id>              # validate one task
#   bash run-eval.sh --all                  # validate all tasks
#   bash run-eval.sh <task-id> --validate   # run reference solution then grade

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TASKS_DIR="$SCRIPT_DIR/tasks"
RESULTS_DIR="$SCRIPT_DIR/results"

# --- helpers --------------------------------------------------------------- #

usage() {
  cat <<EOF
Usage: $(basename "$0") <task-id|--all> [--validate]

Arguments:
  <task-id>     Name of the task directory under tasks/
  --all         Run all tasks

Options:
  --validate    Apply the reference solution before grading (sanity-check mode)

Examples:
  $(basename "$0") grid-basic-setup --validate
  $(basename "$0") --all
EOF
  exit 1
}

run_task() {
  local TASK_ID="$1"
  local VALIDATE="${2:-false}"
  local TASK_DIR="$TASKS_DIR/$TASK_ID"

  if [ ! -d "$TASK_DIR" ]; then
    echo "ERROR: Task directory not found: $TASK_DIR" >&2
    return 1
  fi

  echo "═══════════════════════════════════════════════════════"
  echo "  Task: $TASK_ID"
  echo "═══════════════════════════════════════════════════════"

  # Create a temporary workspace so graders run in isolation
  local WORK_DIR
  WORK_DIR=$(mktemp -d)
  trap "rm -rf '$WORK_DIR'" RETURN

  # Seed the workspace with a minimal src/ tree
  mkdir -p "$WORK_DIR/src"

  # If --validate, apply the reference solution first
  if [ "$VALIDATE" = "true" ]; then
    if [ ! -f "$TASK_DIR/solution/solve.sh" ]; then
      echo "ERROR: No reference solution at $TASK_DIR/solution/solve.sh" >&2
      return 1
    fi
    echo "→ Applying reference solution …"
    (cd "$WORK_DIR" && bash "$TASK_DIR/solution/solve.sh")
  fi

  # Run deterministic grader
  if [ ! -f "$TASK_DIR/tests/test.sh" ]; then
    echo "ERROR: No deterministic grader at $TASK_DIR/tests/test.sh" >&2
    return 1
  fi

  echo "→ Running deterministic grader …"
  local GRADER_EXIT=0
  (cd "$WORK_DIR" && bash "$TASK_DIR/tests/test.sh") || GRADER_EXIT=$?

  # Read reward
  local REWARD="0"
  if [ -f "$WORK_DIR/logs/verifier/reward.txt" ]; then
    REWARD=$(cat "$WORK_DIR/logs/verifier/reward.txt")
  fi

  local STATUS="fail"
  local PASS_RATE="0"
  local PASS_AT_K="0"
  if [ "$GRADER_EXIT" -eq 0 ]; then
    STATUS="pass"
    PASS_RATE="1"
    PASS_AT_K="1"
  fi

  echo ""
  echo "  Result: $STATUS  (reward=$REWARD)"
  echo ""

  # Persist result — includes passRate/passAtK so the CI summary comment can
  # read them directly (these are the fields the workflow script expects).
  mkdir -p "$RESULTS_DIR"
  cat > "$RESULTS_DIR/${TASK_ID}.json" <<EOF
{
  "task": "$TASK_ID",
  "reward": $REWARD,
  "status": "$STATUS",
  "passRate": $PASS_RATE,
  "passAtK": $PASS_AT_K,
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

  return "$GRADER_EXIT"
}

# --- main ------------------------------------------------------------------ #

if [ $# -lt 1 ]; then
  usage
fi

TASK_ARG="$1"
VALIDATE="false"
if [[ "${2:-}" == "--validate" ]]; then
  VALIDATE="true"
fi

OVERALL_EXIT=0

if [ "$TASK_ARG" = "--all" ]; then
  for TASK_PATH in "$TASKS_DIR"/*/; do
    TASK_NAME=$(basename "$TASK_PATH")
    run_task "$TASK_NAME" "$VALIDATE" || OVERALL_EXIT=1
  done
else
  run_task "$TASK_ARG" "$VALIDATE" || OVERALL_EXIT=1
fi

exit "$OVERALL_EXIT"
