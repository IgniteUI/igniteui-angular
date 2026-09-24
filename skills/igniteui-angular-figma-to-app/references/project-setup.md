# Project Detection and Scaffolding

> **Part of the [`igniteui-angular-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 0b to detect an existing Ignite UI Angular project or scaffold a new
> one. Read in full before checking the project or running `igniteui-cli new`.

Check whether the current working directory contains a valid Angular + Ignite UI project:

```
1. Does package.json exist?
2. Does it list "igniteui-angular" OR "@infragistics/igniteui-angular" in dependencies?
3. Is there a src/app/ directory?
```

**If a valid project is found:**

- Note the package layout: `igniteui-angular` (open-source) or `@infragistics/igniteui-angular` (licensed)
- Note the Angular version from `package.json`
- **Check the MCP configuration for all four required server entries** — `figma`, `igniteui-cli`,
  `igniteui-theming`, and `playwright` (in `.vscode/mcp.json` or the client's equivalent).
  If `igniteui-cli` or `igniteui-theming` is missing, run `npx -y igniteui-cli ai-config`
  from the project root — it configures both servers and copies the Agent Skills, preserving
  existing entries. Add missing `figma` and `playwright` entries from
  [references/mcp-setup.md](mcp-setup.md). Projects scaffolded with
  `npx igniteui-cli new` have `igniteui-cli` pre-wired but typically lack the other three.
  A reload is required before newly configured servers' tools appear.
- Inform the user: "Found existing Ignite UI Angular project. Proceeding with the Figma workflow."

**If no valid project is found:**
Present this message and wait for the user’s choice:

> “No Ignite UI Angular project found in the current directory. Would you like me to
> scaffold a new one using the Ignite UI CLI before implementing the Figma design?
>
> `npx -y igniteui-cli new` creates a project pre-configured with Ignite UI Angular,
> theming already applied in `styles.scss`, and the Ignite UI CLI MCP server auto-wired
> into `.vscode/mcp.json`. No global install required.
>
> Alternatively, point me at an existing project directory.”

If the user confirms scaffolding:

1. Ask for a project name. If the user has already shared a Figma URL, suggest a name
   derived from the Figma file name; otherwise prompt.

2. Choose the project template based on the artboard structure. Because Phase 1 has
   not run yet, use the lightest signal available:

   | Signal                                                               | Template to use                                  |
   | -------------------------------------------------------------------- | ------------------------------------------------ |
   | User mentions a sidebar, navigation drawer, or multiple routed views | `side-nav`                                       |
   | No strong signal — default                                           | `empty` (routing + home page; easiest to extend) |

3. Create the project:

   ```bash
   npx -y igniteui-cli new <project-name> --framework=angular --type=igx-ts --template=<empty|side-nav>
   ```

   This produces a standard Angular workspace fully compatible with `ng` commands,
   and additionally:
   - Installs and configures `igniteui-angular` with a default theme in `styles.scss`
   - Generates `.vscode/mcp.json` with the Ignite UI CLI MCP server entry already set
   - Copies Ignite UI Agent Skills to `.claude/skills/`

4. `cd <project-name>`

5. Open the auto-generated `.vscode/mcp.json` and **append** the Figma, Ignite UI
   Theming, and Playwright server entries from `references/mcp-setup.md`. The Ignite
   UI CLI entry is already present — do not duplicate it.

6. Confirm the project starts cleanly:
   ```bash
   npm start
   ```
   Then continue to Phase 1.
