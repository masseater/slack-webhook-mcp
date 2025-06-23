# Slack Webhook MCP Server

A Model Context Protocol (MCP) server that enables LLM applications like Claude Desktop to send messages to Slack channels via incoming webhooks.

## Features

- Send plain text or markdown-formatted messages to Slack
- Simple and secure webhook URL management
- Built with Deno for modern TypeScript development
- Full test coverage

## Installation

### Prerequisites

- [Deno](https://deno.land/) installed on your system
- A Slack workspace with incoming webhooks enabled
- Claude Desktop (or another MCP-compatible client)

### Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/slack-webhook-mcp.git
   cd slack-webhook-mcp
   ```

2. Create a Slack incoming webhook:
   - Go to your Slack workspace's App Directory
   - Search for "Incoming WebHooks" and add it
   - Choose a channel and create a webhook URL
   - Copy the webhook URL (it should look like `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX`)

3. Configure your environment:
   ```bash
   cp .env.example .env
   # Edit .env and add your webhook URL
   ```

## Configuration

### Claude Desktop

Add this server to your Claude Desktop configuration file:
`~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "slack-webhook": {
      "command": "deno",
      "args": ["run", "--allow-net", "--allow-env", "--allow-read", "/path/to/slack-webhook-mcp/src/index.ts"],
      "env": {
        "SLACK_WEBHOOK_URL": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
      }
    }
  }
}
```

### Using Compiled Binary

You can also compile the server to a standalone executable:

```bash
deno task build
```

Then use the binary in your configuration:

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

## Usage

Once configured, you can use the following tool in Claude Desktop:

### `send_slack_message`

Send a message to your configured Slack channel.

**Parameters:**
- `message` (required): The message text to send
- `webhook_url` (optional): Override the default webhook URL
- `format` (optional): Message format - "text" or "markdown" (default: "markdown")

**Examples:**
- "Send a Slack message saying the deployment was successful"
- "Notify the team on Slack that the tests are passing"
- "Send 'Build failed: timeout in test suite' to Slack with plain text format"

## Development

### Available Commands

```bash
# Run in development mode with auto-reload
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
```

### Project Structure

```
slack-webhook-mcp/
├── src/
│   ├── index.ts                # Entry point
│   ├── server.ts               # MCP server implementation
│   ├── tools/
│   │   ├── slack_webhook.ts    # Slack webhook tool
│   │   └── slack_webhook_test.ts # Tool tests
│   ├── types.ts                # TypeScript types
│   └── index_test.ts           # Integration tests
├── deno.json                   # Deno configuration
├── README.md                   # This file
└── .env.example                # Environment variables example
```

## Security

- Never commit your `.env` file or webhook URLs to version control
- Webhook URLs are validated to ensure they match Slack's format
- All errors are handled gracefully without exposing sensitive information

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests and ensure they pass (`deno task test`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built using the [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- Powered by [Deno](https://deno.land/)
- Integrates with [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)