# Project Detection and Scaffolding

> **Part of the [`igniteui-angular-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 0b to detect an existing Ignite UI Angular project or scaffold a new one. Read in full before checking the project or running `igniteui-cli new`.

Check whether the current working directory contains a valid Angular + Ignite UI project:

```
1. Does package.json exist?
2. Does it list "igniteui-angular" OR "@infragistics/igniteui-angular" in dependencies?
3. Is there a src/app/ directory?
```

**If a valid project is found:**

- Note the package layout: `igniteui-angular` (open-source) or `@infragistics/igniteui-angular` (licensed)
- Note the Angular version from `package.json`
- **Check the MCP configuration for all four required server entries** — a Figma entry (`figma` or `figma-desktop`), `igniteui-cli`, `igniteui-theming`, and `playwright` in the config file your client reads (`.mcp.json`, `.vscode/mcp.json`, `.cursor/mcp.json`, …). If `igniteui-cli` or `igniteui-theming` is missing, run `npx -y igniteui-cli ai-config` (or `ig ai-config` when `igniteui-cli` is installed globally) from the project root yourself — it configures both servers and copies the Agent Skills, preserving existing entries. Add a missing Figma entry and `playwright` from [references/mcp-setup.md](mcp-setup.md). Projects scaffolded with `npx igniteui-cli new` already have `igniteui-cli` **and** `igniteui-theming`; they typically lack Figma and Playwright. A reload is required before newly configured servers' tools appear.
- Inform the user: "Found existing Ignite UI Angular project. Proceeding with the Figma workflow."

**If no valid project is found:** Present this message and wait for the user’s choice:

> “No Ignite UI Angular project found in the current directory. Would you like me to scaffold a new one using the Ignite UI CLI before implementing the Figma design?
>
> `npx -y igniteui-cli new` creates a project pre-configured with Ignite UI Angular, a starter theme (prebuilt CSS or Sass), and the Ignite UI CLI and Theming MCP servers configured for your coding assistant. No global install required.
>
> Alternatively, point me at an existing project directory.”

If the user confirms scaffolding:

1. Ask for a project name. If the user has already shared a Figma URL, suggest a name derived from the Figma file name; otherwise prompt.

2. Choose the project template based on the artboard structure. Because Phase 1 has not run yet, use the lightest signal available:

   | Signal                                                               | Template to use                                  |
   | -------------------------------------------------------------------- | ------------------------------------------------ |
   | User mentions a sidebar, navigation drawer, or multiple routed views | `side-nav`                                       |
   | No strong signal — default                                           | `empty` (routing + home page; easiest to extend) |

3. Create the project:

   ```bash
   npx -y igniteui-cli new <project-name> --framework=angular --type=igx-ts --template=<empty|side-nav> --assistants=<generic|vscode|cursor|gemini|junie> --agents=<generic|claude|copilot|cursor|…>
   ```

   `--assistants` picks the MCP config file: `generic` → `.mcp.json` (the default; Claude Code, GitHub Copilot, and others), `vscode` → `.vscode/mcp.json`, `cursor` → `.cursor/mcp.json`, `gemini` → `.gemini/settings.json`, `junie` → `.junie/mcp/mcp.json`. `--agents` picks where the Agent Skills are copied (`generic` → `.agents/skills`, `claude` → `.claude/skills`, `copilot` → `.github/skills`, …). Pass both: without them the CLI asks interactively.

   This produces a standard Angular workspace fully compatible with `ng` commands, and additionally:
   - Installs and configures `igniteui-angular` with a theme: either a prebuilt theme CSS in the `angular.json` `styles` array, or a starter Sass theme in `styles.scss` (Phase 3a treats both as "no theme")
   - Runs the `ai-config` setup: adds the `igniteui-cli` **and** `igniteui-theming` MCP servers to the chosen assistant's config file, and copies the Agent Skills for the chosen agents

4. `cd <project-name>`.

5. Add the Figma and Playwright entries from [mcp-setup.md](mcp-setup.md) to the same config file the scaffold wrote (the one for `--assistants`).

6. Confirm the project builds:
   ```bash
   npx ng build
   ```
   Do not run `npm start` in the foreground: the dev server never exits. Start it in the background, or ask the user to run it, when Phase 5 needs it.

7. The new servers and the new folder only take effect in a new session. Ask the user to **reopen the editor or agent session in the new project folder**, then stop. Phase 1 continues in that session.
