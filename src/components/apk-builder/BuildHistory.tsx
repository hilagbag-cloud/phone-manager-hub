import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getBuildHistory, type BuildHistory as BuildHistoryEntry } from '@/lib/storage';
import { Download, ExternalLink, History, Trash2 } from 'lucide-react';
import { clearAllData } from '@/lib/storage';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const BuildHistory = () => {
  const [history, setHistory] = useState<BuildHistoryEntry[]>([]);

  useEffect(() => {
    getBuildHistory(30).then(setHistory).catch(() => {});
  }, []);

  if (history.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          Historique des builds ({history.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-64">
          <div className="space-y-2">
            {history.map((entry, i) => (
              <div key={entry.id ?? i} className="flex items-center justify-between p-2 rounded-md border border-border bg-muted/30">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium truncate">{entry.appName}</span>
                    <Badge variant={
                      entry.status === 'success' ? 'default' :
                      entry.status === 'error' ? 'destructive' : 'secondary'
                    } className="text-[10px] px-1.5 py-0">
                      {entry.status === 'success' ? '✅ Réussi' :
                       entry.status === 'error' ? '❌ Échoué' : '⏳ En cours'}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {entry.repoOwner}/{entry.repoName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(entry.timestamp), 'dd MMM yyyy HH:mm', { locale: fr })}
                  </p>
                  {entry.errorMessage && (
                    <p className="text-[10px] text-destructive mt-1 truncate">{entry.errorMessage}</p>
                  )}
                </div>
                {entry.downloadUrl && (
                  <a href={entry.downloadUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default BuildHistory;
