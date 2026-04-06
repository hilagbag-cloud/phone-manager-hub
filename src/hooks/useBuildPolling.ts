import { useEffect, useRef } from 'react';
import { useApkBuilderStore } from '@/stores/apkBuilderStore';
import { parseRepoUrl, getLatestRun, getRunArtifacts } from '@/lib/githubClient';
import { notificationService } from '@/lib/notifications';
import { addBuildHistory } from '@/lib/storage';

export function useBuildPolling() {
  const { isBuilding, repoUrl, appConfig, addLog, setIsBuilding, setDownloadUrl, token } = useApkBuilderStore();
  const startTimeRef = useRef<Date | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isBuilding || !repoUrl || !token) return;

    startTimeRef.current = new Date();
    let attempts = 0;

    const poll = async () => {
      try {
        const { owner, repo } = parseRepoUrl(repoUrl);
        const run = await getLatestRun(owner, repo, startTimeRef.current!);
        
        if (!run) {
          if (attempts++ > 6) {
            addLog('En attente du démarrage du workflow...', 'info');
          }
          return;
        }

        if (run.status === 'completed') {
          if (run.conclusion === 'success') {
            addLog('✅ Compilation réussie !', 'success');
            const artifacts = await getRunArtifacts(owner, repo, run.id);
            const apk = artifacts.find(a => a.name.includes('apk'));
            const url = `https://github.com/${owner}/${repo}/actions/runs/${run.id}`;
            
            if (apk) {
              setDownloadUrl(url);
              addLog('APK disponible ! Rendez-vous sur GitHub pour télécharger.', 'success');
            } else {
              addLog('Aucun artefact APK trouvé.', 'warning');
            }

            // Save to build history
            await addBuildHistory({
              repoUrl, repoOwner: owner, repoName: repo,
              appName: appConfig.appName, appId: appConfig.appId,
              status: 'success', timestamp: new Date(),
              downloadUrl: url,
            });

            notificationService.buildComplete(repo);
          } else {
            addLog(`❌ La compilation a échoué (${run.conclusion})`, 'error');
            const url = `https://github.com/${owner}/${repo}/actions/runs/${run.id}`;
            addLog(`Voir les logs : ${url}`, 'error');
            
            await addBuildHistory({
              repoUrl, repoOwner: owner, repoName: repo,
              appName: appConfig.appName, appId: appConfig.appId,
              status: 'error', timestamp: new Date(),
              errorMessage: `Build failed: ${run.conclusion}`,
            });

            notificationService.buildFailed(repo, `Conclusion: ${run.conclusion}`);
          }
          setIsBuilding(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }

        addLog(`Compilation en cours... (${run.status})`, 'info');
      } catch {
        // Silently retry
      }
    };

    intervalRef.current = window.setInterval(poll, 15000);
    const timeout = window.setTimeout(poll, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearTimeout(timeout);
    };
  }, [isBuilding, repoUrl, token]);
}
