import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, FolderOpen, Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Settings, Shield, Hammer } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { getContacts, getSms, getCallLogs } from '@/capacitor/bridge';
import { Contact, Sms, CallLog } from '@/types';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [sms, setSms] = useState<Sms[]>([]);
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [c, s, cl] = await Promise.all([getContacts(), getSms(), getCallLogs()]);
      setContacts(c);
      setSms(s);
      setCalls(cl);
      setLoading(false);
    };
    load();
  }, []);

  const inboxCount = sms.filter(s => s.type === 'inbox').length;
  const sentCount = sms.filter(s => s.type === 'sent').length;
  const incomingCalls = calls.filter(c => c.type === 'incoming').length;
  const outgoingCalls = calls.filter(c => c.type === 'outgoing').length;
  const missedCalls = calls.filter(c => c.type === 'missed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="pb-20">
      <PageHeader
        title="Phone Manager"
        subtitle="Gérez vos données en toute simplicité"
        action={
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
            <Settings className="h-5 w-5" />
          </Button>
        }
      />

      <div className="px-4 grid grid-cols-2 gap-3 mt-2">
        <StatCard
          title="Contacts"
          value={contacts.length}
          icon={Users}
          color="primary"
          onClick={() => navigate('/contacts')}
        />
        <StatCard
          title="Messages"
          value={sms.length}
          subtitle={`${inboxCount} reçus · ${sentCount} envoyés`}
          icon={MessageSquare}
          color="accent"
          onClick={() => navigate('/sms')}
        />
        <StatCard
          title="Fichiers"
          value={12}
          subtitle="Images, documents..."
          icon={FolderOpen}
          color="success"
          onClick={() => navigate('/files')}
        />
        <StatCard
          title="Appels"
          value={calls.length}
          subtitle={`${missedCalls} manqués`}
          icon={Phone}
          color="warning"
          onClick={() => navigate('/calls')}
        />
      </div>

      {/* Quick stats */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-semibold text-foreground mb-3">Détails des appels</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-3 border border-border text-center animate-fade-in">
            <PhoneIncoming className="h-5 w-5 text-success mx-auto mb-1" />
            <div className="text-xl font-bold text-card-foreground">{incomingCalls}</div>
            <div className="text-xs text-muted-foreground">Entrants</div>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border text-center animate-fade-in">
            <PhoneOutgoing className="h-5 w-5 text-info mx-auto mb-1" />
            <div className="text-xl font-bold text-card-foreground">{outgoingCalls}</div>
            <div className="text-xs text-muted-foreground">Sortants</div>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border text-center animate-fade-in">
            <PhoneMissed className="h-5 w-5 text-destructive mx-auto mb-1" />
            <div className="text-xl font-bold text-card-foreground">{missedCalls}</div>
            <div className="text-xs text-muted-foreground">Manqués</div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-semibold text-foreground mb-3">Actions rapides</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button onClick={() => navigate('/contacts')} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium whitespace-nowrap shadow-sm hover:opacity-90 transition-opacity">
            <Users className="h-4 w-4" /> Ajouter un contact
          </button>
          <button onClick={() => navigate('/sms')} className="flex items-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-medium whitespace-nowrap shadow-sm hover:opacity-90 transition-opacity">
            <MessageSquare className="h-4 w-4" /> Nouveau SMS
          </button>
          <button onClick={() => navigate('/apk-builder')} className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium whitespace-nowrap shadow-sm hover:opacity-90 transition-opacity">
            <Hammer className="h-4 w-4" /> Créer APK
          </button>
          <button onClick={() => navigate('/settings')} className="flex items-center gap-2 px-4 py-2.5 bg-muted text-muted-foreground rounded-xl text-sm font-medium whitespace-nowrap shadow-sm hover:opacity-90 transition-opacity">
            <Shield className="h-4 w-4" /> Sauvegarde
          </button>
        </div>
      </div>

      {/* Last sync */}
      <div className="px-4 mt-6">
        <div className="bg-surface rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Dernière synchronisation : {new Date().toLocaleString('fr-FR')}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
