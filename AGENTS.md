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
- Add or update ng update migrations for breaking changes.
- Update the component `README.md` when the public API surface changes.
- Consider demo/sample updates in `src/app/` for user-visible changes.
- Update `CHANGELOG.md` for every new feature, deprecation, or breaking change.

### Never

- Skip steps in the implementation. 
- Commit secrets, tokens, or credentials.
- Introduce `eval()` or dynamic code execution.

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
| `component-readme-agent` | `component-readme-agent.md` | Updates affected component `README.md` files for public API and documented behavior changes |
| `migration-agent` | `migration-agent.md` | Creates `ng update` migration schematics for breaking changes |
| `changelog-agent` | `changelog-agent.md` | Updates `CHANGELOG.md` following repo conventions |

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
