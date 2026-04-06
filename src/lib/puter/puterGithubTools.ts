/**
 * Puter.com AI Tools Implementation
 * Implements the actual GitHub operations for the AI tools
 */

import { getOctokit } from '../githubClient';
import { 
  getRepoTree, 
  readFileContent, 
  updateFile, 
  listWorkflowRuns, 
  getRunJobs, 
  getJobLogs,
} from '../githubLogs';
import type { RepoInfo } from '@/types/apk-builder';

/**
 * Tool implementation: Read a file from the repository
 */
export async function readRepoFile(
  repoInfo: RepoInfo,
  filePath: string,
): Promise<string> {
  try {
    const content = await readFileContent(repoInfo.owner, repoInfo.repo, filePath);
    return content;
  } catch (error) {
    throw new Error(`Impossible de lire le fichier ${filePath}: ${(error as Error).message}`);
  }
}

/**
 * Tool implementation: List files in the repository
 */
export async function listRepoFiles(
  repoInfo: RepoInfo,
  directory?: string,
  pattern?: string,
): Promise<string> {
  try {
    const tree = await getRepoTree(repoInfo.owner, repoInfo.repo, 'HEAD');
    
    let files = tree.filter(f => f.type === 'blob');
    
    // Filter by directory
    if (directory) {
      files = files.filter(f => f.path?.startsWith(directory));
    }
    
    // Filter by pattern
    if (pattern) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      files = files.filter(f => regex.test(f.path || ''));
    }
    
    const fileList = files
      .map(f => `${f.path} (${f.size || 0} bytes)`)
      .join('\n');
    
    return `Fichiers trouvés:\n${fileList}`;
  } catch (error) {
    throw new Error(`Impossible de lister les fichiers: ${(error as Error).message}`);
  }
}

/**
 * Tool implementation: Read GitHub Actions workflow logs
 */
export async function readRepoLogs(
  repoInfo: RepoInfo,
  limit: number = 3,
  includeFailedOnly: boolean = false,
): Promise<string> {
  try {
    const runs = await listWorkflowRuns(repoInfo.owner, repoInfo.repo, Math.min(limit, 10));
    
    if (runs.length === 0) {
      return 'Aucun workflow trouvé dans ce dépôt.';
    }
    
    const filteredRuns = includeFailedOnly 
      ? runs.filter(r => r.conclusion === 'failure')
      : runs;
    
    const parts: string[] = [];
    
    for (const run of filteredRuns.slice(0, 3)) {
      parts.push(`\n### Workflow: ${run.name}`);
      parts.push(`Status: ${run.conclusion || run.status}`);
      parts.push(`Created: ${run.created_at}`);
      parts.push(`Branch: ${run.head_branch}`);
      
      try {
        const jobs = await getRunJobs(repoInfo.owner, repoInfo.repo, run.id);
        
        for (const job of jobs) {
          parts.push(`\nJob: ${job.name} → ${job.conclusion || job.status}`);
          
          for (const step of job.steps) {
            const icon = step.conclusion === 'success' ? '✅' : step.conclusion === 'failure' ? '❌' : '⏳';
            parts.push(`  ${icon} ${step.name}`);
          }
          
          // Get logs for failed jobs
          if (job.conclusion === 'failure') {
            try {
              const logs = await getJobLogs(repoInfo.owner, repoInfo.repo, job.id);
              const lastLines = logs.split('\n').slice(-20).join('\n');
              parts.push(`\nDerniers logs du job:\n${lastLines}`);
            } catch {
              parts.push('(Impossible de charger les logs détaillés)');
            }
          }
        }
      } catch {
        parts.push('(Impossible de charger les détails du job)');
      }
    }
    
    return parts.join('\n');
  } catch (error) {
    throw new Error(`Impossible de charger les logs: ${(error as Error).message}`);
  }
}

/**
 * Tool implementation: Analyze a specific error
 */
export async function analyzeError(
  errorMessage: string,
  filePath?: string,
): Promise<string> {
  // This is a helper that returns structured error info for the AI to analyze
  const analysis = {
    error: errorMessage,
    file: filePath || 'unknown',
    suggestions: [
      'Vérifier que toutes les dépendances sont installées',
      'Vérifier la syntaxe du fichier',
      'Consulter la documentation du projet',
      'Vérifier les versions des outils (Node, npm, etc.)',
    ],
  };
  
  return JSON.stringify(analysis, null, 2);
}

/**
 * Tool implementation: Create or update a file
 */
export async function createOrUpdateFile(
  repoInfo: RepoInfo,
  filePath: string,
  content: string,
  commitMessage: string,
  branch?: string,
): Promise<string> {
  try {
    const targetBranch = branch || 'main';
    
    await updateFile(
      repoInfo.owner,
      repoInfo.repo,
      filePath,
      content,
      commitMessage,
      targetBranch,
    );
    
    return `✅ Fichier ${filePath} créé/modifié et poussé sur ${targetBranch}`;
  } catch (error) {
    throw new Error(`Impossible de créer/modifier le fichier: ${(error as Error).message}`);
  }
}

/**
 * Tool implementation: Create a new file with template
 */
export async function createNewFile(
  repoInfo: RepoInfo,
  filePath: string,
  templateType: string,
  content?: string,
  commitMessage?: string,
): Promise<string> {
  const templates: Record<string, string> = {
    capacitor_config: `{
  "appId": "com.example.app",
  "appName": "Phone Manager",
  "webDir": "dist",
  "server": {
    "androidScheme": "https"
  },
  "ios": {
    "contentInset": "automatic"
  },
  "android": {
    "allowMixedContent": true
  }
}`,
    package_json: `{
  "name": "phone-manager",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "cap:add:android": "cap add android",
    "cap:build:android": "cap build android"
  },
  "dependencies": {
    "@capacitor/core": "latest",
    "@capacitor/android": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "vite": "latest",
    "typescript": "latest"
  }
}`,
    tsconfig: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`,
    github_workflow_apk: `name: Build APK

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: actions/setup-java@v3
        with:
          java-version: '11'
          distribution: 'adopt'
      - run: npx cap add android
      - run: npx cap build android --release
      - uses: actions/upload-artifact@v3
        with:
          name: apk
          path: android/app/build/outputs/apk/`,
    android_manifest: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.READ_CONTACTS" />
  <uses-permission android:name="android.permission.READ_CALL_LOG" />
  <uses-permission android:name="android.permission.READ_SMS" />
</manifest>`,
    gradle_build: `android {
    compileSdk 33
    defaultConfig {
        applicationId "com.example.phonemanager"
        minSdk 21
        targetSdk 33
        versionCode 1
        versionName "1.0"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}`,
  };
  
  const fileContent = templateType === 'custom' ? content : templates[templateType];
  
  if (!fileContent) {
    throw new Error(`Template type "${templateType}" not found`);
  }
  
  return createOrUpdateFile(
    repoInfo,
    filePath,
    fileContent,
    commitMessage || `feat: add ${filePath}`,
  );
}

/**
 * Tool implementation: Fork the repository
 */
export async function forkRepo(
  repoInfo: RepoInfo,
  forkName?: string,
): Promise<string> {
  try {
    const octokit = getOctokit();
    const { data } = await octokit.repos.createFork({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      owner: forkName || undefined,
    });
    
    return `✅ Dépôt forké avec succès: ${data.html_url}`;
  } catch (error) {
    throw new Error(`Impossible de forker le dépôt: ${(error as Error).message}`);
  }
}

/**
 * Tool implementation: Trigger a workflow
 */
export async function triggerWorkflow(
  repoInfo: RepoInfo,
  workflowFile: string,
  branch?: string,
  inputs?: Record<string, string>,
): Promise<string> {
  try {
    const octokit = getOctokit();
    const targetBranch = branch || 'main';
    
    await octokit.actions.createWorkflowDispatch({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      workflow_id: workflowFile,
      ref: targetBranch,
      inputs: inputs || {},
    });
    
    return `✅ Workflow ${workflowFile} déclenché sur la branche ${targetBranch}`;
  } catch (error) {
    throw new Error(`Impossible de déclencher le workflow: ${(error as Error).message}`);
  }
}

/**
 * Tool implementation: Get build status
 */
export async function getBuildStatus(
  repoInfo: RepoInfo,
  workflowFile?: string,
): Promise<string> {
  try {
    const runs = await listWorkflowRuns(repoInfo.owner, repoInfo.repo, 1);
    
    if (runs.length === 0) {
      return 'Aucun workflow trouvé.';
    }
    
    const latestRun = runs[0];
    const status = {
      workflow: latestRun.name,
      status: latestRun.conclusion || latestRun.status,
      created_at: latestRun.created_at,
      updated_at: latestRun.updated_at,
      url: latestRun.html_url,
    };
    
    return JSON.stringify(status, null, 2);
  } catch (error) {
    throw new Error(`Impossible de récupérer le statut du build: ${(error as Error).message}`);
  }
}

/**
 * Tool implementation: Get repository information
 */
export async function getRepoInfo(repoInfo: RepoInfo): Promise<string> {
  try {
    const octokit = getOctokit();
    const { data } = await octokit.repos.get({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
    });
    
    const info = {
      name: data.name,
      full_name: data.full_name,
      description: data.description,
      url: data.html_url,
      default_branch: data.default_branch,
      language: data.language,
      topics: data.topics,
      stars: data.stargazers_count,
      forks: data.forks_count,
      open_issues: data.open_issues_count,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
    
    return JSON.stringify(info, null, 2);
  } catch (error) {
    throw new Error(`Impossible de récupérer les infos du dépôt: ${(error as Error).message}`);
  }
}

/**
 * Tool implementation: Check for missing files
 */
export async function checkMissingFiles(
  repoInfo: RepoInfo,
  checkType: string = 'all',
): Promise<string> {
  try {
    const tree = await getRepoTree(repoInfo.owner, repoInfo.repo, 'HEAD');
    const paths = tree.map(f => f.path || '');
    
    const requiredFiles: Record<string, string[]> = {
      apk_build: [
        'package.json',
        'capacitor.config.json',
        'vite.config.ts',
        'index.html',
        'android/app/build.gradle',
        '.github/workflows/build-apk.yml',
      ],
      capacitor: [
        'capacitor.config.json',
        'capacitor.config.ts',
      ],
      android: [
        'android/app/build.gradle',
        'android/app/src/main/AndroidManifest.xml',
      ],
    };
    
    const filesToCheck = checkType === 'all' 
      ? Object.values(requiredFiles).flat()
      : requiredFiles[checkType] || [];
    
    const missing = filesToCheck.filter(f => !paths.includes(f));
    const present = filesToCheck.filter(f => paths.includes(f));
    
    const result = {
      check_type: checkType,
      total_required: filesToCheck.length,
      present: present.length,
      missing: missing.length,
      missing_files: missing,
      present_files: present,
    };
    
    return JSON.stringify(result, null, 2);
  } catch (error) {
    throw new Error(`Impossible de vérifier les fichiers: ${(error as Error).message}`);
  }
}

/**
 * Tool implementation: Create a pull request
 */
export async function createPullRequest(
  repoInfo: RepoInfo,
  title: string,
  description: string,
  fromBranch?: string,
  toBranch?: string,
): Promise<string> {
  try {
    const octokit = getOctokit();
    const { data } = await octokit.pulls.create({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      title,
      body: description,
      head: fromBranch || 'feature/ai-fix',
      base: toBranch || 'main',
    });
    
    return `✅ Pull Request créée: ${data.html_url}`;
  } catch (error) {
    throw new Error(`Impossible de créer la PR: ${(error as Error).message}`);
  }
}

/**
 * Execute a tool by name
 */
export async function executeTool(
  toolName: string,
  args: Record<string, any>,
  repoInfo: RepoInfo,
): Promise<string> {
  switch (toolName) {
    case 'read_repo_file':
      return readRepoFile(repoInfo, args.file_path);
    
    case 'list_repo_files':
      return listRepoFiles(repoInfo, args.directory, args.pattern);
    
    case 'read_repo_logs':
      return readRepoLogs(repoInfo, args.limit, args.include_failed_only);
    
    case 'analyze_error':
      return analyzeError(args.error_message, args.file_path);
    
    case 'create_or_update_file':
      return createOrUpdateFile(
        repoInfo,
        args.file_path,
        args.content,
        args.commit_message,
        args.branch,
      );
    
    case 'create_new_file':
      return createNewFile(
        repoInfo,
        args.file_path,
        args.template_type,
        args.content,
        args.commit_message,
      );
    
    case 'fork_repo':
      return forkRepo(repoInfo, args.fork_name);
    
    case 'trigger_workflow':
      return triggerWorkflow(repoInfo, args.workflow_file, args.branch, args.inputs);
    
    case 'get_build_status':
      return getBuildStatus(repoInfo, args.workflow_file);
    
    case 'get_repo_info':
      return getRepoInfo(repoInfo);
    
    case 'check_missing_files':
      return checkMissingFiles(repoInfo, args.check_type);
    
    case 'create_pull_request':
      return createPullRequest(
        repoInfo,
        args.title,
        args.description,
        args.from_branch,
        args.to_branch,
      );
    
    default:
      throw new Error(`Tool "${toolName}" not found`);
  }
}
