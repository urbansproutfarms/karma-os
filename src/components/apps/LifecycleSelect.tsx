import { AppLifecycle } from '@/types/karma';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Lock } from 'lucide-react';

interface LifecycleSelectProps {
  value: AppLifecycle;
  onChange: (value: AppLifecycle) => void;
  disabled?: boolean;
}

export const LIFECYCLE_LABELS: Record<AppLifecycle, { label: string; description: string }> = {
  external: { label: 'External', description: 'User-facing product, eligible for launch' },
  'internal-only': { label: 'Internal', description: 'Internal tooling, not launchable' },
};

export function LifecycleSelect({ value, onChange, disabled }: LifecycleSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as AppLifecycle)} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue>
          <div className="flex items-center gap-2">
            {value === 'external' ? (
              <Globe className="h-4 w-4 text-primary" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
            <span>{LIFECYCLE_LABELS[value].label}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="external">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <div>
              <span className="font-medium">External</span>
              <p className="text-xs text-muted-foreground">User-facing product, eligible for 🚀</p>
            </div>
          </div>
        </SelectItem>
        <SelectItem value="internal-only">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="font-medium">Internal</span>
              <p className="text-xs text-muted-foreground">Internal tooling, not launchable</p>
            </div>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
