#!/bin/bash
# run-eval.sh — Self-contained eval runner for Ignite UI Angular skills.
# Inspired by https://github.com/mgechev/skill-eval (a reference architecture,
# not an installable package).
#
# Usage:
#   bash run-eval.sh <task-id>                        # validate one task (reference solution)
#   bash run-eval.sh --all                            # validate all tasks
#   bash run-eval.sh <task-id> --validate             # run reference solution then grade
#   bash run-eval.sh <task-id> --agent copilot        # run task using copilot CLI agent
#   bash run-eval.sh <task-id> --agent gemini         # run task using gemini CLI agent
#   bash run-eval.sh --all --agent copilot            # run all tasks with copilot agent
#   bash run-eval.sh --all --agent gemini --trials 3  # 3 trials per task with gemini

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TASKS_DIR="$SCRIPT_DIR/tasks"
RESULTS_DIR="$SCRIPT_DIR/results"
CONFIG_FILE="$SCRIPT_DIR/eval-config.json"

# --- helpers --------------------------------------------------------------- #

usage() {
  cat <<EOF
Usage: $(basename "$0") <task-id|--all> [--validate] [--agent <name>] [--trials <n>]

Arguments:
  <task-id>     Name of the task directory under tasks/
  --all         Run all tasks

Options:
  --validate    Apply the reference solution before grading (sanity-check mode)
  --agent NAME  Run task using an AI agent CLI (copilot | gemini)
  --trials N    Number of trials per task when using --agent (default: 1)

Examples:
  $(basename "$0") grid-basic-setup --validate
  $(basename "$0") --all
  $(basename "$0") grid-basic-setup --agent copilot
  $(basename "$0") --all --agent gemini --trials 3
EOF
  exit 1
}

# Read a JSON string field from eval-config.json
# Usage: read_config '.agents.copilot.command'
read_config() {
  local QUERY="$1"
  if [ ! -f "$CONFIG_FILE" ]; then
    echo ""
    return
  fi
  # Use node to parse JSON (available in CI and most dev environments)
  node -e "
    const fs = require('fs');
    const cfg = JSON.parse(fs.readFileSync('$CONFIG_FILE', 'utf8'));
    const keys = '${QUERY}'.replace(/^\\./, '').split('.');
    let val = cfg;
    for (const k of keys) { val = val?.[k]; }
    if (Array.isArray(val)) { console.log(val.join(' ')); }
    else { console.log(val ?? ''); }
  " 2>/dev/null || echo ""
}

# Resolve the agent CLI command and flags from config
resolve_agent() {
  local AGENT_NAME="$1"
  AGENT_CMD=$(read_config "agents.${AGENT_NAME}.command")
  AGENT_PROMPT_ARGS=$(read_config "agents.${AGENT_NAME}.promptArgs")
  AGENT_APPROVE_ARGS=$(read_config "agents.${AGENT_NAME}.autoApproveArgs")
  AGENT_ENV_AUTH=$(read_config "agents.${AGENT_NAME}.envAuth")

  if [ -z "$AGENT_CMD" ]; then
    echo "ERROR: Unknown agent '$AGENT_NAME'. Check eval-config.json" >&2
    exit 1
  fi

  # Verify the CLI is installed
  if ! command -v "$AGENT_CMD" &>/dev/null; then
    local INSTALL_CMD
    INSTALL_CMD=$(read_config "agents.${AGENT_NAME}.installCommand")
    echo "ERROR: '$AGENT_CMD' is not installed." >&2
    echo "  Install with: $INSTALL_CMD" >&2
    exit 1
  fi

  # Verify the auth env var is set
  if [ -n "$AGENT_ENV_AUTH" ]; then
    if [ -z "${!AGENT_ENV_AUTH:-}" ]; then
      echo "WARNING: $AGENT_ENV_AUTH is not set. The agent may fail to authenticate." >&2
    fi
  fi
}

# Run a single task using the agent CLI
run_agent_task() {
  local TASK_DIR="$1"
  local WORK_DIR="$2"
  local AGENT_NAME="$3"

  local INSTRUCTION_FILE="$TASK_DIR/instruction.md"
  if [ ! -f "$INSTRUCTION_FILE" ]; then
    echo "ERROR: No instruction.md found at $INSTRUCTION_FILE" >&2
    return 1
  fi

  local PROMPT
  PROMPT=$(cat "$INSTRUCTION_FILE")

  # Build the skill context preamble if skills/ directory exists
  local SKILL_CONTEXT=""
  if [ -d "$TASK_DIR/skills" ]; then
    for SKILL_FILE in "$TASK_DIR"/skills/*/SKILL.md; do
      if [ -f "$SKILL_FILE" ]; then
        SKILL_CONTEXT="${SKILL_CONTEXT}$(cat "$SKILL_FILE")\n\n"
      fi
    done
  fi

  # Combine skill context + instruction into a single prompt
  local FULL_PROMPT=""
  if [ -n "$SKILL_CONTEXT" ]; then
    FULL_PROMPT="Use the following skill reference when completing the task:\n\n${SKILL_CONTEXT}---\n\n${PROMPT}"
  else
    FULL_PROMPT="$PROMPT"
  fi

  echo "  → Sending instruction to $AGENT_NAME agent …"

  local TIMEOUT_SEC
  TIMEOUT_SEC=$(read_config "timeoutSec")
  TIMEOUT_SEC="${TIMEOUT_SEC:-600}"

  # Build the agent command
  local CMD_ARGS=()
  CMD_ARGS+=("$AGENT_CMD")

  # Add prompt args (e.g., -p)
  if [ -n "$AGENT_PROMPT_ARGS" ]; then
    # shellcheck disable=SC2206
    CMD_ARGS+=($AGENT_PROMPT_ARGS)
  fi
  CMD_ARGS+=("$FULL_PROMPT")

  # Add auto-approve args (e.g., --yes, --sandbox)
  if [ -n "$AGENT_APPROVE_ARGS" ]; then
    # shellcheck disable=SC2206
    CMD_ARGS+=($AGENT_APPROVE_ARGS)
  fi

  # Run the agent in the work directory with a timeout
  local AGENT_EXIT=0
  (
    cd "$WORK_DIR"
    timeout "${TIMEOUT_SEC}s" "${CMD_ARGS[@]}" 2>&1 || true
  ) > "$WORK_DIR/agent-output.log" 2>&1 || AGENT_EXIT=$?

  if [ "$AGENT_EXIT" -eq 124 ]; then
    echo "  ⚠ Agent timed out after ${TIMEOUT_SEC}s"
  elif [ "$AGENT_EXIT" -ne 0 ]; then
    echo "  ⚠ Agent exited with code $AGENT_EXIT"
  fi

  echo "  → Agent output saved to $WORK_DIR/agent-output.log"
}

run_task() {
  local TASK_ID="$1"
  local MODE="${2:-validate}"   # validate | agent
  local AGENT_NAME="${3:-}"
  local TASK_DIR="$TASKS_DIR/$TASK_ID"

  if [ ! -d "$TASK_DIR" ]; then
    echo "ERROR: Task directory not found: $TASK_DIR" >&2
    return 1
  fi

  echo "═══════════════════════════════════════════════════════"
  echo "  Task: $TASK_ID"
  if [ "$MODE" = "agent" ]; then
    echo "  Agent: $AGENT_NAME"
  fi
  echo "═══════════════════════════════════════════════════════"

  # Create a temporary workspace so graders run in isolation
  local WORK_DIR
  WORK_DIR=$(mktemp -d)
  trap "rm -rf '$WORK_DIR'" RETURN

  # Seed the workspace with a minimal src/ tree
  mkdir -p "$WORK_DIR/src"

  if [ "$MODE" = "validate" ]; then
    # --validate: apply the reference solution first
    if [ ! -f "$TASK_DIR/solution/solve.sh" ]; then
      echo "ERROR: No reference solution at $TASK_DIR/solution/solve.sh" >&2
      return 1
    fi
    echo "→ Applying reference solution …"
    (cd "$WORK_DIR" && bash "$TASK_DIR/solution/solve.sh")
  elif [ "$MODE" = "agent" ]; then
    # --agent: send the instruction to the agent CLI
    run_agent_task "$TASK_DIR" "$WORK_DIR" "$AGENT_NAME"
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
  local RESULT_SUFFIX=""
  if [ "$MODE" = "agent" ]; then
    RESULT_SUFFIX="-${AGENT_NAME}"
  fi
  cat > "$RESULTS_DIR/${TASK_ID}${RESULT_SUFFIX}.json" <<EOF
{
  "task": "$TASK_ID",
  "agent": "${AGENT_NAME:-reference}",
  "reward": $REWARD,
  "status": "$STATUS",
  "passRate": $PASS_RATE,
  "passAtK": $PASS_AT_K,
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

  return "$GRADER_EXIT"
}

# Run a task N times (trials) and aggregate results
run_task_trials() {
  local TASK_ID="$1"
  local AGENT_NAME="$2"
  local TRIALS="$3"
  local TASK_DIR="$TASKS_DIR/$TASK_ID"

  if [ ! -d "$TASK_DIR" ]; then
    echo "ERROR: Task directory not found: $TASK_DIR" >&2
    return 1
  fi

  local PASS_COUNT=0
  local TOTAL_REWARD=0

  for i in $(seq 1 "$TRIALS"); do
    echo ""
    echo "  ── Trial $i/$TRIALS ──"

    # Create a temporary workspace for each trial
    local WORK_DIR
    WORK_DIR=$(mktemp -d)

    mkdir -p "$WORK_DIR/src"

    # Send to agent
    run_agent_task "$TASK_DIR" "$WORK_DIR" "$AGENT_NAME"

    # Run grader
    local GRADER_EXIT=0
    (cd "$WORK_DIR" && bash "$TASK_DIR/tests/test.sh") || GRADER_EXIT=$?

    local REWARD="0"
    if [ -f "$WORK_DIR/logs/verifier/reward.txt" ]; then
      REWARD=$(cat "$WORK_DIR/logs/verifier/reward.txt")
    fi

    if [ "$GRADER_EXIT" -eq 0 ]; then
      PASS_COUNT=$((PASS_COUNT + 1))
    fi
    TOTAL_REWARD=$(echo "$TOTAL_REWARD + $REWARD" | bc)

    # Cleanup trial workspace
    rm -rf "$WORK_DIR"

    echo "  Trial $i: reward=$REWARD $([ "$GRADER_EXIT" -eq 0 ] && echo "✅" || echo "❌")"
  done

  # Calculate aggregate metrics
  local PASS_RATE
  PASS_RATE=$(echo "scale=2; $PASS_COUNT / $TRIALS" | bc)
  # pass@k = 1 if at least one trial passed, else 0
  local PASS_AT_K=0
  if [ "$PASS_COUNT" -gt 0 ]; then
    PASS_AT_K=1
  fi
  local AVG_REWARD
  AVG_REWARD=$(echo "scale=2; $TOTAL_REWARD / $TRIALS" | bc)

  echo ""
  echo "  ═══ Aggregate ($TRIALS trials) ═══"
  echo "  Pass rate: $PASS_COUNT/$TRIALS ($PASS_RATE)"
  echo "  pass@$TRIALS: $PASS_AT_K"
  echo "  Avg reward: $AVG_REWARD"
  echo ""

  # Persist aggregated result
  mkdir -p "$RESULTS_DIR"
  cat > "$RESULTS_DIR/${TASK_ID}-${AGENT_NAME}.json" <<EOF
{
  "task": "$TASK_ID",
  "agent": "$AGENT_NAME",
  "trials": $TRIALS,
  "passCount": $PASS_COUNT,
  "reward": $AVG_REWARD,
  "status": "$([ "$PASS_AT_K" -eq 1 ] && echo "pass" || echo "fail")",
  "passRate": $PASS_RATE,
  "passAtK": $PASS_AT_K,
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

  [ "$PASS_AT_K" -eq 1 ] && return 0 || return 1
}

# --- main ------------------------------------------------------------------ #

if [ $# -lt 1 ]; then
  usage
fi

# Parse arguments
TASK_ARG=""
MODE="validate"
AGENT_NAME=""
TRIALS=1

while [ $# -gt 0 ]; do
  case "$1" in
    --all)
      TASK_ARG="--all"
      shift
      ;;
    --validate)
      MODE="validate"
      shift
      ;;
    --agent)
      MODE="agent"
      AGENT_NAME="${2:-}"
      if [ -z "$AGENT_NAME" ]; then
        echo "ERROR: --agent requires a name (copilot | gemini)" >&2
        exit 1
      fi
      shift 2
      ;;
    --trials)
      TRIALS="${2:-1}"
      shift 2
      ;;
    -h|--help)
      usage
      ;;
    *)
      if [ -z "$TASK_ARG" ]; then
        TASK_ARG="$1"
      fi
      shift
      ;;
  esac
done

if [ -z "$TASK_ARG" ]; then
  usage
fi

# If using agent mode, resolve and verify agent CLI
if [ "$MODE" = "agent" ]; then
  # Default to configured agent if none specified
  if [ -z "$AGENT_NAME" ]; then
    AGENT_NAME=$(read_config "defaultAgent")
    AGENT_NAME="${AGENT_NAME:-copilot}"
  fi
  resolve_agent "$AGENT_NAME"
  echo "Using agent: $AGENT_NAME ($AGENT_CMD)"
  echo ""
fi

OVERALL_EXIT=0

if [ "$TASK_ARG" = "--all" ]; then
  for TASK_PATH in "$TASKS_DIR"/*/; do
    TASK_NAME=$(basename "$TASK_PATH")
    if [ "$MODE" = "agent" ] && [ "$TRIALS" -gt 1 ]; then
      echo "═══════════════════════════════════════════════════════"
      echo "  Task: $TASK_NAME  (Agent: $AGENT_NAME, $TRIALS trials)"
      echo "═══════════════════════════════════════════════════════"
      run_task_trials "$TASK_NAME" "$AGENT_NAME" "$TRIALS" || OVERALL_EXIT=1
    else
      run_task "$TASK_NAME" "$MODE" "$AGENT_NAME" || OVERALL_EXIT=1
    fi
  done
else
  if [ "$MODE" = "agent" ] && [ "$TRIALS" -gt 1 ]; then
    echo "═══════════════════════════════════════════════════════"
    echo "  Task: $TASK_ARG  (Agent: $AGENT_NAME, $TRIALS trials)"
    echo "═══════════════════════════════════════════════════════"
    run_task_trials "$TASK_ARG" "$AGENT_NAME" "$TRIALS" || OVERALL_EXIT=1
  else
    run_task "$TASK_ARG" "$MODE" "$AGENT_NAME" || OVERALL_EXIT=1
  fi
fi

exit "$OVERALL_EXIT"
