import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ListOrdered, 
  ArrowRight, 
  Database, 
  Shield, 
  Users, 
  FileText, 
  Bot, 
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BuildStep {
  step: number;
  phase: 'foundation' | 'compliance' | 'evaluation' | 'agents' | 'integration';
  title: string;
  description: string;
  whyFirst: string;
  dependencies: string[];
  version: 'v1' | 'v2';
  status: 'done' | 'in_progress' | 'todo';
}

interface CouplingRisk {
  risk: string;
  mitigation: string;
}

interface Shortcut {
  avoid: string;
  reason: string;
}

const buildSteps: BuildStep[] = [
  // Phase 1: Foundation
  {
    step: 1,
    phase: 'foundation',
    title: 'Database Schema & Storage Layer',
    description: 'Define core tables: contributors, agreements, evaluations, audit_log, user_roles',
    whyFirst: 'All other features depend on persistent data storage',
    dependencies: ['Supabase/Cloud connection'],
    version: 'v1',
    status: 'done',
  },
  {
    step: 2,
    phase: 'foundation',
    title: 'Authentication System',
    description: 'Implement Supabase Auth with email/password for founder access',
    whyFirst: 'Role-based access requires authenticated users first',
    dependencies: ['Database schema', 'Supabase Auth'],
    version: 'v1',
    status: 'todo',
  },
  {
    step: 3,
    phase: 'foundation',
    title: 'Role-Based Access Control',
    description: 'Separate user_roles table with has_role() security definer function',
    whyFirst: 'All gating logic depends on knowing who the founder is',
    dependencies: ['Auth system', 'user_roles table'],
    version: 'v1',
    status: 'todo',
  },
  {
    step: 4,
    phase: 'foundation',
    title: 'Audit Logging Infrastructure',
    description: 'ActivityLog table with automatic triggers for all state changes',
    whyFirst: 'Compliance requires all actions logged from day one',
    dependencies: ['Database schema', 'Auth system'],
    version: 'v1',
    status: 'in_progress',
  },

  // Phase 2: Compliance
  {
    step: 5,
    phase: 'compliance',
    title: 'Contributor Record Management',
    description: 'CRUD for contributors with legal fields, Wyoming jurisdiction branding',
    whyFirst: 'Agreement registry needs contributor records to attach to',
    dependencies: ['Database schema', 'RBAC'],
    version: 'v1',
    status: 'done',
  },
  {
    step: 6,
    phase: 'compliance',
    title: 'Agreement Registry & Versioning',
    description: 'Store NDA and IP Assignment templates with version control',
    whyFirst: 'E-signature tracking needs agreement templates defined first',
    dependencies: ['Contributor records'],
    version: 'v1',
    status: 'done',
  },
  {
    step: 7,
    phase: 'compliance',
    title: 'E-Signature Status Tracking',
    description: 'Track sent/signed/revoked status with external provider metadata',
    whyFirst: 'Access tier assignment depends on signature status',
    dependencies: ['Agreement registry'],
    version: 'v1',
    status: 'done',
  },
  {
    step: 8,
    phase: 'compliance',
    title: 'Access Tier Enforcement',
    description: 'Tier 0-3 assignment with automatic gating based on signature status',
    whyFirst: 'Task assignment depends on access tier being set',
    dependencies: ['E-signature tracking'],
    version: 'v1',
    status: 'done',
  },

  // Phase 3: Evaluation
  {
    step: 9,
    phase: 'evaluation',
    title: 'Onboarding Questionnaire Intake',
    description: 'Structured intake form collecting role, availability, portfolio links',
    whyFirst: 'Evaluation rubric needs questionnaire responses to score',
    dependencies: ['Contributor records'],
    version: 'v1',
    status: 'done',
  },
  {
    step: 10,
    phase: 'evaluation',
    title: 'Evaluation Rubric Engine',
    description: 'Score contributors across categories with AI-suggested ratings',
    whyFirst: 'Scoring tags derive from rubric scores',
    dependencies: ['Questionnaire intake'],
    version: 'v1',
    status: 'done',
  },
  {
    step: 11,
    phase: 'evaluation',
    title: 'Scoring Tags System',
    description: 'Fit/Risk/Readiness tags with founder confirmation workflow',
    whyFirst: 'Decision gating depends on tag state',
    dependencies: ['Evaluation rubric'],
    version: 'v1',
    status: 'done',
  },
  {
    step: 12,
    phase: 'evaluation',
    title: 'Decision Gating Rules',
    description: 'Only approved contributors with ready:sign tag proceed to agreements',
    whyFirst: 'Agreement flow needs clear entry criteria',
    dependencies: ['Scoring tags', 'Founder decision workflow'],
    version: 'v1',
    status: 'done',
  },

  // Phase 4: AI Agents
  {
    step: 13,
    phase: 'agents',
    title: 'AI Agent Registry',
    description: 'Define 4 agents with allowed/blocked actions and approval checkpoints',
    whyFirst: 'Agent invocation framework needs agent definitions',
    dependencies: ['RBAC'],
    version: 'v1',
    status: 'done',
  },
  {
    step: 14,
    phase: 'agents',
    title: 'Agent Invocation Framework',
    description: 'Request/approve/reject workflow for agent actions',
    whyFirst: 'Guardrails enforcement requires structured invocation',
    dependencies: ['Agent registry', 'Audit log'],
    version: 'v1',
    status: 'done',
  },
  {
    step: 15,
    phase: 'agents',
    title: 'Guardrails Enforcement',
    description: 'Hard blocks on grant_access, approve_agreement, publish_code, override_founder',
    whyFirst: 'Agents must be constrained before any real invocations',
    dependencies: ['Agent invocation framework'],
    version: 'v1',
    status: 'done',
  },

  // Phase 5: Integration
  {
    step: 16,
    phase: 'integration',
    title: 'Founder Dashboard',
    description: 'At-a-glance view of pending approvals, unsigned agreements, active contributors',
    whyFirst: 'Operational visibility is critical for solo founder',
    dependencies: ['All previous systems'],
    version: 'v1',
    status: 'todo',
  },
  {
    step: 17,
    phase: 'integration',
    title: 'Instant Access Revocation',
    description: 'One-click revoke that cascades through all systems',
    whyFirst: 'Emergency action must be available from day one',
    dependencies: ['Access tiers', 'Agreement registry', 'Audit log'],
    version: 'v1',
    status: 'done',
  },

  // v2 Features
  {
    step: 18,
    phase: 'integration',
    title: 'Real AI Evaluation Integration',
    description: 'Replace mock AI scoring with actual LLM calls for evaluation',
    whyFirst: 'Not critical for MVP — mock scoring validates flow',
    dependencies: ['Evaluation rubric', 'AI API keys'],
    version: 'v2',
    status: 'todo',
  },
  {
    step: 19,
    phase: 'integration',
    title: 'External E-Signature Provider Integration',
    description: 'DocuSign/HelloSign/PandaDoc webhook integration',
    whyFirst: 'Manual status tracking works for MVP volume',
    dependencies: ['Agreement registry'],
    version: 'v2',
    status: 'todo',
  },
  {
    step: 20,
    phase: 'integration',
    title: 'Contributor Self-Service Portal',
    description: 'Contributors can view their own status and agreements',
    whyFirst: 'Founder-managed flow works for MVP volume',
    dependencies: ['Auth with contributor role', 'RBAC'],
    version: 'v2',
    status: 'todo',
  },
];

const couplingRisks: CouplingRisk[] = [
  {
    risk: 'Evaluation → Agreement flow coupling',
    mitigation: 'Use clear state machine: evaluation decision must be finalized before agreement flow starts',
  },
  {
    risk: 'Access tier spread across multiple systems',
    mitigation: 'Single source of truth in contributor record; other systems read but never write tier',
  },
  {
    risk: 'Audit log as afterthought',
    mitigation: 'Build logging infrastructure first; use DB triggers for automatic capture',
  },
  {
    risk: 'AI agent scope creep',
    mitigation: 'Hardcode blocked actions in agent registry; no runtime overrides allowed',
  },
];

const shortcuts: Shortcut[] = [
  {
    avoid: 'Storing roles in user profile table',
    reason: 'Leads to privilege escalation attacks — always use separate user_roles table',
  },
  {
    avoid: 'Client-side access control checks only',
    reason: 'Can be bypassed — all gating must be enforced via RLS policies on server',
  },
  {
    avoid: 'Skipping agreement versioning',
    reason: 'Legal disputes require knowing which version was signed',
  },
  {
    avoid: 'Allowing AI to write final decisions',
    reason: 'Violates founder authority — AI suggests, human decides',
  },
  {
    avoid: 'Batch operations without audit trails',
    reason: 'Every individual action must be logged, even in bulk operations',
  },
];

const mvpDoneDefinition = [
  'A contributor cannot access anything without signed NDA + IP Assignment',
  'All state changes are logged with user, timestamp, and action',
  'Founder can revoke access instantly with one action',
  'AI agents cannot grant access, approve agreements, or override founder',
  'Evaluation decisions gate agreement flow (no backdoors)',
  'System works for solo founder (no required collaborators)',
  'Wyoming LLC jurisdiction is branded throughout legal flows',
  'Access tiers are enforced — unsigned = Tier 0 = no access',
];

const phaseConfig = {
  foundation: { label: 'Foundation', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  compliance: { label: 'Compliance', color: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
  evaluation: { label: 'Evaluation', color: 'bg-purple-500/10 text-purple-500 border-purple-500/30' },
  agents: { label: 'AI Agents', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30' },
  integration: { label: 'Integration', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' },
};

const statusConfig = {
  done: { icon: CheckCircle2, label: 'Done', className: 'text-success' },
  in_progress: { icon: Clock, label: 'In Progress', className: 'text-warning' },
  todo: { icon: Target, label: 'To Do', className: 'text-muted-foreground' },
};

export function MVPBuildOrder() {
  const v1Steps = buildSteps.filter(s => s.version === 'v1');
  const v2Steps = buildSteps.filter(s => s.version === 'v2');
  const doneCount = v1Steps.filter(s => s.status === 'done').length;
  const progress = Math.round((doneCount / v1Steps.length) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <ListOrdered className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">KarmaOS MVP Build Order</h2>
          <p className="text-sm text-muted-foreground">Step-by-step execution plan • {progress}% complete</p>
        </div>
      </div>

      {/* v1 Build Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            v1 — Must Ship ({doneCount}/{v1Steps.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {v1Steps.map((step, index) => {
            const phase = phaseConfig[step.phase];
            const status = statusConfig[step.status];
            const StatusIcon = status.icon;
            
            return (
              <div key={step.step} className="relative">
                {index > 0 && (
                  <div className="absolute -top-2 left-4 h-2 w-px bg-border" />
                )}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium",
                      step.status === 'done' ? 'bg-success/10 text-success' :
                      step.status === 'in_progress' ? 'bg-warning/10 text-warning' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {step.step}
                    </div>
                    {index < v1Steps.length - 1 && (
                      <div className="flex-1 w-px bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{step.title}</span>
                          <Badge variant="outline" className={cn("text-xs", phase.color)}>
                            {phase.label}
                          </Badge>
                          <StatusIcon className={cn("h-4 w-4", status.className)} />
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ArrowRight className="h-3 w-3 mt-0.5 shrink-0" />
                          <span><strong>Why first:</strong> {step.whyFirst}</span>
                        </div>
                        {step.dependencies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {step.dependencies.map(dep => (
                              <Badge key={dep} variant="secondary" className="text-xs">
                                {dep}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* v2 Deferred */}
      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            v2 — Can Wait
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {v2Steps.map(step => (
              <div key={step.step} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  {step.step}
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">{step.title}</span>
                  <p className="text-sm text-muted-foreground/70">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Coupling Risks */}
      <Card className="border-warning/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Coupling Risks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {couplingRisks.map((risk, i) => (
              <div key={i} className="space-y-1">
                <p className="text-sm font-medium text-warning">{risk.risk}</p>
                <p className="text-sm text-muted-foreground">→ {risk.mitigation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shortcuts to Avoid */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <XCircle className="h-4 w-4 text-destructive" />
            Shortcuts to Avoid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {shortcuts.map((shortcut, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg">
                <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{shortcut.avoid}</p>
                  <p className="text-sm text-muted-foreground">{shortcut.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* MVP Done Definition */}
      <Card className="border-success/30 bg-success/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            MVP Done Definition
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            KarmaOS v1 is complete when ALL of the following are true:
          </p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {mvpDoneDefinition.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
