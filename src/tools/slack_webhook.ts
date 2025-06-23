export interface SlackMessageParams {
  message: string;
  webhookUrl?: string;
  format?: 'text' | 'markdown';
}

export interface SlackResponse {
  success: boolean;
  error?: string;
  timestamp?: string;
}

/**
 * Sends a message to Slack via webhook
 */
export async function sendSlackMessage(params: SlackMessageParams): Promise<SlackResponse> {
  const { message, webhookUrl, format = 'markdown' } = params;

  // Get webhook URL from params or environment
  const url = webhookUrl || Deno.env.get('SLACK_WEBHOOK_URL');

  if (!url) {
    return {
      success: false,
      error:
        'No webhook URL provided. Please set SLACK_WEBHOOK_URL environment variable or provide webhook_url parameter.',
    };
  }

  // Validate webhook URL format
  if (!url.startsWith('https://hooks.slack.com/services/')) {
    return {
      success: false,
      error: 'Invalid webhook URL format. URL must start with https://hooks.slack.com/services/',
    };
  }

  try {
    // Prepare the payload
    const payload: Record<string, unknown> = {
      text: message,
    };

    // Add markdown formatting if requested
    if (format === 'markdown') {
      payload.mrkdwn = true;
    }

    // Send request to Slack
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return {
        success: false,
        error: `Slack API error (${response.status}): ${responseText}`,
      };
    }

    // Slack returns 'ok' on success
    if (responseText === 'ok') {
      return {
        success: true,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: false,
      error: `Unexpected response from Slack: ${responseText}`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
