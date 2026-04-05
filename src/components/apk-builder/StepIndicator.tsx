import type { WizardStep } from '@/types/apk-builder';
import { Check } from 'lucide-react';

const steps = [
  { label: 'Dépôt', short: '1' },
  { label: 'Token', short: '2' },
  { label: 'Config', short: '3' },
  { label: 'Compilation', short: '4' },
];

interface Props {
  current: WizardStep;
  onStepClick: (s: WizardStep) => void;
}

const StepIndicator = ({ current, onStepClick }: Props) => (
  <div className="flex items-center justify-center gap-1 py-4">
    {steps.map((s, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <div key={i} className="flex items-center">
          <button
            onClick={() => i <= current ? onStepClick(i as WizardStep) : undefined}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              done ? 'bg-primary text-primary-foreground'
              : active ? 'bg-primary/20 text-primary border-2 border-primary'
              : 'bg-muted text-muted-foreground'
            }`}
          >
            {done ? <Check className="h-4 w-4" /> : s.short}
          </button>
          {i < steps.length - 1 && (
            <div className={`w-8 h-0.5 mx-1 ${i < current ? 'bg-primary' : 'bg-border'}`} />
          )}
        </div>
      );
    })}
  </div>
);

export default StepIndicator;
