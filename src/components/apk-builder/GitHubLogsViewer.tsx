import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useApkBuilderStore } from '@/stores/apkBuilderStore';
import { parseRepoUrl } from '@/lib/githubClient';
import { listWorkflowRuns, getRunJobs, getJobLogs, type WorkflowRun, type WorkflowJob } from '@/lib/githubLogs';
import { FileText, ChevronDown, Loader2, RefreshCw, ExternalLink } from 'lucide-react';

const GitHubLogsViewer = () => {
  const { repoUrl, token } = useApkBuilderStore();
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRun, setSelectedRun] = useState<number | null>(null);
  const [jobs, setJobs] = useState<WorkflowJob[]>([]);
  const [jobLogs, setJobLogs] = useState<Record<number, string>>({});
  const [loadingJob, setLoadingJob] = useState<number | null>(null);

  const fetchRuns = async () => {
    if (!repoUrl || !token) return;
    setLoading(true);
    try {
      const { owner, repo } = parseRepoUrl(repoUrl);
      const data = await listWorkflowRuns(owner, repo, 10);
      setRuns(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    if (repoUrl && token) fetchRuns();
  }, [repoUrl, token]);

  const handleSelectRun = async (runId: number) => {
    if (selectedRun === runId) { setSelectedRun(null); return; }
    setSelectedRun(runId);
    try {
      const { owner, repo } = parseRepoUrl(repoUrl);
      const j = await getRunJobs(owner, repo, runId);
      setJobs(j);
    } catch { setJobs([]); }
  };

  const handleLoadJobLogs = async (jobId: number) => {
    if (jobLogs[jobId]) return;
    setLoadingJob(jobId);
    try {
      const { owner, repo } = parseRepoUrl(repoUrl);
      const logs = await getJobLogs(owner, repo, jobId);
      setJobLogs(prev => ({ ...prev, [jobId]: logs }));
    } catch { setJobLogs(prev => ({ ...prev, [jobId]: 'Erreur de chargement' })); }
    setLoadingJob(null);
  };

  if (!token || !repoUrl) return null;

  const conclusionColor = (c: string | null) =>
    c === 'success' ? 'default' : c === 'failure' ? 'destructive' : 'secondary';

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Logs GitHub Actions
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fetchRuns} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && runs.length === 0 && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2 text-xs text-muted-foreground">Chargement...</span>
          </div>
        )}
        {runs.length === 0 && !loading && (
          <p className="text-xs text-muted-foreground text-center py-4">Aucun workflow trouvé.</p>
        )}
        <ScrollArea className="max-h-80">
          <div className="space-y-1.5">
            {runs.map(run => (
              <Collapsible key={run.id} open={selectedRun === run.id}>
                <CollapsibleTrigger asChild>
                  <button
                    onClick={() => handleSelectRun(run.id)}
                    className="w-full text-left p-2 rounded border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium truncate flex-1">{run.name}</span>
                      <Badge variant={conclusionColor(run.conclusion)} className="text-[10px] px-1.5 py-0 ml-2">
                        {run.conclusion || run.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(run.created_at).toLocaleString('fr-FR')}
                      </span>
                      <span className="text-[10px] text-muted-foreground">({run.head_branch})</span>
                      <a href={run.html_url} target="_blank" rel="noopener noreferrer" className="ml-auto"
                         onClick={e => e.stopPropagation()}>
                        <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
                      </a>
                    </div>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-2 mt-1 space-y-1">
                  {jobs.map(job => (
                    <div key={job.id} className="border border-border rounded p-2 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium">{job.name}</span>
                        <Badge variant={conclusionColor(job.conclusion)} className="text-[9px] px-1 py-0">
                          {job.conclusion || job.status}
                        </Badge>
                      </div>
                      {/* Steps */}
                      <div className="mt-1 space-y-0.5">
                        {job.steps.map(step => (
                          <div key={step.number} className="flex items-center gap-1 text-[10px]">
                            <span>{step.conclusion === 'success' ? '✅' : step.conclusion === 'failure' ? '❌' : '⏳'}</span>
                            <span className="text-muted-foreground">{step.name}</span>
                          </div>
                        ))}
                      </div>
                      {/* Load logs button */}
                      <Button
                        variant="outline" size="sm"
                        className="w-full mt-2 text-[10px] h-6"
                        onClick={() => handleLoadJobLogs(job.id)}
                        disabled={loadingJob === job.id}
                      >
                        {loadingJob === job.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Voir les logs'}
                      </Button>
                      {jobLogs[job.id] && (
                        <ScrollArea className="mt-2 h-40 rounded bg-[hsl(220,20%,8%)] p-2">
                          <pre className="text-[10px] text-gray-300 whitespace-pre-wrap font-mono">
                            {jobLogs[job.id]}
                          </pre>
                        </ScrollArea>
                      )}
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default GitHubLogsViewer;
