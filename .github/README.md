# Ignite UI for Angular Agent Guide

This document describes the custom AI agents used in this repository, what each one is responsible for, how they work together, and how to use them effectively.

---

## Table of Contents

- [Purpose](#purpose)
- [Agent System at a Glance](#agent-system-at-a-glance)
- [Agent List](#agent-list)
- [How the System Is Structured](#how-the-system-is-structured)
  - [Orchestrators](#1-orchestrators)
  - [Specialists](#2-specialists)
- [Quick Start](#quick-start)
- [Feature Workflow](#feature-workflow)
- [Bug-Fix Workflow](#bug-fix-workflow)
- [When to Use Which Agent](#when-to-use-which-agent)
- [Using Agents Individually](#using-agents-individually)
- [Repository Areas the Agents Care About](#repository-areas-the-agents-care-about)
- [Maintenance Notes](#maintenance-notes)
- [Final Summary](#final-summary)

---

## Purpose

The agent system keeps AI-assisted work **modular, consistent, and reviewable**.

Instead of one general agent doing everything, work is split into two roles:

- **Orchestrators** analyze scope, decide follow-through, and route work.
- **Specialists** handle one focused responsibility well, such as tests, implementation, docs, migrations, or changelog updates.

---

## Agent System at a Glance

```text
┌──────────────────────────────┐
│         User Request         │
└──────────────┬───────────────┘
               │
      ┌────────┴────────┐
      │                 │
      ▼                 ▼
┌──────────────────┐  ┌──────────────────┐
│ Feature workflow │  │   Bug workflow   │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         ▼                     ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│ feature-orchestrator-    │  │ bug-fixing-orchestrator- │
│ agent                    │  │ agent                    │
└──────────────┬───────────┘  └──────────────┬───────────┘
               │                             │
               └──────────────┬──────────────┘
                              │
                              ▼
                 ┌──────────────────────────┐
                 │ tdd-test-writer-agent    │
                 └──────────────┬───────────┘
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
                 ▼                             ▼
      ┌──────────────────────────┐  ┌──────────────────────────┐
      │ feature-implementer-     │  │ bug-fixing-implementer-  │
      │ agent                    │  │ agent                    │
      └──────────────┬───────────┘  └──────────────┬───────────┘
                     │                             │
                     └──────────────┬──────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────┐
                    │ Optional when needed      │
                    └──────────────┬────────────┘
                                   │
                                   ▼
┌──────────────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ component-readme-agent   │  │ migration-agent  │  │ changelog-agent  │
└──────────────────────────┘  └──────────────────┘  └──────────────────┘
```

- one core workflow is selected: **feature** or **bug**
- **TDD tests come first**
- implementation follows
- README, migration, and changelog work are **optional follow-through**

---

## Agent List

| Agent | Role | Use it for |
|---|---|---|
| [`feature-orchestrator-agent`](./agents/feature-orchestrator-agent.md) | Orchestrator | New features, enhancements, broader feature work |
| [`bug-fixing-orchestrator-agent`](./agents/bug-fixing-orchestrator-agent.md) | Orchestrator | Bug reports, regressions, investigation-first work |
| [`tdd-test-writer-agent`](./agents/tdd-test-writer-agent.md) | Specialist | Small failing tests before production code |
| [`feature-implementer-agent`](./agents/feature-implementer-agent.md) | Specialist | Feature implementation and refactor |
| [`bug-fixing-implementer-agent`](./agents/bug-fixing-implementer-agent.md) | Specialist | Minimum safe bug fix |
| [`component-readme-agent`](./agents/component-readme-agent.md) | Specialist | Component README updates |
| [`migration-agent`](./agents/migration-agent.md) | Specialist | `ng update` migration for breaking changes |
| [`changelog-agent`](./agents/changelog-agent.md) | Specialist | `CHANGELOG.md` updates |

---

## Workflows
## How the System Is Structured

### 1. Orchestrators

Orchestrators are responsible for:

- understanding the request at a high level
- identifying affected components and files
- mapping impact such as breaking changes, docs impact, changelog impact, accessibility, i18n, or demos
- deciding which specialist agents are needed
- routing work in the correct order
- verifying that nothing important was missed

Orchestrators do **not** act as detailed spec writers. They should pass minimal context and avoid over-constraining downstream agents.

### 2. Specialists

Specialist agents own a single focused responsibility.

Examples:

- the TDD agent writes failing tests
- implementer agents write production code
- the README agent updates component docs
- the migration agent handles `ng update` migrations for breaking changes
- the changelog agent updates release notes in the correct section

---

## Quick Start

| Goal | Start with |
|---|---|
| Add or expand a feature | `feature-orchestrator-agent` |
| Investigate and fix a bug | `bug-fixing-orchestrator-agent` |
| Write failing tests first | `tdd-test-writer-agent` |
| Implement a known feature | `feature-implementer-agent` |
| Implement a known bug fix | `bug-fixing-implementer-agent` |
| Update docs after public change | `component-readme-agent` |
| Add migration for breaking change | `migration-agent` |
| Add release-note coverage | `changelog-agent` |

---

## Feature Workflow

### What it is for

Use the feature flow when the task is about **new behavior**, **new public API**, **enhancements**, **refactors tied to a feature**, or **deprecation follow-through**.

### Main entry point

- `feature-orchestrator-agent`

### Flow

```text
┌──────────────────────────────┐
│       Feature request        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ feature-orchestrator-agent   │
├──────────────────────────────┤
│ - discovers scope            │
│ - identifies affected areas  │
│ - checks follow-through      │
│ - routes the work            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ tdd-test-writer-agent        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ feature-implementer-agent    │
└──────────────┬───────────────┘
               │
               ▼
      ┌────────────────────────┐
      │ Optional follow-through│
      └───────────┬────────────┘
                  │
     ┌────────────┼────────────┐
     │            │            │
     ▼            ▼            ▼
┌──────────────┐ ┌───────────┐ ┌──────────────┐
│ component-   │ │ migration-│ │ changelog-   │
│ readme-agent │ │ agent     │ │ agent        │
└──────────────┘ └───────────┘ └──────────────┘
            │
            ▼
┌──────────────────────────────┐
│ feature-orchestrator-agent   │
│ verifies completeness        │
└──────────────────────────────┘
```

**Orchestrator checks before routing:**
- affected files and components
- deprecations or API changes
- accessibility and i18n impact
- whether README, migration, or changelog work is needed
- smallest relevant test suite

### Why this order exists

The order keeps the workflow grounded:

1. **Tests first** — define the missing behavior.
2. **Implementation second** — satisfy the real feature contract, not just the tests literally.
3. **Documentation follow-through** — reflect actual public changes.
4. **Migration follow-through** — automate breaking changes.
5. **Changelog follow-through** — record notable release information.

---

## Bug-Fix Workflow

### What it is for

Use the bug-fix flow when the task is about **broken existing behavior**, **regressions**, **unexpected runtime behavior**, or **incorrect output caused by an existing implementation**.

### Main entry point

- `bug-fixing-orchestrator-agent`

### Flow

```text
┌──────────────────────────────┐
│         Bug report           │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ bug-fixing-orchestrator-     │
│ agent                        │
├──────────────────────────────┤
│ - investigates reproduction  │
│ - finds affected areas       │
│ - performs root-cause review │
│ - checks follow-through      │
│ - routes the work            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ tdd-test-writer-agent        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ bug-fixing-implementer-agent │
└──────────────┬───────────────┘
               │
               ▼
      ┌────────────────────────┐
      │ Optional follow-through│
      └───────────┬────────────┘
                  │
     ┌────────────┼────────────┐
     │            │            │
     ▼            ▼            ▼
┌──────────────┐ ┌───────────┐ ┌──────────────┐
│ component-   │ │ migration-│ │ changelog-   │
│ readme-agent │ │ agent     │ │ agent        │
└──────────────┘ └───────────┘ └──────────────┘
                  │
                  ▼
┌──────────────────────────────┐
│ bug-fixing-orchestrator-     │
│ agent verifies completeness  │
└──────────────────────────────┘
```

**Bug flow differs because it emphasizes:**
Compared with feature work, bug fixing adds stronger emphasis on:

- **root-cause analysis before routing**
- **reproduction-first testing**
- **minimal fixes** rather than scope expansion
- **multi-branch handling** when the bug affects release branches
- **edge-case escalation** when the issue is not reproducible, is by design, or is caused by a third party

---

## When to Use Which Agent

Use this quick decision guide:

| Situation | Best starting agent |
|---|---|
| New feature or enhancement | `feature-orchestrator-agent` |
| Bug report or regression | `bug-fixing-orchestrator-agent` |
| Only need failing tests first | `tdd-test-writer-agent` |
| Already have failing tests and need implementation | `feature-implementer-agent` or `bug-fixing-implementer-agent` |
| Public behavior changed and docs must be updated | `component-readme-agent` |
| Breaking change needs `ng update` support | `migration-agent` |
| User-visible change needs release-note coverage | `changelog-agent` |

### Rule of thumb

If the task is broad or uncertain, start with an **orchestrator**.

If the task is narrow and clearly scoped, start directly with the **specialist** that owns that responsibility.

---

## Using Agents Individually

| Agent | Call directly when | Avoid when |
|---|---|---|
| `feature-orchestrator-agent` | the task is a feature and scope still needs analysis | you already only need one narrow follow-up task |
| `bug-fixing-orchestrator-agent` | the task is a bug and root cause is not yet confirmed | root cause is already known and you only need the fix |
| `tdd-test-writer-agent` | you need RED-phase tests or a failing repro | you need production code |
| `feature-implementer-agent` | feature scope is known and implementation is next | the task is really a bug fix |
| `bug-fixing-implementer-agent` | the bug is understood and needs the smallest safe fix | the task is actually a feature |
| `component-readme-agent` | public API or documented behavior changed | no docs impact exists |
| `migration-agent` | a breaking change needs migration support | the change is additive only |
| `changelog-agent` | the change deserves release-note coverage | the change is too minor for changelog |

---

## Repository Areas the Agents Care About

These paths appear repeatedly in the workflow and are worth knowing:

```text
projects/igniteui-angular/<component>/src/        source + tests
projects/igniteui-angular/<component>/index.ts    public barrel
projects/igniteui-angular/<component>/README.md   component documentation
projects/igniteui-angular/test-utils/             shared test helpers
projects/igniteui-angular/migrations/             migration schematics
CHANGELOG.md                                      root changelog
src/app/<component>/                              demo pages
```

The system also relies on repository-specific guidance in:

```text
.github/copilot-instructions.md
skills/igniteui-angular-components/SKILL.md
skills/igniteui-angular-grids/SKILL.md
skills/igniteui-angular-theming/SKILL.md
```

---

## Maintenance Notes

When adding a new agent, update these places:

1. **Agent List**
2. **Agent System at a Glance**
3. **When to Use Which Agent**
4. **Using Agents Individually**

### Good additions to document immediately

Whenever you add a new agent, document:

- its exact name
- its one-sentence purpose
- whether it is an orchestrator or specialist
- where it fits in the workflow
- when to call it directly
- what it explicitly should not do

### Naming guideline

Use names that make role and scope obvious, for example:

- `<domain>-orchestrator-agent`
- `<domain>-implementer-agent`
- `<responsibility>-agent`

That naming pattern makes the workflow easier to understand at a glance.

---

## Final Summary

This agent system is built around a clear separation of concerns:

- **Orchestrators think in scope, impact, and routing**
- **Specialists think in focused execution**
- **Optional follow-through agents keep release quality high**

That structure makes feature delivery and bug fixing more predictable, easier to review, and more aligned with repository conventions.
