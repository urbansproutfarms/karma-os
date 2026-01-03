import { useState } from 'react';
import { AppIntake, DataLayerType, DATA_LAYER_LABELS } from '@/types/karma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Rocket, Database, Wrench, Lightbulb, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface LaunchPromptsCardProps {
  app: AppIntake;
}

// Recommend data layer based on app characteristics
function getRecommendedDataLayer(app: AppIntake): { layer: DataLayerType; reason: string } {
  // If app has login/auth mentioned in description or mvpScope
  const needsAuth = 
    app.description.toLowerCase().includes('login') ||
    app.description.toLowerCase().includes('account') ||
    app.description.toLowerCase().includes('user data') ||
    app.mvpScope.toLowerCase().includes('login') ||
    app.mvpScope.toLowerCase().includes('account');
  
  // If app is complex multi-user
  const isComplexMultiUser = 
    app.description.toLowerCase().includes('multi-user') ||
    app.description.toLowerCase().includes('marketplace') ||
    app.description.toLowerCase().includes('sensitive') ||
    app.intendedUser.toLowerCase().includes('teams') ||
    app.intendedUser.toLowerCase().includes('organizations');

  // If app needs sync across devices
  const needsSync = 
    app.description.toLowerCase().includes('sync') ||
    app.description.toLowerCase().includes('cross-device') ||
    app.description.toLowerCase().includes('cloud');

  if (isComplexMultiUser) {
    return { layer: 'supabase_dedicated', reason: 'App appears complex or multi-user; dedicated DB recommended' };
  }
  
  if (needsAuth || needsSync) {
    return { layer: 'supabase_shared', reason: 'App needs accounts/history across devices' };
  }
  
  return { layer: 'none_local', reason: 'No login + no cross-device sync needed → local-only is fine' };
}

// Generate PWA/Vercel prompt
function generatePWAVercelPrompt(app: AppIntake): string {
  const repoNote = app.repoUrl ? `Repo: ${app.repoUrl}\n\n` : '';
  
  return `${repoNote}## PWA/Vercel Launch Readiness Prompt for "${app.name}"

### Objective
Prepare this app for Vercel deployment as a Progressive Web App (PWA).

### Requirements
- Minimal changes only - no redesign, no new features
- Preserve existing intent and functionality
- No monetization changes

### Checklist
1. [ ] PWA manifest present and valid (manifest.json)
2. [ ] Service worker registered correctly
3. [ ] No false claims or legal ambiguity in UI text
4. [ ] Clear informational language throughout
5. [ ] Error-free load on initial visit
6. [ ] Ready for Vercel deployment (vercel.json if needed)

### Success Criteria
- App loads without console errors
- Lighthouse PWA score ≥ 80
- All manifest icons present (192x192, 512x512)
- Offline fallback displays gracefully
- No "installable" claims unless actually installable`;
}

// Generate Data Layer prompt based on type
function generateDataLayerPrompt(app: AppIntake): string {
  const dataLayer = app.dataLayer || 'none_local';
  const repoNote = app.repoUrl ? `Repo: ${app.repoUrl}\n\n` : '';
  
  switch (dataLayer) {
    case 'none_local':
      return `${repoNote}## Data Layer Prompt for "${app.name}" (Local-Only)

### Objective
Confirm and harden local-only data handling.

### Requirements
- Minimal changes only - no redesign, no new features
- Preserve existing intent and functionality
- No auth, no external DB

### Checklist
1. [ ] All localStorage access wrapped in try/catch
2. [ ] Schema normalization on load (handle undefined/null gracefully)
3. [ ] Empty-state UI when no data exists
4. [ ] Add small on-screen note: "Data stored on this device" (informational, non-alarming)
5. [ ] No external API calls for data persistence

### Success Criteria
- App works correctly on first load (empty state)
- App recovers gracefully from corrupted localStorage
- User understands data is device-local`;

    case 'supabase_shared':
      const appPrefix = app.name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 15);
      return `${repoNote}## Data Layer Prompt for "${app.name}" (Supabase Shared)

### Objective
Connect to existing shared Supabase project using env vars.

### Requirements
- Minimal changes only - no redesign, no new features
- Use table naming with app prefix: \`${appPrefix}_*\`
- Keep schema minimal (only tables actually needed)
- Do NOT migrate legacy data unless explicitly requested

### Checklist
1. [ ] Environment variables configured (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
2. [ ] Supabase client initialized correctly
3. [ ] Tables prefixed with \`${appPrefix}_\`
4. [ ] RLS policies appropriate for auth needs
5. [ ] Connectivity check on app load (display status)
6. [ ] Graceful fallback if Supabase unreachable

### Success Criteria
- App connects to Supabase on load
- Data persists across sessions
- RLS policies prevent unauthorized access`;

    case 'supabase_dedicated':
      return `${repoNote}## Data Layer Prompt for "${app.name}" (Supabase Dedicated)

### Objective
Create/assume dedicated Supabase project for this app.

### Requirements
- Minimal changes only - no redesign, no new features
- Use clean table names without prefixes
- Use RLS and auth only if needed
- Emphasize separation and simplicity

### Checklist
1. [ ] Dedicated Supabase project created
2. [ ] Environment variables configured
3. [ ] Clean table names (no prefixes needed)
4. [ ] Minimal schema - only required tables
5. [ ] RLS policies if auth is used
6. [ ] Connectivity check on app load

### Success Criteria
- App has isolated, dedicated database
- No table naming conflicts
- Clean separation from other apps`;

    case 'other':
      return `${repoNote}## Data Layer Prompt for "${app.name}" (Other Backend)

### Objective
Prepare placeholders for custom backend integration.

### Requirements
- Founder must specify the backend details
- Do NOT implement without specifics

### Checklist
1. [ ] Backend type specified: ________________
2. [ ] Environment variables defined: ________________
3. [ ] Auth requirements documented: ________________
4. [ ] Data model documented: ________________
5. [ ] API endpoints documented: ________________

### Founder Action Required
Please specify:
- What backend/database will be used?
- What authentication method?
- What is the data model?

### Success Criteria
- Backend integration documented
- Implementation can proceed once specified`;

    default:
      return 'Data layer not configured.';
  }
}

// Generate Minimal Launch Fix prompt (for Yellow apps)
function generateMinimalLaunchFixPrompt(app: AppIntake): string | null {
  if (app.trafficLight !== 'yellow') return null;
  
  const repoNote = app.repoUrl ? `Repo: ${app.repoUrl}\n\n` : '';
  
  // Identify blockers
  const blockers: string[] = [];
  if (!app.repoUrl) blockers.push('Missing repo URL');
  if (!app.ownerConfirmed) blockers.push('Ownership not confirmed');
  if (!app.agentReviewComplete) blockers.push('Agent review not complete');
  
  const unacknowledgedFlags = [
    ...(app.productSpecReview?.flags.filter(f => !f.acknowledged) || []),
    ...(app.riskIntegrityReview?.flags.filter(f => !f.acknowledged) || []),
  ];
  if (unacknowledgedFlags.length > 0) {
    blockers.push(`${unacknowledgedFlags.length} unacknowledged flag(s)`);
  }
  
  const vercelComplete = app.vercelReadiness ? Object.values(app.vercelReadiness).filter(Boolean).length : 0;
  if (vercelComplete < 6) {
    blockers.push(`Vercel checklist: ${vercelComplete}/6 complete`);
  }

  return `${repoNote}## Minimal Launch Fix Prompt for "${app.name}" (Yellow → Green)

### Objective
Address minimum blockers to move from Yellow to Green status.

### Current Status: YELLOW

### Blockers to Address
${blockers.map(b => `- [ ] ${b}`).join('\n')}

### Requirements
- Minimal changes only - no redesign
- No new features
- Preserve existing intent
- No monetization changes
- Fix ONLY the identified blockers

### Success Criteria
${blockers.map(b => `- ${b} → Resolved`).join('\n')}
- App moves from Yellow to Green status
- All Vercel checklist items complete
- No unacknowledged flags remain`;
}

export function LaunchPromptsCard({ app }: LaunchPromptsCardProps) {
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  
  const pwaPrompt = generatePWAVercelPrompt(app);
  const dataLayerPrompt = generateDataLayerPrompt(app);
  const minimalFixPrompt = generateMinimalLaunchFixPrompt(app);
  const recommendation = getRecommendedDataLayer(app);
  
  const handleCopy = async (prompt: string, label: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(label);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopiedPrompt(null), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Don't show for internal modules
  if (app.isInternal || app.lifecycle === 'internal-only') {
    return null;
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Rocket className="h-4 w-4" />
          Launch Prompts
        </CardTitle>
        <CardDescription>Copy-ready prompts for launch preparation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recommended Data Layer Advisory */}
        {app.dataLayer !== recommendation.layer && (
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-medium">Recommended Data Layer: </span>
                <span className="text-primary">{DATA_LAYER_LABELS[recommendation.layer]}</span>
                <p className="text-muted-foreground mt-1">{recommendation.reason}</p>
              </div>
            </div>
          </div>
        )}

        {/* PWA/Vercel Prompt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <Rocket className="h-3 w-3" />
              PWA/Vercel Prompt
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(pwaPrompt, 'PWA/Vercel Prompt')}
            >
              {copiedPrompt === 'PWA/Vercel Prompt' ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              Copy
            </Button>
          </div>
          <Textarea
            value={pwaPrompt}
            readOnly
            className="text-xs font-mono h-24 resize-none"
          />
        </div>

        <Separator />

        {/* Data Layer Prompt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <Database className="h-3 w-3" />
              Data Layer Prompt
              <Badge variant="outline" className="text-xs">
                {DATA_LAYER_LABELS[app.dataLayer || 'none_local']}
              </Badge>
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(dataLayerPrompt, 'Data Layer Prompt')}
            >
              {copiedPrompt === 'Data Layer Prompt' ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              Copy
            </Button>
          </div>
          <Textarea
            value={dataLayerPrompt}
            readOnly
            className="text-xs font-mono h-24 resize-none"
          />
        </div>

        {/* Minimal Launch Fix Prompt (Yellow only) */}
        {minimalFixPrompt && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Wrench className="h-3 w-3" />
                  Minimal Launch Fix
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
                    Yellow → Green
                  </Badge>
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(minimalFixPrompt, 'Minimal Launch Fix')}
                >
                  {copiedPrompt === 'Minimal Launch Fix' ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  Copy
                </Button>
              </div>
              <Textarea
                value={minimalFixPrompt}
                readOnly
                className="text-xs font-mono h-24 resize-none"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
