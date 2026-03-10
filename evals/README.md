# Ignite UI for Angular — Skill Evals

Automated evaluation suite for the Ignite UI for Angular agent skills.
Inspired by the [skill-eval](https://github.com/mgechev/skill-eval) reference
architecture and extended with patterns from
[Anthropic's agent eval research](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents).

The infrastructure is **self-contained** — there are no external eval-framework
dependencies. A lightweight shell runner (`run-eval.sh`) executes each task's
reference solution and deterministic grader.

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

### npm scripts (convenience wrappers)

```bash
cd evals
npm run validate               # all tasks
npm run validate:grid          # grid-basic-setup only
npm run validate:combo         # component-combo-reactive-form only
npm run validate:theming       # theming-palette-generation only
```

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
2. Validates all graders against their reference solutions
3. Uploads results as an artifact
4. Posts a summary comment on the PR

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
