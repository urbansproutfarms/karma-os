import { useState } from 'react';
import { Guardrail } from '@/types/karma';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Shield, AlertTriangle, DollarSign, Target, Workflow, Lock, UserCheck } from 'lucide-react';

const defaultGuardrails: Guardrail[] = [
  {
    id: '1',
    rule: 'No retroactive compensation',
    description: 'All compensation agreements must be documented before work begins. No promises made after the fact.',
    category: 'financial',
    isActive: true,
    isSystemRule: true,
  },
  {
    id: '2',
    rule: 'No undocumented scope changes',
    description: 'All scope changes must be documented and approved before implementation.',
    category: 'scope',
    isActive: true,
    isSystemRule: true,
  },
  {
    id: '3',
    rule: 'No dark patterns',
    description: 'User interfaces must be honest and transparent. No deceptive or manipulative design.',
    category: 'ethics',
    isActive: true,
    isSystemRule: true,
  },
  {
    id: '4',
    rule: 'Human approval for major decisions',
    description: 'All major architectural, financial, or strategic decisions require explicit human approval.',
    category: 'process',
    isActive: true,
    isSystemRule: true,
  },
  {
    id: '5',
    rule: 'Transparent data practices',
    description: 'Be explicit about what data is collected, how it is used, and who has access.',
    category: 'ethics',
    isActive: true,
    isSystemRule: true,
  },
  {
    id: '6',
    rule: 'No promises without capacity',
    description: 'Do not commit to deliverables without confirming team capacity and timeline feasibility.',
    category: 'process',
    isActive: true,
    isSystemRule: true,
  },
  {
    id: '7',
    rule: 'No work without signed agreements',
    description: 'Contributors cannot be assigned tasks or submit work until NDA and IP Assignment are signed.',
    category: 'compliance',
    isActive: true,
    isSystemRule: true,
  },
  {
    id: '8',
    rule: 'No permanent access for contributors',
    description: 'All contributor access is temporary and must be explicitly revoked upon exit.',
    category: 'access',
    isActive: true,
    isSystemRule: true,
  },
  {
    id: '9',
    rule: 'Full auditability',
    description: 'All actions must be logged and reviewable. No silent changes to system or access.',
    category: 'process',
    isActive: true,
    isSystemRule: true,
  },
];

const categoryConfig: Record<string, { icon: typeof Shield; label: string; className: string }> = {
  ethics: { icon: AlertTriangle, label: 'Ethics', className: 'text-warning' },
  process: { icon: Workflow, label: 'Process', className: 'text-info' },
  financial: { icon: DollarSign, label: 'Financial', className: 'text-success' },
  scope: { icon: Target, label: 'Scope', className: 'text-primary' },
  compliance: { icon: UserCheck, label: 'Compliance', className: 'text-destructive' },
  access: { icon: Lock, label: 'Access', className: 'text-warning' },
};

interface GuardrailsPanelProps {
  onConfirm?: (confirmedIds: string[]) => void;
}

export function GuardrailsPanel({ onConfirm }: GuardrailsPanelProps) {
  const [guardrails] = useState<Guardrail[]>(defaultGuardrails);
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());

  const handleToggle = (id: string) => {
    const newConfirmed = new Set(confirmed);
    if (newConfirmed.has(id)) {
      newConfirmed.delete(id);
    } else {
      newConfirmed.add(id);
    }
    setConfirmed(newConfirmed);
    onConfirm?.(Array.from(newConfirmed));
  };

  const allConfirmed = confirmed.size === guardrails.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-accent rounded-lg border border-primary/20">
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <h3 className="font-medium text-foreground">Ethical Guardrails</h3>
          <p className="text-sm text-muted-foreground">
            Review and confirm these principles before proceeding with major decisions.
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {confirmed.size} of {guardrails.length} confirmed
        </span>
        {allConfirmed && (
          <Badge variant="secondary" className="bg-success/10 text-success">
            All Confirmed
          </Badge>
        )}
      </div>

      {/* Guardrails List */}
      <div className="space-y-3">
        {guardrails.map((guardrail) => {
          const category = categoryConfig[guardrail.category] || categoryConfig.process;
          const Icon = category.icon;
          const isConfirmed = confirmed.has(guardrail.id);

          return (
            <Card 
              key={guardrail.id}
              className={cn(
                "transition-karma cursor-pointer",
                isConfirmed && "border-primary/30 bg-accent/50"
              )}
              onClick={() => handleToggle(guardrail.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox 
                    checked={isConfirmed}
                    onCheckedChange={() => handleToggle(guardrail.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={cn("h-4 w-4", category.className)} />
                      <span className="font-medium text-foreground">
                        {guardrail.rule}
                      </span>
                      {guardrail.isSystemRule && (
                        <Badge variant="outline" className="text-xs">System</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {guardrail.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {category.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
