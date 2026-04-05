import { useEffect, useState } from 'react';
import { Plus, Phone as PhoneIcon, Mail, Trash2, Edit, UserPlus } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SearchBar from '@/components/SearchBar';
import { getContacts, addContact, deleteContact, updateContact } from '@/capacitor/bridge';
import { Contact } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ContactsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', group: '' });

  const load = async () => {
    setLoading(true);
    const c = await getContacts();
    setContacts(c);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const groups = [...new Set(contacts.map(c => c.group).filter(Boolean))];
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const displayed = activeGroup ? filtered.filter(c => c.group === activeGroup) : filtered;

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', phone: '', email: '', group: '' });
    setDialogOpen(true);
  };

  const openEdit = (c: Contact) => {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone, email: c.email || '', group: c.group || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.phone) {
      toast.error('Nom et numéro requis');
      return;
    }
    if (editing) {
      await updateContact({ ...editing, ...form });
      toast.success('Contact modifié');
    } else {
      await addContact(form);
      toast.success('Contact ajouté');
    }
    setDialogOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await deleteContact(id);
    toast.success('Contact supprimé');
    load();
  };

  return (
    <div className="pb-20">
      <PageHeader
        title="Contacts"
        subtitle={`${contacts.length} contacts`}
        action={
          <Button size="sm" onClick={openAdd} className="gap-1">
            <UserPlus className="h-4 w-4" /> Ajouter
          </Button>
        }
      />

      <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un contact..." />

      {/* Group filters */}
      {groups.length > 0 && (
        <div className="flex gap-2 px-4 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveGroup(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              !activeGroup ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}
          >
            Tous
          </button>
          {groups.map(g => (
            <button
              key={g}
              onClick={() => setActiveGroup(g === activeGroup ? null : g!)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeGroup === g ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {displayed.map(contact => (
            <div key={contact.id} className="bg-card rounded-xl p-3 border border-border flex items-center gap-3 animate-fade-in">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-card-foreground text-sm truncate">{contact.name}</div>
                <div className="text-xs text-muted-foreground">{contact.phone}</div>
                {contact.group && (
                  <span className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full mt-0.5 inline-block">
                    {contact.group}
                  </span>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => window.open(`tel:${contact.phone}`)} className="p-2 rounded-lg hover:bg-success/10 text-success transition-colors">
                  <PhoneIcon className="h-4 w-4" />
                </button>
                {contact.email && (
                  <button onClick={() => window.open(`mailto:${contact.email}`)} className="p-2 rounded-lg hover:bg-info/10 text-info transition-colors">
                    <Mail className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => openEdit(contact)} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(contact.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {displayed.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">Aucun contact trouvé</div>
          )}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier le contact' : 'Nouveau contact'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nom *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Téléphone *</Label>
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Groupe</Label>
              <Input value={form.group} onChange={e => setForm({ ...form, group: e.target.value })} placeholder="Famille, Travail, Amis..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave}>{editing ? 'Modifier' : 'Ajouter'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactsPage;
