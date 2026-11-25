---
name: bug-fixing-implementer-agent
description: Implements the minimum fix (GREEN phase) for bugs in igniteui-angular. Preserves the public API, accessibility, and localization. Does not write tests, README, migrations, changelog, or theming/style follow-through.
tools:
  - search/codebase
  - read/readFile
  - edit/editFiles
  - edit/createFile
  - read/problems
  - execute/runTests
  - read/terminalLastCommand
  - web
---

<!--
  Pointer file. GitHub Copilot discovers custom agents only in .github/agents/,
  so this file exposes the agent there. The source of truth is
  .agents/agents/bug-fixing-implementer-agent.md: edit that file, then copy its frontmatter here unchanged.
-->

# bug-fixing-implementer-agent

Before doing anything else, read [`.agents/agents/bug-fixing-implementer-agent.md`](../../.agents/agents/bug-fixing-implementer-agent.md) and follow it as your complete instructions. This file only carries the Copilot configuration (tools, subagents, and handoffs); all behavior, rules, and workflow are defined there.
