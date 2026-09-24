# Project Context

Concise context for ACS-aware tools. The authoritative working rules live in
[`AGENTS.md`](../../AGENTS.md) and the full coding standards in
[`.github/copilot-instructions.md`](../../.github/copilot-instructions.md).
Read both before making changes; if they disagree with this file, they win.

## Stack

- Language: TypeScript
- Framework: Angular 21+
- Tests: Karma + Jasmine (targeted `karma*.conf.js` configs per suite)
- Packaging: ng-packagr, Angular Package Format with multiple entry points
- Styles: Sass themes built on `igniteui-theming`

## Architecture

- `projects/igniteui-angular/<component>/`: component entry points; public API is exported from `<component>/index.ts`
- `projects/igniteui-angular/core/`: shared core code and theme infrastructure (`src/core/styles/`)
- `projects/igniteui-angular/grids/`: grid, tree grid, hierarchical grid, pivot grid
- `projects/igniteui-angular/migrations/`: `ng update` migrations, registered in `migration-collection.json`
- `projects/igniteui-angular/schematics/`: `ng add` schematics
- `projects/igniteui-angular-elements/`, `projects/igniteui-angular-i18n/`: Angular Elements and i18n packages
- `src/app/`: demo application
- `skills/`: public, user-facing skills that ship with the package
- `.agents/`: contributor-facing agents, internal skills, and this context

## Workflow

TDD first (failing test), then implementation, then theming/styles follow-through,
demo update (only if requested), component README, migration (breaking changes only),
and `CHANGELOG.md`. Route work through the agents in `.agents/agents/`; see
[`.agents/README.md`](../README.md).

Use the internal skills instead of guessing:

- Build: [`.agents/skills/igniteui-angular-build`](../skills/igniteui-angular-build/SKILL.md)
- Testing: [`.agents/skills/igniteui-angular-testing`](../skills/igniteui-angular-testing/SKILL.md)
- Linting: [`.agents/skills/igniteui-angular-linting`](../skills/igniteui-angular-linting/SKILL.md)
- Skill authoring: [`.agents/skills/igniteui-angular-skill-authoring`](../skills/igniteui-angular-skill-authoring/SKILL.md)

Before finishing, run the smallest relevant test suite and `npm run lint:lib`.

## Do not change without explicit instruction

- `package.json`, `package-lock.json`, or any other dependency manifest or lock file
- Public API names, selectors, or entry points without a migration plan
- A new component entry point (confirm naming and placement first)
