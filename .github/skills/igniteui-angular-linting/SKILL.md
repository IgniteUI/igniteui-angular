---
name: igniteui-angular-linting
description: "Quick-reference for linting the core Ignite UI for Angular library. Covers the combined lint command (`lint:lib`), ESLint for TypeScript and templates, and Stylelint for Sass/SCSS styles. Use when an agent needs to run the main linters, fix lint errors, or understand the primary lint configuration. Do NOT use for building — use igniteui-angular-build instead. Do NOT use for running tests — use igniteui-angular-testing instead."
user-invocable: true
---

# Ignite UI for Angular — Linting

Quick-reference card for the core lint commands for the main library in this repository.

## Prerequisites

- Run `npm install` at the repo root.

## Commands

| Command | What it runs |
|---|---|
| `npm run lint:lib` | ESLint **+** Stylelint (both — use this as the default) |
| `npm run lint:styles` | Stylelint only (Sass/SCSS files) |
| `npm run lint` | `ng lint` — ESLint only (TypeScript + templates) |

### `lint:lib` (recommended)

```bash
npm run lint:lib
```

This is the combined command and the one agents should run before considering work complete. It executes:

1. `ng lint` — ESLint on TypeScript source and Angular templates, using the config at `projects/igniteui-angular/eslint.config.mjs`.
2. `npm run lint:styles` — Stylelint on Sass files under `projects/igniteui-angular/core/src/core/styles`.

### Lint Styles Only

```bash
npm run lint:styles
```

Runs `stylelint "projects/igniteui-angular/core/src/core/styles"`. Use when you only changed SCSS/Sass and want a faster check.

## Configuration Files

| File | Purpose |
|---|---|
| `eslint.config.mjs` (repo root) | Root ESLint config |
| `projects/igniteui-angular/eslint.config.mjs` | Library-specific ESLint config (referenced in `angular.json`) |
| Stylelint config | Resolved from the repo root (check `package.json` or `.stylelintrc` for the active config) |

## Agent Rules

- **Always run `npm run lint:lib` before marking work complete** — this is a requirement from [AGENTS.md](../../../AGENTS.md).
- Fix all lint errors before committing. Do not disable rules without justification.
- If a lint rule conflicts with the intended change, investigate whether the rule is correct before suppressing it.

## Related Skills

- [`igniteui-angular-build`](../igniteui-angular-build/SKILL.md) — Building the library
- [`igniteui-angular-testing`](../igniteui-angular-testing/SKILL.md) — Running tests
