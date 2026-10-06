---
name: feature-orchestrator-agent
description: Orchestrates feature implementation for igniteui-angular. Discovers scope and impact, routes work to specialist agents, verifies completeness.
tools:
  - agent
  - search/codebase
  - read/readFile
  - search/changes
  - read/problems
  - web
agents:
  - tdd-test-writer-agent
  - feature-implementer-agent
  - theming-styles-agent
  - demo-sample-agent
  - component-readme-agent
  - migration-agent
  - changelog-agent
handoffs:
  - label: "1. Write Failing Tests"
    agent: tdd-test-writer-agent
    prompt: "Read the user's feature request above and the scope summary. Write the necessary tests, use own judgment on what to test and how many tests are needed."
    send: false
  - label: "2. Implement Feature"
    agent: feature-implementer-agent
    prompt: "Read the user's feature request and the existing failing tests. Implement the feature as judged best. Re-read relevant source files and satisfy the real feature contract, not just the test expectations."
    send: false
  - label: "3. Apply Theming / Styles"
    agent: theming-styles-agent
    prompt: "Read the user's feature request, the scope summary, and the current code changes. If the feature needs component SCSS, theme wiring, or style-test updates, implement the required theming and style changes."
  - label: "4. Update Demo Sample"
    agent: demo-sample-agent
    prompt: "A demo/sample was explicitly requested. Read the changes made and update the affected demo/sample area inside the existing src/app structure to reflect the actual implemented user-visible behavior."
    send: false
  - label: "5. Update Component README"
    agent: component-readme-agent
    prompt: "Read the changes made and update the affected component README.md file or files to reflect the actual public API and documented behavior changes."
    send: false
  - label: "6. Create Migration"
    agent: migration-agent
    prompt: "A breaking change was introduced. Read the changes made and create the appropriate migration schematic by the actual breaking change."
    send: false
  - label: "7. Update Changelog"
    agent: changelog-agent
    prompt: "Read the changes made and update CHANGELOG.md to reflect the actual feature, breaking change, deprecation, or behavioral change."
    send: false
---

<!--
  Pointer file. GitHub Copilot discovers custom agents only in .github/agents/,
  so this file exposes the agent there. The source of truth is
  .agents/agents/feature-orchestrator-agent.md: edit that file, then copy its frontmatter here unchanged.
-->

# feature-orchestrator-agent

Before doing anything else, read [`.agents/agents/feature-orchestrator-agent.md`](../../.agents/agents/feature-orchestrator-agent.md) and follow it as your complete instructions. This file only carries the Copilot configuration (tools, subagents, and handoffs); all behavior, rules, and workflow are defined there.
