---
name: changelog-agent
description: Updates CHANGELOG.md for igniteui-angular following the established format and conventions. Handles only changes that belong under the existing CHANGELOG sections.
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
  .agents/agents/changelog-agent.md: edit that file, then copy its frontmatter here unchanged.
-->

# changelog-agent

Before doing anything else, read [`.agents/agents/changelog-agent.md`](../../.agents/agents/changelog-agent.md) and follow it as your complete instructions. This file only carries the Copilot configuration (tools, subagents, and handoffs); all behavior, rules, and workflow are defined there.
