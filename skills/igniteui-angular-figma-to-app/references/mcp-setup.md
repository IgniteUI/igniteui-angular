# MCP Server Setup — All Four Servers

> **Part of the [`igniteui-angular-figma-to-app`](../SKILL.md) skill.**
>
> This file contains setup instructions for all four MCP servers required by this skill.
> Configure all four before running the Figma-to-app workflow.

---

## Overview

| Server                                     | Purpose                                             | Verify with                                    |
| ------------------------------------------ | --------------------------------------------------- | ---------------------------------------------- |
| **Figma**                                  | Read artboard structure, screenshots, design tokens | `figma_get_metadata` (no nodeId)               |
| **Ignite UI CLI** (`igniteui-cli`)         | Component docs, API reference                       | `igniteui_cli_list_components`                 |
| **Ignite UI Theming** (`igniteui-theming`) | Palette + component-level theming code              | `theming_detect_platform`                      |
| **Playwright**                             | Browser automation, screenshots, DOM measurement    | `playwright_browser_navigate` to `about:blank` |

---

## 1. Figma MCP

The Figma MCP server connects your AI tool to the Figma desktop app or a Figma file URL.
It requires a **Figma personal access token**.

### Get a Figma Access Token

1. Open Figma → click your avatar (top-right) → **Settings**
2. Scroll to **Personal access tokens** → **Generate new token**
3. Give it a name (e.g. `mcp-agent`) → copy the token value

### VS Code

Create or edit `.vscode/mcp.json`:

~~~json
{
  "servers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@figma/mcp@latest"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "YOUR_TOKEN_HERE"
      }
    }
  }
}
~~~

### Cursor

Create or edit `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@figma/mcp@latest"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "YOUR_TOKEN_HERE"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add figma -- npx -y @figma/mcp@latest --figma-access-token YOUR_TOKEN_HERE
```

Or edit `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@figma/mcp@latest"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "YOUR_TOKEN_HERE"
      }
    }
  }
}
```

### JetBrains IDEs

1. **Settings → Tools → AI Assistant → MCP Servers → + Add MCP Server**
2. Command: `npx`, Arguments: `-y @figma/mcp@latest`
3. Environment: `FIGMA_ACCESS_TOKEN=YOUR_TOKEN_HERE`

### Figma Desktop App Plugin (Recommended)

If you use the Figma desktop app, the preferred setup is through the Figma MCP plugin for your editor. Follow Figma's official installation guide: https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/

This approach connects to the currently open Figma file and the selected node without needing to pass node IDs manually.

> **Session-binding behaviour:** The Figma MCP tools (`figma_get_screenshot`,
> `figma_get_design_context`, `figma_get_variable_defs`) always operate on the
> **currently selected node in the Figma desktop app**. Any `nodeId` parameter passed
> to these tools is **silently ignored** — the tool returns data for whatever is
> selected, not for the specified ID.
>
> **Consequence:** you cannot programmatically navigate between artboards by passing
> node IDs. To get screenshots or design context for a specific artboard you **must**
> ask the user to click that artboard frame in Figma before calling the tool.
>
> The correct pattern in every Phase 1 step:
> ```
> // 1. Ask the user
> "In Figma, please click the [Artboard Name] frame to select it, then confirm."
> // 2. Wait for confirmation
> // 3. Only then call the tool
> figma_get_screenshot({})
> figma_get_design_context({ clientLanguages: "typescript", clientFrameworks: "angular", ... })
> ```

### Verifying Figma MCP

Call `figma_get_metadata` with **no `nodeId`**. It should return either:

- A list of top-level pages if something is selected in the Figma desktop app, or
- A prompt to open a Figma file

> **Rate limits:** Starter plan: 6 calls/month · Organization: 200/day · Enterprise: 600/day.
> Use `figma_get_metadata` for structural discovery and `figma_get_design_context` only for
> target artboards to conserve quota.

### Troubleshooting Figma MCP

| Problem                               | Fix                                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `figma_get_metadata` returns an error | Token may be expired or invalid — regenerate it                                                                           |
| Tools not available after config      | Restart the editor/IDE                                                                                                    |
| `File not found`                      | Verify the Figma file URL is correct and you have access                                                                  |
| 6 calls/month exceeded                | Upgrade to an Organization plan or use the Figma REST API with a personal access token for higher-volume development work |

---

## 2. Ignite UI CLI MCP (`igniteui-cli`)

> **Projects created with `npx igniteui-cli new` already have this configured.**
> `npx igniteui-cli new` writes the Ignite UI CLI MCP entry into `.vscode/mcp.json`
> automatically during scaffolding. For existing projects that lack this config, run:
>
> ```bash
> npx -y igniteui-cli ai-config
> ```
>
> This sets up both the MCP configuration and the Agent Skills in one step.
> Only follow the manual steps below when `npx igniteui-cli ai-config` is not available
> or you need to configure a non-VS Code editor.

### VS Code

Create or edit `.vscode/mcp.json`:

```json
{
  "servers": {
    "igniteui-cli": {
      "command": "npx",
      "args": ["-y", "igniteui-cli", "mcp"]
    }
  }
}
```

### Cursor

Create or edit `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "igniteui-cli": {
      "command": "npx",
      "args": ["-y", "igniteui-cli", "mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add igniteui-cli -- npx -y igniteui-cli mcp
```

Or edit `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "igniteui-cli": {
      "command": "npx",
      "args": ["-y", "igniteui-cli", "mcp"]
    }
  }
}
```

### JetBrains IDEs

1. **Settings → Tools → AI Assistant → MCP Servers → + Add MCP Server**
2. Command: `npx`, Arguments: `-y igniteui-cli mcp`

### Verifying Ignite UI CLI MCP

Ask your AI assistant: _"List all available Ignite UI Angular components."_

The `list_components` tool should return a full component list for the Angular framework.

---

## 3. Ignite UI Theming MCP (`igniteui-theming`)

### VS Code

Create or edit `.vscode/mcp.json`:

```json
{
  "servers": {
    "igniteui-theming": {
      "command": "npx",
      "args": ["-y", "igniteui-theming", "igniteui-theming-mcp"]
    }
  }
}
```

### Cursor

Create or edit `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "igniteui-theming": {
      "command": "npx",
      "args": ["-y", "igniteui-theming", "igniteui-theming-mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add igniteui-theming -- npx -y igniteui-theming igniteui-theming-mcp
```

Or edit `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "igniteui-theming": {
      "command": "npx",
      "args": ["-y", "igniteui-theming", "igniteui-theming-mcp"]
    }
  }
}
```

### JetBrains IDEs

1. **Settings → Tools → AI Assistant → MCP Servers → + Add MCP Server**
2. Command: `npx`, Arguments: `-y igniteui-theming igniteui-theming-mcp`

### Verifying Ignite UI Theming MCP

Ask your AI assistant: _"Detect which Ignite UI platform my project uses."_

The `theming_detect_platform` tool should analyze your `package.json` and return the
detected platform (e.g., `angular`, `angular-licensed`).

---

## 4. Playwright MCP

### VS Code

Create or edit `.vscode/mcp.json`:

```json
{
  "servers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

### Cursor

Create or edit `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add playwright -- npx -y @playwright/mcp@latest
```

Or edit `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

### JetBrains IDEs

1. **Settings → Tools → AI Assistant → MCP Servers → + Add MCP Server**
2. Command: `npx`, Arguments: `-y @playwright/mcp@latest`

### Verifying Playwright MCP

Navigate to a URL: _"Navigate the browser to `https://example.com`."_

The `playwright_browser_navigate` tool should open the page without error.

### Troubleshooting Playwright MCP

| Problem                                               | Fix                                                         |
| ----------------------------------------------------- | ----------------------------------------------------------- |
| Screenshots are blank                                 | Make sure the dev server is running (`npm start`)           |
| Page resets to `about:blank` after resize             | Always re-navigate after `playwright_browser_resize`        |
| Console shows `ERR_CONNECTION_REFUSED`                | The Angular dev server is not running                       |
| `browser_evaluate` fails with `__name is not defined` | Pass code using the `function` parameter (not `script`): `playwright_browser_evaluate({ function: "() => { ... }" })` |
| `playwright_browser_take_screenshot` returns empty    | Re-navigate to the target URL first                         |

---

## Combined JSON Config (All Four Servers)

> **If your project was created with `npx igniteui-cli new`:** the Ignite UI CLI entry is already in
> `.vscode/mcp.json`. Open that file and **add only the three entries below** (Figma,
> Ignite UI Theming, Playwright) to the existing `"servers"` block — do not duplicate
> the `igniteui-cli` entry.
>
> **Fresh setup (no existing `.vscode/mcp.json`):** use the complete blocks below.
> Replace `YOUR_TOKEN_HERE` with your actual Figma personal access token.

### VS Code (`.vscode/mcp.json`)

```json
{
  "servers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@figma/mcp@latest"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "YOUR_TOKEN_HERE"
      }
    },
    "igniteui-cli": {
      "command": "npx",
      "args": ["-y", "igniteui-cli", "mcp"]
    },
    "igniteui-theming": {
      "command": "npx",
      "args": ["-y", "igniteui-theming", "igniteui-theming-mcp"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

### Cursor (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@figma/mcp@latest"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "YOUR_TOKEN_HERE"
      }
    },
    "igniteui-cli": {
      "command": "npx",
      "args": ["-y", "igniteui-cli", "mcp"]
    },
    "igniteui-theming": {
      "command": "npx",
      "args": ["-y", "igniteui-theming", "igniteui-theming-mcp"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

### Claude Code (`~/.claude/settings.json`)

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@figma/mcp@latest"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "YOUR_TOKEN_HERE"
      }
    },
    "igniteui-cli": {
      "command": "npx",
      "args": ["-y", "igniteui-cli", "mcp"]
    },
    "igniteui-theming": {
      "command": "npx",
      "args": ["-y", "igniteui-theming", "igniteui-theming-mcp"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```
