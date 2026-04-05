import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApkBuilderStore } from '@/stores/apkBuilderStore';
import { chatCompletion } from '@/lib/aiClient';
import { Bot, Send, Loader2, AlertCircle } from 'lucide-react';
import type { AIMessage } from '@/types/apk-builder';

const SYSTEM_PROMPT = `Tu es un assistant expert en développement d'applications web et mobiles.
Tu aides les utilisateurs à transformer leurs PWA en APK Android via Capacitor et GitHub Actions.
Tu peux analyser les logs d'erreur, suggérer des corrections de code, et expliquer les étapes.
Réponds toujours en français, de manière claire et concise.`;

const AIChat = () => {
  const { aiConfig, logs } = useApkBuilderStore();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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
      // Include build logs context if available
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
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Erreur: ${e.message}`,
      }]);
    } finally {
      setLoading(false);
    }
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
    setInput(`Analyse ces erreurs de build et propose des solutions:\n\n${errorLogs}`);
  };

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
              Posez une question ou demandez d'analyser les erreurs de build.
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
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Réflexion...
            </div>
          )}
        </ScrollArea>

        {logs.some(l => l.type === 'error') && (
          <Button variant="outline" size="sm" onClick={handleAnalyzeErrors} className="w-full text-xs">
            🔍 Analyser les erreurs de build
          </Button>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Posez votre question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={loading}
            className="text-sm"
          />
          <Button size="icon" onClick={handleSend} disabled={!input.trim() || loading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChat;
