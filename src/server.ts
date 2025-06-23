import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { sendSlackMessage } from './tools/slack_webhook.ts';

export function createServer(): { start: () => Promise<void> } {
  const server = new McpServer({
    name: 'slack-webhook',
    version: '1.0.0',
  });

  // Register the send_slack_message tool
  server.tool(
    'send_slack_message',
    {
      message: z.string().describe('The message text to send to Slack'),
      webhook_url: z.string().optional().describe('Override the default webhook URL'),
      format: z.enum(['text', 'markdown']).optional().default('markdown')
        .describe('Message format - "text" or "markdown"'),
    },
    async (params) => {
      try {
        const result = await sendSlackMessage({
          message: params.message,
          webhookUrl: params.webhook_url,
          format: params.format,
        });

        return {
          content: [
            {
              type: 'text',
              text: result.success
                ? `Message sent successfully to Slack${
                  result.timestamp ? ` at ${result.timestamp}` : ''
                }`
                : `Failed to send message: ${result.error}`,
            },
          ],
          isError: !result.success,
        };
      } catch (error) {
        console.error('Tool error:', error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  return {
    start: async () => {
      const transport = new StdioServerTransport();
      await server.connect(transport);
      console.error('Slack webhook MCP server started');
    },
  };
}
