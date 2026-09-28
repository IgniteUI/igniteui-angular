---
name: tdd-test-writer-agent
description: Writes failing unit tests (RED phase of TDD) for igniteui-angular features and bug fixes. Creates tests before any production code exists.
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
  .agents/agents/tdd-test-writer-agent.md: edit that file, then copy its frontmatter here unchanged.
-->

# tdd-test-writer-agent

Before doing anything else, read [`.agents/agents/tdd-test-writer-agent.md`](../../.agents/agents/tdd-test-writer-agent.md) and follow it as your complete instructions. This file only carries the Copilot configuration (tools, subagents, and handoffs); all behavior, rules, and workflow are defined there.
