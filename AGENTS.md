# AGENTS.md — Ignite UI for Angular

This file defines repository-wide guidance for AI agents working in Ignite UI for Angular.

## Project Overview

Ignite UI for Angular is a comprehensive UI component library built on the Angular framework.

- **Language**: TypeScript
- **Framework**: Angular 21+
- **Test runner**: Karma + Jasmine
- **Package format**: Angular Package Format with multiple entry points
- **Build**: ng-packagr

## Repository Structure

```text
.github/                           ← contributing docs, agent docs, templates, workflows, Copilot instructions
  agents/                          ← custom agent definitions and handoff workflows
  copilot-instructions.md          ← repository coding standards and AI-specific guidance
cypress/                           ← repository-level Cypress setup/tests
projects/
  bundle-test/                     ← auxiliary bundle test project
  igniteui-angular/                ← main Angular component library
    <component>/                   ← component entry points (accordion, combo, slider, etc.)
    core/                          ← shared core code, styles, and related infrastructure
      src/core/styles/             ← shared Sass theme infrastructure used by theming/style work
    cypress/                       ← library-scoped Cypress tests/assets
    directives/                    ← shared directives and directive-level documentation areas
    grids/                         ← grid-related library area
    migrations/                    ← `ng update` migrations
      common/                      ← shared migration utilities
      migration-collection.json    ← registered migration entry points
    schematics/                    ← `ng add` / schematics
    src/                           ← shared library sources
    test-utils/                    ← shared test helpers
    karma*.conf.js                 ← targeted Karma configs for different suites
  igniteui-angular-elements/       ← Angular Elements package/project
  igniteui-angular-i18n/           ← i18n package/resources
  igniteui-angular-performance/    ← performance-focused project
scripts/                           ← build, docs, packaging, and style scripts
skills/                            ← AI skill guides for components, grids, and theming
src/app/                           ← demo application
  <component>/                     ← existing demo/sample areas reused for user-visible changes
CHANGELOG.md                       ← release notes
SECURITY.md                        ← supported-version policy for multi-branch bug fixes
css-naming-convention.md           ← CSS naming rules
```

## Coding Conventions

[`.github/copilot-instructions.md`](.github/copilot-instructions.md) for full Ignite UI Angular coding standards.

## Working Rules

### Always

- Reuse existing repository patterns before introducing new abstractions.
- Read the original request, existing source, and existing tests before editing.
- Read the relevant skill file before modifying component code.
- If a skill points to reference files, read the relevant reference files before editing.
- If the task changes behavior or fixes a bug, write or update failing tests before production code.
- Reuse the existing spec structure whenever possible.
- Run the smallest relevant test suite and `npm run lint:lib` before considering work complete.
- Run additional checks when applicable, such as `npm run lint:styles`, `npm run test:styles`, `npm run test:schematics`, `npm run build:migrations`, or i18n-specific checks.
- Export new public symbols from `<component>/index.ts`.
- Keep accessibility intact: ARIA, keyboard navigation, focus behavior, and screen reader semantics.
- Keep i18n intact when user-facing text changes.
- Add JSDoc with `@param`, `@returns`, and `@example` on every new public member.
- Treat SCSS, theme wiring, and style-test work as dedicated theming/styles follow-through, and validate it with the relevant style checks when needed.
- Add or update `ng update` migrations for true breaking changes such as removals, renames, moved entry points, selector changes, or incompatible default-behavior changes.
- Update the component `README.md` when public API, documented usage, or documented behavior changes, including new features, renamed or deprecated API, and behavior changes.
- Consider demo/sample updates in `src/app/` only for explicitly requested user-visible changes.
- Update `CHANGELOG.md` for new features, deprecations, breaking changes, behavioral changes, and notable user-visible fixes when they fit the existing changelog section structure.
- Update relevant Agent skills if a change is significant and/or you need to tell other agents how to use the newly introduced feature.

### Never

- Skip steps in the implementation.
- Commit secrets, tokens, or credentials.
- Introduce `eval()` or dynamic code execution.
- Modify `package.json`, `package-lock.json`, or any other dependency manifest or lock file. If a dependency change appears truly necessary, ask for approval first. Never commit `package-lock.json` unless you have been explicitly approved to make dependency changes — committing unintended lock file changes can break builds.

### Ask First

- Before adding a new component entry point — confirm naming and placement.
- Before introducing a breaking rename/removal without a migration plan.
- Before creating a migration schematic — confirm the change is truly breaking.

## Commands

| Action | Command |
|---|---|
| Install | `npm install` |
| Start demos | `npm start` |
| Lint (code + styles) | `npm run lint:lib` |
| Lint styles only | `npm run lint:styles` |
| Build library | `npm run build:lib` |
| Build migrations | `npm run build:migrations` |
| Build schematics | `npm run build:schematics` |
| Build i18n | `npm run build:i18n` |
| All tests | `npm run test:lib` |
| Non-grid tests | `npm run test:lib:others` |
| Grid tests | `npm run test:lib:grid` |
| Tree-grid tests | `npm run test:lib:tgrid` |
| Hierarchical-grid tests | `npm run test:lib:hgrid` |
| Pivot-grid tests | `npm run test:lib:pgrid` |
| Schematics tests | `npm run test:schematics` |
| i18n tests | `npm run test:i18n` |
| Style tests | `npm run test:styles` |

## Skills

Domain-specific knowledge for AI assistants:

| Skill | Path | Use when |
|---|---|---|
| Components | [`skills/igniteui-angular-components/SKILL.md`](skills/igniteui-angular-components/SKILL.md) | Working on non-grid UI components, charts |
| Grids | [`skills/igniteui-angular-grids/SKILL.md`](skills/igniteui-angular-grids/SKILL.md) | Working on grid, tree-grid, hierarchical-grid, pivot-grid |
| Theming | [`skills/igniteui-angular-theming/SKILL.md`](skills/igniteui-angular-theming/SKILL.md) | Working on styles, themes, palettes |
| Build | [`.github/skills/igniteui-angular-build/SKILL.md`](.github/skills/igniteui-angular-build/SKILL.md) | Building the library, producing dist output, compiling migrations/schematics |
| Testing | [`.github/skills/igniteui-angular-testing/SKILL.md`](.github/skills/igniteui-angular-testing/SKILL.md) | Running test suites, choosing the right Karma config |
| Linting | [`.github/skills/igniteui-angular-linting/SKILL.md`](.github/skills/igniteui-angular-linting/SKILL.md) | Running ESLint and Stylelint, fixing lint errors |

## Custom Agents

The repository provides a set of agents in `.github/agents/`. Orchestrators analyze requests, define scope, and route work to the right specialists; they do not implement code directly. Specialists handle focused implementation and follow-through tasks.

| Agent | Role | File | Use it for |
|---|---|---|---|
| `feature-orchestrator-agent` | Orchestrator | `feature-orchestrator-agent.md` | Analyzing feature requests, defining scope, deciding which specialists are needed, and routing the work. Does not implement code directly. |
| `bug-fixing-orchestrator-agent` | Orchestrator | `bug-fixing-orchestrator-agent.md` | Analyzing bug reports, confirming likely scope and root-cause direction, deciding which specialists are needed, and routing the work. Does not implement code directly. |
| `tdd-test-writer-agent` | Specialist | `tdd-test-writer-agent.md` | Writing small failing tests before production code for features and bug fixes |
| `feature-implementer-agent` | Specialist | `feature-implementer-agent.md` | Implementing a feature or feature-side refactor after scope and tests are clear |
| `bug-fixing-implementer-agent` | Specialist | `bug-fixing-implementer-agent.md` | Implementing the minimum safe bug fix once reproduction and root cause are known |
| `theming-styles-agent` | Specialist | `theming-styles-agent.md` | Component SCSS, theme wiring, structural styles, and style validation |
| `demo-sample-agent` | Specialist | `demo-sample-agent.md` | Updating existing `src/app/` demo/sample areas for explicitly requested user-visible changes |
| `component-readme-agent` | Specialist | `component-readme-agent.md` | Updating affected component `README.md` files when public API or documented behavior changes |
| `migration-agent` | Specialist | `migration-agent.md` | Creating `ng update` migrations for true breaking changes |
| `changelog-agent` | Specialist | `changelog-agent.md` | Updating `CHANGELOG.md` for notable user-visible changes |

These agents are available as specialized helpers for repository work. Select and use the relevant subagent when it adds clarity, specialization, or better task separation, but do not treat subagent use as mandatory — an agent may decide to handle the work directly as long as it follows the same repository workflow, standards, and validation steps.

## Workflow

### Standard default flow

TDD (write or update failing tests first) → feature implementation or bug-fix implementation → theming/styles follow-through (only when the change affects SCSS, theme wiring, or style-test validation) → demo/sample update (only if explicitly requested) → component README update (when needed) → migration (for breaking changes) → changelog update (when needed).

## Commit Message Conventions

When creating or suggesting a commit message, follow this format:

`<type>(<scope>): <subject>`

Allowed `<type>` values:
- `feat` — new feature
- `fix` — bug fix
- `test` — tests added or updated
- `docs` — documentation only
- `refactor` — code change without fixing a bug or adding a feature
- `perf` — performance improvement
- `style` — formatting or style-only changes with no logic change
- `chore` — maintenance, tooling, or housekeeping work
- `ci` — CI/CD or workflow changes

Rules:
- Use a clear subject with at least 15 characters.
- Keep each line within 80 characters.
- If the scope is unclear, use `(*)`.
- Use the current component, directive, service, or area as the scope when possible.
