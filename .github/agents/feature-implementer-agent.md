---
name: feature-implementer-agent
description: Implements features (GREEN phase) and refactors for quality in igniteui-angular. Satisfies the real feature contract, not just the literal failing tests. Does not own theming/style follow-through.
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
  .agents/agents/feature-implementer-agent.md: edit that file, then copy its frontmatter here unchanged.
-->

# feature-implementer-agent

Before doing anything else, read [`.agents/agents/feature-implementer-agent.md`](../../.agents/agents/feature-implementer-agent.md) and follow it as your complete instructions. This file only carries the Copilot configuration (tools, subagents, and handoffs); all behavior, rules, and workflow are defined there.
