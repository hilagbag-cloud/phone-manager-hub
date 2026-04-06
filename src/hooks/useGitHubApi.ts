import { useCallback } from 'react';
import { useApkBuilderStore } from '@/stores/apkBuilderStore';
import { initGitHub, parseRepoUrl, validateToken, triggerWorkflow } from '@/lib/githubClient';
import { analyzeRepo } from '@/lib/repoAnalyzer';
import { getFixActions, applyFixes } from '@/lib/autoFixer';
import { saveGitHubToken } from '@/lib/storage';
import { toast } from 'sonner';
import { notificationService } from '@/lib/notifications';

export function useGitHubApi() {
  const store = useApkBuilderStore();

  const connectToken = useCallback(async (token: string) => {
    try {
      initGitHub(token);
      const username = await validateToken(token);
      store.setToken(token);
      store.setUsername(username);
      // Persist token
      await saveGitHubToken(token, username);
      toast.success(`Connecté en tant que ${username}`);
      return true;
    } catch (e: any) {
      const msg = e.message?.includes('401')
        ? 'Token invalide. Vérifiez que le token est correct.'
        : e.message?.includes('403')
        ? 'Permissions insuffisantes. Le token nécessite les scopes repo et workflow.'
        : `Erreur de connexion: ${e.message}`;
      toast.error(msg);
      return false;
    }
  }, []);

  const analyze = useCallback(async () => {
    const { repoUrl } = useApkBuilderStore.getState();
    try {
      store.setIsAnalyzing(true);
      store.addLog('🔍 Analyse du dépôt en cours...', 'info');
      const { owner, repo } = parseRepoUrl(repoUrl);
      store.addLog(`Dépôt: ${owner}/${repo}`, 'info', `https://github.com/${owner}/${repo}`);

      const analysis = await analyzeRepo(owner, repo);
      store.setAnalysis(analysis);

      // Auto-fill app config
      store.setAppConfig({
        appName: repo.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        appId: `com.github.${owner}.${repo}`.toLowerCase().replace(/[^a-z0-9.]/g, ''),
      });

      // Detailed logs
      const checks = [
        { key: 'hasPackageJson', label: 'package.json', file: 'package.json' },
        { key: 'hasCapacitorConfig', label: 'Capacitor config', file: 'capacitor.config.ts' },
        { key: 'hasAndroidFolder', label: 'Dossier Android', file: 'android/' },
        { key: 'hasIndexHtml', label: 'index.html', file: 'index.html' },
        { key: 'hasManifest', label: 'manifest.json', file: 'public/manifest.json' },
        { key: 'hasWorkflow', label: 'GitHub Actions', file: '.github/workflows/' },
      ] as const;

      for (const check of checks) {
        const present = analysis[check.key as keyof typeof analysis];
        store.addLog(
          `${present ? '✅' : '❌'} ${check.label}: ${present ? 'trouvé' : 'manquant'}`,
          present ? 'success' : 'warning',
          `https://github.com/${owner}/${repo}/blob/${analysis.defaultBranch}/${check.file}`
        );
      }

      if (analysis.detectedBuildDir) {
        store.addLog(`📁 Dossier de build détecté: ${analysis.detectedBuildDir}`, 'info');
      }

      store.addLog('✅ Analyse terminée', 'success');
      
      // Push notification for scan complete
      const issueCount = Object.entries(analysis)
        .filter(([k]) => k.startsWith('has'))
        .filter(([, v]) => !v).length;
      notificationService.scanComplete(`${owner}/${repo}`, issueCount);
      
      return analysis;
    } catch (e: any) {
      const msg = e.message?.includes('404')
        ? 'Dépôt introuvable. Vérifiez l\'URL et que le token a accès aux repos privés.'
        : e.message?.includes('401')
        ? 'Token expiré ou invalide. Reconnectez-vous.'
        : `Erreur: ${e.message}`;
      store.addLog(`❌ ${msg}`, 'error');
      toast.error(msg);
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
      store.addLog(`🔧 ${fixes.length} correction(s) à appliquer...`, 'info');
      
      for (const fix of fixes) {
        store.addLog(`📝 ${fix.message}`, 'info', `https://github.com/${owner}/${repo}/blob/${analysis.defaultBranch}/${fix.file}`);
      }

      await applyFixes(owner, repo, analysis.defaultBranch, fixes, (msg) => {
        store.addLog(msg);
      });

      // Trigger workflow
      store.addLog('🚀 Déclenchement de la compilation...', 'info');
      await triggerWorkflow(owner, repo, 'build-apk.yml', analysis.defaultBranch);
      store.addLog(
        '✅ Workflow GitHub Actions déclenché !',
        'success',
        `https://github.com/${owner}/${repo}/actions`
      );
      store.addLog('⏳ La compilation peut prendre 2-5 minutes...', 'info');
      store.addLog(
        '👁️ Suivre en direct sur GitHub Actions',
        'info',
        `https://github.com/${owner}/${repo}/actions`
      );

      return true;
    } catch (e: any) {
      const msg = e.message?.includes('404')
        ? 'Workflow introuvable. Vérifiez que le fichier build-apk.yml existe.'
        : e.message?.includes('422')
        ? 'Le workflow existe mais ne peut pas être déclenché. Vérifiez la branche.'
        : `Erreur: ${e.message}`;
      store.addLog(`❌ ${msg}`, 'error', `https://github.com/${parseRepoUrl(repoUrl).owner}/${parseRepoUrl(repoUrl).repo}/actions`);
      toast.error(msg);
      return false;
    }
  }, []);

  return { connectToken, analyze, fixAndBuild };
}
