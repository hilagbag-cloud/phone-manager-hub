/**
 * Hook to load persisted data into the Zustand store on app startup.
 */
import { useEffect, useState } from 'react';
import { useApkBuilderStore } from '@/stores/apkBuilderStore';
import { initGitHub } from '@/lib/githubClient';
import {
  loadGitHubToken,
  loadAIConfig,
  loadAppConfig,
  loadLastRepo,
} from '@/lib/storage';
import type { AIConfig, AppConfig } from '@/types/apk-builder';

export function usePersistedStore() {
  const [loaded, setLoaded] = useState(false);
  const store = useApkBuilderStore();

  useEffect(() => {
    (async () => {
      try {
        const [ghData, aiData, appData, lastRepo] = await Promise.all([
          loadGitHubToken(),
          loadAIConfig(),
          loadAppConfig(),
          loadLastRepo(),
        ]);

        if (ghData?.token) {
          store.setToken(ghData.token);
          store.setUsername(ghData.username);
          initGitHub(ghData.token);
        }

        if (aiData) {
          store.setAiConfig(aiData as AIConfig);
        }

        if (appData) {
          store.setAppConfig(appData as Partial<AppConfig>);
        }

        if (lastRepo) {
          store.setRepoUrl(lastRepo);
        }
      } catch (e) {
        console.warn('Failed to load persisted data:', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, [store]);

  return loaded;
}