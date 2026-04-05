import { useEffect, useState } from 'react';
import { Send, Trash2, Inbox, ArrowUpRight, Download } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SearchBar from '@/components/SearchBar';
import { getSms, sendSms, deleteSms } from '@/capacitor/bridge';
import { Sms } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const SmsPage = () => {
  const [messages, setMessages] = useState<Sms[]>([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'inbox' | 'sent'>('inbox');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [composeOpen, setComposeOpen] = useState(false);
  const [form, setForm] = useState({ phone: '', content: '' });

  const load = async () => {
    setLoading(true);
    const s = await getSms();
    setMessages(s);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = messages
    .filter(s => s.type === tab)
    .filter(s =>
      s.content.toLowerCase().includes(search.toLowerCase()) ||
      (s.contactName || s.phone).toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleDeleteSelected = async () => {
    await deleteSms([...selected]);
    setSelected(new Set());
    toast.success(`${selected.size} message(s) supprimé(s)`);
    load();
  };

  const handleSend = async () => {
    if (!form.phone || !form.content) {
      toast.error('Numéro et message requis');
      return;
    }
    await sendSms(form.phone, form.content);
    toast.success('SMS envoyé');
    setComposeOpen(false);
    setForm({ phone: '', content: '' });
    load();
  };

  const exportMessages = () => {
    const toExport = filtered.filter(s => selected.size === 0 || selected.has(s.id));
    const blob = new Blob([JSON.stringify(toExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sms_export_${tab}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export terminé');
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="pb-20">
      <PageHeader
        title="Messages"
        subtitle={`${messages.length} messages`}
        action={
          <Button size="sm" onClick={() => setComposeOpen(true)} className="gap-1">
            <Send className="h-4 w-4" /> Nouveau
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 px-4 mb-2">
        <button
          onClick={() => { setTab('inbox'); setSelected(new Set()); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === 'inbox' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
          }`}
        >
          <Inbox className="h-4 w-4" /> Reçus
        </button>
        <button
          onClick={() => { setTab('sent'); setSelected(new Set()); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === 'sent' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
          }`}
        >
          <ArrowUpRight className="h-4 w-4" /> Envoyés
        </button>
        {selected.size > 0 && (
          <button onClick={handleDeleteSelected} className="ml-auto flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium bg-destructive text-destructive-foreground">
            <Trash2 className="h-4 w-4" /> {selected.size}
          </button>
        )}
        <button onClick={exportMessages} className="p-2 rounded-xl bg-secondary text-secondary-foreground ml-auto">
          <Download className="h-4 w-4" />
        </button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Rechercher dans les messages..." />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {filtered.map(sms => (
            <div
              key={sms.id}
              onClick={() => toggleSelect(sms.id)}
              className={`bg-card rounded-xl p-3 border transition-all cursor-pointer animate-fade-in ${
                selected.has(sms.id) ? 'border-primary bg-primary/5' : 'border-border'
              } ${!sms.read ? 'border-l-4 border-l-primary' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-card-foreground">{sms.contactName || sms.phone}</span>
                <span className="text-xs text-muted-foreground">{formatDate(sms.date)}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{sms.content}</p>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">Aucun message</div>
          )}
        </div>
      )}

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Nouveau SMS</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Destinataire</Label>
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+33 6 ..." />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeOpen(false)}>Annuler</Button>
            <Button onClick={handleSend} className="gap-1"><Send className="h-4 w-4" /> Envoyer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SmsPage;
