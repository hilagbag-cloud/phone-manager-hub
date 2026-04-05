import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Key, Shield } from 'lucide-react';
import { useApkBuilderStore } from '@/stores/apkBuilderStore';
import { useGitHubApi } from '@/hooks/useGitHubApi';
import { LINKS } from '@/lib/links';

const TokenInput = () => {
  const { username, setStep } = useApkBuilderStore();
  const { connectToken } = useGitHubApi();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    const ok = await connectToken(value);
    setLoading(false);
    if (ok) setStep(2);
  };

  if (username) {
    return (
      <Card>
        <CardContent className="pt-6 text-center space-y-3">
          <Shield className="h-8 w-8 text-primary mx-auto" />
          <p className="font-medium">Connecté en tant que <span className="text-primary">@{username}</span></p>
          <Button onClick={() => setStep(2)} className="w-full">Continuer</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Étape 2 : Token GitHub</CardTitle>
        <CardDescription>
          Un token permet à l'application d'agir sur votre dépôt (ajouter des fichiers, lancer la compilation).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="password"
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="font-mono text-sm"
        />

        <div className="bg-muted rounded-lg p-3 text-xs space-y-2">
          <p className="font-medium flex items-center gap-1"><Key className="h-3 w-3" /> Comment obtenir un token :</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>
              <a href={LINKS.githubTokenNew} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Ouvrir la page de création de token <ExternalLink className="h-3 w-3 inline" />
              </a>
            </li>
            <li>Cochez les droits : <code className="bg-background px-1 rounded">repo</code> et <code className="bg-background px-1 rounded">workflow</code></li>
            <li>Cliquez sur « Generate token » puis copiez-le ici</li>
          </ol>
          <p className="text-muted-foreground mt-2">
            🔒 Votre token reste dans votre navigateur et n'est jamais envoyé à un serveur.
          </p>
        </div>

        <Button disabled={!value || loading} onClick={handleConnect} className="w-full">
          {loading ? 'Vérification...' : 'Vérifier et continuer'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TokenInput;
