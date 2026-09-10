# Setting Up the Theming MCP Server

> **Part of the [`igniteui-angular-theming`](../SKILL.md) skill hub.**

The Ignite UI Theming MCP server enables AI assistants to generate production-ready theming code. It must be configured in the editor/agent before the theming tools become available, and the editor or agent session must be restarted afterwards — MCP servers cannot be hot-loaded into a running session.

> Depending on the client, MCP tool names may appear with a server prefix (e.g. `mcp__igniteui-theming__detect_platform` in Claude Code). This skill refers to tools by their bare names.

## Recommended: One-Command Setup

From the project root:

```bash
npx -y igniteui-cli ai-config
```

This configures **both** the `igniteui-theming` and `igniteui-cli` MCP servers, copies the Ignite UI Agent Skills into the project, and preserves any existing server entries in the config files. Inline options such as `--agents claude copilot` and `--assistants vscode cursor` select which agents and editors to configure.

## Manual Configuration (fallback)

Use these only when `ai-config` is unavailable or your editor is not covered by it.

### VS Code — `.vscode/mcp.json`

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

`npx -y` works whether `igniteui-theming` is installed locally in `node_modules` or needs to be pulled from the npm registry.

### Claude Code

```bash
claude mcp add igniteui-theming -- npx -y igniteui-theming igniteui-theming-mcp
```

### Cursor — `.cursor/mcp.json`

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

### Claude Desktop

Edit the Claude Desktop config file (**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`, **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`) and add the same `mcpServers` entry as shown for Cursor above.

### WebStorm / JetBrains IDEs

1. Go to **Settings → Tools → AI Assistant → MCP Servers**
2. Click **+ Add MCP Server**
3. Set Command to `npx` and Arguments to `-y igniteui-theming igniteui-theming-mcp`
4. Click OK and restart the AI Assistant

## Verifying the Setup

After restarting the editor/session, ask the AI assistant:

> "Detect which Ignite UI platform my project uses"

If the MCP server is running, the `detect_platform` tool will analyze `package.json` and return the detected platform (e.g., `angular`).
