import { load } from '@std/dotenv';
import { createServer } from './server.ts';

// Load environment variables from .env file
await load({ export: true });

// Create and start the MCP server
const server = createServer();
await server.start();
