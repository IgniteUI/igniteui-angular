# Ignite UI for Angular — Skill Evals

Automated evaluation suite for the Ignite UI for Angular agent skills.
Inspired by the [skill-eval](https://github.com/mgechev/skill-eval) reference
architecture and extended with patterns from
[Anthropic's agent eval research](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents).

The infrastructure is **self-contained** — there are no external eval-framework
dependencies. A lightweight shell runner (`run-eval.sh`) executes each task's
reference solution and deterministic grader, and can also dispatch tasks to
AI coding agents (GitHub Copilot CLI or Google Gemini CLI) for end-to-end
evaluation.

## Overview

The suite tests three skills:

| Skill | Task ID | What it tests |
|---|---|---|
| `igniteui-angular-grids` | `grid-basic-setup` | Flat grid with sorting and pagination on flat employee data |
| `igniteui-angular-components` | `component-combo-reactive-form` | Multi-select combo bound to a reactive form control |
| `igniteui-angular-theming` | `theming-palette-generation` | Custom branded palette with `palette()` and `theme()` |

Each task includes:

- **`instruction.md`** — the prompt given to the agent
- **`tests/test.sh`** — deterministic grader (file checks, compilation, lint)
- **`prompts/quality.md`** — LLM rubric grader (intent routing, API usage)
- **`solution/solve.sh`** — reference solution for baseline validation
- **`environment/Dockerfile`** — isolated environment for agent execution
- **`skills/`** — symlinked skill files under test

## Prerequisites

- Bash 4+
- `bc` (installed by default on most Linux / macOS systems)
- Node.js 20+ (for config parsing and agent CLI installation)

**For agent-based evaluation (optional):**

| Agent | Install | Auth |
|---|---|---|
| GitHub Copilot | `npm install -g @github/copilot` | Active Copilot subscription; `GITHUB_TOKEN` env var |
| Google Gemini | `npm install -g @google/gemini-cli` | `GEMINI_API_KEY` env var |

## Running Evals Locally

### Validate graders against reference solutions

This applies each task's `solution/solve.sh`, then runs `tests/test.sh` to
confirm the grader scores 100%. Use this to catch grader regressions.

```bash
cd evals

# Validate all tasks
bash run-eval.sh --all --validate

# Validate a single task
bash run-eval.sh grid-basic-setup --validate
```

### Run evals against an AI agent

Send the `instruction.md` to a coding agent CLI, let the agent generate code
in an isolated workspace, then run the deterministic grader on the output.

```bash
cd evals

# Run all tasks with GitHub Copilot CLI
bash run-eval.sh --all --agent copilot

# Run a single task with Gemini CLI
bash run-eval.sh grid-basic-setup --agent gemini

# Run 3 trials per task for statistical robustness
bash run-eval.sh --all --agent copilot --trials 3
```

### npm scripts (convenience wrappers)

```bash
cd evals

# Validation (reference solutions)
npm run validate               # all tasks
npm run validate:grid          # grid-basic-setup only
npm run validate:combo         # component-combo-reactive-form only
npm run validate:theming       # theming-palette-generation only

# Agent-based evaluation
npm run agent:copilot          # all tasks with Copilot
npm run agent:copilot:grid     # grid task with Copilot
npm run agent:gemini           # all tasks with Gemini
npm run agent:gemini:theming   # theming task with Gemini
```

## Agent Configuration

Agent settings are stored in `eval-config.json`:

```json
{
  "defaultAgent": "copilot",
  "agents": {
    "copilot": {
      "command": "copilot",
      "installCommand": "npm install -g @github/copilot",
      "promptArgs": ["-p"],
      "autoApproveArgs": ["--yes"],
      "envAuth": "GITHUB_TOKEN"
    },
    "gemini": {
      "command": "gemini",
      "installCommand": "npm install -g @google/gemini-cli",
      "promptArgs": ["-p"],
      "autoApproveArgs": ["--sandbox"],
      "envAuth": "GEMINI_API_KEY"
    }
  },
  "trialCount": 1,
  "timeoutSec": 600
}
```

You can customize the agent command, flags, and timeouts by editing this file.
To switch the default agent, change `defaultAgent`.

## Adding a New Task

1. Create a directory under `evals/tasks/<task-id>/` with the standard structure:

   ```
   tasks/<task-id>/
   ├── task.toml               # Config: grader metadata, weights, timeouts
   ├── instruction.md          # Agent prompt
   ├── environment/Dockerfile  # Container setup (for future Docker-based runs)
   ├── tests/test.sh           # Deterministic grader
   ├── prompts/quality.md      # LLM rubric grader
   ├── solution/solve.sh       # Reference solution
   └── skills/                 # Skill files under test
       └── <skill-name>/SKILL.md
   ```

2. Write a clear, unambiguous `instruction.md` that tells the agent exactly what
   to build.

3. Write `tests/test.sh` to check **outcomes** (files exist, correct selectors
   and entry-point imports are present, correct API call ordering) rather than
   specific steps. The grader must write a reward (0.0–1.0) to
   `logs/verifier/reward.txt`.

4. Write `prompts/quality.md` with rubric dimensions that sum to 1.0.

5. Write `solution/solve.sh` — a shell script that proves the task is solvable
   and validates that the graders work correctly.

6. Validate graders before submitting:

   ```bash
   bash run-eval.sh <task-id> --validate
   ```

7. Test against at least one agent:

   ```bash
   bash run-eval.sh <task-id> --agent copilot
   ```

## Pass / Fail Thresholds

Following [Anthropic's recommendations](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents):

| Metric | Threshold | Effect |
|---|---|---|
| `pass@k ≥ 80%` | **Merge gate** | At least 1 success in k trials required |
| `pass@k ≥ 60%` | **Tracked** | Flags flaky skills for investigation |
| `pass@k < 60%` | **Blocks merge** | On PRs touching the relevant skill |

## CI Integration

The GitHub Actions workflow at `.github/workflows/skill-eval.yml` runs
both on PRs (that modify `skills/**` or `evals/**`) and via manual
`workflow_dispatch`. Every run executes three parallel jobs:

1. **Grader validation** — applies reference solutions, verifies graders score 100%
2. **Copilot agent eval** — installs `@github/copilot`, runs all tasks against Copilot CLI
3. **Gemini agent eval** — installs `@google/gemini-cli`, runs all tasks against Gemini CLI

A fourth summary job collects results from all three and posts a combined
PR comment showing pass rates per task per agent.

**Secrets required:**
- `GITHUB_TOKEN` — automatically available (for Copilot)
- `GEMINI_API_KEY` — must be added as a repository secret (for Gemini)

## Grading Strategy

**Deterministic grader (60% weight)** — checks:
- Expected component files exist
- Correct Ignite UI selector is present in the generated template
- Required entry-point imports exist (not root barrel)
- No use of forbidden alternatives
- Correct API call ordering (e.g. `core()` before `theme()`)

**LLM rubric grader (40% weight)** — evaluates:
- Correct intent routing
- Idiomatic API usage
- Absence of hallucinated APIs
- Following the skill's guidance

## Results

Baseline results are stored in `evals/results/baseline.json` and used for
regression comparison on PRs. The CI workflow uploads per-run results as
GitHub Actions artifacts.

Agent-based results are suffixed with the agent name (e.g.,
`grid-basic-setup-copilot.json`) to distinguish them from reference
validation results.
