import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, Zap, Check } from 'lucide-react';
import { AppOrigin } from '@/types/karma';

type TrafficLight = 'green' | 'yellow' | 'red';

interface QuickRegisterEntry {
  id: string;
  name: string;
  source: AppOrigin;
  purpose: string;
  initialStatus: TrafficLight;
}

interface QuickRegisterFormProps {
  onSubmit: (entries: Omit<QuickRegisterEntry, 'id'>[]) => void;
  onCancel: () => void;
}

const SOURCES: { value: AppOrigin; label: string }[] = [
  { value: 'lovable', label: 'Lovable' },
  { value: 'rork', label: 'Rork' },
  { value: 'google_ai_studio', label: 'Google AI Studio' },
  { value: 'chat', label: 'Chat' },
  { value: 'manual', label: 'Manual' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS: { value: TrafficLight; label: string; color: string }[] = [
  { value: 'green', label: 'Green', color: 'bg-emerald-500' },
  { value: 'yellow', label: 'Yellow', color: 'bg-amber-500' },
  { value: 'red', label: 'Red', color: 'bg-red-500' },
];

export function QuickRegisterForm({ onSubmit, onCancel }: QuickRegisterFormProps) {
  const [entries, setEntries] = useState<QuickRegisterEntry[]>([
    { id: crypto.randomUUID(), name: '', source: 'lovable', purpose: '', initialStatus: 'yellow' }
  ]);

  const addEntry = () => {
    setEntries([...entries, { 
      id: crypto.randomUUID(), 
      name: '', 
      source: 'lovable', 
      purpose: '', 
      initialStatus: 'yellow' 
    }]);
  };

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const updateEntry = (id: string, field: keyof QuickRegisterEntry, value: string) => {
    setEntries(entries.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const handleSubmit = () => {
    const validEntries = entries.filter(e => e.name.trim() && e.purpose.trim());
    if (validEntries.length > 0) {
      onSubmit(validEntries.map(({ id, ...rest }) => rest));
    }
  };

  const validCount = entries.filter(e => e.name.trim() && e.purpose.trim()).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Quick Register</h1>
            <p className="text-sm text-muted-foreground">
              Rapidly register multiple apps with minimal fields
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={validCount === 0}>
            <Check className="h-4 w-4 mr-2" />
            Register {validCount > 0 ? `(${validCount})` : ''}
          </Button>
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <Card key={entry.id} className="border-muted">
            <CardContent className="p-4">
              <div className="grid grid-cols-12 gap-3 items-end">
                {/* Row number */}
                <div className="col-span-1 flex items-center justify-center">
                  <span className="text-sm text-muted-foreground font-medium">
                    {index + 1}
                  </span>
                </div>

                {/* Name */}
                <div className="col-span-3">
                  <Label className="text-xs text-muted-foreground">App Name</Label>
                  <Input
                    placeholder="App name"
                    value={entry.name}
                    onChange={(e) => updateEntry(entry.id, 'name', e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Source */}
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground">Source</Label>
                  <Select 
                    value={entry.source} 
                    onValueChange={(v) => updateEntry(entry.id, 'source', v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Purpose */}
                <div className="col-span-4">
                  <Label className="text-xs text-muted-foreground">One-line Purpose</Label>
                  <Input
                    placeholder="Brief description of what this app does"
                    value={entry.purpose}
                    onChange={(e) => updateEntry(entry.id, 'purpose', e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select 
                    value={entry.initialStatus} 
                    onValueChange={(v) => updateEntry(entry.id, 'initialStatus', v as TrafficLight)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${STATUS_OPTIONS.find(s => s.value === entry.initialStatus)?.color}`} />
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(s => (
                        <SelectItem key={s.value} value={s.value}>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${s.color}`} />
                            {s.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Remove */}
                <div className="col-span-1 flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEntry(entry.id)}
                    disabled={entries.length === 1}
                    className="h-9 w-9"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Row */}
      <Button variant="outline" onClick={addEntry} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Another App
      </Button>

      {/* Info */}
      <p className="text-xs text-muted-foreground text-center">
        Quick Register creates governance records only. Full intake details can be added later.
      </p>
    </div>
  );
}
