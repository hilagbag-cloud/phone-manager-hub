import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApkBuilderStore } from '@/stores/apkBuilderStore';
import { chatCompletion } from '@/lib/aiClient';
import { aiFullAnalysis, aiFixFile } from '@/lib/aiRepoAnalyzer';
import { parseRepoUrl } from '@/lib/githubClient';
import { Bot, Send, Loader2, AlertCircle, Search, Wrench } from 'lucide-react';
import type { AIMessage } from '@/types/apk-builder';

const SYSTEM_PROMPT = `Tu es un assistant expert en développement d'applications web et mobiles.
Tu aides les utilisateurs à transformer leurs PWA en APK Android via Capacitor et GitHub Actions.
Tu peux analyser les logs d'erreur, suggérer des corrections de code, et expliquer les étapes.
Réponds toujours en français, de manière claire et concise.`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const AIChat = () => {
  const { aiConfig, logs, repoUrl, analysis } = useApkBuilderStore();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  if (!aiConfig?.apiKey) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-muted-foreground">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm">Configurez votre clé API IA dans les paramètres pour utiliser l'assistant.</p>
        </CardContent>
      </Card>
    );
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: AIMessage = { role: 'user', content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const logsContext = logs.length > 0
        ? `\n\nLogs de build récents:\n${logs.slice(-20).map(l => `[${l.type}] ${l.message}`).join('\n')}`
        : '';

      const allMessages: AIMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT + logsContext },
        ...updated,
      ];

      const reply = await chatCompletion(aiConfig, allMessages);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Erreur: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFullAnalysis = async () => {
    if (!repoUrl || !analysis) return;
    setLoadingAction('analysis');
    setMessages(prev => [...prev, { role: 'user', content: '🔍 Analyse complète du dépôt (code + workflows + logs)...' }]);
    try {
      const { owner, repo } = parseRepoUrl(repoUrl);
      const result = await aiFullAnalysis(
        aiConfig, owner, repo, analysis.defaultBranch,
        'Analyse complètement ce dépôt. Identifie tous les problèmes pour la génération APK: fichiers manquants, erreurs de config, problèmes de workflow GitHub Actions. Propose des corrections précises.'
      );
      setMessages(prev => [...prev, { role: 'assistant', content: result }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${e.message}` }]);
    }
    setLoadingAction(null);
  };

  const handleAnalyzeErrors = async () => {
    const errorLogs = logs.filter(l => l.type === 'error').map(l => l.message).join('\n');
    if (!errorLogs) {
      setMessages(prev => [...prev,
        { role: 'user', content: 'Analyse les erreurs de build' },
        { role: 'assistant', content: 'Aucune erreur détectée dans les logs actuels. ✅' },
      ]);
      return;
    }
    
    if (repoUrl && analysis) {
      setLoadingAction('errors');
      setMessages(prev => [...prev, { role: 'user', content: '🔧 Analyse des erreurs avec contexte complet du repo...' }]);
      try {
        const { owner, repo } = parseRepoUrl(repoUrl);
        const result = await aiFullAnalysis(
          aiConfig, owner, repo, analysis.defaultBranch,
          `Analyse ces erreurs de build et propose des corrections précises:\n\n${errorLogs}`
        );
        setMessages(prev => [...prev, { role: 'assistant', content: result }]);
      } catch (e: any) {
        setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${e.message}` }]);
      }
      setLoadingAction(null);
    } else {
      setInput(`Analyse ces erreurs de build et propose des solutions:\n\n${errorLogs}`);
    }
  };

  const handleAutoFix = async (filePath: string, error: string) => {
    if (!repoUrl || !analysis) return;
    setLoadingAction('fix');
    setMessages(prev => [...prev, { role: 'user', content: `🔧 Auto-correction de ${filePath}...` }]);
    try {
      const { owner, repo } = parseRepoUrl(repoUrl);
      const result = await aiFixFile(aiConfig, owner, repo, analysis.defaultBranch, filePath, error);
      setMessages(prev => [...prev, { role: 'assistant', content: result.message }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${e.message}` }]);
    }
    setLoadingAction(null);
  };

  const isLoading = loading || !!loadingAction;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" /> Assistant IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ScrollArea className="h-64 rounded-md border bg-muted/30 p-3" ref={scrollRef}>
          {messages.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">
              Posez une question ou lancez une analyse complète du dépôt.
            </p>
          )}
          {messages.filter(m => m.role !== 'system').map((m, i) => (
            <div key={i} className={`mb-3 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-card-foreground'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingAction === 'analysis' ? 'Lecture du dépôt complet...' :
               loadingAction === 'errors' ? 'Analyse des erreurs...' :
               loadingAction === 'fix' ? 'Correction en cours...' : 'Réflexion...'}
            </div>
          )}
        </ScrollArea>

        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-1.5">
          {repoUrl && analysis && (
            <Button variant="outline" size="sm" onClick={handleFullAnalysis} disabled={isLoading} className="text-[11px] h-7">
              <Search className="h-3 w-3 mr-1" /> Analyse complète
            </Button>
          )}
          {logs.some(l => l.type === 'error') && (
            <Button variant="outline" size="sm" onClick={handleAnalyzeErrors} disabled={isLoading} className="text-[11px] h-7">
              <Wrench className="h-3 w-3 mr-1" /> Analyser erreurs
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Posez votre question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            className="text-sm"
          />
          <Button size="icon" onClick={handleSend} disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChat;
