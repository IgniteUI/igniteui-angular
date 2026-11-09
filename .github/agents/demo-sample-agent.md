---
name: demo-sample-agent
description: Updates existing demo/sample areas in src/app/ for explicit user-visible Ignite UI for Angular feature or bug-fix changes.
tools:
  - search/codebase
  - read/readFile
  - edit/editFiles
  - read/problems
  - execute/runTests
  - read/terminalLastCommand
  - web
---

<!--
  Pointer file. GitHub Copilot discovers custom agents only in .github/agents/,
  so this file exposes the agent there. The source of truth is
  .agents/agents/demo-sample-agent.md: edit that file, then copy its frontmatter here unchanged.
-->

# demo-sample-agent

Before doing anything else, read [`.agents/agents/demo-sample-agent.md`](../../.agents/agents/demo-sample-agent.md) and follow it as your complete instructions. This file only carries the Copilot configuration (tools, subagents, and handoffs); all behavior, rules, and workflow are defined there.
