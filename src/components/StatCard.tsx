import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'primary' | 'accent' | 'success' | 'warning' | 'info' | 'destructive';
  onClick?: () => void;
}

const colorMap = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
  destructive: 'bg-destructive/10 text-destructive',
};

const StatCard = ({ title, value, subtitle, icon: Icon, color, onClick }: StatCardProps) => {
  return (
    <button
      onClick={onClick}
      className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-all duration-200 text-left w-full animate-fade-in"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="text-2xl font-bold text-card-foreground">{value}</div>
      <div className="text-sm font-medium text-card-foreground mt-0.5">{title}</div>
      {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
    </button>
  );
};

export default StatCard;
