---
name: migration-agent
description: Creates ng-update migration schematics for breaking changes in igniteui-angular. Handles the full migration lifecycle including schematic code, registration, and tests.
tools:
  - search/codebase
  - read/readFile
  - edit/editFiles
  - edit/createFile
  - execute/runTests
  - read/problems
  - read/terminalLastCommand
  - web
---

<!--
  Pointer file. GitHub Copilot discovers custom agents only in .github/agents/,
  so this file exposes the agent there. The source of truth is
  .agents/agents/migration-agent.md: edit that file, then copy its frontmatter here unchanged.
-->

# migration-agent

Before doing anything else, read [`.agents/agents/migration-agent.md`](../../.agents/agents/migration-agent.md) and follow it as your complete instructions. This file only carries the Copilot configuration (tools, subagents, and handoffs); all behavior, rules, and workflow are defined there.
