import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Github } from 'lucide-react';
import { useApkBuilderStore } from '@/stores/apkBuilderStore';
import { LINKS } from '@/lib/links';

const RepoForm = () => {
  const { repoUrl, setRepoUrl, setStep } = useApkBuilderStore();
  const [url, setUrl] = useState(repoUrl);
  const valid = /github\.com\/[^/]+\/[^/]+/.test(url);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Étape 1 : Votre dépôt GitHub</CardTitle>
        <CardDescription>
          Entrez l'URL du dépôt contenant votre application web ou PWA.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            placeholder="https://github.com/utilisateur/mon-app"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="font-mono text-sm"
          />
          {url && !valid && (
            <p className="text-xs text-destructive mt-1">Format attendu : https://github.com/utilisateur/depot</p>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <Github className="h-3 w-3 inline mr-1" />
            Pas encore de compte ? <a href={LINKS.githubSignup} target="_blank" rel="noopener noreferrer" className="text-primary underline">Créer un compte GitHub <ExternalLink className="h-3 w-3 inline" /></a>
          </p>
          <p>
            Pour exporter depuis Lovable : <a href={LINKS.lovableGithubDocs} target="_blank" rel="noopener noreferrer" className="text-primary underline">voir le guide <ExternalLink className="h-3 w-3 inline" /></a>
          </p>
        </div>

        <Button disabled={!valid} onClick={() => { setRepoUrl(url); setStep(1); }} className="w-full">
          Continuer
        </Button>
      </CardContent>
    </Card>
  );
};

export default RepoForm;
