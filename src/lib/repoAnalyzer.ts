import { getFileContent, getDefaultBranch } from './githubClient';
import type { RepoAnalysis } from '@/types/apk-builder';

const BUILD_DIRS = ['dist', 'build', 'out', 'www', '.output/public'];

export async function analyzeRepo(owner: string, repo: string): Promise<RepoAnalysis> {
  const defaultBranch = await getDefaultBranch(owner, repo);

  const [pkgJson, capConfig, androidDir, indexHtml, manifest, sw, workflowDir] = await Promise.all([
    getFileContent(owner, repo, 'package.json'),
    getFileContent(owner, repo, 'capacitor.config.json').then(r => r || getFileContent(owner, repo, 'capacitor.config.ts')),
    getFileContent(owner, repo, 'android'),
    getFileContent(owner, repo, 'index.html'),
    getFileContent(owner, repo, 'public/manifest.json').then(r => r || getFileContent(owner, repo, 'manifest.json')),
    getFileContent(owner, repo, 'sw.js').then(r => r || getFileContent(owner, repo, 'public/sw.js').then(r2 => r2 || getFileContent(owner, repo, 'service-worker.js'))),
    getFileContent(owner, repo, '.github/workflows'),
  ]);

  let detectedBuildDir: string | undefined;
  for (const dir of BUILD_DIRS) {
    const found = await getFileContent(owner, repo, dir);
    if (found) { detectedBuildDir = dir; break; }
  }

  let packageJsonContent: Record<string, unknown> | undefined;
  if (pkgJson && !Array.isArray(pkgJson) && 'content' in (pkgJson as any)) {
    try {
      packageJsonContent = JSON.parse(decodeURIComponent(escape(atob((pkgJson as any).content.replace(/\n/g, '')))));
    } catch { /* ignore */ }
  }

  return {
    hasPackageJson: !!pkgJson,
    packageJsonContent,
    hasCapacitorConfig: !!capConfig,
    hasAndroidFolder: !!androidDir,
    hasBuildDir: !!detectedBuildDir,
    detectedBuildDir,
    hasManifest: !!manifest,
    hasServiceWorker: !!sw,
    hasWorkflow: !!workflowDir,
    hasIndexHtml: !!indexHtml,
    defaultBranch,
  };
}
