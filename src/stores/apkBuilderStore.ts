import { create } from 'zustand';
import type { WizardStep, RepoAnalysis, AppConfig, BuildLog, AIConfig } from '@/types/apk-builder';
import { saveGitHubToken, saveAIConfig, saveAppConfig, saveLastRepo } from '@/lib/storage';

interface ApkBuilderState {
  // Wizard
  step: WizardStep;
  setStep: (s: WizardStep) => void;

  // Repo
  repoUrl: string;
  setRepoUrl: (u: string) => void;

  // Token
  token: string;
  setToken: (t: string) => void;
  username: string;
  setUsername: (u: string) => void;

  // Config
  appConfig: AppConfig;
  setAppConfig: (c: Partial<AppConfig>) => void;

  // Analysis
  analysis: RepoAnalysis | null;
  setAnalysis: (a: RepoAnalysis | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (v: boolean) => void;

  // Build
  isBuilding: boolean;
  setIsBuilding: (v: boolean) => void;
  logs: BuildLog[];
  addLog: (msg: string, type?: BuildLog['type'], link?: string) => void;
  clearLogs: () => void;
  downloadUrl: string | null;
  setDownloadUrl: (u: string | null) => void;

  // AI
  aiConfig: AIConfig | null;
  setAiConfig: (c: AIConfig | null) => void;

  // Reset
  reset: () => void;
}

const initialAppConfig: AppConfig = {
  appName: 'Mon Application',
  appId: 'com.example.myapp',
  version: '1.0.0',
};

export const useApkBuilderStore = create<ApkBuilderState>((set) => ({
  step: 0,
  setStep: (step) => set({ step }),
  repoUrl: '',
  setRepoUrl: (repoUrl) => {
    set({ repoUrl });
    saveLastRepo(repoUrl).catch(() => {});
  },
  token: '',
  setToken: (token) => set({ token }),
  username: '',
  setUsername: (username) => set({ username }),
  appConfig: { ...initialAppConfig },
  setAppConfig: (c) => set((s) => {
    const newConfig = { ...s.appConfig, ...c };
    saveAppConfig(newConfig).catch(() => {});
    return { appConfig: newConfig };
  }),
  analysis: null,
  setAnalysis: (analysis) => set({ analysis }),
  isAnalyzing: false,
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  isBuilding: false,
  setIsBuilding: (isBuilding) => set({ isBuilding }),
  logs: [],
  addLog: (message, type = 'info', link?: string) =>
    set((s) => ({ logs: [...s.logs, { timestamp: new Date(), message, type, link }] })),
  clearLogs: () => set({ logs: [] }),
  downloadUrl: null,
  setDownloadUrl: (downloadUrl) => set({ downloadUrl }),
  aiConfig: null,
  setAiConfig: (aiConfig) => {
    set({ aiConfig });
    if (aiConfig) saveAIConfig(aiConfig).catch(() => {});
  },
  reset: () => set({
    step: 0, repoUrl: '', 
    appConfig: { ...initialAppConfig },
    analysis: null, isAnalyzing: false, isBuilding: false,
    logs: [], downloadUrl: null,
  }),
}));
