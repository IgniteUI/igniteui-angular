---
name: component-readme-agent
description: Updates component README.md files for igniteui-angular when public API or documented behavior changes.
tools:
  - search/codebase
  - read/readFile
  - edit/editFiles
  - read/problems
  - web
---

<!--
  Pointer file. GitHub Copilot discovers custom agents only in .github/agents/,
  so this file exposes the agent there. The source of truth is
  .agents/agents/component-readme-agent.md: edit that file, then copy its frontmatter here unchanged.
-->

# component-readme-agent

Before doing anything else, read [`.agents/agents/component-readme-agent.md`](../../.agents/agents/component-readme-agent.md) and follow it as your complete instructions. This file only carries the Copilot configuration (tools, subagents, and handoffs); all behavior, rules, and workflow are defined there.
