import { ContributorEvaluation, Contributor, EvaluationDecision } from '@/types/karma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Scale, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Pause,
  HelpCircle,
  Users,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EvaluationListProps {
  evaluations: ContributorEvaluation[];
  contributors: Contributor[];
  onEvaluationClick: (evaluation: ContributorEvaluation) => void;
}

const decisionConfig: Record<EvaluationDecision, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Pending', icon: <Clock className="h-3 w-3" />, color: 'bg-muted text-muted-foreground' },
  approved: { label: 'Approved', icon: <CheckCircle2 className="h-3 w-3" />, color: 'bg-success/10 text-success' },
  conditional: { label: 'Conditional', icon: <HelpCircle className="h-3 w-3" />, color: 'bg-warning/10 text-warning' },
  declined: { label: 'Declined', icon: <XCircle className="h-3 w-3" />, color: 'bg-destructive/10 text-destructive' },
  paused: { label: 'Paused', icon: <Pause className="h-3 w-3" />, color: 'bg-info/10 text-info' },
};

const roleLabels: Record<string, string> = {
  product_ops: 'Product/Ops',
  technical: 'Technical',
  design_ux: 'Design/UX',
};

export function EvaluationList({ evaluations, contributors, onEvaluationClick }: EvaluationListProps) {
  const getContributor = (id: string) => contributors.find(c => c.id === id);
  
  const pendingEvaluations = evaluations.filter(e => e.decision === 'pending');
  const completedEvaluations = evaluations.filter(e => e.decision !== 'pending');

  if (evaluations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">No Evaluations Yet</h3>
          <p className="text-sm text-muted-foreground">
            Evaluations will appear here when contributors complete their intake questionnaire
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Evaluations */}
      {pendingEvaluations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Review ({pendingEvaluations.length})
          </h3>
          <div className="grid gap-3">
            {pendingEvaluations.map(evaluation => {
              const contributor = getContributor(evaluation.contributorId);
              const config = decisionConfig[evaluation.decision];
              const hasFlags = evaluation.riskFlags.filter(f => !f.acknowledged).length > 0;
              
              return (
                <Card 
                  key={evaluation.id} 
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => onEvaluationClick(evaluation)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {contributor?.legalName || 'Unknown Contributor'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{roleLabels[evaluation.roleAppliedFor]}</span>
                            <span>•</span>
                            <span>Score: {evaluation.overallScore.toFixed(1)}/5</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasFlags && (
                          <Badge className="bg-amber-500/10 text-amber-500 text-xs gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Flags
                          </Badge>
                        )}
                        <Badge className={cn(config.color, "gap-1")}>
                          {config.icon}
                          {config.label}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Evaluations */}
      {completedEvaluations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Completed ({completedEvaluations.length})
          </h3>
          <div className="grid gap-2">
            {completedEvaluations.map(evaluation => {
              const contributor = getContributor(evaluation.contributorId);
              const config = decisionConfig[evaluation.decision];
              
              return (
                <Card 
                  key={evaluation.id} 
                  className="cursor-pointer hover:border-primary/50 transition-colors opacity-80"
                  onClick={() => onEvaluationClick(evaluation)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {contributor?.legalName || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {roleLabels[evaluation.roleAppliedFor]} • {evaluation.overallScore.toFixed(1)}/5
                          </p>
                        </div>
                      </div>
                      <Badge className={cn(config.color, "gap-1 text-xs")}>
                        {config.icon}
                        {config.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
