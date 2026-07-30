# Setting Up the Ignite UI CLI MCP Server

> **Part of the [`igniteui-angular-components`](../SKILL.md) skill hub.**

The Ignite UI CLI MCP server exposes `list_components`, `get_doc`, `search_docs`, and `search_api` so AI assistants can discover Ignite UI components and read version-accurate documentation. It must be configured in the editor/agent before these tools become available, and the editor or agent session must be restarted afterwards — MCP servers cannot be hot-loaded into a running session.

> Depending on the client, MCP tool names may appear with a server prefix (e.g. `mcp__igniteui-cli__list_components` in Claude Code). This skill refers to tools by their bare names.

## Recommended: One-Command Setup

From the project root:

```bash
npx -y igniteui-cli ai-config
```

This configures **both** the `igniteui-cli` and `igniteui-theming` MCP servers, copies the Ignite UI Agent Skills into the project, and preserves any existing server entries in the config files. Inline options such as `--agents claude copilot` and `--assistants vscode cursor` select which agents and editors to configure.

Projects created with `npx igniteui-cli new` already have the `igniteui-cli` MCP entry configured.

## Manual Configuration (fallback)

Use these only when `ai-config` is unavailable or your editor is not covered by it.

### VS Code — `.vscode/mcp.json`

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

`npx -y` works whether `igniteui-cli` is installed locally in `node_modules` or needs to be pulled from the npm registry.

### Claude Code

```bash
claude mcp add igniteui-cli -- npx -y igniteui-cli mcp
```

### Cursor — `.cursor/mcp.json`

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

### Claude Desktop

Edit the Claude Desktop config file (**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`, **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`) and add the same `mcpServers` entry as shown for Cursor above.

### WebStorm / JetBrains IDEs

1. Go to **Settings → Tools → AI Assistant → MCP Servers**
2. Click **+ Add MCP Server**
3. Set Command to `npx` and Arguments to `-y igniteui-cli mcp`
4. Click OK and restart the AI Assistant

## Verifying the Setup

After restarting the editor/session, ask the AI assistant:

> "List all available Ignite UI components"

If the MCP server is running, the `list_components` tool will return all available components for the detected framework.
