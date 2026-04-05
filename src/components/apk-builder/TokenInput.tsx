import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Key, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApkBuilderStore } from '@/stores/apkBuilderStore';
import { useGitHubApi } from '@/hooks/useGitHubApi';
import { LINKS } from '@/lib/links';
import { clearGitHubToken } from '@/lib/storage';
import { toast } from 'sonner';

const REQUIRED_SCOPES = ['repo', 'workflow', 'read:org', 'read:user'];

const TokenInput = () => {
  const { username, setStep, token, setToken, setUsername } = useApkBuilderStore();
  const { connectToken } = useGitHubApi();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    const ok = await connectToken(value);
    setLoading(false);
    if (ok) setStep(0); // Go to repo selection (step 0 now shows repos)
  };

  const handleDisconnect = async () => {
    setToken('');
    setUsername('');
    await clearGitHubToken();
    toast.info('Déconnecté de GitHub');
  };

  if (username && token) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="text-center space-y-2">
            <Shield className="h-8 w-8 text-primary mx-auto" />
            <p className="font-medium">Connecté en tant que <span className="text-primary">@{username}</span></p>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Token sauvegardé localement
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setStep(0)} className="flex-1">Continuer</Button>
            <Button variant="outline" onClick={handleDisconnect} className="text-xs">
              Déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Token creation URL with all required scopes
  const tokenUrl = `https://github.com/settings/tokens/new?scopes=${REQUIRED_SCOPES.join(',')}&description=APK%20Builder%20Universal`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Connexion GitHub</CardTitle>
        <CardDescription>
          Un token d'accès personnel permet à l'application d'accéder à vos dépôts et lancer des builds.
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
              <a href={tokenUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Créer un token avec les bons scopes <ExternalLink className="h-3 w-3 inline" />
              </a>
            </li>
            <li>Vérifiez que ces permissions sont cochées :</li>
          </ol>
          <div className="flex flex-wrap gap-1 pl-4">
            {REQUIRED_SCOPES.map(scope => (
              <code key={scope} className="bg-background px-1.5 py-0.5 rounded text-[10px]">{scope}</code>
            ))}
          </div>
          <ol className="list-decimal pl-4 space-y-1" start={3}>
            <li>Cliquez sur « Generate token » puis copiez-le ici</li>
          </ol>
          
          <div className="flex items-start gap-1.5 mt-2 p-2 bg-background rounded border border-border">
            <AlertTriangle className="h-3 w-3 text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              Le scope <code className="bg-muted px-1 rounded">repo</code> est indispensable pour les dépôts privés.
              Le token est stocké uniquement dans votre navigateur (IndexedDB).
            </p>
          </div>
        </div>

        <Button disabled={!value || loading} onClick={handleConnect} className="w-full">
          {loading ? 'Vérification...' : 'Connecter'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TokenInput;
