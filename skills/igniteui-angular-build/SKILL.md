---
name: igniteui-angular-build
description: "Quick-reference for building the core Ignite UI for Angular library and related packages. Covers the full production build (`build:lib`), individual partial builds (styles, migrations, schematics, i18n, elements), and the combined build-all command. Use when an agent needs to compile the library, produce a dist output, or verify that code changes compile cleanly. Do NOT use for running tests — use igniteui-angular-testing instead. Do NOT use for linting — use igniteui-angular-linting instead."
user-invocable: true
---

# Ignite UI for Angular — Build

Quick-reference card for the core library and related build commands in this repository.

## Prerequisites

- Run `npm install` at the repo root before any build command.

## Full Build

```bash
npm run build
```

Runs all sub-builds in sequence (library, elements, schematics, migrations, i18n). Use this when you need a complete publishable output or before running the full CI pipeline locally. Check `package.json` for the exact sequence.

## Library Build (most common)

```bash
npm run build:lib
```

This is the primary build command. It does two things:

1. `ng build igniteui-angular --configuration production` — compiles the library with ng-packagr using Angular Package Format. Uses `ng-package.prod.json` (production config).
2. `npm run build:styles` — runs `node scripts/build-styles.mjs` to compile and bundle Sass themes into distributable CSS.

**Output**: `dist/igniteui-angular/`

### When to use `build:lib`

- After implementing a feature or fix, to verify the code compiles.
- Before checking that new public symbols are correctly exported.
- When another project needs to consume a local build of the library.

## Partial Builds

| Command | What it does |
|---|---|
| `npm run build:styles` | Compiles Sass themes only (`scripts/build-styles.mjs`). Already included in `build:lib`. |
| `npm run build:schematics` | Copies and compiles `ng add` schematics (`projects/igniteui-angular/schematics/`). |
| `npm run build:migrations` | Copies and compiles `ng update` migration schematics (`projects/igniteui-angular/migrations/`). |
| `npm run build:i18n` | Compiles the i18n package (`projects/igniteui-angular-i18n/`). |
| `npm run build:elements` | Builds the Angular Elements package + bundling + style copy. |
| `npm run build:docs` | Generates TypeDoc + SassDoc documentation. |

### When to use partial builds

- **`build:schematics`** — after editing files under `projects/igniteui-angular/schematics/`.
- **`build:migrations`** — after editing files under `projects/igniteui-angular/migrations/`. Required before running `test:schematics`.
- **`build:i18n`** — after changing i18n resource strings.
- **`build:elements`** — when working on the Angular Elements wrapper.

## Key Paths

| Path | Purpose |
|---|---|
| `projects/igniteui-angular/` | Library source root |
| `projects/igniteui-angular/ng-package.prod.json` | Production ng-packagr config |
| `projects/igniteui-angular/ng-package.json` | Dev ng-packagr config (preserves dest) |
| `dist/igniteui-angular/` | Build output |
| `scripts/build-styles.mjs` | Sass theme compilation script |

## Related Skills

- [`igniteui-angular-testing`](../igniteui-angular-testing/SKILL.md) — Running tests
- [`igniteui-angular-linting`](../igniteui-angular-linting/SKILL.md) — Linting code and styles
