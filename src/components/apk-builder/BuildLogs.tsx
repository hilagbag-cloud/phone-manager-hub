import { useEffect, useRef } from 'react';
import { useApkBuilderStore } from '@/stores/apkBuilderStore';
import { ScrollArea } from '@/components/ui/scroll-area';

const BuildLogs = () => {
  const { logs } = useApkBuilderStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  if (logs.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-[hsl(220,20%,8%)] p-3 mt-4">
      <p className="text-xs font-semibold text-muted-foreground mb-2">Logs</p>
      <ScrollArea className="h-48">
        <div className="space-y-1 font-mono text-xs">
          {logs.map((log, i) => (
            <div key={i} className={`${
              log.type === 'success' ? 'text-green-400' :
              log.type === 'error' ? 'text-red-400' :
              log.type === 'warning' ? 'text-yellow-400' :
              'text-gray-300'
            }`}>
              <span className="text-gray-500">[{log.timestamp.toLocaleTimeString('fr-FR')}]</span>{' '}
              {log.message}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default BuildLogs;
