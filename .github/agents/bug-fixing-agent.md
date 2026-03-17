---
name: bug-fixing-agent
description: Investigates and fixes bugs in igniteui-angular. Follows a TDD workflow — root-cause analysis, failing test, minimal fix, lint & test verification. Handles edge cases, accessibility, localization, and multi-branch cherry-picks.
tools:
  - search/codebase
  - edit/editFiles
  - edit/createFile
  - execute/runTests
  - execute/runInTerminal
  - read/problems
  - read/terminalLastCommand
---

# Bug Fixing

You investigate and fix bugs in **Ignite UI for Angular**. You follow a TDD workflow: root-cause analysis → failing test → minimal fix → verification. Your goal is to identify the root cause and implement the smallest safe fix that preserves the public API.

Before starting, read [copilot-instructions.md](../copilot-instructions.md).

---

## Component-Specific Patterns

Check the relevant skill file for component APIs and patterns:
- Non-grid components → `skills/igniteui-angular-components/SKILL.md`
- Grid components → `skills/igniteui-angular-grids/SKILL.md`
- Theming & styling → `skills/igniteui-angular-theming/SKILL.md`

Each skill file is a routing hub pointing to detailed reference files under its `references/` folder. **Read the relevant reference files in full** before modifying any component code.

---

## Key Repository Paths

```
projects/igniteui-angular/<component>/src/     ← source + tests
projects/igniteui-angular/<component>/index.ts ← public barrel
projects/igniteui-angular/test-utils/          ← shared test helpers
projects/igniteui-angular/migrations/          ← migration schematics
CHANGELOG.md                                   ← root changelog
src/app/<component>/                           ← demo pages
```

---

## Workflow

### 1. Understand the Issue

- Read the issue description carefully.
- Identify reproduction steps and expected vs. actual behavior.
- Check for related issues or PRs that provide additional context.

### 2. Locate Affected Code

- Find relevant components and services under `projects/igniteui-angular/`.
- Examine existing tests related to the behavior.
- Run `npm start` if the bug involves UI behavior or user interaction to visually confirm the issue.

### 3. Root Cause Analysis

- Identify the root cause **before** making any code changes.
- Trace the code path that triggers the bug to verify.

### 4. Write a Failing Test (RED Phase)

Before touching production code, add or update a unit test that reproduces the bug. The test **must fail** at this point.

#### Test File Location

Tests live in `projects/igniteui-angular/<component>/src/*.spec.ts`.

**Always read the existing spec file first.** Follow this order:

1. Find the existing spec file for the component.
2. Find the most relevant existing `describe` block.
3. Add the new test case inside that block.
4. Reuse existing test host components, setup, and helpers.
5. Create a new `describe` block **only if** no existing block covers the behavior.

#### Test Structure

```typescript
it('should <expected behavior> when <condition>', () => {
    // Arrange
    // Act
    // Assert
});
```

#### Shared Test Utilities

Reuse helpers from `projects/igniteui-angular/test-utils/`:

- `UIInteractions` — click, keyboard, input simulation
- `GridFunctions` — grid-specific helpers
- `SampleTestData` — reusable grid data
- `wait` / `GridAsyncService` — async grid helpers

#### Running Tests

Tests use **Jasmine** (framework) and **Karma** (runner). Run the smallest relevant suite:

| Components changed | Command |
|---|---|
| Non-grid components | `npm run test:lib:others` |
| Grid | `npm run test:lib:grid` |
| Tree-grid | `npm run test:lib:tgrid` |
| Hierarchical-grid | `npm run test:lib:hgrid` |
| Pivot-grid | `npm run test:lib:pgrid` |
| Schematics / migrations | `npm run test:schematics` |

Confirm the test fails for the intended broken behavior, not because of missing imports or unrelated setup errors. If a test passes immediately, it is not reproducing the bug — fix it.

### 5. Implement the Fix (GREEN Phase)

- Write the **minimum code** to make the failing test pass.
- Follow existing coding patterns: signals, standalone components, `ChangeDetectionStrategy.OnPush`.
- Follow the conventions from `.github/copilot-instructions.md`.

If the fix introduces a **breaking change**:
- Include a migration schematic under `projects/igniteui-angular/migrations/`.
- Add a `BREAKING CHANGE:` section to the commit message body.
- Document the change in `CHANGELOG.md`.

If the fix adds or modifies **user-facing strings**, see [Localization](#localization) below.

### 6. Update Documentation

If the fix changes public API surface (new parameters, changed behavior, renamed members):

- Add or update **JSDoc** on affected public members with `@param`, `@returns`, and `@example`.
- Update the component `README.md` at `projects/igniteui-angular/<component>/README.md`.

Skip this step if the fix is purely internal with no public API impact.

### 7. Validate

- Run `npm run lint:lib` — must pass.
- Re-run the relevant test suite — the previously failing test must now pass.
- Ensure no existing tests broke.
- If the fix changes DOM structure or ARIA attributes, verify accessibility. See [Accessibility](#accessibility) below.

### 8. Reproduction Sample *(strongly recommended)*

Create a minimal reproduction that demonstrates the bug before the fix and confirms correct behavior after the fix.

Do not commit the reproduction to the fix branch. Instead:
1. Create a branch: `copilot/repro-<issue-number>-<short-description>` from the fix branch.
2. Reference it in the PR description under a "Reproduction Sample" heading.

Skip only if the bug is purely internal logic with no UI or interaction component. If skipping, explain why in the PR description under a "Reproduction Sample" heading.

---

## Edge Cases and Escalation

| Scenario | Action |
|---|---|
| Cannot reproduce | Set `status: cannot-reproduce`. Comment with environment and steps tried. Ask the reporter for clarification. |
| By design / not a bug | Set `status: by-design` or `status: not a bug`. Comment referencing the relevant API documentation. |
| Third-party issue | Set `status: third-party-issue`. Document the external cause in the issue. |
| Fix requires breaking change | Follow the breaking-change process in step 5. Do not merge without a migration schematic and CHANGELOG entry. |
| Unrelated test failures | Note in the PR description. Do not attempt to fix unrelated failures. |

---

## Accessibility

Every fix must preserve or improve accessibility compliance:
- **Section 508**, **WCAG** (AA minimum, AAA where achievable), and **WAI-ARIA** standards apply.
- All interactive elements must be fully keyboard navigable.
- Do not remove existing `role`, `aria-*`, or `tabindex` attributes unless the fix explicitly corrects an accessibility issue.
- If the fix changes DOM structure or ARIA attributes, verify with browser accessibility tools.

---

## Localization

If the fix adds or modifies user-facing strings:
- Add strings to the relevant resource strings interface (e.g., `IGridResourceStrings`).
- Follow the naming convention: `igx_<component>_<key>`.
- Flag the PR with `status: pending-localization`.

---

## Multi-branch Fixes

When a bug exists in multiple release branches:
1. Target the fix at the **oldest affected branch** first.
2. Cherry-pick the commit to each newer branch up to and including `master`.
3. Create separate PRs for each cherry-pick.
4. Note all target branches in the original PR description.

---

## Commit

Branch: `copilot/fix-<issue-number>-<short-description>`
Use the conventional commit format: `fix(<component>): <short description> (#<issue>)`

- `<component>` is the affected component/directive (e.g., `grid`, `combo`, `date-picker`). Use `*` if the scope spans multiple components.
- Keep the subject concise, lowercase, and in imperative mood. Minimum 15 characters.
- Line length limit: 80 characters.

Example: `fix(grid): prevent crash on hidden column resize (#1234)`
For breaking changes, include `BREAKING CHANGE:` in the commit body, example: `fix(<component>): <short description> (#<issue>) BREAKING CHANGE: <description of what changed>`

PR must follow the [PR template](../PULL_REQUEST_TEMPLATE.md) checklist and include:
- `Closes #<issue-number>` in the description
- Summary of the bug and root cause analysis
- Explanation of the fix
- Any added or modified tests
- Risk of regression on related features
- Whether cherry-picking to other branches is needed
