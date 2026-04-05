import { useState, useEffect } from 'react';
import { ArrowLeft, Moon, Sun, Shield, Download, Upload, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { checkPermissions, getContacts, getSms, getCallLogs } from '@/capacitor/bridge';
import { AppPermissions } from '@/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [permissions, setPermissions] = useState<AppPermissions | null>(null);

  useEffect(() => {
    // Check system preference
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    checkPermissions().then(setPermissions);
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
  };

  const handleBackup = async () => {
    const [contacts, sms, calls] = await Promise.all([getContacts(), getSms(), getCallLogs()]);
    const backup = {
      version: '1.0',
      date: new Date().toISOString(),
      contacts,
      sms,
      callLogs: calls,
    };
    const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phone_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Sauvegarde exportée');
  };

  const handleRestore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.contacts && data.sms && data.callLogs) {
          toast.success(`Restauration : ${data.contacts.length} contacts, ${data.sms.length} SMS, ${data.callLogs.length} appels`);
        } else {
          toast.error('Format de sauvegarde invalide');
        }
      } catch {
        toast.error('Erreur lors de la lecture du fichier');
      }
    };
    input.click();
  };

  const handleReset = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données locales ?')) {
      localStorage.clear();
      toast.success('Données locales effacées');
    }
  };

  const permLabels: Record<keyof AppPermissions, string> = {
    contacts: 'Contacts',
    sms: 'SMS',
    storage: 'Stockage',
    callLog: 'Journal d\'appels',
  };

  return (
    <div className="pb-20">
      <PageHeader
        title="Paramètres"
        action={
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        }
      />

      <div className="px-4 space-y-4 mt-2">
        {/* Theme */}
        <div className="bg-card rounded-xl p-4 border border-border animate-fade-in">
          <h3 className="font-semibold text-card-foreground mb-3">Apparence</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {darkMode ? <Moon className="h-5 w-5 text-accent" /> : <Sun className="h-5 w-5 text-warning" />}
              <span className="text-sm text-card-foreground">Mode sombre</span>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleTheme} />
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-card rounded-xl p-4 border border-border animate-fade-in">
          <h3 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Permissions
          </h3>
          <div className="space-y-2">
            {permissions && (Object.keys(permissions) as (keyof AppPermissions)[]).map(key => (
              <div key={key} className="flex items-center justify-between py-1">
                <span className="text-sm text-card-foreground">{permLabels[key]}</span>
                <span className={`flex items-center gap-1 text-xs font-medium ${
                  permissions[key] === 'granted' ? 'text-success' : 'text-destructive'
                }`}>
                  {permissions[key] === 'granted' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {permissions[key] === 'granted' ? 'Accordé' : 'Refusé'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="bg-card rounded-xl p-4 border border-border animate-fade-in">
          <h3 className="font-semibold text-card-foreground mb-3">Sauvegarde & Restauration</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={handleBackup}>
              <Download className="h-4 w-4" /> Exporter une sauvegarde
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={handleRestore}>
              <Upload className="h-4 w-4" /> Restaurer une sauvegarde
            </Button>
          </div>
        </div>

        {/* Reset */}
        <div className="bg-card rounded-xl p-4 border border-border animate-fade-in">
          <h3 className="font-semibold text-card-foreground mb-3">Zone dangereuse</h3>
          <Button variant="destructive" className="w-full gap-2" onClick={handleReset}>
            <Trash2 className="h-4 w-4" /> Réinitialiser l'application
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
