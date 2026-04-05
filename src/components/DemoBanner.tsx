import { isNative } from '@/capacitor/bridge';
import { AlertTriangle } from 'lucide-react';

const DemoBanner = () => {
  if (isNative()) return null;
  return (
    <div className="bg-warning/10 border-b border-warning/30 px-4 py-2 flex items-center gap-2 text-sm text-warning">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="font-medium">Mode démo</span>
      <span className="text-muted-foreground">— Les données ne sont pas réelles</span>
    </div>
  );
};

export default DemoBanner;
