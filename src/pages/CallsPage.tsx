import { useEffect, useState } from 'react';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Trash2, Phone } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SearchBar from '@/components/SearchBar';
import { getCallLogs, deleteCallLog, clearCallLogs } from '@/capacitor/bridge';
import { CallLog } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const callIcons = {
  incoming: { icon: PhoneIncoming, color: 'text-success' },
  outgoing: { icon: PhoneOutgoing, color: 'text-info' },
  missed: { icon: PhoneMissed, color: 'text-destructive' },
};

const callLabels = {
  incoming: 'Entrant',
  outgoing: 'Sortant',
  missed: 'Manqué',
};

const formatDuration = (sec: number) => {
  if (sec === 0) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const CallsPage = () => {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'incoming' | 'outgoing' | 'missed'>('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const c = await getCallLogs();
    setCalls(c);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = calls
    .filter(c => filter === 'all' || c.type === filter)
    .filter(c =>
      (c.contactName || c.phone).toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDelete = async (id: string) => {
    await deleteCallLog(id);
    toast.success('Appel supprimé');
    load();
  };

  const handleClearAll = async () => {
    await clearCallLogs();
    toast.success('Historique effacé');
    load();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="pb-20">
      <PageHeader
        title="Appels"
        subtitle={`${calls.length} appels`}
        action={
          calls.length > 0 ? (
            <Button size="sm" variant="outline" onClick={handleClearAll} className="gap-1 text-destructive">
              <Trash2 className="h-4 w-4" /> Tout effacer
            </Button>
          ) : undefined
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-2 px-4 mb-2 overflow-x-auto">
        {(['all', 'incoming', 'outgoing', 'missed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {f === 'all' ? 'Tous' : callLabels[f]}
          </button>
        ))}
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un appel..." />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {filtered.map(call => {
            const { icon: CallIcon, color } = callIcons[call.type];
            return (
              <div key={call.id} className="bg-card rounded-xl p-3 border border-border flex items-center gap-3 animate-fade-in">
                <div className={`p-2 rounded-xl bg-secondary ${color}`}>
                  <CallIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-card-foreground truncate">{call.contactName || call.phone}</div>
                  <div className="text-xs text-muted-foreground">
                    {callLabels[call.type]} · {formatDuration(call.duration)} · {formatDate(call.date)}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => window.open(`tel:${call.phone}`)} className="p-2 rounded-lg hover:bg-success/10 text-success transition-colors">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(call.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">Aucun appel</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CallsPage;
