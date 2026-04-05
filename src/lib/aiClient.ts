/**
 * Client-side AI integration — calls AI providers directly from the browser.
 * Supports OpenAI-compatible APIs (OpenAI, Gemini via OpenAI compat, Groq, Mistral, etc.)
 */
import type { AIConfig, AIProvider, AIMessage } from '@/types/apk-builder';

const PROVIDER_ENDPOINTS: Record<AIProvider, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
  qwen: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  mistral: 'https://api.mistral.ai/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  custom: '',
};

const DEFAULT_MODELS: Record<AIProvider, string> = {
  openai: 'gpt-4o-mini',
  gemini: 'gemini-2.5-flash',
  qwen: 'qwen-turbo',
  groq: 'llama-3.1-8b-instant',
  mistral: 'mistral-small-latest',
  anthropic: 'claude-3-haiku-20240307',
  custom: '',
};

export function getDefaultModel(provider: AIProvider): string {
  return DEFAULT_MODELS[provider] || '';
}

export async function chatCompletion(
  config: AIConfig,
  messages: AIMessage[],
): Promise<string> {
  const endpoint = config.provider === 'custom'
    ? config.baseUrl!
    : PROVIDER_ENDPOINTS[config.provider];

  if (!endpoint) throw new Error('Endpoint non configuré');

  const model = config.model || getDefaultModel(config.provider);

  // Anthropic uses a different format
  if (config.provider === 'anthropic') {
    return callAnthropic(endpoint, config.apiKey, model, messages, config.maxTokens);
  }

  // OpenAI-compatible format (works for OpenAI, Gemini, Groq, Mistral, Qwen, etc.)
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: config.maxTokens || 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erreur API (${res.status}): ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callAnthropic(
  endpoint: string, apiKey: string, model: string,
  messages: AIMessage[], maxTokens?: number,
): Promise<string> {
  const systemMsg = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens || 4096,
      ...(systemMsg ? { system: systemMsg.content } : {}),
      messages: userMessages.map(m => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erreur Anthropic (${res.status}): ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || '';
}

/** Test if the API key works by sending a minimal request */
export async function testApiKey(config: AIConfig): Promise<boolean> {
  try {
    const result = await chatCompletion(config, [
      { role: 'user', content: 'Réponds uniquement "ok".' },
    ]);
    return result.length > 0;
  } catch {
    return false;
  }
}
