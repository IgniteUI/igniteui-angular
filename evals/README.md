# Ignite UI for Angular — Skill Evals

Automated evaluation suite for the Ignite UI for Angular agent skills. Uses the
[skill-eval](https://github.com/mgechev/skill-eval) framework to measure skill
quality, detect regressions, and gate merges.

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
- **`skills/`** — symlinked or copied skill files under test

## Prerequisites

- Node.js 20+
- Docker (for isolated agent execution)
- An API key for the agent provider (Gemini or Anthropic)

## Running Evals Locally

### Install dependencies

```bash
cd evals
npm install
```

### Run a single task

```bash
# Gemini (default)
GEMINI_API_KEY=your-key npm run eval -- grid-basic-setup

# Claude
ANTHROPIC_API_KEY=your-key npm run eval -- grid-basic-setup --agent=claude
```

### Run all tasks

```bash
GEMINI_API_KEY=your-key npm run eval:all
```

### Options

```bash
# Adjust trials (default: 5)
npm run eval -- grid-basic-setup --trials=5

# Run locally without Docker
npm run eval -- grid-basic-setup --provider=local

# Validate graders against the reference solution
npm run eval -- grid-basic-setup --validate --provider=local

# Run multiple trials in parallel
npm run eval -- grid-basic-setup --parallel=3
```

### Preview results

```bash
# CLI report
npm run preview

# Web UI at http://localhost:3847
npm run preview:browser
```

## Adding a New Task

1. Create a directory under `evals/tasks/<task-id>/` with the standard structure:

   ```
   tasks/<task-id>/
   ├── task.toml               # Config: graders, timeouts, resource limits
   ├── instruction.md          # Agent prompt
   ├── environment/Dockerfile  # Container setup
   ├── tests/test.sh           # Deterministic grader
   ├── prompts/quality.md      # LLM rubric grader
   ├── solution/solve.sh       # Reference solution
   └── skills/                 # Skill files under test
       └── <skill-name>/SKILL.md
   ```

2. Write a clear, unambiguous `instruction.md` that tells the agent exactly what
   to build.

3. Write `tests/test.sh` to check **outcomes** (files exist, project compiles,
   correct selectors are present) rather than specific steps.

4. Write `prompts/quality.md` with rubric dimensions that sum to 1.0.

5. Write `solution/solve.sh` — a shell script that proves the task is solvable
   and validates that the graders work correctly.

6. Validate graders before submitting:

   ```bash
   npm run eval -- <task-id> --validate --provider=local
   ```

## Pass / Fail Thresholds

Following [Anthropic's recommendations](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents):

| Metric | Threshold | Effect |
|---|---|---|
| `pass@5 ≥ 80%` | **Merge gate** | At least 1 success in 5 trials required |
| `pass^5 ≥ 60%` | **Tracked** | Flags flaky skills for investigation |
| `pass@5 < 60%` | **Blocks merge** | On PRs touching the relevant skill |

## CI Integration

The GitHub Actions workflow at `.github/workflows/skill-eval.yml` runs
automatically on PRs that modify `skills/**` or `evals/**`. It:

1. Checks out the repo
2. Installs eval dependencies
3. Runs all tasks with 5 trials
4. Uploads results as an artifact
5. Posts a summary comment on the PR

## Grading Strategy

**Deterministic grader (60% weight)** — checks:
- Project builds without errors
- Correct Ignite UI selector is present in the generated template
- Required imports exist
- No use of forbidden alternatives

**LLM rubric grader (40% weight)** — evaluates:
- Correct intent routing
- Idiomatic API usage
- Absence of hallucinated APIs
- Following the skill's guidance

## Results

Baseline results are stored in `evals/results/baseline.json` and used for
regression comparison on PRs. The CI workflow uploads per-run results as
GitHub Actions artifacts.
