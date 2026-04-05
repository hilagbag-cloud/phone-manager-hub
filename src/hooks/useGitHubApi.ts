import { useCallback } from 'react';
import { useApkBuilderStore } from '@/stores/apkBuilderStore';
import { initGitHub, parseRepoUrl, validateToken, triggerWorkflow } from '@/lib/githubClient';
import { analyzeRepo } from '@/lib/repoAnalyzer';
import { getFixActions, applyFixes } from '@/lib/autoFixer';
import { toast } from 'sonner';

export function useGitHubApi() {
  const store = useApkBuilderStore();

  const connectToken = useCallback(async (token: string) => {
    try {
      initGitHub(token);
      const username = await validateToken(token);
      store.setToken(token);
      store.setUsername(username);
      toast.success(`Connecté en tant que ${username}`);
      return true;
    } catch {
      toast.error('Token invalide ou permissions insuffisantes');
      return false;
    }
  }, []);

  const analyze = useCallback(async () => {
    try {
      store.setIsAnalyzing(true);
      store.addLog('Analyse du dépôt en cours...');
      const { owner, repo } = parseRepoUrl(store.repoUrl);
      const analysis = await analyzeRepo(owner, repo);
      store.setAnalysis(analysis);

      // Auto-fill app config from repo name
      store.setAppConfig({
        appName: repo.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        appId: `com.github.${owner}.${repo}`.toLowerCase().replace(/[^a-z0-9.]/g, ''),
      });

      store.addLog('Analyse terminée', 'success');
      return analysis;
    } catch (e: any) {
      store.addLog(`Erreur: ${e.message}`, 'error');
      toast.error(e.message);
      return null;
    } finally {
      store.setIsAnalyzing(false);
    }
  }, []);

  const fixAndBuild = useCallback(async () => {
    const { analysis, appConfig, repoUrl } = useApkBuilderStore.getState();
    if (!analysis) return;

    try {
      store.setIsBuilding(true);
      store.clearLogs();
      const { owner, repo } = parseRepoUrl(repoUrl);

      // Apply fixes
      const fixes = getFixActions(analysis, appConfig);
      store.addLog(`${fixes.length} correction(s) à appliquer...`);
      await applyFixes(owner, repo, analysis.defaultBranch, fixes, (msg) => {
        store.addLog(msg);
      });

      // Trigger workflow
      store.addLog('Déclenchement de la compilation...');
      await triggerWorkflow(owner, repo, 'build-apk.yml', analysis.defaultBranch);
      store.addLog('Workflow GitHub Actions déclenché !', 'success');
      store.addLog('La compilation peut prendre 2-5 minutes...', 'info');

      return true;
    } catch (e: any) {
      store.addLog(`Erreur: ${e.message}`, 'error');
      toast.error(e.message);
      return false;
    }
  }, []);

  return { connectToken, analyze, fixAndBuild };
}
