import { createOrUpdateFile } from './githubClient';
import { generateWorkflow } from './workflowTemplate';
import type { RepoAnalysis, AppConfig, FixAction } from '@/types/apk-builder';

export function getFixActions(analysis: RepoAnalysis, config: AppConfig): FixAction[] {
  const fixes: FixAction[] = [];
  const buildDir = analysis.detectedBuildDir || 'dist';

  if (!analysis.hasPackageJson) {
    fixes.push({
      file: 'package.json',
      message: 'chore: add package.json with Capacitor dependencies',
      content: JSON.stringify({
        name: config.appName.toLowerCase().replace(/\s+/g, '-'),
        version: config.version,
        private: true,
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
        },
        dependencies: {
          '@capacitor/core': '^6.0.0',
        },
        devDependencies: {
          '@capacitor/cli': '^6.0.0',
          '@capacitor/android': '^6.0.0',
          vite: '^5.0.0',
        },
      }, null, 2),
    });
  }

  if (!analysis.hasCapacitorConfig) {
    fixes.push({
      file: 'capacitor.config.json',
      message: 'chore: add Capacitor configuration',
      content: JSON.stringify({
        appId: config.appId,
        appName: config.appName,
        webDir: buildDir,
        plugins: {
          SplashScreen: { launchShowDuration: 2000 },
        },
      }, null, 2),
    });
  }

  if (!analysis.hasManifest) {
    fixes.push({
      file: 'public/manifest.json',
      message: 'chore: add PWA manifest',
      content: JSON.stringify({
        name: config.appName,
        short_name: config.appName,
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3b82f6',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      }, null, 2),
    });
  }

  // Always add/update the workflow
  fixes.push({
    file: '.github/workflows/build-apk.yml',
    message: 'ci: add APK build workflow',
    content: generateWorkflow(analysis),
  });

  return fixes;
}

export async function applyFixes(
  owner: string, repo: string, branch: string,
  fixes: FixAction[],
  onProgress: (msg: string) => void
) {
  for (const fix of fixes) {
    onProgress(`Création de ${fix.file}...`);
    await createOrUpdateFile(owner, repo, fix.file, fix.content, fix.message, branch);
    onProgress(`✅ ${fix.file} créé avec succès`);
  }
}
