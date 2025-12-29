import { useState } from 'react';
import { ContributorEvaluation, RUBRIC_CATEGORIES, RubricCategory, EvaluationDecision, ACCESS_TIER_NAMES, AccessTier } from '@/types/karma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  Bot, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Sparkles,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Pause,
  HelpCircle,
  Scale
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EvaluationDetailProps {
  evaluation: ContributorEvaluation;
  questionnaireResponses?: Record<string, string>;
  onBack: () => void;
  onUpdateScore: (category: RubricCategory, score: number, notes?: string) => void;
  onAcknowledgeFlag: (flagId: string) => void;
  onMakeDecision: (
    decision: EvaluationDecision,
    notes?: string,
    conditionalRequirements?: string,
    conditionalDeadline?: string
  ) => void;
}

const decisionConfig: Record<EvaluationDecision, { label: string; icon: React.ReactNode; color: string; description: string }> = {
  pending: { label: 'Pending Review', icon: <Clock className="h-4 w-4" />, color: 'bg-muted text-muted-foreground', description: 'Awaiting founder decision' },
  approved: { label: 'Approved', icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-success/10 text-success', description: 'Proceed to agreement signing' },
  conditional: { label: 'Conditional', icon: <HelpCircle className="h-4 w-4" />, color: 'bg-warning/10 text-warning', description: 'Requires follow-up before proceeding' },
  declined: { label: 'Declined', icon: <XCircle className="h-4 w-4" />, color: 'bg-destructive/10 text-destructive', description: 'Record locked, no access' },
  paused: { label: 'Paused', icon: <Pause className="h-4 w-4" />, color: 'bg-info/10 text-info', description: 'Record open but access blocked' },
};

const roleLabels: Record<string, string> = {
  product_ops: 'Product/Operations',
  technical: 'Technical',
  design_ux: 'Design/UX',
};

export function EvaluationDetail({
  evaluation,
  questionnaireResponses,
  onBack,
  onUpdateScore,
  onAcknowledgeFlag,
  onMakeDecision,
}: EvaluationDetailProps) {
  const [decisionNotes, setDecisionNotes] = useState(evaluation.decisionNotes || '');
  const [conditionalRequirements, setConditionalRequirements] = useState(evaluation.conditionalRequirements || '');
  const [conditionalDeadline, setConditionalDeadline] = useState(evaluation.conditionalDeadline || '');
  const [showConditionalForm, setShowConditionalForm] = useState(false);

  const config = decisionConfig[evaluation.decision];
  const unacknowledgedFlags = evaluation.riskFlags.filter(f => !f.acknowledged);

  const handleDecision = (decision: EvaluationDecision) => {
    if (decision === 'conditional') {
      setShowConditionalForm(true);
    } else {
      onMakeDecision(decision, decisionNotes);
    }
  };

  const confirmConditional = () => {
    onMakeDecision('conditional', decisionNotes, conditionalRequirements, conditionalDeadline);
    setShowConditionalForm(false);
  };

  return (
    <ScrollArea className="h-[calc(100vh-120px)]">
      <div className="space-y-6 pr-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Evaluations
          </Button>
          <Badge className={config.color}>
            {config.icon}
            <span className="ml-1">{config.label}</span>
          </Badge>
        </div>

        {/* Evaluation Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Contributor Evaluation
            </CardTitle>
            <CardDescription>
              Role: {roleLabels[evaluation.roleAppliedFor]} • Overall Score: {evaluation.overallScore.toFixed(1)}/5
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all",
                      evaluation.overallScore >= 4 ? "bg-success" :
                      evaluation.overallScore >= 3 ? "bg-warning" : "bg-destructive"
                    )}
                    style={{ width: `${(evaluation.overallScore / 5) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-2xl font-bold text-foreground">{evaluation.overallScore.toFixed(1)}</span>
            </div>
          </CardContent>
        </Card>

        {/* AI Summary */}
        {evaluation.aiSummary && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bot className="h-4 w-4 text-primary" />
                AI Evaluation Summary
              </CardTitle>
              <CardDescription className="text-xs">
                AI-generated insights • Founder review required
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground">{evaluation.aiSummary}</p>
              
              <div className="grid gap-4 md:grid-cols-2">
                {/* Strengths */}
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-1 text-success">
                    <Sparkles className="h-3 w-3" />
                    Strengths Identified
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {evaluation.aiStrengths?.map((s, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <CheckCircle2 className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Concerns */}
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-1 text-warning">
                    <AlertTriangle className="h-3 w-3" />
                    Areas of Concern
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {evaluation.aiConcerns?.map((c, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <AlertTriangle className="h-3 w-3 text-warning mt-0.5 flex-shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risk Flags */}
        {evaluation.riskFlags.length > 0 && (
          <Card className={unacknowledgedFlags.length > 0 ? "border-amber-500/30" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className={cn("h-4 w-4", unacknowledgedFlags.length > 0 ? "text-amber-500" : "text-muted-foreground")} />
                Risk Flags ({unacknowledgedFlags.length} unacknowledged)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {evaluation.riskFlags.map(flag => (
                <div 
                  key={flag.id} 
                  className={cn(
                    "p-3 rounded-lg border flex items-start justify-between gap-3",
                    flag.severity === 'high' ? "bg-destructive/5 border-destructive/20" :
                    flag.severity === 'medium' ? "bg-amber-500/5 border-amber-500/20" :
                    "bg-muted border-border"
                  )}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{flag.category}</Badge>
                      <Badge 
                        className={cn(
                          "text-xs",
                          flag.severity === 'high' ? "bg-destructive/10 text-destructive" :
                          flag.severity === 'medium' ? "bg-amber-500/10 text-amber-600" :
                          "bg-muted text-muted-foreground"
                        )}
                      >
                        {flag.severity}
                      </Badge>
                      {flag.aiGenerated && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Bot className="h-2.5 w-2.5" />
                          AI
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{flag.description}</p>
                  </div>
                  {!flag.acknowledged ? (
                    <Button size="sm" variant="outline" onClick={() => onAcknowledgeFlag(flag.id)}>
                      Acknowledge
                    </Button>
                  ) : (
                    <Badge className="bg-success/10 text-success text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Acknowledged
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Rubric Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rubric Scores</CardTitle>
            <CardDescription>Adjust scores based on your review (1-5 scale)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {evaluation.scores.map(score => {
              const category = RUBRIC_CATEGORIES[score.category];
              return (
                <div key={score.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{category.label}</p>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {score.aiSuggested && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Bot className="h-2.5 w-2.5" />
                          AI
                        </Badge>
                      )}
                      <span className="text-lg font-bold w-8 text-right">{score.score}</span>
                    </div>
                  </div>
                  <Slider
                    value={[score.score]}
                    min={1}
                    max={5}
                    step={1}
                    disabled={evaluation.isFinalized}
                    onValueChange={([v]) => onUpdateScore(score.category, v)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Questionnaire Responses */}
        {questionnaireResponses && Object.keys(questionnaireResponses).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Questionnaire Responses</CardTitle>
              <CardDescription>Raw responses from contributor intake</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(questionnaireResponses).map(([question, answer]) => (
                <div key={question} className="space-y-1">
                  <p className="text-sm font-medium capitalize">{question.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded">{answer || 'No response'}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Founder Decision */}
        {!evaluation.isFinalized && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-primary" />
                Founder Decision
              </CardTitle>
              <CardDescription>This decision is final and will be logged</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Decision Notes (optional)</Label>
                <Textarea
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  className="min-h-[80px]"
                />
              </div>

              {showConditionalForm && (
                <div className="space-y-3 p-4 bg-warning/5 border border-warning/20 rounded-lg">
                  <p className="font-medium text-warning">Conditional Approval Requirements</p>
                  <div className="space-y-2">
                    <Label>What must the contributor complete?</Label>
                    <Textarea
                      value={conditionalRequirements}
                      onChange={(e) => setConditionalRequirements(e.target.value)}
                      placeholder="Describe the requirements for approval..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Deadline (optional)</Label>
                    <Input
                      type="date"
                      value={conditionalDeadline}
                      onChange={(e) => setConditionalDeadline(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={confirmConditional} disabled={!conditionalRequirements}>
                      Confirm Conditional
                    </Button>
                    <Button variant="outline" onClick={() => setShowConditionalForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {!showConditionalForm && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button 
                    className="bg-success hover:bg-success/90 text-white"
                    onClick={() => handleDecision('approved')}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-warning text-warning hover:bg-warning/10"
                    onClick={() => handleDecision('conditional')}
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Conditional
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-info text-info hover:bg-info/10"
                    onClick={() => handleDecision('paused')}
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleDecision('declined')}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Finalized Decision Display */}
        {evaluation.isFinalized && (
          <Card className={config.color.replace('/10', '/5')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {config.icon}
                Decision: {config.label}
              </CardTitle>
              <CardDescription>
                Finalized by {evaluation.decisionBy} on {evaluation.decisionTimestamp && new Date(evaluation.decisionTimestamp).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {evaluation.decisionNotes && (
                <p className="text-sm text-muted-foreground">{evaluation.decisionNotes}</p>
              )}
              {evaluation.conditionalRequirements && (
                <div className="p-3 bg-warning/10 rounded-lg">
                  <p className="text-sm font-medium text-warning">Conditional Requirements:</p>
                  <p className="text-sm text-muted-foreground">{evaluation.conditionalRequirements}</p>
                  {evaluation.conditionalDeadline && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Deadline: {new Date(evaluation.conditionalDeadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
