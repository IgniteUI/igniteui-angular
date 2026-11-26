# AGENTS.md — Ignite UI for Angular

This file defines repository-wide guidance for AI agents working in Ignite UI for Angular.

## Project Overview

Ignite UI for Angular is a comprehensive UI component library built on the Angular framework.

- **Language**: TypeScript
- **Framework**: Angular 22+
- **Test runner**: Vitest (browser mode with Playwright Chromium via the Angular unit-test builder; Node for schematics, migrations, and Sass style tests)
- **Package format**: Angular Package Format with multiple entry points
- **Build**: ng-packagr

## Repository Structure

```text
.agents/                           ← agent infrastructure (ACS layout)
  main.yaml                        ← ACS manifest: project metadata and active layers
  README.md                        ← agent system guide
  context/project.md               ← concise project context for ACS-aware tools
  agents/                          ← custom agent definitions and handoff workflows
  skills/                          ← internal operational skills (build, testing, linting)
  permissions/policy.yaml          ← agent read/write boundaries
.github/                           ← contributing docs, templates, workflows, Copilot agents and path-specific instructions
  agents/                          ← Copilot pointer files that load the matching `.agents/agents/` definition
  instructions/                    ← path-specific Copilot instructions (`*.instructions.md`)
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
    vitest.config.ts               ← Vitest runner config for library browser tests
  igniteui-angular-elements/       ← Angular Elements package/project
  igniteui-angular-i18n/           ← i18n package/resources
  igniteui-angular-performance/    ← performance-focused project
scripts/                           ← build, docs, packaging, and style scripts
skills/                            ← AI skill guides for components, grids, theming, and image-to-app generation
src/app/                           ← demo application
  <component>/                     ← existing demo/sample areas reused for user-visible changes
CHANGELOG.md                       ← release notes
CLAUDE.md                          ← imports this file (`@AGENTS.md`) for Claude Code
SECURITY.md                        ← supported-version policy for multi-branch bug fixes
css-naming-convention.md           ← CSS naming rules
```

## Coding Conventions

Here is a link to the most recent Angular style guide https://angular.dev/style-guide

Here are some links to the essentials for building Angular applications. Use these to get an understanding of how some of the core functionality works

- https://angular.dev/essentials/components
- https://angular.dev/essentials/signals
- https://angular.dev/essentials/templates
- https://angular.dev/essentials/dependency-injection

### CSS naming convention

See [`css-naming-convention.md`](css-naming-convention.md) for the component CSS class naming rules — CUBE CSS for new/actively-migrated components, BEM for the rest of the existing library.

### TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

### Angular Best Practices

- Use signals for state management
- Implement lazy loading for feature routes
- Use `NgOptimizedImage` for all static images.

### Components

- Keep component logic, styles, and templates in separate `.ts`, `.scss`, and `.html` files. Do NOT use inline templates or inline styles.
- Author component styles in `<name>.component.scss`, but set `styleUrl` to the compiled `<name>.component.css` file (built by `scripts/sass.mjs`), as existing components do.
- New components should have their own entry-point
- Keep components small and focused on a single responsibility
- Use `computed()` for derived state learn more about signals here https://angular.dev/guide/signals.
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer Reactive forms instead of Template-driven ones

### New Code

Apply these conventions to new components, directives, and pipes:

- Always use standalone components over `NgModules`
- Do NOT set `standalone: true` inside the `@Component`, `@Directive` and `@Pipe` decorators
- Use `input()` signal instead of decorators, learn more here https://angular.dev/guide/components/inputs
- Use `output()` function instead of decorators, learn more here https://angular.dev/guide/components/outputs
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Do NOT use `ngClass`, use `class` bindings instead, for context: https://angular.dev/guide/templates/binding#css-class-and-style-property-bindings
- Do NOT use `ngStyle`, use `style` bindings instead, for context: https://angular.dev/guide/templates/binding#css-class-and-style-property-bindings

### Existing Code

- When modifying existing code, including adding members to existing classes or templates, respect established repository patterns and preserve backward compatibility.
- Do NOT migrate existing decorators, inputs, host bindings, or template bindings unless explicitly requested.
- Avoid unrelated refactoring and unintended public API changes.

### State Management

- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

### Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Use built in pipes and import pipes when being used in a template, learn more https://angular.dev/guide/templates/pipes#

### Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

### DOM Events

- Do NOT use `event.target` to identify the element where the event originated; use `event.composedPath()[0]` with an `instanceof` guard (`Element`, or a narrower type such as `HTMLInputElement`) instead, especially before calling `preventDefault()` or `stopPropagation()`. A listener outside a shadow root sees the shadow host as `event.target`.
- Do NOT add an `event.composed ? ... : event.target` fallback; `composedPath()[0]` already equals `event.target` when no shadow boundary is crossed.
- To find an ancestor in the listener's own DOM tree, call `closest()` on `event.target` after an `instanceof Element` guard. `closest()` and `contains()` check DOM containment and cannot cross shadow boundaries.
- To check whether the event passed through an element that may be in another tree (for example, from a `document` listener), use the propagation path: `event.composedPath().includes(element)`, or `event.composedPath().some(node => node instanceof Element && node.matches(selector))` for a selector.
- Resolve elements synchronously in the handler and pass the element, not the event, to throttled, debounced, or asynchronous code. After dispatch, `composedPath()` returns an empty array and `event.target` can be `null`.
- Prefer handlers on the element itself over container listeners that cancel native behavior.
- When a container listener must cancel a default action, cancel it only for the elements that need it (an allowlist), as `preventImplicitSubmission` in `projects/igniteui-angular/core/src/core/utils.ts` does. An exclusion list still cancels every native action it does not list, such as toggling a `<summary>`.
- In specs, cover the shadow DOM case: host the native element in an open shadow root inside the element that has the listener, and dispatch the event on the native element with `bubbles: true, cancelable: true, composed: true` (event constructors default all three to `false`). See the `preventImplicitSubmission()` tests in `projects/igniteui-angular/core/src/core/utils.spec.ts` for the setup.
- In tests that verify cancellation, assert `defaultPrevented`. When the expected result is `false`, also dispatch on an element in the same shadow root that the handler must cancel, to prove the listener received the event.

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

### GitHub Actions workflows

- Pin every action and reusable workflow to a full commit SHA with a `# vX.Y.Z` comment.
- Use each action's current inputs instead of copying older workflows. For example, `actions/create-github-app-token` takes `client-id: ${{ secrets.IGNITEUI_GITHUB_APP_CLIENT_ID }}`; `app-id` is deprecated since v3.1.0.
- Deploys to Infragistics infrastructure go through a `repository_dispatch` to `IgniteUI/igniteui-actions`.
- Validate changed workflows with `actionlint`.

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
| Subset of tests (one component, grid type, or spec file) | `ng test igniteui-angular --no-watch --include '<glob>'` (e.g. `'projects/igniteui-angular/grids/grid/**/*.spec.ts'`) |
| Tests in watch mode | `npm run test:lib:watch` |
| Extras tests | `npm run test:extras` |
| Elements tests | `npm run test:elements` |
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
| Generate From Image Design | [`skills/igniteui-angular-generate-from-image-design/SKILL.md`](skills/igniteui-angular-generate-from-image-design/SKILL.md) | Building Angular views from screenshots, mockups, or wireframes with Ignite UI components |
| Figma to App | [`skills/igniteui-angular-figma-to-app/SKILL.md`](skills/igniteui-angular-figma-to-app/SKILL.md) | Building Angular apps from Figma screens with Ignite UI components, including Indigo.Design kits, third-party kits, and plain frames |
| Build | [`.agents/skills/igniteui-angular-build/SKILL.md`](.agents/skills/igniteui-angular-build/SKILL.md) | Building the library, producing dist output, compiling migrations/schematics |
| Testing | [`.agents/skills/igniteui-angular-testing/SKILL.md`](.agents/skills/igniteui-angular-testing/SKILL.md) | Running test suites, choosing the smallest relevant test run |
| Linting | [`.agents/skills/igniteui-angular-linting/SKILL.md`](.agents/skills/igniteui-angular-linting/SKILL.md) | Running ESLint and Stylelint, fixing lint errors |
| Skill Authoring | [`.agents/skills/igniteui-angular-skill-authoring/SKILL.md`](.agents/skills/igniteui-angular-skill-authoring/SKILL.md) | Writing or updating a SKILL.md: frontmatter rules, description format, size budget |

## Custom Agents

The repository provides a set of agents in `.agents/agents/` (see [`.agents/README.md`](.agents/README.md) for the full guide). Orchestrators analyze requests, define scope, and route work to the right specialists; they do not implement code directly. Specialists handle focused implementation and follow-through tasks.

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
