import { useEffect, useRef } from 'react';
import { useApkBuilderStore } from '@/stores/apkBuilderStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink } from 'lucide-react';

const BuildLogs = () => {
  const { logs } = useApkBuilderStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  if (logs.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-muted p-3 mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-muted-foreground">Logs ({logs.length})</p>
      </div>
      <ScrollArea className="h-56">
        <div className="space-y-1 font-mono text-xs">
          {logs.map((log, i) => (
            <div key={i} className={`flex items-start gap-1 ${
              log.type === 'success' ? 'text-green-400' :
              log.type === 'error' ? 'text-red-400' :
              log.type === 'warning' ? 'text-yellow-400' :
              'text-gray-300'
            }`}>
              <span className="text-gray-500 shrink-0">[{log.timestamp.toLocaleTimeString('fr-FR')}]</span>
              <span className="flex-1">{log.message}</span>
              {log.link && (
                <a
                  href={log.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 shrink-0"
                  title="Voir sur GitHub"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default BuildLogs;
