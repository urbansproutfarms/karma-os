import { AccessTier, ACCESS_TIER_NAMES } from '@/types/karma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Code, Users, XCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TierDefinition {
  tier: AccessTier;
  name: string;
  description: string;
  permissions: string[];
  restrictions: string[];
  icon: typeof Shield;
  color: string;
}

const tierDefinitions: TierDefinition[] = [
  {
    tier: 0,
    name: 'No Access',
    description: 'Pre-signature state. No systems, tasks, or IP exposure.',
    permissions: [],
    restrictions: [
      'No system access',
      'No task assignment',
      'No IP exposure',
      'No project visibility',
    ],
    icon: XCircle,
    color: 'text-muted-foreground',
  },
  {
    tier: 1,
    name: 'Limited Contributor',
    description: 'Basic contributor with scoped visibility.',
    permissions: [
      'View assigned specs',
      'Submit work for review',
      'Communicate via approved channels',
    ],
    restrictions: [
      'Cannot access repos directly',
      'Cannot modify architecture',
      'Cannot see other projects',
      'Cannot approve work',
    ],
    icon: Eye,
    color: 'text-warning',
  },
  {
    tier: 2,
    name: 'Scoped Technical',
    description: 'Technical contributor with limited repo access.',
    permissions: [
      'Limited repo access (project-specific)',
      'Submit code for review',
      'View technical documentation',
      'Access development environment',
    ],
    restrictions: [
      'No admin rights',
      'No access to legal, billing, or strategy',
      'No cross-project access',
      'Cannot merge to main branch',
    ],
    icon: Code,
    color: 'text-info',
  },
  {
    tier: 3,
    name: 'Ops / Coordination',
    description: 'Operations contributor for coordination tasks.',
    permissions: [
      'Update task statuses',
      'Prepare summaries and reports',
      'Coordinate between teams',
      'Access project management tools',
    ],
    restrictions: [
      'Cannot approve work',
      'Cannot change scope',
      'Cannot access code repos',
      'Cannot make commitments',
    ],
    icon: Users,
    color: 'text-success',
  },
];

export function AccessTiersPanel() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Access Tiers</h3>
          <p className="text-sm text-muted-foreground">Explicit access levels with enforcement rules</p>
        </div>
      </div>

      {/* Enforcement Rules */}
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-base">Enforcement Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2">
            <li className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-destructive mt-0.5" />
              <span>Access tier assigned only AFTER agreement signed</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-destructive mt-0.5" />
              <span>Access automatically revoked on disengagement</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-destructive mt-0.5" />
              <span>Access level changes logged with timestamp</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-destructive mt-0.5" />
              <span>Founder can revoke access instantly</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Tier Definitions */}
      <div className="grid gap-4 md:grid-cols-2">
        {tierDefinitions.map(tier => {
          const Icon = tier.icon;
          
          return (
            <Card key={tier.tier} className={cn(
              tier.tier === 0 && 'border-muted',
              tier.tier > 0 && 'border-primary/20'
            )}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-5 w-5", tier.color)} />
                    <CardTitle className="text-base">Tier {tier.tier}</CardTitle>
                  </div>
                  <Badge variant="outline">{tier.name}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {tier.permissions.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-success mb-2">Permissions</p>
                    <ul className="space-y-1">
                      {tier.permissions.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-success mt-1" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div>
                  <p className="text-xs font-medium text-destructive mb-2">Restrictions</p>
                  <ul className="space-y-1">
                    {tier.restrictions.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <XCircle className="h-3 w-3 text-destructive mt-1" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
