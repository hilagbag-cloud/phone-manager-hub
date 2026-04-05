/**
 * GitHub repo selector: fetches user's repos and allows selection.
 * Falls back to manual URL input.
 */
import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useApkBuilderStore } from '@/stores/apkBuilderStore';
import { getOctokit } from '@/lib/githubClient';
import { Github, Search, Lock, Globe, Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { LINKS } from '@/lib/links';

interface GHRepo {
  full_name: string;
  name: string;
  owner: { login: string };
  private: boolean;
  html_url: string;
  description: string | null;
  language: string | null;
  updated_at: string;
}

const RepoSelector = () => {
  const { repoUrl, setRepoUrl, setStep, setAppConfig, token, username } = useApkBuilderStore();
  const [repos, setRepos] = useState<GHRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const [manualUrl, setManualUrl] = useState(repoUrl);

  const fetchRepos = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const octokit = getOctokit();
      const allRepos: GHRepo[] = [];
      let page = 1;
      // Fetch up to 200 repos
      while (page <= 2) {
        const { data } = await octokit.repos.listForAuthenticatedUser({
          per_page: 100,
          page,
          sort: 'updated',
          direction: 'desc',
        });
        allRepos.push(...(data as unknown as GHRepo[]));
        if (data.length < 100) break;
        page++;
      }
      setRepos(allRepos);
    } catch (e: any) {
      toast.error(`Erreur: ${e.message}`);
      setManualMode(true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && !manualMode) fetchRepos();
  }, [token, manualMode, fetchRepos]);

  const selectRepo = (repo: GHRepo) => {
    const url = `https://github.com/${repo.full_name}`;
    setRepoUrl(url);
    // Auto-generate appConfig
    const safeName = repo.name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const safeId = `com.github.${repo.owner.login}.${repo.name}`.toLowerCase().replace(/[^a-z0-9.]/g, '');
    setAppConfig({ appName: safeName, appId: safeId });
    setStep(2);
  };

  const filtered = repos.filter(r =>
    r.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (r.description?.toLowerCase().includes(search.toLowerCase()))
  );

  // Manual mode or no token
  if (manualMode || !token) {
    const valid = /github\.com\/[^/]+\/[^/]+/.test(manualUrl);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Étape 1 : Votre dépôt GitHub</CardTitle>
          <CardDescription>Entrez l'URL du dépôt contenant votre application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="https://github.com/utilisateur/mon-app"
            value={manualUrl}
            onChange={e => setManualUrl(e.target.value)}
            className="font-mono text-sm"
          />
          {manualUrl && !valid && (
            <p className="text-xs text-destructive">Format attendu : https://github.com/utilisateur/depot</p>
          )}
          <div className="text-xs text-muted-foreground space-y-1">
            <p><Github className="h-3 w-3 inline mr-1" />
              <a href={LINKS.githubSignup} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Créer un compte GitHub <ExternalLink className="h-3 w-3 inline" />
              </a>
            </p>
          </div>
          <Button disabled={!valid} onClick={() => { setRepoUrl(manualUrl); setStep(2); }} className="w-full">
            Continuer
          </Button>
          {token && (
            <Button variant="ghost" size="sm" onClick={() => setManualMode(false)} className="w-full text-xs">
              ← Retour à la sélection automatique
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Github className="h-5 w-5" /> Sélectionnez un dépôt
        </CardTitle>
        <CardDescription>
          Connecté en tant que <span className="text-primary font-medium">@{username}</span> — 
          {repos.length} dépôts trouvés
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un dépôt..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchRepos} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Chargement des dépôts...</span>
          </div>
        ) : (
          <ScrollArea className="h-72">
            <div className="space-y-1">
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun dépôt trouvé</p>
              )}
              {filtered.map(repo => (
                <button
                  key={repo.full_name}
                  onClick={() => selectRepo(repo)}
                  className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <div className="flex items-center gap-2">
                    {repo.private ? (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    ) : (
                      <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-sm font-medium text-foreground truncate">{repo.full_name}</span>
                    {repo.language && (
                      <Badge variant="secondary" className="text-[10px] ml-auto shrink-0">{repo.language}</Badge>
                    )}
                  </div>
                  {repo.description && (
                    <p className="text-xs text-muted-foreground mt-1 truncate pl-5">{repo.description}</p>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        )}

        <Button variant="ghost" size="sm" onClick={() => setManualMode(true)} className="w-full text-xs">
          Entrer l'URL manuellement →
        </Button>
      </CardContent>
    </Card>
  );
};

export default RepoSelector;
