import { DataLayerType, DATA_LAYER_LABELS } from '@/types/karma';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database } from 'lucide-react';

interface DataLayerSelectProps {
  value: DataLayerType;
  onChange: (value: DataLayerType) => void;
  compact?: boolean;
}

export function DataLayerSelect({ value, onChange, compact = false }: DataLayerSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as DataLayerType)}>
      <SelectTrigger className={compact ? 'h-8 text-xs w-[160px]' : 'w-[200px]'}>
        <div className="flex items-center gap-2">
          {!compact && <Database className="h-3 w-3 text-muted-foreground" />}
          <SelectValue placeholder="Select data layer..." />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none_local">{DATA_LAYER_LABELS.none_local}</SelectItem>
        <SelectItem value="supabase_shared">{DATA_LAYER_LABELS.supabase_shared}</SelectItem>
        <SelectItem value="supabase_dedicated">{DATA_LAYER_LABELS.supabase_dedicated}</SelectItem>
        <SelectItem value="other">{DATA_LAYER_LABELS.other}</SelectItem>
      </SelectContent>
    </Select>
  );
}
