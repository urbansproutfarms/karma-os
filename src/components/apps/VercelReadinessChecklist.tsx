import { AppIntake, VercelReadinessChecklist as VercelChecklist } from '@/types/karma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Cloud, Check, X } from 'lucide-react';

interface VercelReadinessChecklistProps {
  app: AppIntake;
  onUpdateChecklist: (appId: string, checklist: VercelChecklist) => void;
  readOnly?: boolean;
}

const CHECKLIST_ITEMS: { key: keyof VercelChecklist; label: string; description: string }[] = [
  { 
    key: 'pwaManifestPresent', 
    label: 'PWA manifest present', 
    description: 'manifest.json with icons and theme configured' 
  },
  { 
    key: 'serviceWorkerRegistered', 
    label: 'Service worker registered', 
    description: 'SW registered for offline capability' 
  },
  { 
    key: 'noFalseClaimsOrLegalAmbiguity', 
    label: 'No false claims / legal ambiguity', 
    description: 'All claims are accurate and legally sound' 
  },
  { 
    key: 'clearInformationalLanguage', 
    label: 'Clear informational-only language', 
    description: 'No misleading or prescriptive language' 
  },
  { 
    key: 'errorFreeLoad', 
    label: 'Error-free load (no runtime crash)', 
    description: 'App loads without console errors or crashes' 
  },
  { 
    key: 'readyForVercelDeployment', 
    label: 'Ready for Vercel deployment', 
    description: 'Build passes and ready to deploy' 
  },
];

const DEFAULT_CHECKLIST: VercelChecklist = {
  pwaManifestPresent: false,
  serviceWorkerRegistered: false,
  noFalseClaimsOrLegalAmbiguity: false,
  clearInformationalLanguage: false,
  errorFreeLoad: false,
  readyForVercelDeployment: false,
};

export function getVercelReadinessScore(checklist?: VercelChecklist): { complete: number; total: number; allComplete: boolean } {
  if (!checklist) return { complete: 0, total: 6, allComplete: false };
  
  const values = Object.values(checklist);
  const complete = values.filter(Boolean).length;
  return { complete, total: values.length, allComplete: complete === values.length };
}

export function VercelReadinessChecklistCard({ app, onUpdateChecklist, readOnly = false }: VercelReadinessChecklistProps) {
  const checklist = app.vercelReadiness || DEFAULT_CHECKLIST;
  const { complete, total, allComplete } = getVercelReadinessScore(checklist);

  const handleToggle = (key: keyof VercelChecklist) => {
    if (readOnly) return;
    
    const updated = {
      ...checklist,
      [key]: !checklist[key],
    };
    onUpdateChecklist(app.id, updated);
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            Vercel / PWA Readiness
          </div>
          <span className={`text-sm font-normal ${allComplete ? 'text-primary' : 'text-muted-foreground'}`}>
            {complete}/{total}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {CHECKLIST_ITEMS.map((item) => (
          <div 
            key={item.key} 
            className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
              checklist[item.key] ? 'bg-primary/5' : 'bg-muted/30'
            }`}
          >
            <Checkbox
              id={`${app.id}-${item.key}`}
              checked={checklist[item.key]}
              onCheckedChange={() => handleToggle(item.key)}
              disabled={readOnly}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label 
                htmlFor={`${app.id}-${item.key}`}
                className={`text-sm cursor-pointer ${checklist[item.key] ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {item.label}
              </Label>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            {checklist[item.key] ? (
              <Check className="h-4 w-4 text-primary" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground/50" />
            )}
          </div>
        ))}
        
        {!readOnly && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Manually confirm each item. Used for launch readiness calculation.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
