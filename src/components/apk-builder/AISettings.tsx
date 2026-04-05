import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useApkBuilderStore } from '@/stores/apkBuilderStore';
import { getDefaultModel, testApiKey } from '@/lib/aiClient';
import { Bot, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { AIProvider } from '@/types/apk-builder';

const PROVIDERS: { value: AIProvider; label: string; free?: boolean }[] = [
  { value: 'gemini', label: 'Google Gemini', free: true },
  { value: 'groq', label: 'Groq (Llama)', free: true },
  { value: 'qwen', label: 'Qwen (Alibaba)', free: true },
  { value: 'mistral', label: 'Mistral AI', free: true },
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'custom', label: 'Personnalisé (OpenAI-compatible)' },
];

const AISettings = () => {
  const { aiConfig, setAiConfig } = useApkBuilderStore();
  const [provider, setProvider] = useState<AIProvider>(aiConfig?.provider || 'gemini');
  const [apiKey, setApiKey] = useState(aiConfig?.apiKey || '');
  const [model, setModel] = useState(aiConfig?.model || '');
  const [baseUrl, setBaseUrl] = useState(aiConfig?.baseUrl || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const handleProviderChange = (v: AIProvider) => {
    setProvider(v);
    setModel(getDefaultModel(v));
    setTestResult(null);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const config = { provider, apiKey, model: model || undefined, baseUrl: baseUrl || undefined };
    const ok = await testApiKey(config);
    setTestResult(ok);
    setTesting(false);
    if (ok) toast.success('Clé API valide !');
    else toast.error('Clé API invalide ou erreur de connexion');
  };

  const handleSave = () => {
    setAiConfig({ provider, apiKey, model: model || undefined, baseUrl: baseUrl || undefined });
    toast.success('Configuration IA sauvegardée');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" /> Assistant IA
        </CardTitle>
        <CardDescription>
          Configurez un fournisseur d'IA pour analyser les erreurs de build et obtenir de l'aide.
          Les clés API restent dans votre navigateur.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Fournisseur</Label>
          <Select value={provider} onValueChange={(v) => handleProviderChange(v as AIProvider)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PROVIDERS.map(p => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label} {p.free && <span className="text-xs text-muted-foreground ml-1">(tier gratuit)</span>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Clé API</Label>
          <Input
            type="password"
            placeholder="sk-... ou AIza..."
            value={apiKey}
            onChange={e => { setApiKey(e.target.value); setTestResult(null); }}
          />
        </div>

        <div className="space-y-2">
          <Label>Modèle (optionnel)</Label>
          <Input
            placeholder={getDefaultModel(provider)}
            value={model}
            onChange={e => setModel(e.target.value)}
          />
        </div>

        {provider === 'custom' && (
          <div className="space-y-2">
            <Label>URL de l'API (OpenAI-compatible)</Label>
            <Input
              placeholder="https://api.example.com/v1/chat/completions"
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTest} disabled={!apiKey || testing}>
            {testing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Tester la clé
          </Button>
          {testResult !== null && (
            testResult
              ? <span className="flex items-center text-sm text-primary"><CheckCircle className="h-4 w-4 mr-1" /> Valide</span>
              : <span className="flex items-center text-sm text-destructive"><XCircle className="h-4 w-4 mr-1" /> Invalide</span>
          )}
        </div>

        <Button onClick={handleSave} disabled={!apiKey} className="w-full">
          Sauvegarder la configuration IA
        </Button>
      </CardContent>
    </Card>
  );
};

export default AISettings;
