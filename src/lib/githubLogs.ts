/**
 * GitHub Actions logs fetcher — loads workflow run logs directly in the app.
 */
import { getOctokit, parseRepoUrl } from './githubClient';

export interface WorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  created_at: string;
  updated_at: string;
  html_url: string;
  head_branch: string;
}

export interface WorkflowJob {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  started_at: string;
  completed_at: string | null;
  steps: { name: string; status: string; conclusion: string | null; number: number }[];
}

/** List recent workflow runs */
export async function listWorkflowRuns(owner: string, repo: string, limit = 10): Promise<WorkflowRun[]> {
  const { data } = await getOctokit().actions.listWorkflowRunsForRepo({
    owner, repo, per_page: limit,
  });
  return data.workflow_runs.map(r => ({
    id: r.id,
    name: r.name || 'Unknown',
    status: r.status || 'unknown',
    conclusion: r.conclusion,
    created_at: r.created_at,
    updated_at: r.updated_at,
    html_url: r.html_url,
    head_branch: r.head_branch,
  }));
}

/** Get jobs for a specific run */
export async function getRunJobs(owner: string, repo: string, runId: number): Promise<WorkflowJob[]> {
  const { data } = await getOctokit().actions.listJobsForWorkflowRun({
    owner, repo, run_id: runId,
  });
  return data.jobs.map(j => ({
    id: j.id,
    name: j.name,
    status: j.status,
    conclusion: j.conclusion,
    started_at: j.started_at,
    completed_at: j.completed_at,
    steps: (j.steps || []).map(s => ({
      name: s.name,
      status: s.status,
      conclusion: s.conclusion,
      number: s.number,
    })),
  }));
}

/** Download full text logs for a run */
export async function getRunLogs(owner: string, repo: string, runId: number): Promise<string> {
  try {
    const { data } = await getOctokit().actions.downloadWorkflowRunLogs({
      owner, repo, run_id: runId,
    });
    // data is a redirect URL or ArrayBuffer
    if (typeof data === 'string') return data;
    // For ArrayBuffer, decode
    const decoder = new TextDecoder();
    return decoder.decode(data as ArrayBuffer);
  } catch {
    return 'Impossible de charger les logs (le run est peut-être trop ancien ou en cours).';
  }
}

/** Get job-level logs as text */
export async function getJobLogs(owner: string, repo: string, jobId: number): Promise<string> {
  try {
    const { data } = await getOctokit().actions.downloadJobLogsForWorkflowRun({
      owner, repo, job_id: jobId,
    });
    return typeof data === 'string' ? data : new TextDecoder().decode(data as ArrayBuffer);
  } catch {
    return 'Impossible de charger les logs du job.';
  }
}

/** Read full repo tree for AI analysis */
export async function getRepoTree(owner: string, repo: string, branch: string): Promise<{ path: string; type: string; size?: number }[]> {
  const { data } = await getOctokit().git.getTree({
    owner, repo, tree_sha: branch, recursive: 'true',
  });
  return data.tree.map(t => ({
    path: t.path || '',
    type: t.type || 'blob',
    size: t.size,
  }));
}

/** Read a file's content from the repo */
export async function readFileContent(owner: string, repo: string, path: string): Promise<string> {
  const { data } = await getOctokit().repos.getContent({ owner, repo, path });
  if (Array.isArray(data) || !('content' in data)) throw new Error('Not a file');
  return decodeURIComponent(escape(atob((data.content || '').replace(/\n/g, ''))));
}

/** Update a file in the repo */
export async function updateFile(
  owner: string, repo: string, path: string,
  content: string, message: string, branch: string
) {
  const { data: existing } = await getOctokit().repos.getContent({ owner, repo, path });
  const sha = !Array.isArray(existing) ? (existing as any).sha : undefined;
  await getOctokit().repos.createOrUpdateFileContents({
    owner, repo, path, message, branch,
    content: btoa(unescape(encodeURIComponent(content))),
    ...(sha ? { sha } : {}),
  });
}
