import { useEffect, useState } from 'react';
import { Folder, File, Image, Film, Music, FileText, ChevronRight, ArrowLeft, FolderPlus, Trash2, Share2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SearchBar from '@/components/SearchBar';
import { getFiles, deleteFile, createDirectory, shareFile } from '@/capacitor/bridge';
import { FileEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const getFileIcon = (entry: FileEntry) => {
  if (entry.type === 'directory') return <Folder className="h-5 w-5 text-warning" />;
  if (entry.mimeType?.startsWith('image')) return <Image className="h-5 w-5 text-info" />;
  if (entry.mimeType?.startsWith('video')) return <Film className="h-5 w-5 text-accent" />;
  if (entry.mimeType?.startsWith('audio')) return <Music className="h-5 w-5 text-success" />;
  if (entry.mimeType?.includes('pdf') || entry.mimeType?.includes('text')) return <FileText className="h-5 w-5 text-destructive" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
};

const formatSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / 1048576).toFixed(1)} Mo`;
};

const FilesPage = () => {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [path, setPath] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState('');

  useEffect(() => {
    const load = async () => {
      const f = await getFiles();
      setFiles(f);
      setLoading(false);
    };
    load();
  }, []);

  // Navigate into the file tree
  const getCurrentEntries = (): FileEntry[] => {
    let current = files;
    for (const segment of path) {
      const dir = current.find(f => f.name === segment && f.type === 'directory');
      if (dir?.children) {
        current = dir.children;
      } else {
        return [];
      }
    }
    return current;
  };

  const entries = getCurrentEntries().filter(e =>
    search ? e.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  const navigateInto = (entry: FileEntry) => {
    if (entry.type === 'directory') {
      setPath([...path, entry.name]);
      setSearch('');
    }
  };

  const navigateBack = () => {
    setPath(path.slice(0, -1));
  };

  const handleCreateFolder = async () => {
    if (!folderName) return;
    await createDirectory(`/${path.join('/')}/${folderName}`);
    toast.success(`Dossier "${folderName}" créé`);
    setNewFolderOpen(false);
    setFolderName('');
  };

  const handleDelete = async (entry: FileEntry) => {
    await deleteFile(entry.path);
    toast.success(`"${entry.name}" supprimé`);
  };

  const handleShare = async (entry: FileEntry) => {
    await shareFile(entry.path, entry.name);
    toast.success('Partage lancé');
  };

  return (
    <div className="pb-20">
      <PageHeader
        title="Fichiers"
        subtitle={path.length > 0 ? path.join(' / ') : 'Stockage'}
        action={
          <Button size="sm" variant="outline" onClick={() => setNewFolderOpen(true)} className="gap-1">
            <FolderPlus className="h-4 w-4" />
          </Button>
        }
      />

      {path.length > 0 && (
        <div className="px-4 pb-2">
          <button onClick={navigateBack} className="flex items-center gap-1 text-sm text-primary font-medium">
            <ArrowLeft className="h-4 w-4" /> Retour
          </button>
        </div>
      )}

      <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un fichier..." />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="px-4 space-y-1.5">
          {entries.map(entry => (
            <div
              key={entry.id}
              className="bg-card rounded-xl p-3 border border-border flex items-center gap-3 animate-fade-in"
            >
              <button onClick={() => navigateInto(entry)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                {getFileIcon(entry)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-card-foreground truncate">{entry.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {entry.type === 'directory'
                      ? `${entry.children?.length || 0} éléments`
                      : formatSize(entry.size)}
                    {' · '}{new Date(entry.modifiedAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                {entry.type === 'directory' && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              </button>
              {entry.type === 'file' && (
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleShare(entry)} className="p-2 rounded-lg hover:bg-info/10 text-info transition-colors">
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(entry)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
          {entries.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">Dossier vide</div>
          )}
        </div>
      )}

      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Nouveau dossier</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Nom du dossier</Label>
            <Input value={folderName} onChange={e => setFolderName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderOpen(false)}>Annuler</Button>
            <Button onClick={handleCreateFolder}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FilesPage;
