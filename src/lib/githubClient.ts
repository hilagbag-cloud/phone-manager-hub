import { Octokit } from '@octokit/rest';
import type { RepoInfo } from '@/types/apk-builder';

let octokit: Octokit | null = null;

export function initGitHub(token: string) {
  octokit = new Octokit({ auth: token });
  return octokit;
}

export function getOctokit(): Octokit {
  if (!octokit) throw new Error('GitHub non initialisé. Veuillez entrer votre token.');
  return octokit;
}

export function parseRepoUrl(url: string): RepoInfo {
  const match = url.trim().replace(/\.git$/, '').match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error('URL de dépôt GitHub invalide');
  return { owner: match[1], repo: match[2] };
}

export async function validateToken(token: string): Promise<string> {
  const ok = new Octokit({ auth: token });
  const { data } = await ok.users.getAuthenticated();
  return data.login;
}

export async function getFileContent(owner: string, repo: string, path: string) {
  try {
    const { data } = await getOctokit().repos.getContent({ owner, repo, path });
    return data;
  } catch {
    return null;
  }
}

export async function createOrUpdateFile(
  owner: string, repo: string, path: string,
  content: string, message: string, branch: string
) {
  const existing = await getFileContent(owner, repo, path);
  const sha = existing && !Array.isArray(existing) ? (existing as any).sha : undefined;
  
  await getOctokit().repos.createOrUpdateFileContents({
    owner, repo, path, message, branch,
    content: btoa(unescape(encodeURIComponent(content))),
    ...(sha ? { sha } : {}),
  });
}

export async function getDefaultBranch(owner: string, repo: string): Promise<string> {
  const { data } = await getOctokit().repos.get({ owner, repo });
  return data.default_branch;
}

export async function triggerWorkflow(owner: string, repo: string, workflowFile: string, branch: string) {
  await getOctokit().actions.createWorkflowDispatch({
    owner, repo, workflow_id: workflowFile, ref: branch,
  });
}

export async function getLatestRun(owner: string, repo: string, afterDate: Date) {
  const { data } = await getOctokit().actions.listWorkflowRunsForRepo({
    owner, repo, per_page: 5,
  });
  return data.workflow_runs.find(r => new Date(r.created_at) > afterDate);
}

export async function getRunArtifacts(owner: string, repo: string, runId: number) {
  const { data } = await getOctokit().actions.listWorkflowRunArtifacts({
    owner, repo, run_id: runId,
  });
  return data.artifacts;
}

export async function downloadArtifactUrl(owner: string, repo: string, artifactId: number): Promise<string> {
  const { url } = await getOctokit().actions.downloadArtifact({
    owner, repo, artifact_id: artifactId, archive_format: 'zip',
  });
  return url;
}
