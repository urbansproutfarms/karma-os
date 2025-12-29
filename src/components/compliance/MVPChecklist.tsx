import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, XCircle, AlertCircle, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  status: 'done' | 'in_progress' | 'todo';
  category: 'must' | 'must_not';
}

const mvpChecklist: ChecklistItem[] = [
  // MUST INCLUDE
  { id: '1', label: 'User authentication', description: 'Supabase Auth integration', status: 'todo', category: 'must' },
  { id: '2', label: 'Role-based access control', description: 'Founder, contributor roles enforced', status: 'in_progress', category: 'must' },
  { id: '3', label: 'Contributor records', description: 'Store contributor profiles and status', status: 'done', category: 'must' },
  { id: '4', label: 'Agreement registry', description: 'Versioned legal agreement templates', status: 'done', category: 'must' },
  { id: '5', label: 'E-signature status tracking', description: 'Track signature status and timestamps', status: 'done', category: 'must' },
  { id: '6', label: 'Access tier enforcement', description: 'Tier 0-3 with explicit rules', status: 'done', category: 'must' },
  { id: '7', label: 'AI agent invocation framework', description: '4 agents with approval checkpoints', status: 'done', category: 'must' },
  { id: '8', label: 'Audit / activity log', description: 'Log all actions with timestamps', status: 'in_progress', category: 'must' },
  { id: '9', label: 'Manual founder approval checkpoints', description: 'Human-in-the-loop for major decisions', status: 'done', category: 'must' },
];

const mustNotInclude: string[] = [
  'Public user access',
  'Payments / billing',
  'Marketing features',
  'Over-automation',
  'Autonomous AI decisions',
];

const successCriteria: string[] = [
  'A contributor cannot work without signing agreements',
  'All actions are logged',
  'Founder can see system state at a glance',
  'System works for a solo founder first',
];

const statusConfig = {
  done: { icon: CheckCircle, label: 'Done', className: 'text-success' },
  in_progress: { icon: AlertCircle, label: 'In Progress', className: 'text-warning' },
  todo: { icon: Circle, label: 'To Do', className: 'text-muted-foreground' },
};

export function MVPChecklist() {
  const mustItems = mvpChecklist.filter(i => i.category === 'must');
  const doneCount = mustItems.filter(i => i.status === 'done').length;
  const progress = (doneCount / mustItems.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Rocket className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">KarmaOS MVP Checklist</h3>
          <p className="text-sm text-muted-foreground">Track implementation progress</p>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">MVP Progress</span>
            <span className="text-sm text-muted-foreground">{doneCount} / {mustItems.length} complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {progress === 100 ? 'MVP ready for deployment!' : `${Math.round(progress)}% complete`}
          </p>
        </CardContent>
      </Card>

      {/* Must Include */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            MVP Must Include
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mustItems.map(item => {
              const status = statusConfig[item.status];
              const StatusIcon = status.icon;
              
              return (
                <div key={item.id} className="flex items-start gap-3 p-3 bg-accent rounded-lg">
                  <StatusIcon className={cn("h-5 w-5 mt-0.5", status.className)} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.label}</span>
                      <Badge variant="outline" className={cn("text-xs", status.className)}>
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Must NOT Include */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <XCircle className="h-4 w-4 text-destructive" />
            MVP Must NOT Include
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {mustNotInclude.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-destructive/5 rounded-md">
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Criteria */}
      <Card className="border-success/20 bg-success/5">
        <CardHeader>
          <CardTitle className="text-base">Success Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {successCriteria.map((criteria, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                <span className="text-sm">{criteria}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
