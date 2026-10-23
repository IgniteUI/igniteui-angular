---
name: igniteui-angular-testing
description: "Quick-reference for running Ignite UI for Angular test suites. Covers the full library run (`test:lib`) on Vitest browser mode through the Angular unit-test builder, running a subset with `--include`/`--filter`, watch mode, extras/elements suites, and auxiliary suites (schematics, styles, i18n). WHEN TO USE: running, selecting, or understanding the test infrastructure. WHEN NOT TO USE: building (use igniteui-angular-build) or linting (use igniteui-angular-linting)."
license: MIT
user-invocable: true
---

# Ignite UI for Angular — Testing

Quick-reference card for the core test commands for the main igniteui-angular library plus extras, elements, schematics, styles, and i18n suites.

## Prerequisites

- Run `npm install` at the repo root.
- Install the Playwright browser once: `npx playwright install chromium` (CI runs `npx playwright install`). Vitest launches Playwright's own Chromium, so no system Chrome is needed. Leave `CHROME_BIN` unset (a Karma-era leftover): the unit-test builder passes it to Playwright as the Chromium executable when present.
- Headless vs. headed: `test:lib` passes `--browsers=chromiumHeadless`; a plain `ng test` uses the `chromium` default from `angular.json` (headed locally, headless when `CI` is set). Add `--browsers=chromiumHeadless` on machines without a display.
- The `test:lib*`, `test:extras*`, and `test:elements*` scripts run `npm run build:styles:components` first. When you call `ng test` directly, run that script once beforehand (and again after component SCSS changes).
- Schematics tests normally run from source and do not require a build first. Only run `npm run build:schematics` and `npm run build:migrations` when you specifically want to validate the compiled schematics or migrations output.

## Test Runner

Every test suite runs on **Vitest**: browser mode for component tests, Node for schematics/migrations and Sass style tests.

- **Browser tests:** every Angular project (`igniteui-angular`, `igniteui-angular-extras`, `igniteui-angular-elements`, `igniteui-dev-demos`, `bundle-test`, `igniteui-angular-performance`) runs on **Vitest in browser mode** (Playwright Chromium) through the `@angular/build:unit-test` builder in `angular.json`.
- The main library runner config is `projects/igniteui-angular/vitest.config.ts`; it injects the compiled theme CSS, aliases `fflate`, and sets `restoreMocks` and the viewport. Extras reuses it.
- Specs import `describe`, `it`, `expect`, `vi`, etc. explicitly from `'vitest'`.
- Tests must not depend on zone.js: no `fakeAsync`, `tick`, or `waitForAsync`. Use `async`/`await` with `fixture.whenStable()`, the `wait()` helper, or `vi.useFakeTimers()`.
- **Node tests:** schematics/migrations specs (`projects/igniteui-angular/{migrations,schematics}/**/*.spec.ts`) and the sass-true style tests (`projects/igniteui-angular/core/src/core/styles/spec/`) also run on Vitest, in Node instead of a browser.
- Coverage reports are written to `coverage/`.

## Choosing the Right Command

| Scenario | Command |
|---|---|
| **All library tests** (slow — runs everything) | `npm run test:lib` |
| **One component or area** | `ng test igniteui-angular --no-watch --include '<glob>'` |
| **Tests matching a name** | `ng test igniteui-angular --no-watch --filter '<regex>'` |
| **Watch mode** (re-runs on file changes, for dev loop) | `npm run test:lib:watch` |
| **Library coverage run** | `npm run test:coverage` |
| **Extras package** | `npm run test:extras` |
| **Elements package** | `npm run test:elements` |
| **Schematics + migrations** | `npm run test:schematics` |
| **Sass/style logic** | `npm run test:styles` |
| **i18n resource validation** | `npm run test:i18n` |

### Running a Subset

`--include` takes a glob (repeatable) and replaces the old per-suite scripts:

| Area | `--include` glob |
|---|---|
| Flat grid | `'projects/igniteui-angular/grids/grid/**/*.spec.ts'` |
| Tree grid | `'projects/igniteui-angular/grids/tree-grid/**/*.spec.ts'` |
| Hierarchical grid | `'projects/igniteui-angular/grids/hierarchical-grid/**/*.spec.ts'` |
| Pivot grid | `'projects/igniteui-angular/grids/pivot-grid/**/*.spec.ts'` |
| A single component | `'projects/igniteui-angular/<component>/**/*.spec.ts'` |
| A single spec file | `'projects/igniteui-angular/slider/src/slider/slider.component.spec.ts'` |

Example:

```bash
npm run build:styles:components
ng test igniteui-angular --no-watch --include 'projects/igniteui-angular/grids/grid/**/*.spec.ts'
```

Combine `--include` with `--filter '<regex>'` to narrow further by suite or test name, e.g. the grid performance specs: `--include 'projects/igniteui-angular/grids/grid/**/*.spec.ts' --filter '#perf'`.

### Decision Guide

1. **Working on a grid component?** → Use `--include` with the matching grid glob.
2. **Working on a non-grid component or directive?** → Use `--include` with that component's or directive's folder.
3. **Iterating quickly during development?** → Use `test:lib:watch`, optionally with `-- --include '<glob>'`.
4. **Edited a migration or schematic?** → Use `test:schematics`. Build first only if you also need to validate compiled output.
5. **Changed Sass theme logic?** → Use `test:styles`.
6. **Changed i18n resource strings?** → Use `test:i18n`.
7. **Changed `igniteui-angular-extras` or `igniteui-angular-elements`?** → Use `test:extras` or `test:elements`.
8. **Final verification before marking work complete?** → Use `test:lib` (full suite).

## Key Paths

| Path | Purpose |
|---|---|
| `angular.json` (`test` targets) | `@angular/build:unit-test` options per project (browsers, includes/excludes, coverage, runner config) |
| `projects/igniteui-angular/vitest.config.ts` | Vitest runner config for the library (also used by extras) |
| `projects/igniteui-angular/test-utils/` | Shared test helpers and utilities |
| `projects/igniteui-angular/core/src/core/styles/spec/` | Sass style tests |
| `coverage/` | Code coverage output |

## Related Skills

- [`igniteui-angular-build`](../igniteui-angular-build/SKILL.md) — Building the library
- [`igniteui-angular-linting`](../igniteui-angular-linting/SKILL.md) — Linting code and styles
