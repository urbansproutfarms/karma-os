import { useState } from 'react';
import { AppIntake, DATA_LAYER_LABELS } from '@/types/karma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Wrench, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface NextFixPromptCardProps {
  app: AppIntake;
}

interface ReadinessItem {
  id: string;
  label: string;
  status: 'green' | 'yellow' | 'red';
  notes?: string;
}

function getReadinessChecklist(app: AppIntake): ReadinessItem[] {
  const items: ReadinessItem[] = [];
  
  // PWA basics
  const pwaComplete = app.vercelReadiness?.pwaManifestPresent && app.vercelReadiness?.serviceWorkerRegistered;
  items.push({
    id: 'pwa',
    label: 'PWA basics (manifest, icons, installable, offline)',
    status: pwaComplete ? 'green' : app.vercelReadiness?.pwaManifestPresent ? 'yellow' : 'red',
    notes: !pwaComplete ? 'Missing manifest or service worker' : undefined,
  });

  // Legal
  const legalComplete = app.vercelReadiness?.noFalseClaimsOrLegalAmbiguity && app.vercelReadiness?.clearInformationalLanguage;
  items.push({
    id: 'legal',
    label: 'Legal: Terms, Privacy, ClearPath "What this is / is not"',
    status: legalComplete ? 'green' : 'yellow',
    notes: !legalComplete ? 'Review legal language and claims' : undefined,
  });

  // Data handling
  const dataLayer = app.dataLayer || 'none_local';
  items.push({
    id: 'data',
    label: `Data handling: ${DATA_LAYER_LABELS[dataLayer]}`,
    status: dataLayer === 'none_local' || dataLayer === 'supabase_shared' || dataLayer === 'supabase_dedicated' ? 'green' : 'yellow',
    notes: dataLayer === 'other' ? 'Data layer needs specification' : undefined,
  });

  // Claims check
  const noClaims = app.complianceFlags?.noMedicalClaims && 
                   app.complianceFlags?.noFinancialClaims && 
                   app.complianceFlags?.noEmploymentClaims;
  items.push({
    id: 'claims',
    label: 'Claims: No medical/financial/employment claims',
    status: noClaims ? 'green' : app.complianceFlags ? 'yellow' : 'red',
    notes: !noClaims ? 'Verify no prohibited claims in UI text' : undefined,
  });

  // Accessibility
  items.push({
    id: 'a11y',
    label: 'Accessibility: Basic contrast + keyboard nav',
    status: 'yellow',
    notes: 'Requires manual review',
  });

  // Error states
  items.push({
    id: 'errors',
    label: 'Error states: Empty states, network failures',
    status: app.vercelReadiness?.errorFreeLoad ? 'green' : 'yellow',
    notes: !app.vercelReadiness?.errorFreeLoad ? 'Add graceful error handling' : undefined,
  });

  return items;
}

function generateNextFixPrompt(app: AppIntake, items: ReadinessItem[]): string {
  const redItems = items.filter(i => i.status === 'red');
  const yellowItems = items.filter(i => i.status === 'yellow');
  
  if (redItems.length === 0 && yellowItems.length === 0) {
    return '✅ All readiness checks passed. App is launch-ready.';
  }

  const blockers = [...redItems, ...yellowItems];
  const repoNote = app.repoUrl ? `Repo: ${app.repoUrl}\n\n` : '';

  return `${repoNote}## Next Fix Prompt for "${app.name}"

### Objective
Address RED/YELLOW readiness items to prepare for launch.

### Current Status
- 🔴 RED items: ${redItems.length}
- 🟡 YELLOW items: ${yellowItems.length}
- 🟢 GREEN items: ${items.filter(i => i.status === 'green').length}

### Items to Fix
${blockers.map(item => `- [${item.status === 'red' ? '🔴' : '🟡'}] ${item.label}${item.notes ? `\n  → ${item.notes}` : ''}`).join('\n')}

### Requirements
- Minimal changes only - no redesign
- No new features unless required for compliance
- Preserve existing intent
- No monetization changes

### Success Criteria
${blockers.map(item => `- ${item.label} → Resolved`).join('\n')}

### Constraints
- Do NOT add social feeds, messaging, leaderboards, points, streaks, or rewards
- Keep tone calm and neutral
- No employment/medical/financial claims`;
}

export function NextFixPromptCard({ app }: NextFixPromptCardProps) {
  const [copied, setCopied] = useState(false);
  
  const items = getReadinessChecklist(app);
  const redItems = items.filter(i => i.status === 'red');
  const yellowItems = items.filter(i => i.status === 'yellow');
  const greenItems = items.filter(i => i.status === 'green');
  
  const prompt = generateNextFixPrompt(app, items);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast.success('Next Fix Prompt copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Don't show for internal modules
  if (app.isInternal || app.lifecycle === 'internal-only') {
    return null;
  }

  const getStatusIcon = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'yellow':
        return <AlertCircle className="h-3 w-3 text-amber-500" />;
      case 'red':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          Launch Readiness
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400">
            {greenItems.length} Green
          </Badge>
          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
            {yellowItems.length} Yellow
          </Badge>
          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400">
            {redItems.length} Red
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Compact checklist */}
        <div className="space-y-1.5">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-2 text-xs">
              {getStatusIcon(item.status)}
              <span className={item.status === 'green' ? 'text-muted-foreground' : 'text-foreground'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Next Fix Prompt button */}
        {(redItems.length > 0 || yellowItems.length > 0) && (
          <div className="space-y-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="w-full"
            >
              {copied ? (
                <Check className="h-3 w-3 mr-2" />
              ) : (
                <Copy className="h-3 w-3 mr-2" />
              )}
              Copy Next Fix Prompt
            </Button>
            <Textarea
              value={prompt}
              readOnly
              className="text-xs font-mono h-20 resize-none"
            />
          </div>
        )}

        {redItems.length === 0 && yellowItems.length === 0 && (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
            <p className="text-xs text-green-700 dark:text-green-400 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              All readiness checks passed. Ready for 🚀 launch.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
