import { Check, X, Loader2 } from 'lucide-react';
import type { RepoAnalysis } from '@/types/apk-builder';

interface Props {
  analysis: RepoAnalysis;
}

const items = [
  { key: 'hasPackageJson', label: 'package.json', desc: 'Fichier de dépendances' },
  { key: 'hasCapacitorConfig', label: 'Capacitor config', desc: 'Configuration Capacitor' },
  { key: 'hasAndroidFolder', label: 'Dossier Android', desc: 'Plateforme native' },
  { key: 'hasIndexHtml', label: 'index.html', desc: 'Point d\'entrée web' },
  { key: 'hasBuildDir', label: 'Dossier de build', desc: 'Fichiers compilés' },
  { key: 'hasManifest', label: 'manifest.json', desc: 'Manifeste PWA' },
  { key: 'hasServiceWorker', label: 'Service Worker', desc: 'Cache hors-ligne' },
  { key: 'hasWorkflow', label: 'GitHub Actions', desc: 'Workflow CI/CD' },
] as const;

const AnalysisReport = ({ analysis }: Props) => (
  <div className="space-y-2">
    <h3 className="text-sm font-semibold text-foreground">Rapport d'analyse</h3>
    {items.map(({ key, label, desc }) => {
      const present = analysis[key];
      return (
        <div key={key} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card border border-border">
          {present ? (
            <Check className="h-4 w-4 text-green-500 shrink-0" />
          ) : (
            <X className="h-4 w-4 text-destructive shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-card-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{desc}{key === 'hasBuildDir' && analysis.detectedBuildDir ? ` (${analysis.detectedBuildDir})` : ''}</p>
          </div>
          <span className={`ml-auto text-xs font-medium ${present ? 'text-green-500' : 'text-destructive'}`}>
            {present ? 'OK' : 'Manquant'}
          </span>
        </div>
      );
    })}
  </div>
);

export default AnalysisReport;
