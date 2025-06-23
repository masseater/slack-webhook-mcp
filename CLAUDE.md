# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## Project Overview

This is a Model Context Protocol (MCP) server built with Deno that provides Slack webhook
integration tools to LLM applications like Claude Desktop. The server exposes tools that allow the
LLM to send messages to Slack channels via incoming webhooks through a standardized MCP interface.

## Development Commands

```bash
# Run the MCP server in development mode
deno task dev

# Run tests
deno task test

# Run tests with coverage
deno task test:coverage

# Type checking
deno task check

# Linting
deno task lint

# Format code
deno task fmt

# Build standalone executable
deno task build

# Run a specific test file
deno test src/slack_webhook_test.ts
```

## Architecture

```
slack-webhook-mcp/
├── src/
│   ├── index.ts                # MCP server entry point
│   ├── server.ts               # MCP server implementation with stdio transport
│   ├── tools/
│   │   ├── slack_webhook.ts    # Slack webhook tool implementation
│   │   └── slack_webhook_test.ts # Tests for webhook functionality
│   └── types.ts                # TypeScript type definitions
├── deno.json                   # Deno configuration, tasks, and import map
├── README.md                   # User documentation
└── .env.example                # Example environment variables
```

### Key Components

1. **MCP Server (src/server.ts)**
   - Uses `@modelcontextprotocol/sdk` with McpServer class for tool registration
   - Implements stdio transport for Claude Desktop integration
   - Registers tools using Zod schema validation
   - Returns structured MCP responses with content blocks

2. **Slack Webhook Tool (src/tools/slack_webhook.ts)**
   - Sends messages to Slack using native fetch API
   - Supports plain text and markdown formatting
   - Validates webhook URLs and handles HTTP errors
   - Returns success/failure status to MCP client

3. **Entry Point (src/index.ts)**
   - Initializes and starts the MCP server
   - Handles environment configuration
   - Sets up stdio transport

## Environment Configuration

The server requires a Slack webhook URL. Configure it using:

1. **Environment Variable** (for development):
   ```bash
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL deno task dev
   ```

2. **.env file** (recommended for local development): Create a `.env` file:
   ```
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```

3. **MCP Client Configuration**: Configure in Claude Desktop's
   `~/Library/Application Support/Claude/claude_desktop_config.json`:

## MCP Server Configuration

For Claude Desktop, add to configuration:

```json
{
  "mcpServers": {
    "slack-webhook": {
      "command": "deno",
      "args": [
        "run",
        "--allow-net",
        "--allow-env",
        "--allow-read",
        "/path/to/slack-webhook-mcp/src/index.ts"
      ],
      "env": {
        "SLACK_WEBHOOK_URL": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
      }
    }
  }
}
```

For compiled binary:

```json
{
  "mcpServers": {
    "slack-webhook": {
      "command": "/path/to/slack-webhook-mcp/slack-webhook-server",
      "env": {
        "SLACK_WEBHOOK_URL": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
      }
    }
  }
}
```

## MCP Tools

The server exposes the following tools:

### `send_slack_message`

Sends a message to a Slack channel via webhook.

Parameters:

- `message` (required): The message text to send
- `webhook_url` (optional): Override the default webhook URL from environment
- `format` (optional): Message format - "text" or "markdown" (default: "markdown")

Example usage in Claude Desktop:

- "Send a Slack message saying the deployment was successful"
- "Notify the team on Slack that the tests are passing"
- "Send 'Build failed: timeout in test suite' to Slack"

## Deno Configuration (deno.json)

```json
{
  "tasks": {
    "dev": "deno run --allow-net --allow-env --allow-read --watch src/index.ts",
    "test": "deno test --allow-net --allow-env --allow-read",
    "test:coverage": "deno test --allow-net --allow-env --allow-read --coverage",
    "check": "deno check src/index.ts",
    "lint": "deno lint",
    "fmt": "deno fmt",
    "build": "deno compile --allow-net --allow-env --allow-read --output=slack-webhook-server src/index.ts"
  },
  "imports": {
    "@std/assert": "jsr:@std/assert@^1.0.0",
    "@std/dotenv": "jsr:@std/dotenv@^0.225.0",
    "@modelcontextprotocol/sdk": "npm:@modelcontextprotocol/sdk@^0.8.0",
    "zod": "npm:zod@^3.24.0"
  },
  "fmt": {
    "lineWidth": 100,
    "indentWidth": 2,
    "singleQuote": true
  },
  "lint": {
    "rules": {
      "tags": ["recommended"]
    }
  },
  "compilerOptions": {
    "strict": true
  }
}
```

## Implementation Notes

1. **Deno Permissions**: The server requires `--allow-net` for HTTP requests, `--allow-env` for
   environment variables, and `--allow-read` for .env file
2. **Import Maps**: All external dependencies are managed through deno.json imports section
3. **Error Handling**: All errors are caught and returned as structured MCP error responses
4. **URL Validation**: Webhook URLs must match the pattern `https://hooks.slack.com/services/...`
5. **Security**: Never commit webhook URLs or .env files to the repository
6. **Testing**: Use Deno's built-in test runner with mocked fetch for HTTP requests
7. **Type Safety**: Leverage Deno's TypeScript support with strict mode enabled

## Testing Strategy

1. **Unit Tests**: Test individual functions with mocked dependencies
2. **Integration Tests**: Test MCP tool registration and response handling
3. **Mock HTTP Requests**: Use Deno's test utilities to mock fetch calls
4. **Environment Isolation**: Use test-specific environment variables

Example test:

```typescript
import { assertEquals } from '@std/assert';

Deno.test('send_slack_message sends correct payload', async () => {
  using _mock = await mockFetch();

  // Mock the Slack API response
  globalThis.fetch = async (url: string | URL | Request, init?: RequestInit) => {
    if (url === 'https://hooks.slack.com/services/test') {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }
    return new Response('Not found', { status: 404 });
  };

  // Test implementation
});
```

## Future Enhancements

- Support for Slack Block Kit formatting
- Multiple webhook URL management with channel routing
- Message threading and conversation support
- File and image attachments
- Scheduled message delivery
- Integration with Deno KV for message history
