---
name: igniteui-angular-skill-authoring
description: "This skill provides rules for writing or updating a SKILL.md in this repository, including frontmatter validation, discovery description markers, and the 500-line body budget. WHEN TO USE: creating or editing skills. WHEN NOT TO USE: writing custom agents or looking up build, test, or lint commands."
license: MIT
---

# Ignite UI for Angular — Skill Authoring

Quick-reference for writing a `SKILL.md` that agents can discover and load reliably.

## Location

- Internal, contributor-facing skills: `.agents/skills/<name>/SKILL.md`
- Public skills that ship with the package: `skills/<name>/SKILL.md`
- The folder name must match the `name` field.

## Frontmatter

| Field | Rules |
|---|---|
| `license` | Required. Must specify the license under which the skill is released. Default is MIT. |
| `name` | Required. Max 64 characters. Lowercase letters, numbers, and hyphens only. No XML tags. No reserved words (`anthropic`, `claude`). Use the `igniteui-angular-` prefix. |
| `description` | Required. Non-empty. Max 1,024 characters. No XML tags. |

Write the description in the third person: say what the skill covers, then add both markers:

- `WHEN TO USE:` the tasks or triggers that should load the skill.
- `WHEN NOT TO USE:` nearby tasks it does not cover, naming the skill to use instead.

Agents see only `name` and `description` until they load the skill, so the description decides whether it is ever used.

## Token Budget

- Keep the `SKILL.md` body under 500 lines.
- If it grows past that, use progressive disclosure: keep the overview and core rules in `SKILL.md` and move detail into `references/<topic>.md` files.
- Link each reference file directly from `SKILL.md` (one level deep) and say when to read it, so agents load it only when needed.

## MCP Servers in Public Skills

Public skills require the `igniteui-cli` (component docs and API lookups) and `igniteui-theming` (theme code and design tokens) MCP servers. Every public skill that produces Ignite UI code must:

- Verify the server before any other step: `list_components` for `igniteui-cli`, `detect_platform` for `igniteui-theming`.
- If a tool is missing, tell the agent to configure the servers itself with `npx -y igniteui-cli ai-config` (or `ig ai-config`), ask the user to reload, and stop. Continuing without the servers happens only at the user's explicit request, with unverified details flagged.
- Never describe the servers as optional or add "when available" fallbacks.

Follow the existing wording in [`igniteui-angular-components`](../../../skills/igniteui-angular-components/SKILL.md#ignite-ui-cli-mcp-server-required) and [`igniteui-angular-theming`](../../../skills/igniteui-angular-theming/SKILL.md#ignite-ui-theming-mcp-server-required).

## Checklist

1. Frontmatter passes the rules above.
2. The description includes `WHEN TO USE:` and `WHEN NOT TO USE:`.
3. The body is under 500 lines, and every reference file is linked from `SKILL.md`.
4. Public skills that produce Ignite UI code include the required MCP server check.
5. The skill is listed in the Skills table in [AGENTS.md](../../../AGENTS.md). Internal skills are also listed in [.agents/README.md](../../README.md) and [.github/copilot-instructions.md](../../../.github/copilot-instructions.md).

## Related Skills

- [`igniteui-angular-build`](../igniteui-angular-build/SKILL.md) — Building the library
- [`igniteui-angular-testing`](../igniteui-angular-testing/SKILL.md) — Running tests
- [`igniteui-angular-linting`](../igniteui-angular-linting/SKILL.md) — Linting
