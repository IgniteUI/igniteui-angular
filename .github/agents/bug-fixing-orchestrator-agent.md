---
name: bug-fixing-orchestrator-agent
description: Orchestrates bug fixing for igniteui-angular. Discovers scope and root cause, routes work to specialist agents, verifies completeness. Handles edge cases, escalation, and multi-branch fixes.
tools:
  - agent
  - search/codebase
  - read/readFile
  - search/changes
  - read/problems
  - web
agents:
  - tdd-test-writer-agent
  - bug-fixing-implementer-agent
  - theming-styles-agent
  - demo-sample-agent
  - component-readme-agent
  - migration-agent
  - changelog-agent
handoffs:
  - label: "1. Write Failing Test"
    agent: tdd-test-writer-agent
    prompt: "Read the bug report above and the scope summary. Write a test that reproduces the bug — it must fail for the broken behavior."
    send: false
  - label: "2. Implement Fix"
    agent: bug-fixing-implementer-agent
    prompt: "Use the Bug Knowledge block below to implement the minimum fix. Skip your own investigation — the orchestrator has already done it."
    send: false
  - label: "3. Apply Theming / Styles"
    agent: theming-styles-agent
    prompt: "Read the bug report, the scope summary, and the current code changes. If the fix requires SCSS, theme wiring, or style-test updates, implement the needed theming and style changes."
  - label: "4. Update Demo Sample"
    agent: demo-sample-agent
    prompt: "A demo/sample was explicitly requested. Read the changes made and update the affected demo/sample area inside the existing src/app structure to reflect the actual implemented user-visible behavior."
    send: false
  - label: "5. Update Component README"
    agent: component-readme-agent
    prompt: "Read the changes made and update the affected component README.md file or files to reflect any public API or documented behavior changes."
    send: false
  - label: "6. Create Migration"
    agent: migration-agent
    prompt: "A breaking change was introduced by the fix. Read the changes made and create the appropriate migration schematic."
    send: false
  - label: "7. Update Changelog"
    agent: changelog-agent
    prompt: "Read the changes made and update CHANGELOG.md only if the fix belongs under an existing CHANGELOG section. Otherwise leave CHANGELOG.md unchanged."
    send: false
---

<!--
  Pointer file. GitHub Copilot discovers custom agents only in .github/agents/,
  so this file exposes the agent there. The source of truth is
  .agents/agents/bug-fixing-orchestrator-agent.md: edit that file, then copy its frontmatter here unchanged.
-->

# bug-fixing-orchestrator-agent

Before doing anything else, read [`.agents/agents/bug-fixing-orchestrator-agent.md`](../../.agents/agents/bug-fixing-orchestrator-agent.md) and follow it as your complete instructions. This file only carries the Copilot configuration (tools, subagents, and handoffs); all behavior, rules, and workflow are defined there.
