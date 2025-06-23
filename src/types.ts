// Common types used across the MCP server

export interface ToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}

export interface SlackBlockKitBlock {
  type: string;
  text?: {
    type: string;
    text: string;
  };
  [key: string]: unknown;
}
