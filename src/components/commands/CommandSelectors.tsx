import { AppIntake, CommandTarget, CommandType } from '@/types/karma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertCircle } from 'lucide-react';

interface CommandSelectorsProps {
  apps: AppIntake[];
  selectedAppId: string | null;
  selectedTarget: CommandTarget;
  selectedType: CommandType;
  minimalChanges: boolean;
  doNotTouchAssets: boolean;
  onAppChange: (appId: string) => void;
  onTargetChange: (target: CommandTarget) => void;
  onTypeChange: (type: CommandType) => void;
  onMinimalChangesChange: (value: boolean) => void;
  onDoNotTouchAssetsChange: (value: boolean) => void;
}

const TARGETS: { value: CommandTarget; label: string }[] = [
  { value: 'lovable', label: 'Lovable' },
  { value: 'github', label: 'GitHub / Claude Code' },
  { value: 'rork', label: 'Rork' },
  { value: 'vercel', label: 'Vercel' },
];

const TYPES: { value: CommandType; label: string; description: string }[] = [
  { value: 'repair', label: 'Repair', description: 'Fix blockers and errors' },
  { value: 'pwa', label: 'PWA', description: 'PWA/installability setup' },
  { value: 'deploy', label: 'Deploy', description: 'Deployment steps' },
  { value: 'verify', label: 'Verify', description: 'Verification checklist' },
  { value: 'sync', label: 'Sync', description: 'Sync repo → Lovable' },
];

export function CommandSelectors({
  apps,
  selectedAppId,
  selectedTarget,
  selectedType,
  minimalChanges,
  doNotTouchAssets,
  onAppChange,
  onTargetChange,
  onTypeChange,
  onMinimalChangesChange,
  onDoNotTouchAssetsChange,
}: CommandSelectorsProps) {
  const selectedApp = apps.find(a => a.id === selectedAppId);
  const hasRepoUrl = Boolean(selectedApp?.repoUrl);

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Command Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* App Selector */}
        <div className="space-y-2">
          <Label>App</Label>
          <Select value={selectedAppId || ''} onValueChange={onAppChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select an app..." />
            </SelectTrigger>
            <SelectContent>
              {apps.map(app => (
                <SelectItem key={app.id} value={app.id}>
                  <span className="flex items-center gap-2">
                    <span 
                      className={`w-2 h-2 rounded-full ${
                        app.trafficLight === 'green' ? 'bg-green-500' :
                        app.trafficLight === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    />
                    {app.displayName || app.name}
                    {app.isInternal && (
                      <span className="text-xs text-muted-foreground">(Internal)</span>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Repo URL Warning */}
        {selectedApp && !hasRepoUrl && (selectedTarget === 'github' || selectedTarget === 'vercel') && (
          <div className="flex items-start gap-2 p-2 bg-destructive/10 rounded-md text-sm">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <span className="text-destructive">Repo URL required for {selectedTarget} commands</span>
          </div>
        )}

        {/* Target Selector */}
        <div className="space-y-2">
          <Label>Target</Label>
          <Select value={selectedTarget} onValueChange={(v) => onTargetChange(v as CommandTarget)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TARGETS.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type Selector */}
        <div className="space-y-2">
          <Label>Objective</Label>
          <Select value={selectedType} onValueChange={(v) => onTypeChange(v as CommandType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>
                  <div className="flex flex-col">
                    <span>{t.label}</span>
                    <span className="text-xs text-muted-foreground">{t.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Toggles */}
        <div className="pt-2 border-t space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="minimal" className="text-sm font-normal cursor-pointer">
              Minimal changes only
            </Label>
            <Switch 
              id="minimal" 
              checked={minimalChanges} 
              onCheckedChange={onMinimalChangesChange}
              disabled // Locked ON
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="assets" className="text-sm font-normal cursor-pointer">
              Do not touch assets
            </Label>
            <Switch 
              id="assets" 
              checked={doNotTouchAssets} 
              onCheckedChange={onDoNotTouchAssetsChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
