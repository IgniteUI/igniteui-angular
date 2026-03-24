---
name: igniteui-angular-testing
description: "Quick-reference for running Ignite UI for Angular test suites. Covers the full test run (`test:lib`), grid-specific suites (grid, tree-grid, hierarchical-grid, pivot-grid), non-grid tests, watch mode, and auxiliary test suites (schematics, styles, i18n). Use when an agent needs to run, select, or understand the test infrastructure. Do NOT use for building — use igniteui-angular-build instead. Do NOT use for linting — use igniteui-angular-linting instead."
user-invocable: true
---

# Ignite UI for Angular — Testing

Quick-reference card for the core test commands for the main igniteui-angular library plus schematics, styles, and i18n suites.

## Prerequisites

- Run `npm install` at the repo root.
- For schematics tests: run `npm run build:schematics` and `npm run build:migrations` first.

## Test Runner

- **Karma + Jasmine** for all library unit tests.
- Karma configs live in `projects/igniteui-angular/karma*.conf.js`.
- Coverage reports are written to `coverage/`.

## Choosing the Right Command

| Scenario | Command |
|---|---|
| **All library tests** (slow — runs everything) | `npm run test:lib` |
| **Flat grid tests** only | `npm run test:lib:grid` |
| **Tree grid tests** only | `npm run test:lib:tgrid` |
| **Hierarchical grid tests** only | `npm run test:lib:hgrid` |
| **Pivot grid tests** only | `npm run test:lib:pgrid` |
| **All non-grid tests** (components, directives, services) | `npm run test:lib:others` |
| **Watch mode** (re-runs on file changes, for dev loop) | `npm run test:lib:watch` |
| **Schematics + migrations** | `npm run test:schematics` |
| **Sass/style logic** | `npm run test:styles` |
| **i18n resource validation** | `npm run test:i18n` |

### Decision Guide

1. **Working on a grid component?** → Use the matching grid command (`test:lib:grid`, `test:lib:tgrid`, `test:lib:hgrid`, or `test:lib:pgrid`).
2. **Working on a non-grid component or directive?** → Use `test:lib:others`.
3. **Iterating quickly during development?** → Use `test:lib:watch`.
4. **Edited a migration or schematic?** → Build first (`build:schematics` / `build:migrations`), then `test:schematics`.
5. **Changed Sass theme logic?** → Use `test:styles`.
6. **Changed i18n resource strings?** → Use `test:i18n`.
7. **Final verification before marking work complete?** → Use `test:lib` (full suite).

## Karma Configs

| Config file | Used by |
|---|---|
| `karma.conf.js` | `test:lib` (all tests) |
| `karma.grid.conf.js` | `test:lib:grid` |
| `karma.tree-grid.conf.js` | `test:lib:tgrid` |
| `karma.hierarchical-grid.conf.js` | `test:lib:hgrid` |
| `karma.pivot-grid.conf.js` | `test:lib:pgrid` |
| `karma.non-grid.conf.js` | `test:lib:others` |
| `karma.watch.conf.js` | `test:lib:watch` |
| `karma.test-perf.conf.js` | `test:lib:perf` (performance) |

All configs are in `projects/igniteui-angular/`.

## Key Paths

| Path | Purpose |
|---|---|
| `projects/igniteui-angular/test-utils/` | Shared test helpers and utilities |
| `projects/igniteui-angular/src/test.ts` | Karma test entry point |
| `coverage/` | Code coverage output |

## Related Skills

- [`igniteui-angular-build`](../igniteui-angular-build/SKILL.md) — Building the library
- [`igniteui-angular-linting`](../igniteui-angular-linting/SKILL.md) — Linting code and styles
