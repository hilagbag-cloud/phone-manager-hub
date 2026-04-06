/**
 * Puter.com AI Module - Main exports
 */

// Client
export {
  loadPuterLibrary,
  isPuterLoaded,
  callPuterAI,
  callPuterAIStream,
  callPuterAIWithHistory,
  parseToolCallArguments,
  hasToolCalls,
  extractToolCalls,
  extractTextResponse,
  buildSystemPrompt,
  testPuterConnection,
  getPuterModels,
  type PuterChatMessage,
  type PuterToolCall,
  type PuterChatResponse,
  type PuterChatChunk,
} from './puterAiClient';

// Tools
export {
  ALL_PUTER_TOOLS,
  getToolsByCategory,
  readRepoFileTool,
  listRepoFilesTool,
  readRepoLogsTool,
  analyzeErrorTool,
  createOrUpdateFileTool,
  createNewFileTool,
  forkRepoTool,
  triggerWorkflowTool,
  getBuildStatusTool,
  getRepoInfoTool,
  checkMissingFilesTool,
  createPullRequestTool,
  type ToolDefinition,
} from './puterTools';

// GitHub Tools Implementation
export {
  readRepoFile,
  listRepoFiles,
  readRepoLogs,
  analyzeError,
  createOrUpdateFile,
  createNewFile,
  forkRepo,
  triggerWorkflow,
  getBuildStatus,
  getRepoInfo,
  checkMissingFiles,
  createPullRequest,
  executeTool,
} from './puterGithubTools';

// Agent
export {
  createAgentSession,
  addMessageToSession,
  addActionToSession,
  runAiAgent,
  runAiAgentStreaming,
  getSessionSummary,
  type AgentAction,
  type AgentSession,
} from './puterAiAgent';
