import { buildWineAutofillPrompt, wineAutofillJsonSchema } from './_wineAutofillPrompt';
import { validateWineAutofillRequest, validateWineAutofillResult } from './_wineAutofillValidation';

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_MODEL = 'gpt-4.1-mini';

function sendJson(response: any, status: number, body: unknown) {
  response.status(status).setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(body));
}

function extractOutputText(openAIResponse: any): string | null {
  if (typeof openAIResponse?.output_text === 'string') return openAIResponse.output_text;

  const output = Array.isArray(openAIResponse?.output) ? openAIResponse.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (typeof part?.text === 'string') return part.text;
    }
  }

  return null;
}

export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') {
    sendJson(response, 405, { error: { code: 'method_not_allowed', message: 'Use POST to request wine autofill.' } });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    sendJson(response, 500, { error: { code: 'missing_openai_key', message: 'AI autofill is not configured yet.' } });
    return;
  }

  const { input, error } = validateWineAutofillRequest(request.body);
  if (!input) {
    sendJson(response, 400, { error: { code: 'invalid_request', message: error ?? 'Please check the wine details and try again.' } });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18_000);

  try {
    const openAIResponse = await fetch(OPENAI_RESPONSES_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        input: [
          {
            role: 'system',
            content:
              'You return conservative wine autofill suggestions for a private cellar app. Follow the schema exactly and never include secrets or implementation details.',
          },
          { role: 'user', content: buildWineAutofillPrompt(input) },
        ],
        text: {
          format: {
            type: 'json_schema',
            ...wineAutofillJsonSchema,
          },
        },
      }),
    });

    if (!openAIResponse.ok) {
      sendJson(response, 502, { error: { code: 'openai_request_failed', message: 'The sommelier could not generate suggestions right now. Please try again.' } });
      return;
    }

    const payload = await openAIResponse.json();
    const outputText = extractOutputText(payload);
    if (!outputText) {
      sendJson(response, 502, { error: { code: 'empty_ai_response', message: 'The sommelier returned an empty response. Please try again.' } });
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      sendJson(response, 502, { error: { code: 'invalid_ai_json', message: 'The sommelier response could not be read. Please try again.' } });
      return;
    }

    const result = validateWineAutofillResult(parsed);
    if (!result) {
      sendJson(response, 502, { error: { code: 'invalid_ai_output', message: 'The sommelier returned an incomplete suggestion. Please try again.' } });
      return;
    }

    sendJson(response, 200, result);
  } catch (caught) {
    const isAbort = caught instanceof Error && caught.name === 'AbortError';
    sendJson(response, isAbort ? 504 : 500, {
      error: {
        code: isAbort ? 'openai_timeout' : 'wine_autofill_failed',
        message: isAbort ? 'The sommelier took too long to respond. Please try again.' : 'AI autofill failed. Your typed values are still safe.',
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}
