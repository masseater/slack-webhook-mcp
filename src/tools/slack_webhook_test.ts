import { assertEquals } from '@std/assert';
import { sendSlackMessage } from './slack_webhook.ts';

// Mock fetch for testing
function mockFetch(responseText: string, status = 200) {
  globalThis.fetch = (_url: string | URL | Request, _init?: RequestInit) => {
    return Promise.resolve(
      new Response(responseText, {
        status,
        headers: { 'Content-Type': 'text/plain' },
      }),
    );
  };
}

Deno.test('sendSlackMessage - success case', async () => {
  mockFetch('ok');

  const result = await sendSlackMessage({
    message: 'Test message',
    webhookUrl: 'https://hooks.slack.com/services/TEST/WEBHOOK/URL',
  });

  assertEquals(result.success, true);
  assertEquals(result.error, undefined);
  assertEquals(typeof result.timestamp, 'string');
});

Deno.test('sendSlackMessage - missing webhook URL', async () => {
  // Clear environment variable
  const originalUrl = Deno.env.get('SLACK_WEBHOOK_URL');
  Deno.env.delete('SLACK_WEBHOOK_URL');

  const result = await sendSlackMessage({
    message: 'Test message',
  });

  assertEquals(result.success, false);
  assertEquals(
    result.error,
    'No webhook URL provided. Please set SLACK_WEBHOOK_URL environment variable or provide webhook_url parameter.',
  );

  // Restore environment variable if it existed
  if (originalUrl) {
    Deno.env.set('SLACK_WEBHOOK_URL', originalUrl);
  }
});

Deno.test('sendSlackMessage - invalid webhook URL format', async () => {
  const result = await sendSlackMessage({
    message: 'Test message',
    webhookUrl: 'https://invalid.url/webhook',
  });

  assertEquals(result.success, false);
  assertEquals(
    result.error,
    'Invalid webhook URL format. URL must start with https://hooks.slack.com/services/',
  );
});

Deno.test('sendSlackMessage - Slack API error', async () => {
  mockFetch('invalid_token', 403);

  const result = await sendSlackMessage({
    message: 'Test message',
    webhookUrl: 'https://hooks.slack.com/services/TEST/WEBHOOK/URL',
  });

  assertEquals(result.success, false);
  assertEquals(result.error, 'Slack API error (403): invalid_token');
});

Deno.test('sendSlackMessage - network error', async () => {
  globalThis.fetch = () => {
    return Promise.reject(new Error('Network failure'));
  };

  const result = await sendSlackMessage({
    message: 'Test message',
    webhookUrl: 'https://hooks.slack.com/services/TEST/WEBHOOK/URL',
  });

  assertEquals(result.success, false);
  assertEquals(result.error, 'Network error: Network failure');
});

Deno.test('sendSlackMessage - markdown format', async () => {
  let capturedBody: Record<string, unknown> = {};

  globalThis.fetch = (_url: string | URL | Request, init?: RequestInit) => {
    capturedBody = JSON.parse(init?.body as string);
    return Promise.resolve(new Response('ok', { status: 200 }));
  };

  await sendSlackMessage({
    message: '*Bold text*',
    webhookUrl: 'https://hooks.slack.com/services/TEST/WEBHOOK/URL',
    format: 'markdown',
  });

  assertEquals(capturedBody.text, '*Bold text*');
  assertEquals(capturedBody.mrkdwn, true);
});

Deno.test('sendSlackMessage - text format', async () => {
  let capturedBody: Record<string, unknown> = {};

  globalThis.fetch = (_url: string | URL | Request, init?: RequestInit) => {
    capturedBody = JSON.parse(init?.body as string);
    return Promise.resolve(new Response('ok', { status: 200 }));
  };

  await sendSlackMessage({
    message: 'Plain text',
    webhookUrl: 'https://hooks.slack.com/services/TEST/WEBHOOK/URL',
    format: 'text',
  });

  assertEquals(capturedBody.text, 'Plain text');
  assertEquals(capturedBody.mrkdwn, undefined);
});
