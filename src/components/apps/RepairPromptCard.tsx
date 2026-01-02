import { useState } from 'react';
import { AppIntake } from '@/types/karma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Wrench } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RepairPromptCardProps {
  app: AppIntake;
}

function inferBlockingIssues(app: AppIntake): string[] {
  const blockers: string[] = [];
  
  // Conservative inference based on available data
  if (!app.repoUrl) {
    blockers.push('Missing repository URL for deployment');
  }
  if (!app.ownerConfirmed) {
    blockers.push('Ownership not yet confirmed');
  }
  if (!app.agentReviewComplete) {
    blockers.push('Agent review not completed');
  }
  if (app.productSpecReview?.flags.some(f => !f.acknowledged && f.severity === 'high')) {
    blockers.push('Unacknowledged high-severity product spec flags');
  }
  if (app.riskIntegrityReview?.flags.some(f => !f.acknowledged && f.severity === 'high')) {
    blockers.push('Unacknowledged high-severity risk/integrity flags');
  }
  if (!app.vercelReadiness?.pwaManifestPresent) {
    blockers.push('PWA manifest may be missing');
  }
  if (!app.vercelReadiness?.errorFreeLoad) {
    blockers.push('Runtime errors may be present');
  }
  
  // Default if nothing specific found
  if (blockers.length === 0) {
    blockers.push('Status marked Yellow - requires founder review before launch');
  }
  
  return blockers;
}

function generateRepairPrompt(app: AppIntake): string {
  const blockers = inferBlockingIssues(app);
  
  const prompt = `Review and fix launch-blocking issues for "${app.name}".

CONSTRAINTS:
- Do NOT redesign the app
- Do NOT add new features  
- Do NOT add monetization
- Preserve the original intent: "${app.description}"

BLOCKING ISSUES TO ADDRESS:
${blockers.map(b => `- ${b}`).join('\n')}

ACTIONS REQUIRED:
1. Audit for runtime errors and fix any crashes
2. Ensure all user-facing text is accurate and informational-only
3. Remove any false claims or legally ambiguous language
4. Verify PWA manifest and icons are properly configured
5. Test that the app loads without errors

After fixes, confirm the app is stable and ready for Vercel deployment.`;

  return prompt;
}

export function RepairPromptCard({ app }: RepairPromptCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Only show for yellow apps
  if (app.trafficLight !== 'yellow') {
    return null;
  }

  const blockers = inferBlockingIssues(app);
  const repairPrompt = generateRepairPrompt(app);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(repairPrompt);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Repair prompt copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Please select and copy manually',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="border-amber-500/50 bg-amber-500/5">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 text-amber-600">
          <Wrench className="h-4 w-4" />
          Auto Repair Prompt
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-2">APP: {app.name}</p>
          <p className="text-xs text-muted-foreground mb-2">CURRENT STATUS: Yellow</p>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">BLOCKING ISSUES:</p>
          <ul className="text-sm space-y-1">
            {blockers.map((blocker, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-500">•</span>
                <span>{blocker}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">COPY-PASTE FIX PROMPT:</p>
          <div className="bg-muted/50 rounded-lg p-3 text-sm font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
            {repairPrompt}
          </div>
        </div>

        <Button 
          onClick={handleCopy} 
          className="w-full"
          variant={copied ? 'outline' : 'default'}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy Repair Prompt
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Safe for Lovable, Rork, and Claude. Addresses launch-blocking issues only.
        </p>
      </CardContent>
    </Card>
  );
}
