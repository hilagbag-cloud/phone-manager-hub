/**
 * Puter Auto Fixer
 * Autonomous error detection and fixing logic
 */

import { runAiAgent, createAgentSession } from './puterAiAgent';
import { checkMissingFiles, readRepoLogs } from './puterGithubTools';
import type { RepoInfo } from '@/types/apk-builder';

export interface FixReport {
  timestamp: Date;
  repoInfo: RepoInfo;
  missingFiles: string[];
  errors: string[];
  fixes: string[];
  buildTriggered: boolean;
  status: 'success' | 'partial' | 'failed';
  message: string;
}

/**
 * Analyze repository for APK build issues
 */
export async function analyzeRepositoryForBuild(repoInfo: RepoInfo): Promise<{
  missingFiles: string[];
  errors: string[];
  readiness: number; // 0-100
}> {
  try {
    // Check missing files
    const missingFilesResult = await checkMissingFiles(repoInfo, 'apk_build');
    const missingData = JSON.parse(missingFilesResult);
    const missingFiles = missingData.missing_files || [];

    // Check for build errors
    const logsResult = await readRepoLogs(repoInfo, 3, true);
    const errors = logsResult.split('\n').filter((line: string) => line.includes('❌') || line.includes('error'));

    // Calculate readiness (0-100)
    const totalRequired = missingData.total_required || 6;
    const present = missingData.present || 0;
    const readiness = Math.round((present / totalRequired) * 100);

    return {
      missingFiles,
      errors,
      readiness,
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return {
      missingFiles: [],
      errors: [(error as Error).message],
      readiness: 0,
    };
  }
}

/**
 * Auto-fix repository for APK build
 */
export async function autoFixRepository(
  repoInfo: RepoInfo,
  options?: {
    model?: string;
    maxIterations?: number;
    onProgress?: (message: string) => void;
  },
): Promise<FixReport> {
  const model = options?.model || 'gpt-5.4-nano';
  const maxIterations = options?.maxIterations || 15;
  const onProgress = options?.onProgress || (() => {});

  const report: FixReport = {
    timestamp: new Date(),
    repoInfo,
    missingFiles: [],
    errors: [],
    fixes: [],
    buildTriggered: false,
    status: 'success',
    message: '',
  };

  try {
    onProgress('📊 Analyse du dépôt...');

    // Analyze repository
    const analysis = await analyzeRepositoryForBuild(repoInfo);
    report.missingFiles = analysis.missingFiles;
    report.errors = analysis.errors;

    if (analysis.readiness === 100 && analysis.errors.length === 0) {
      report.message = '✅ Le dépôt est déjà prêt pour la compilation APK';
      return report;
    }

    onProgress(`📋 Readiness: ${analysis.readiness}% - ${analysis.missingFiles.length} fichiers manquants`);

    // Create agent session
    const session = createAgentSession(repoInfo, model);

    // Build comprehensive prompt
    const prompt = `Tu dois préparer ce dépôt Android/Capacitor pour la compilation APK.

Situation actuelle:
- Readiness: ${analysis.readiness}%
- Fichiers manquants: ${analysis.missingFiles.join(', ') || 'Aucun'}
- Erreurs détectées: ${analysis.errors.length > 0 ? 'Oui' : 'Non'}

Actions à effectuer:
1. Vérifier les fichiers manquants avec check_missing_files
2. Pour chaque fichier manquant, le créer avec create_new_file (utilise les bons templates)
3. Vérifier la configuration avec read_repo_file (package.json, capacitor.config.json)
4. Consulter les logs avec read_repo_logs pour identifier les erreurs
5. Corriger les fichiers de configuration si nécessaire
6. Créer ou mettre à jour le workflow GitHub Actions pour le build APK
7. Déclencher un build avec trigger_workflow

Sois autonome et effectue toutes les corrections nécessaires sans demander de confirmation.
Explique chaque action que tu effectues.`;

    onProgress('🤖 Lancement de l\'agent IA...');

    // Run agent
    const result = await runAiAgent(session, prompt, {
      maxIterations,
      toolCategories: ['all'],
      onAction: (action) => {
        if (action.type === 'tool_call') {
          onProgress(`🔧 ${action.tool_name}: Exécution...`);
          report.fixes.push(`${action.tool_name}: ${action.tool_args?.file_path || ''}`);
        } else if (action.type === 'error') {
          onProgress(`❌ Erreur: ${action.message}`);
        }
      },
    });

    report.message = result;

    // Check if build was triggered
    if (report.fixes.some(f => f.includes('trigger_workflow'))) {
      report.buildTriggered = true;
      onProgress('✅ Build APK déclenché');
    }

    // Re-analyze to check progress
    onProgress('📊 Vérification finale...');
    const finalAnalysis = await analyzeRepositoryForBuild(repoInfo);

    if (finalAnalysis.readiness === 100) {
      report.status = 'success';
      report.message = `✅ Dépôt préparé avec succès (${report.fixes.length} corrections appliquées)`;
    } else if (finalAnalysis.readiness >= 80) {
      report.status = 'partial';
      report.message = `⚠️ Dépôt partiellement préparé (${finalAnalysis.readiness}% readiness)`;
    } else {
      report.status = 'failed';
      report.message = `❌ Impossible de préparer le dépôt (${finalAnalysis.readiness}% readiness)`;
    }
  } catch (error) {
    report.status = 'failed';
    report.message = `❌ Erreur: ${(error as Error).message}`;
  }

  return report;
}

/**
 * Fix specific build errors
 */
export async function fixBuildErrors(
  repoInfo: RepoInfo,
  errorLogs: string,
  options?: {
    model?: string;
    maxIterations?: number;
  },
): Promise<FixReport> {
  const model = options?.model || 'gpt-5.4-nano';
  const maxIterations = options?.maxIterations || 10;

  const report: FixReport = {
    timestamp: new Date(),
    repoInfo,
    missingFiles: [],
    errors: [],
    fixes: [],
    buildTriggered: false,
    status: 'success',
    message: '',
  };

  try {
    // Create agent session
    const session = createAgentSession(repoInfo, model);

    // Build prompt
    const prompt = `Analyse ces erreurs de build et corrige-les:

\`\`\`
${errorLogs}
\`\`\`

Actions:
1. Analyser les erreurs avec analyze_error
2. Lire les fichiers concernés avec read_repo_file
3. Identifier la cause racine
4. Corriger les fichiers avec create_or_update_file
5. Déclencher un nouveau build avec trigger_workflow

Sois précis et effectue les corrections nécessaires.`;

    // Run agent
    const result = await runAiAgent(session, prompt, {
      maxIterations,
      toolCategories: ['all'],
    });

    report.message = result;
    report.status = 'success';
  } catch (error) {
    report.status = 'failed';
    report.message = `❌ Erreur: ${(error as Error).message}`;
  }

  return report;
}

/**
 * Prepare repository for APK compilation
 */
export async function prepareForAPKCompilation(
  repoInfo: RepoInfo,
  options?: {
    model?: string;
  },
): Promise<FixReport> {
  const model = options?.model || 'gpt-5.4-nano';

  const report: FixReport = {
    timestamp: new Date(),
    repoInfo,
    missingFiles: [],
    errors: [],
    fixes: [],
    buildTriggered: false,
    status: 'success',
    message: '',
  };

  try {
    // Create agent session
    const session = createAgentSession(repoInfo, model);

    // Build prompt
    const prompt = `Prépare ce dépôt pour la compilation APK Android:

Checklist:
☐ Vérifier package.json (dépendances Capacitor)
☐ Vérifier capacitor.config.json
☐ Vérifier capacitor.config.ts
☐ Vérifier android/app/build.gradle
☐ Vérifier android/app/src/main/AndroidManifest.xml
☐ Vérifier .github/workflows/build-apk.yml
☐ Vérifier vite.config.ts
☐ Vérifier tsconfig.json
☐ Créer les fichiers manquants
☐ Corriger les configurations invalides

Utilise les tools pour:
1. Lister les fichiers avec list_repo_files
2. Vérifier les fichiers manquants avec check_missing_files
3. Lire les fichiers existants avec read_repo_file
4. Créer les fichiers manquants avec create_new_file
5. Corriger les fichiers avec create_or_update_file

Sois autonome et applique toutes les corrections nécessaires.`;

    // Run agent
    const result = await runAiAgent(session, prompt, {
      maxIterations: 12,
      toolCategories: ['read', 'write'],
    });

    report.message = result;
  } catch (error) {
    report.status = 'failed';
    report.message = `❌ Erreur: ${(error as Error).message}`;
  }

  return report;
}

/**
 * Generate fix report summary
 */
export function generateFixReportSummary(report: FixReport): string {
  const lines = [
    `📋 Rapport de correction - ${report.timestamp.toLocaleString()}`,
    `Dépôt: ${report.repoInfo.owner}/${report.repoInfo.repo}`,
    `Status: ${report.status === 'success' ? '✅' : report.status === 'partial' ? '⚠️' : '❌'} ${report.status}`,
    `Fichiers manquants: ${report.missingFiles.length}`,
    `Erreurs: ${report.errors.length}`,
    `Corrections appliquées: ${report.fixes.length}`,
    `Build déclenché: ${report.buildTriggered ? 'Oui ✅' : 'Non'}`,
    ``,
    `Message: ${report.message}`,
  ];

  if (report.missingFiles.length > 0) {
    lines.push(`\nFichiers manquants:`);
    report.missingFiles.forEach(f => lines.push(`  - ${f}`));
  }

  if (report.fixes.length > 0) {
    lines.push(`\nCorrections appliquées:`);
    report.fixes.forEach(f => lines.push(`  - ${f}`));
  }

  return lines.join('\n');
}
