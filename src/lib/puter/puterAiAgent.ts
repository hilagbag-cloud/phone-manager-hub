/**
 * Puter.com AI Agent
 * Orchestrates AI interactions with tool calling for autonomous GitHub operations
 */

import {
  callPuterAI,
  callPuterAIStream,
  callPuterAIWithHistory,
  hasToolCalls,
  extractToolCalls,
  extractTextResponse,
  parseToolCallArguments,
  buildSystemPrompt,
  type PuterChatMessage,
  type PuterChatResponse,
} from './puterAiClient';
import { executeTool } from './puterGithubTools';
import { getToolsByCategory, type ToolDefinition } from './puterTools';
import type { RepoInfo } from '@/types/apk-builder';

export interface AgentAction {
  type: 'tool_call' | 'response' | 'error';
  tool_name?: string;
  tool_args?: Record<string, any>;
  tool_result?: string;
  message?: string;
  timestamp: Date;
}

export interface AgentSession {
  id: string;
  repoInfo: RepoInfo;
  messages: PuterChatMessage[];
  actions: AgentAction[];
  status: 'idle' | 'running' | 'completed' | 'error';
  model: string;
}

/**
 * Create a new agent session
 */
export function createAgentSession(
  repoInfo: RepoInfo,
  model: string = 'gpt-5.4-nano',
): AgentSession {
  return {
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    repoInfo,
    messages: [],
    actions: [],
    status: 'idle',
    model,
  };
}

/**
 * Add message to session
 */
export function addMessageToSession(
  session: AgentSession,
  message: PuterChatMessage,
): void {
  session.messages.push(message);
}

/**
 * Add action to session
 */
export function addActionToSession(
  session: AgentSession,
  action: AgentAction,
): void {
  session.actions.push(action);
}

/**
 * Run AI agent with tool calling loop
 */
export async function runAiAgent(
  session: AgentSession,
  userPrompt: string,
  options?: {
    maxIterations?: number;
    toolCategories?: ('read' | 'write' | 'workflow' | 'all')[];
    onAction?: (action: AgentAction) => void;
  },
): Promise<string> {
  const maxIterations = options?.maxIterations || 10;
  const toolCategories = options?.toolCategories || ['all'];
  const onAction = options?.onAction;

  session.status = 'running';

  // Build system prompt
  const systemPrompt = buildSystemPrompt(
    `${session.repoInfo.owner}/${session.repoInfo.repo}`,
  );

  // Add system message
  addMessageToSession(session, {
    role: 'system',
    content: systemPrompt,
  });

  // Add user prompt
  addMessageToSession(session, {
    role: 'user',
    content: userPrompt,
  });

  let iterations = 0;
  let finalResponse = '';

  try {
    while (iterations < maxIterations) {
      iterations++;

      // Get tools based on categories
      let tools: ToolDefinition[] = [];
      for (const category of toolCategories) {
        tools = [...tools, ...getToolsByCategory(category)];
      }

      // Call AI
      const response = await callPuterAIWithHistory(session.messages, {
        model: session.model,
        max_tokens: 4096,
        temperature: 0.7,
        tools,
      });

      // Check if AI wants to call tools
      if (hasToolCalls(response)) {
        const toolCalls = extractToolCalls(response);

        // Add assistant message with tool calls
        addMessageToSession(session, {
          role: 'assistant',
          tool_calls: toolCalls,
        });

        // Execute each tool call
        for (const toolCall of toolCalls) {
          const toolName = toolCall.function.name;
          const toolArgs = parseToolCallArguments(toolCall.function.arguments);

          const action: AgentAction = {
            type: 'tool_call',
            tool_name: toolName,
            tool_args: toolArgs,
            timestamp: new Date(),
          };

          try {
            // Execute tool
            const result = await executeTool(toolName, toolArgs, session.repoInfo);

            action.type = 'tool_call';
            action.tool_result = result;

            // Add tool result message
            addMessageToSession(session, {
              role: 'tool',
              tool_call_id: toolCall.id,
              content: result,
            });

            addActionToSession(session, action);
            onAction?.(action);
          } catch (error) {
            const errorMessage = (error as Error).message;

            action.type = 'error';
            action.message = errorMessage;

            // Add error message
            addMessageToSession(session, {
              role: 'tool',
              tool_call_id: toolCall.id,
              content: `Erreur: ${errorMessage}`,
            });

            addActionToSession(session, action);
            onAction?.(action);
          }
        }
      } else {
        // AI responded without tool calls - we're done
        finalResponse = extractTextResponse(response);

        const action: AgentAction = {
          type: 'response',
          message: finalResponse,
          timestamp: new Date(),
        };

        addMessageToSession(session, {
          role: 'assistant',
          content: finalResponse,
        });

        addActionToSession(session, action);
        onAction?.(action);

        session.status = 'completed';
        break;
      }
    }

    if (iterations >= maxIterations) {
      session.status = 'error';
      finalResponse = `Nombre maximum d'itérations (${maxIterations}) atteint.`;
    }
  } catch (error) {
    session.status = 'error';
    finalResponse = `Erreur lors de l'exécution: ${(error as Error).message}`;
  }

  return finalResponse;
}

/**
 * Run AI agent with streaming
 */
export async function* runAiAgentStreaming(
  session: AgentSession,
  userPrompt: string,
  options?: {
    maxIterations?: number;
    toolCategories?: ('read' | 'write' | 'workflow' | 'all')[];
  },
): AsyncGenerator<AgentAction> {
  const maxIterations = options?.maxIterations || 10;
  const toolCategories = options?.toolCategories || ['all'];

  session.status = 'running';

  // Build system prompt
  const systemPrompt = buildSystemPrompt(
    `${session.repoInfo.owner}/${session.repoInfo.repo}`,
  );

  // Add system message
  addMessageToSession(session, {
    role: 'system',
    content: systemPrompt,
  });

  // Add user prompt
  addMessageToSession(session, {
    role: 'user',
    content: userPrompt,
  });

  let iterations = 0;

  try {
    while (iterations < maxIterations) {
      iterations++;

      // Get tools based on categories
      let tools: ToolDefinition[] = [];
      for (const category of toolCategories) {
        tools = [...tools, ...getToolsByCategory(category)];
      }

      // Call AI
      const response = await callPuterAIWithHistory(session.messages, {
        model: session.model,
        max_tokens: 4096,
        temperature: 0.7,
        tools,
      });

      // Check if AI wants to call tools
      if (hasToolCalls(response)) {
        const toolCalls = extractToolCalls(response);

        // Add assistant message with tool calls
        addMessageToSession(session, {
          role: 'assistant',
          tool_calls: toolCalls,
        });

        // Execute each tool call
        for (const toolCall of toolCalls) {
          const toolName = toolCall.function.name;
          const toolArgs = parseToolCallArguments(toolCall.function.arguments);

          const action: AgentAction = {
            type: 'tool_call',
            tool_name: toolName,
            tool_args: toolArgs,
            timestamp: new Date(),
          };

          try {
            // Execute tool
            const result = await executeTool(toolName, toolArgs, session.repoInfo);

            action.tool_result = result;

            // Add tool result message
            addMessageToSession(session, {
              role: 'tool',
              tool_call_id: toolCall.id,
              content: result,
            });

            addActionToSession(session, action);
            yield action;
          } catch (error) {
            const errorMessage = (error as Error).message;

            action.type = 'error';
            action.message = errorMessage;

            // Add error message
            addMessageToSession(session, {
              role: 'tool',
              tool_call_id: toolCall.id,
              content: `Erreur: ${errorMessage}`,
            });

            addActionToSession(session, action);
            yield action;
          }
        }
      } else {
        // AI responded without tool calls - we're done
        const finalResponse = extractTextResponse(response);

        const action: AgentAction = {
          type: 'response',
          message: finalResponse,
          timestamp: new Date(),
        };

        addMessageToSession(session, {
          role: 'assistant',
          content: finalResponse,
        });

        addActionToSession(session, action);
        yield action;

        session.status = 'completed';
        break;
      }
    }

    if (iterations >= maxIterations) {
      session.status = 'error';
      const action: AgentAction = {
        type: 'error',
        message: `Nombre maximum d'itérations (${maxIterations}) atteint.`,
        timestamp: new Date(),
      };
      yield action;
    }
  } catch (error) {
    session.status = 'error';
    const action: AgentAction = {
      type: 'error',
      message: `Erreur lors de l'exécution: ${(error as Error).message}`,
      timestamp: new Date(),
    };
    yield action;
  }
}

/**
 * Get session summary
 */
export function getSessionSummary(session: AgentSession): {
  id: string;
  status: string;
  iterations: number;
  toolCallsCount: number;
  errorsCount: number;
  actions: AgentAction[];
} {
  const toolCalls = session.actions.filter(a => a.type === 'tool_call').length;
  const errors = session.actions.filter(a => a.type === 'error').length;

  return {
    id: session.id,
    status: session.status,
    iterations: session.actions.length,
    toolCallsCount: toolCalls,
    errorsCount: errors,
    actions: session.actions,
  };
}
