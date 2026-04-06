/**
 * Puter AI Chat Component
 * Enhanced AI assistant with GitHub tool calling capabilities
 */

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useApkBuilderStore } from '@/stores/apkBuilderStore';
import { parseRepoUrl } from '@/lib/githubClient';
import {
  loadPuterLibrary,
  isPuterLoaded,
  buildSystemPrompt,
} from '@/lib/puter/puterAiClient';
import {
  createAgentSession,
  runAiAgent,
  runAiAgentStreaming,
  getSessionSummary,
  type AgentAction,
} from '@/lib/puter/puterAiAgent';
import { Bot, Send, Loader2, AlertCircle, Zap, GitBranch, FileText, CheckCircle2, XCircle } from 'lucide-react';
import type { RepoInfo } from '@/types/apk-builder';

interface ChatMessage {
  role: 'user' | 'assistant' | 'action';
  content: string;
  action?: AgentAction;
  timestamp: Date;
}

const PuterAIChat = () => {
  const { aiConfig, logs, repoUrl, analysis } = useApkBuilderStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const [usePuter, setUsePuter] = useState(false);
  const [model, setModel] = useState('gpt-5.4-nano');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Puter on mount
  useEffect(() => {
    const init = async () => {
      const loaded = await loadPuterLibrary();
      setPuterReady(loaded);
      if (!loaded) {
        console.warn('Puter.js failed to load');
      }
    };
    init();
  }, []);

  // Auto-scroll to bottom
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

  const addMessage = (role: 'user' | 'assistant' | 'action', content: string, action?: AgentAction) => {
    setMessages(prev => [...prev, { role, content, action, timestamp: new Date() }]);
  };

  const handleSendWithPuter = async () => {
    if (!input.trim() || loading || !repoUrl) return;

    const userMsg = input;
    addMessage('user', userMsg);
    setInput('');
    setLoading(true);

    try {
      const repoInfo = parseRepoUrl(repoUrl);

      // Create agent session
      const session = createAgentSession(repoInfo, model);

      // Run agent with streaming
      addMessage('assistant', '🤖 Puter IA démarre l\'analyse...');

      const actions: AgentAction[] = [];
      for await (const action of runAiAgentStreaming(session, userMsg, {
        maxIterations: 10,
        toolCategories: ['all'],
      })) {
        actions.push(action);

        if (action.type === 'tool_call') {
          addMessage('action', `🔧 Exécution: ${action.tool_name}(${JSON.stringify(action.tool_args)})`, action);
        } else if (action.type === 'error') {
          addMessage('action', `❌ Erreur: ${action.message}`, action);
        } else if (action.type === 'response') {
          addMessage('assistant', action.message || '');
        }
      }

      // Get session summary
      const summary = getSessionSummary(session);
      addMessage('assistant', `\n✅ Session terminée\n- Itérations: ${summary.iterations}\n- Tools appelés: ${summary.toolCallsCount}\n- Erreurs: ${summary.errorsCount}`);
    } catch (error) {
      addMessage('assistant', `❌ Erreur: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAnalyzeAndFix = async () => {
    if (!repoUrl || !analysis || loading) return;

    const prompt = `Analyse ce dépôt et corrige automatiquement les problèmes trouvés:
1. Vérifie les fichiers manquants pour la compilation APK
2. Consulte les logs des workflows GitHub Actions
3. Identifie les erreurs de configuration
4. Crée ou modifie les fichiers nécessaires
5. Déclenche un nouveau build APK

Sois autonome et effectue toutes les corrections nécessaires.`;

    addMessage('user', prompt);
    setLoading(true);

    try {
      const repoInfo = parseRepoUrl(repoUrl);
      const session = createAgentSession(repoInfo, model);

      addMessage('assistant', '🚀 Lancement de l\'analyse et correction automatique...');

      for await (const action of runAiAgentStreaming(session, prompt, {
        maxIterations: 15,
        toolCategories: ['all'],
      })) {
        if (action.type === 'tool_call') {
          const icon = action.tool_name?.includes('read') ? '📖' :
                       action.tool_name?.includes('create') ? '✏️' :
                       action.tool_name?.includes('trigger') ? '▶️' : '🔧';
          addMessage('action', `${icon} ${action.tool_name}: ${action.tool_result?.substring(0, 100)}...`, action);
        } else if (action.type === 'error') {
          addMessage('action', `❌ ${action.message}`, action);
        } else if (action.type === 'response') {
          addMessage('assistant', action.message || '');
        }
      }
    } catch (error) {
      addMessage('assistant', `❌ Erreur: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrepareForBuild = async () => {
    if (!repoUrl || loading) return;

    const prompt = `Prépare ce dépôt pour la compilation APK:
1. Vérifie la présence de tous les fichiers requis (capacitor.config.json, package.json, etc.)
2. Crée les fichiers manquants avec les bons templates
3. Vérifie la configuration Android
4. Vérifie le workflow GitHub Actions pour le build APK
5. Signale si tout est prêt pour le build`;

    addMessage('user', prompt);
    setLoading(true);

    try {
      const repoInfo = parseRepoUrl(repoUrl);
      const session = createAgentSession(repoInfo, model);

      addMessage('assistant', '📋 Préparation du dépôt pour la compilation...');

      for await (const action of runAiAgentStreaming(session, prompt, {
        maxIterations: 10,
        toolCategories: ['read', 'write'],
      })) {
        if (action.type === 'tool_call') {
          addMessage('action', `🔍 ${action.tool_name}`, action);
        } else if (action.type === 'response') {
          addMessage('assistant', action.message || '');
        }
      }
    } catch (error) {
      addMessage('assistant', `❌ Erreur: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action?: AgentAction) => {
    if (!action) return null;

    if (action.type === 'error') return <XCircle className="h-4 w-4 text-destructive" />;
    if (action.type === 'response') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (action.tool_name?.includes('trigger')) return <Zap className="h-4 w-4 text-yellow-500" />;
    if (action.tool_name?.includes('create')) return <FileText className="h-4 w-4 text-blue-500" />;
    if (action.tool_name?.includes('fork')) return <GitBranch className="h-4 w-4 text-purple-500" />;

    return <Bot className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            {usePuter ? 'Puter IA Agent' : 'Assistant IA'}
          </CardTitle>
          {puterReady && (
            <Button
              variant={usePuter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUsePuter(!usePuter)}
              className="text-xs"
            >
              <Zap className="h-3 w-3 mr-1" />
              {usePuter ? 'Puter Actif' : 'Activer Puter'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {usePuter && (
          <div className="flex gap-2 items-center text-xs bg-blue-50 dark:bg-blue-950 p-2 rounded">
            <Zap className="h-3 w-3 text-blue-500" />
            <span className="text-blue-700 dark:text-blue-300">Mode Puter IA actif - L'IA peut exécuter des outils GitHub</span>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              className="ml-auto text-xs px-2 py-1 rounded border"
            >
              <option value="gpt-5.4-nano">GPT-5.4 Nano</option>
              <option value="gpt-5.2-chat">GPT-5.2 Chat</option>
              <option value="gemini-2.5-flash-lite">Gemini 2.5</option>
            </select>
          </div>
        )}

        <ScrollArea className="h-64 rounded-md border bg-muted/30 p-3" ref={scrollRef}>
          {messages.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">
              {usePuter
                ? 'Puter IA est prêt. Décrivez ce que vous voulez que l\'IA fasse avec le dépôt.'
                : 'Posez une question ou lancez une analyse.'}
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`mb-3 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : m.role === 'action'
                  ? 'bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800'
                  : 'bg-card border border-border text-card-foreground'
              }`}>
                <div className="flex items-start gap-2">
                  {m.role === 'action' && getActionIcon(m.action)}
                  <span>{m.content}</span>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Puter IA en action...</span>
            </div>
          )}
        </ScrollArea>

        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-1.5">
          {usePuter && repoUrl && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrepareForBuild}
                disabled={loading}
                className="text-[11px] h-7"
              >
                <FileText className="h-3 w-3 mr-1" /> Préparer build
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoAnalyzeAndFix}
                disabled={loading}
                className="text-[11px] h-7"
              >
                <Zap className="h-3 w-3 mr-1" /> Analyser & Corriger
              </Button>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder={usePuter ? 'Décrivez ce que vous voulez faire...' : 'Posez votre question...'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (usePuter ? handleSendWithPuter() : null)}
            disabled={loading || (usePuter && !repoUrl)}
            className="text-sm"
          />
          <Button
            size="icon"
            onClick={usePuter ? handleSendWithPuter : undefined}
            disabled={!input.trim() || loading || (usePuter && !repoUrl)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {usePuter && !repoUrl && (
          <p className="text-xs text-muted-foreground text-center">
            ⚠️ Veuillez d'abord entrer une URL de dépôt GitHub
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PuterAIChat;
