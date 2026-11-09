# MCP Server Setup — All Four Servers

> **Part of the [`igniteui-angular-figma-to-app`](../SKILL.md) skill.**
>
> This file contains setup instructions for all four MCP servers required by this skill. Configure all four before running the Figma-to-app workflow.

---

## Overview

| Server                                     | Purpose                                             | Verify with                                    |
| ------------------------------------------ | --------------------------------------------------- | ---------------------------------------------- |
| **Figma**                                  | Read artboard structure, screenshots, design tokens | `figma_get_metadata` tool schema               |
| **Ignite UI CLI** (`igniteui-cli`)         | Component docs, API reference                       | `list_components`                              |
| **Ignite UI Theming** (`igniteui-theming`) | Palette + component-level theming code              | `theming_detect_platform`                      |
| **Playwright**                             | Browser automation, screenshots, DOM measurement    | `playwright_browser_navigate` to `about:blank` |

---

## 1. Figma MCP

Figma provides two official MCP servers. Both are HTTP servers — there is **no npm package** to install for either one. Source: https://developers.figma.com/docs/figma-mcp-server/

| Server | URL | Authentication | How tools find a node |
| --- | --- | --- | --- |
| **Desktop** (local) | `http://127.0.0.1:3845/mcp` | None — the Figma desktop app must be running with the server enabled | The **file open in the desktop app**: the current selection, or the node ID taken from a pasted frame link |
| **Remote** | `https://mcp.figma.com/mcp` | Figma OAuth sign-in on first use | A **link** to a frame or layer, from which the file key and node ID are taken. No selection |

Prefer the **remote** server when the user can share file links: you can move between artboards without asking the user to click anything. Use the **desktop** server when the file is only available in the user's desktop app.

### Desktop server

1. In the Figma desktop app, open the design file and switch to **Dev Mode**.
2. In the inspect panel's **MCP server** section, select **Enable desktop MCP server**. A confirmation appears at the bottom of the screen.
3. Add the server to the client:

**VS Code** (`.vscode/mcp.json`):

```json
{
  "servers": {
    "figma-desktop": {
      "type": "http",
      "url": "http://127.0.0.1:3845/mcp"
    }
  }
}
```

**Cursor** (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "figma-desktop": {
      "url": "http://127.0.0.1:3845/mcp"
    }
  }
}
```

**Claude Code:**

```bash
claude mcp add --transport http figma-desktop http://127.0.0.1:3845/mcp
```

**JetBrains IDEs:** **Settings → Tools → AI Assistant → MCP Servers → + Add MCP Server**, then add an HTTP server with the URL `http://127.0.0.1:3845/mcp`.

Official guide: https://developers.figma.com/docs/figma-mcp-server/local-server-installation/

### Remote server

**VS Code** (`.vscode/mcp.json`):

```json
{
  "servers": {
    "figma": {
      "type": "http",
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```

**Cursor:** use the one-click install link from Figma's guide, or add the same URL as an HTTP server in `.cursor/mcp.json`.

**Claude Code:**

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

The client opens Figma's OAuth flow the first time a tool is called.

Official guide: https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/

> Neither server needs a secret in the config file, so both entries are safe to commit.

### Personal access token (REST API only)

The MCP servers do **not** use a personal access token. You need one only for the Figma **REST API** calls in this skill: Tier 1 asset export (`asset-extraction.md`) and reading exact variant properties (`design-provenance.md § Step 1`).

1. Figma → avatar → **Settings** → **Security** → **Personal access tokens** → **Generate new token**, with read access to file content.
2. Ask the user to export it in the shell that runs the agent (`export FIGMA_TOKEN=…`). **Never** write it into a project file, `mcp.json`, or source control.

Without a token, asset extraction falls back to Tier 2/3 and variant properties come from the design context only.

### Verifying Figma MCP

Check that the Figma tools (`figma_get_metadata`, `figma_get_design_context`, …) are listed. Do not spend a call just to verify: View/Collab seats have very small quotas. Tell which server is connected from its **configured URL** (`127.0.0.1:3845` → desktop, `mcp.figma.com` → remote); see `figma-exploration.md` for how each is driven.

> **Rate limits** (per seat; verify at https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/): View/Collab seats get up to 6 calls/month (20 on Starter). Dev/Full seats get 200/day on Starter and Professional, and 600/day on Organization and Enterprise, with per-minute caps of 10–20. Use `figma_get_metadata` for structural discovery and `figma_get_design_context` only for target artboards to conserve quota.

### Troubleshooting Figma MCP

| Problem                               | Fix                                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `figma_get_metadata` returns an error | Desktop: the Figma desktop app is closed, the server is not enabled in Dev Mode, or no file is open. Remote: sign in again through OAuth |
| Tools not available after config      | Restart the editor/IDE                                                                                                    |
| `File not found`                      | Verify the Figma file URL is correct and you have access                                                                  |
| Monthly/daily call quota exceeded     | A View/Collab seat allows 6 calls/month (20 on Starter) — use a Dev/Full seat, or the Figma REST API with a personal access token for metadata and assets |

---

## 2. Ignite UI CLI MCP (`igniteui-cli`)

> **Projects created with `npx igniteui-cli new` already have this configured.** `npx igniteui-cli new` runs the same setup as `ai-config`: it adds both `igniteui-cli` and `igniteui-theming` to the config file of the assistant chosen with `--assistants` (`.mcp.json` by default). For existing projects that lack this config, run:
>
> ```bash
> npx -y igniteui-cli ai-config
> ```
>
> This configures **both** the `igniteui-cli` and `igniteui-theming` MCP servers and copies the Agent Skills in one step, preserving existing server entries. Agents should run it themselves rather than asking the user to. Only follow the manual steps below (and in section 3) when `npx igniteui-cli ai-config` is not available or you need to configure an editor it does not cover.
>
> When `igniteui-cli` is installed globally (`npm install -g igniteui-cli`), `ig ai-config` and `ig mcp` are equivalent to the `npx` commands, and a server entry can use `"command": "ig", "args": ["mcp"]`.

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

Or add the entry to the project's `.mcp.json` (created at the repo root):

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

> **`npx -y igniteui-cli ai-config` configures this server too** (see section 2). Use the manual steps below only when `ai-config` is unavailable or doesn't cover your editor.

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

Or add the entry to the project's `.mcp.json` (created at the repo root):

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

The `theming_detect_platform` tool should analyze your `package.json` and return the detected platform (`angular`). Licensed projects (`@infragistics/igniteui-angular`) are also detected as `angular`, with `licensed: true`.

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

Or add the entry to the project's `.mcp.json` (created at the repo root):

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

Navigate to a URL: _"Navigate the browser to `about:blank`."_

The `playwright_browser_navigate` tool should open the page without error.

### Troubleshooting Playwright MCP

| Problem                                               | Fix                                                         |
| ----------------------------------------------------- | ----------------------------------------------------------- |
| Screenshots are blank                                 | Make sure the dev server is running (`npm start`)           |
| Page resets to `about:blank` after resize             | Always re-navigate after `playwright_browser_resize`        |
| Console shows `ERR_CONNECTION_REFUSED`                | The Angular dev server is not running                       |
| `browser_evaluate` fails with _"Invalid input: expected string, received undefined"_ | Pass code using the `function` parameter (not `script`): `playwright_browser_evaluate({ function: "() => { ... }" })` |
| `playwright_browser_take_screenshot` returns empty    | Re-navigate to the target URL first                         |

---

## Combined JSON Config (All Four Servers)

> **If your project was created with `npx igniteui-cli new`:** `igniteui-cli` and `igniteui-theming` are already in your client's config file (the one chosen with `--assistants`; `.mcp.json` by default). Add only the Figma and Playwright entries below — do not duplicate the others.
>
> **Fresh setup (no existing `.vscode/mcp.json`):** use the complete blocks below.
>
> The blocks use Figma's **remote** server. To use the desktop server instead, replace the `figma` entry with the desktop entry from section 1 (`http://127.0.0.1:3845/mcp`). No Figma token belongs in these files.

### VS Code (`.vscode/mcp.json`)

```json
{
  "servers": {
    "figma": {
      "type": "http",
      "url": "https://mcp.figma.com/mcp"
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
      "url": "https://mcp.figma.com/mcp"
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

### Claude Code (`.mcp.json` in the project root)

```json
{
  "mcpServers": {
    "figma": {
      "type": "http",
      "url": "https://mcp.figma.com/mcp"
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
