# CLAUDE.local.md

## Slack Webhook MCP Server Configuration

This project includes a locally configured MCP server for sending Slack messages.

### Available MCP Tools

- `send_slack_message`: Send messages to Slack via webhook
  - Parameters:
    - `message` (required): The message text
    - `webhook_url` (optional): Override default webhook URL
    - `format` (optional): "text" or "markdown" (default: "markdown")

### Usage Examples

```
# Send a simple message
send_slack_message({ message: "Hello from MCP!" })

# Send markdown formatted message
send_slack_message({ 
  message: "*Bold* and _italic_ text", 
  format: "markdown" 
})
```

### Local Configuration

The MCP server is configured to run from this directory using Deno.
Make sure to set up a real Slack webhook URL in `.env` file for actual use.