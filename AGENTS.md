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

```
.github/                           ← contributing docs, templates, workflows, Copilot instructions
cypress/                           ← repository-level Cypress setup/tests
projects/
  bundle-test/                     ← auxiliary bundle test project
  igniteui-angular/                ← main Angular component library
    <component>/                   ← component entry points (accordion, combo, slider, etc.)
    core/                          ← shared core code, styles, and related infrastructure
    cypress/                       ← library-scoped Cypress tests/assets
    grids/                         ← grid-related library area
    migrations/                    ← `ng update` migrations
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
CHANGELOG.md                       ← release notes
css-naming-convention.md           ← CSS naming rules
```

## Coding Conventions

[`.github/copilot-instructions.md`](.github/copilot-instructions.md) for full Ignite UI Angular coding standards.

## Working Rules

### Always

- Reuse existing repository patterns before introducing new abstractions.
- Read existing source and tests before editing.
- Run `npm run lint:lib` and the relevant test suite before considering work complete.
- Export new public symbols from `<component>/index.ts`.
- Keep accessibility intact: ARIA, keyboard navigation, focus behavior, and screen reader semantics.
- Keep i18n intact when user-facing text changes.
- Add JSDoc with `@param`, `@returns`, and `@example` on every new public member.
- Add or update `ng update` migrations for true breaking changes such as removals, renames, moved entry points, selector changes, or incompatible default-behavior changes.
- Update the component `README.md` when the public API surface changes.
- Update relevant Agent skills if a change is significant and/or you need to tell other agents how to use the newly introduced feature.
- Consider demo/sample updates in `src/app/` only for explicitly requested user-visible changes.
- Update `CHANGELOG.md` for new features, deprecations, breaking changes, and notable user-visible fixes when they fit the existing changelog section structure.

### Never

- Skip steps in the implementation. 
- Commit secrets, tokens, or credentials.
- Introduce `eval()` or dynamic code execution.
- Modify `package.json`, `package-lock.json`, or any other dependency manifest or lock file. If a dependency change appears truly necessary, ask for approval first. Never commit `package-lock.json` unless you have been explicitly approved to introduce a new dependency — committing unintended lock file changes can break builds.

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

## Custom Agents

Feature implementation is handled by a set of specialized agents in `.github/agents/`:

| Agent | File | Purpose |
|---|---|---|
| `feature-orchestrator-agent` | `feature-orchestrator-agent.md` | Orchestrates end-to-end feature implementation via TDD |
| `bug-fixing-orchestrator-agent` | `bug-fixing-orchestrator-agent.md` | Orchestrates end-to-end bug fixing via TDD |
| `tdd-test-writer-agent` | `tdd-test-writer-agent.md` | Writes failing tests (RED phase) for features and bug fixes |
| `feature-implementer-agent` | `feature-implementer-agent.md` | Implements features and refactors (GREEN + REFACTOR phases) |
| `bug-fixing-implementer-agent` | `bug-fixing-implementer-agent.md` | Implements the minimum bug fix (GREEN phase) |
| `theming-styles-agent` | `theming-styles-agent.md` | Implements component theming, structural SCSS, theme wiring, and style validation |
| `demo-sample-agent` | `demo-sample-agent.md` | Updates existing demo/sample areas in `src/app/` when a demo is explicitly requested for a user-visible feature or bug fix |
| `component-readme-agent` | `component-readme-agent.md` | Updates affected component `README.md` files for public API and documented behavior changes |
| `migration-agent` | `migration-agent.md` | Creates `ng update` migration schematics for breaking changes |
| `changelog-agent` | `changelog-agent.md` | Updates `CHANGELOG.md` following repo conventions |

Feature and bug orchestrators route work in this order:
TDD → implementer → README (if needed) → migration (if breaking) → changelog (if needed).

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
