/**
 * Puter.com AI Client
 * Wrapper for puter.ai.chat() with tool calling support
 */

import { ALL_PUTER_TOOLS, type ToolDefinition } from './puterTools';

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (
          prompt: string | any[],
          options?: Record<string, any>,
        ) => Promise<PuterChatResponse | AsyncIterable<PuterChatChunk>>;
      };
    };
  }
}

export interface PuterChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content?: string;
  tool_call_id?: string;
  tool_calls?: PuterToolCall[];
}

export interface PuterToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

export interface PuterChatResponse {
  message: {
    content?: string;
    tool_calls?: PuterToolCall[];
  };
  text?: string;
}

export interface PuterChatChunk {
  type: 'text' | 'tool_use';
  text?: string;
  name?: string;
  id?: string;
  input?: Record<string, any>;
}

/**
 * Load Puter.js library
 */
export async function loadPuterLibrary(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.puter) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.onload = () => {
      resolve(!!window.puter);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

/**
 * Check if Puter.js is loaded
 */
export function isPuterLoaded(): boolean {
  return !!window.puter?.ai?.chat;
}

/**
 * Call Puter AI with tools
 */
export async function callPuterAI(
  prompt: string,
  options?: {
    model?: string;
    stream?: boolean;
    max_tokens?: number;
    temperature?: number;
    tools?: ToolDefinition[];
  },
): Promise<PuterChatResponse> {
  if (!isPuterLoaded()) {
    throw new Error('Puter.js not loaded. Call loadPuterLibrary() first.');
  }

  const tools = options?.tools || ALL_PUTER_TOOLS;

  const response = await window.puter.ai.chat(prompt, {
    model: options?.model || 'gpt-5.4-nano',
    max_tokens: options?.max_tokens || 4096,
    temperature: options?.temperature || 0.7,
    tools,
  });

  return response as PuterChatResponse;
}

/**
 * Call Puter AI with streaming
 */
export async function* callPuterAIStream(
  prompt: string,
  options?: {
    model?: string;
    max_tokens?: number;
    temperature?: number;
    tools?: ToolDefinition[];
  },
): AsyncGenerator<PuterChatChunk> {
  if (!isPuterLoaded()) {
    throw new Error('Puter.js not loaded. Call loadPuterLibrary() first.');
  }

  const tools = options?.tools || ALL_PUTER_TOOLS;

  const response = await window.puter.ai.chat(prompt, {
    model: options?.model || 'gpt-5.4-nano',
    max_tokens: options?.max_tokens || 4096,
    temperature: options?.temperature || 0.7,
    tools,
    stream: true,
  });

  for await (const chunk of response as AsyncIterable<PuterChatChunk>) {
    yield chunk;
  }
}

/**
 * Call Puter AI with message history
 */
export async function callPuterAIWithHistory(
  messages: PuterChatMessage[],
  options?: {
    model?: string;
    stream?: boolean;
    max_tokens?: number;
    temperature?: number;
    tools?: ToolDefinition[];
  },
): Promise<PuterChatResponse> {
  if (!isPuterLoaded()) {
    throw new Error('Puter.js not loaded. Call loadPuterLibrary() first.');
  }

  const tools = options?.tools || ALL_PUTER_TOOLS;

  const response = await window.puter.ai.chat(messages, {
    model: options?.model || 'gpt-5.4-nano',
    max_tokens: options?.max_tokens || 4096,
    temperature: options?.temperature || 0.7,
    tools,
  });

  return response as PuterChatResponse;
}

/**
 * Parse tool call arguments
 */
export function parseToolCallArguments(argumentsJson: string): Record<string, any> {
  try {
    return JSON.parse(argumentsJson);
  } catch (error) {
    console.error('Failed to parse tool call arguments:', argumentsJson);
    return {};
  }
}

/**
 * Check if response contains tool calls
 */
export function hasToolCalls(response: PuterChatResponse): boolean {
  return !!(response.message?.tool_calls && response.message.tool_calls.length > 0);
}

/**
 * Extract tool calls from response
 */
export function extractToolCalls(response: PuterChatResponse): PuterToolCall[] {
  return response.message?.tool_calls || [];
}

/**
 * Extract text response
 */
export function extractTextResponse(response: PuterChatResponse): string {
  return response.message?.content || response.text || '';
}

/**
 * Build system prompt for AI
 */
export function buildSystemPrompt(repoName: string, context?: string): string {
  return `Tu es un expert DevOps et développeur full-stack spécialisé dans la compilation d'applications Android avec Capacitor.

Tu travailles sur le dépôt: ${repoName}

Tes responsabilités:
1. Analyser le code et les logs de compilation
2. Identifier les erreurs et les fichiers manquants
3. Proposer et implémenter des corrections
4. Préparer le dépôt pour la compilation APK
5. Déclencher les workflows GitHub Actions

Tu as accès aux outils suivants:
- read_repo_file: Lire un fichier du dépôt
- list_repo_files: Lister les fichiers
- read_repo_logs: Consulter les logs des workflows
- create_or_update_file: Créer ou modifier un fichier
- create_new_file: Créer un nouveau fichier avec template
- trigger_workflow: Déclencher un workflow
- get_build_status: Vérifier le statut du build
- check_missing_files: Vérifier les fichiers manquants

Quand tu identifies un problème:
1. Utilise read_repo_logs pour consulter les erreurs
2. Utilise read_repo_file pour examiner les fichiers concernés
3. Utilise create_or_update_file pour corriger les fichiers
4. Utilise trigger_workflow pour relancer le build

Sois proactif et propose des solutions avant de les implémenter.
Explique chaque action que tu effectues.

${context ? `\nContexte supplémentaire:\n${context}` : ''}`;
}

/**
 * Test Puter AI connection
 */
export async function testPuterConnection(): Promise<boolean> {
  try {
    if (!isPuterLoaded()) {
      const loaded = await loadPuterLibrary();
      if (!loaded) return false;
    }

    const response = await callPuterAI('Réponds uniquement "ok".');
    return !!response;
  } catch (error) {
    console.error('Puter connection test failed:', error);
    return false;
  }
}

/**
 * Get available Puter models
 */
export async function getPuterModels(): Promise<string[]> {
  // This would require listModels() from Puter API
  // For now, return common models
  return [
    'gpt-5.4-nano',
    'gpt-5.2-chat',
    'gemini-2.5-flash-lite',
    'claude-3-haiku',
    'claude-3-sonnet',
  ];
}
