export interface RepoInfo {
  owner: string;
  repo: string;
}

export interface RepoAnalysis {
  hasPackageJson: boolean;
  packageJsonContent?: Record<string, unknown>;
  hasCapacitorConfig: boolean;
  hasAndroidFolder: boolean;
  hasBuildDir: boolean;
  detectedBuildDir?: string;
  hasManifest: boolean;
  hasServiceWorker: boolean;
  hasWorkflow: boolean;
  hasIndexHtml: boolean;
  defaultBranch: string;
}

export type AnalysisItemStatus = 'present' | 'missing' | 'checking';

export interface AnalysisItem {
  key: keyof Omit<RepoAnalysis, 'packageJsonContent' | 'detectedBuildDir' | 'defaultBranch'>;
  label: string;
  description: string;
  status: AnalysisItemStatus;
  fixable: boolean;
}

export interface AppConfig {
  appName: string;
  appId: string;
  version: string;
}

export interface BuildLog {
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  link?: string; // Clickable link to GitHub Actions or specific file
}

export type WizardStep = 0 | 1 | 2 | 3;

export interface FixAction {
  file: string;
  content: string;
  message: string;
}

// AI Integration types
export type AIProvider = 'gemini' | 'qwen' | 'openai' | 'anthropic' | 'groq' | 'mistral' | 'custom';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  baseUrl?: string;
  maxTokens?: number;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIAnalysisRequest {
  codebase?: string;
  errorLogs?: string;
  question?: string;
  history?: AIMessage[];
}
