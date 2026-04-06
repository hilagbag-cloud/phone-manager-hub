/**
 * Enhanced AI module — reads full repo, analyzes workflows, logs, and can fix files.
 */
import { chatCompletion } from './aiClient';
import { getRepoTree, readFileContent, updateFile } from './githubLogs';
import { listWorkflowRuns, getRunJobs, getJobLogs } from './githubLogs';
import type { AIConfig, AIMessage } from '@/types/apk-builder';

const MAX_FILE_SIZE = 50000; // chars
const IMPORTANT_FILES = [
  'package.json', 'capacitor.config.json', 'capacitor.config.ts',
  'vite.config.ts', 'vite.config.js', 'tsconfig.json',
  'index.html', 'public/manifest.json',
  '.github/workflows/build-apk.yml',
];

/** Read all important files from the repo for AI context */
export async function buildRepoContext(owner: string, repo: string, branch: string): Promise<string> {
  const tree = await getRepoTree(owner, repo, branch);
  
  // Get tree overview
  const treeOverview = tree
    .filter(f => f.type === 'blob' && (f.size || 0) < 100000)
    .map(f => `${f.path} (${f.size || 0}b)`)
    .join('\n');

  // Read important files
  const fileContents: string[] = [];
  for (const filePath of IMPORTANT_FILES) {
    const exists = tree.find(f => f.path === filePath);
    if (exists) {
      try {
        const content = await readFileContent(owner, repo, filePath);
        if (content.length <= MAX_FILE_SIZE) {
          fileContents.push(`=== ${filePath} ===\n${content}`);
        }
      } catch { /* skip */ }
    }
  }

  // Also read src files (limited)
  const srcFiles = tree
    .filter(f => f.type === 'blob' && f.path?.startsWith('src/') && (f.size || 0) < 10000)
    .slice(0, 20);
  
  for (const f of srcFiles) {
    try {
      const content = await readFileContent(owner, repo, f.path);
      fileContents.push(`=== ${f.path} ===\n${content}`);
    } catch { /* skip */ }
  }

  return `## Arborescence du dépôt\n${treeOverview}\n\n## Contenu des fichiers\n${fileContents.join('\n\n')}`;
}

/** Get latest workflow logs for AI analysis */
export async function getWorkflowContext(owner: string, repo: string): Promise<string> {
  try {
    const runs = await listWorkflowRuns(owner, repo, 3);
    if (runs.length === 0) return 'Aucun workflow trouvé.';

    const parts: string[] = [];
    for (const run of runs.slice(0, 2)) {
      parts.push(`\n### Run: ${run.name} (${run.conclusion || run.status}) - ${run.created_at}`);
      const jobs = await getRunJobs(owner, repo, run.id);
      for (const job of jobs) {
        parts.push(`Job: ${job.name} → ${job.conclusion || job.status}`);
        for (const step of job.steps) {
          parts.push(`  ${step.conclusion === 'success' ? '✅' : '❌'} ${step.name}`);
        }
        // Get logs for failed jobs
        if (job.conclusion === 'failure') {
          try {
            const logs = await getJobLogs(owner, repo, job.id);
            parts.push(`\nLogs (dernières 2000 chars):\n${logs.slice(-2000)}`);
          } catch { /* skip */ }
        }
      }
    }
    return parts.join('\n');
  } catch {
    return 'Impossible de charger les logs workflow.';
  }
}

/** AI-powered full analysis with repo context */
export async function aiFullAnalysis(
  config: AIConfig,
  owner: string, repo: string, branch: string,
  question: string,
): Promise<string> {
  const [repoContext, workflowContext] = await Promise.all([
    buildRepoContext(owner, repo, branch),
    getWorkflowContext(owner, repo),
  ]);

  const systemPrompt = `Tu es un expert DevOps et développeur full-stack.
Tu analyses des dépôts GitHub pour les transformer en APK Android via Capacitor + GitHub Actions.
Tu as accès au contenu complet du dépôt et aux logs des workflows CI/CD.
Identifie les problèmes, propose des corrections précises avec le code exact à modifier.
Réponds en français.

## Contexte du dépôt (${owner}/${repo}, branche ${branch})
${repoContext}

## Logs GitHub Actions
${workflowContext}`;

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: question },
  ];

  return chatCompletion(config, messages);
}

/** AI-powered file fix — analyzes error and pushes fix */
export async function aiFixFile(
  config: AIConfig,
  owner: string, repo: string, branch: string,
  filePath: string, errorContext: string,
): Promise<{ fixed: boolean; message: string }> {
  // Read current file
  let currentContent: string;
  try {
    currentContent = await readFileContent(owner, repo, filePath);
  } catch {
    return { fixed: false, message: `Fichier ${filePath} introuvable.` };
  }

  const prompt = `Voici le contenu actuel du fichier "${filePath}":
\`\`\`
${currentContent}
\`\`\`

Erreur rencontrée:
${errorContext}

Corrige le fichier pour résoudre cette erreur. Retourne UNIQUEMENT le contenu corrigé du fichier complet, sans explication, sans blocs de code markdown.`;

  const messages: AIMessage[] = [
    { role: 'system', content: 'Tu es un correcteur de code. Retourne uniquement le code corrigé, rien d\'autre.' },
    { role: 'user', content: prompt },
  ];

  const fixedContent = await chatCompletion(config, messages);
  
  // Clean markdown code blocks if present
  const cleaned = fixedContent
    .replace(/^```[\w]*\n?/, '')
    .replace(/\n?```$/, '')
    .trim();

  // Push fix
  await updateFile(owner, repo, filePath, cleaned, `fix: auto-correct ${filePath}`, branch);
  
  return { fixed: true, message: `✅ ${filePath} corrigé et poussé sur ${branch}` };
}
