import { assertEquals } from '@std/assert';
import { createServer } from './server.ts';

Deno.test('createServer returns a server with start method', () => {
  const server = createServer();

  assertEquals(typeof server.start, 'function');
});

// Note: Full integration testing with stdio transport requires manual testing
// or more complex test setup with child processes
