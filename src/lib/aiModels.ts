/**
 * Fetch available models from AI providers.
 * Each provider has a /v1/models endpoint (OpenAI-compatible).
 */
import type { AIProvider } from '@/types/apk-builder';

interface ModelInfo {
  id: string;
  name: string;
}

const MODEL_ENDPOINTS: Partial<Record<AIProvider, string>> = {
  openai: 'https://api.openai.com/v1/models',
  groq: 'https://api.groq.com/openai/v1/models',
  mistral: 'https://api.mistral.ai/v1/models',
  qwen: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/models',
};

// Gemini uses a different format
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function fetchModels(provider: AIProvider, apiKey: string): Promise<ModelInfo[]> {
  try {
    if (provider === 'gemini') {
      return await fetchGeminiModels(apiKey);
    }

    if (provider === 'anthropic') {
      // Anthropic doesn't have a /models endpoint, return known models
      return [
        { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
        { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
        { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
      ];
    }

    if (provider === 'custom') return [];

    const endpoint = MODEL_ENDPOINTS[provider];
    if (!endpoint) return [];

    const res = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!res.ok) return [];

    const data = await res.json();
    const models: ModelInfo[] = (data.data || [])
      .map((m: any) => ({ id: m.id, name: m.id }))
      .sort((a: ModelInfo, b: ModelInfo) => a.id.localeCompare(b.id));

    return models;
  } catch {
    return [];
  }
}

async function fetchGeminiModels(apiKey: string): Promise<ModelInfo[]> {
  try {
    const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.models || [])
      .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m: any) => ({
        id: m.name?.replace('models/', '') || m.name,
        name: m.displayName || m.name,
      }));
  } catch {
    return [];
  }
}
