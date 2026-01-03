import { useState } from 'react';
import { AppIntake, AppAgentFlag, VercelReadinessChecklist } from '@/types/karma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Package, ArrowLeft, Bot, AlertTriangle, CheckCircle, 
  PauseCircle, XCircle, Zap, Shield, FileText, GitBranch,
  Check, X
} from 'lucide-react';
import { RepairPromptCard } from './RepairPromptCard';
import { VercelReadinessChecklistCard } from './VercelReadinessChecklist';
import { VercelPWAPromptCard } from './VercelPWAPromptCard';

interface AppDetailProps {
  app: AppIntake;
  onBack: () => void;
  onRunAgentReview: (appId: string) => void;
  onMakeDecision: (appId: string, decision: 'approve' | 'pause' | 'kill', notes?: string) => void;
  onSetActive: (appId: string) => void;
  onConfirmOwnership: (appId: string, repoUrl: string) => void;
  onAcknowledgeFlag: (appId: string, flagId: string, reviewType: 'productSpecReview' | 'riskIntegrityReview') => void;
  onUpdateVercelReadiness?: (appId: string, checklist: VercelReadinessChecklist) => void;
  canProceedToBuild: boolean;
}

const SEVERITY_COLORS = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/20 text-warning',
  high: 'bg-destructive/20 text-destructive',
};

export function AppDetail({
  app,
  onBack,
  onRunAgentReview,
  onMakeDecision,
  onSetActive,
  onConfirmOwnership,
  onAcknowledgeFlag,
  onUpdateVercelReadiness,
  canProceedToBuild,
}: AppDetailProps) {
  const [repoUrl, setRepoUrl] = useState(app.repoUrl || '');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [showOwnershipForm, setShowOwnershipForm] = useState(false);

  const handleConfirmOwnership = () => {
    if (repoUrl) {
      onConfirmOwnership(app.id, repoUrl);
      setShowOwnershipForm(false);
    }
  };

  const renderFlag = (flag: AppAgentFlag, reviewType: 'productSpecReview' | 'riskIntegrityReview') => (
    <div 
      key={flag.id} 
      className={`p-3 rounded-lg border ${flag.acknowledged ? 'border-border/50 bg-muted/30' : 'border-warning/50 bg-warning/5'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={SEVERITY_COLORS[flag.severity]}>
              {flag.severity}
            </Badge>
            <span className="text-xs text-muted-foreground capitalize">
              {flag.category.replace('_', ' ')}
            </span>
          </div>
          <p className="text-sm">{flag.description}</p>
        </div>
        {!flag.acknowledged ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAcknowledgeFlag(app.id, flag.id, reviewType)}
          >
            <Check className="h-3 w-3 mr-1" />
            Acknowledge
          </Button>
        ) : (
          <Badge variant="outline" className="text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            Acknowledged
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                {app.name}
                {(app.isInternal || app.lifecycle === 'internal-only') && (
                  <Badge variant="outline" className="text-muted-foreground">
                    Internal Module
                  </Badge>
                )}
                {app.isActive && (
                  <Badge variant="default">
                    <Zap className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </h1>
              <p className="text-sm text-muted-foreground capitalize">{app.origin.replace('_', ' ')} • {app.status.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
        {app.status === 'approved' && !app.isActive && (
          <Button onClick={() => onSetActive(app.id)}>
            <Zap className="h-4 w-4 mr-2" />
            Set as Active
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* App Details */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                App Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Description</Label>
                <p className="text-sm mt-1">{app.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Intended User</Label>
                  <p className="text-sm mt-1">{app.intendedUser}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Origin</Label>
                  <p className="text-sm mt-1 capitalize">{app.origin.replace('_', ' ')}</p>
                </div>
              </div>
              {app.alias && (
                <div>
                  <Label className="text-xs text-muted-foreground">Alias</Label>
                  <p className="text-sm mt-1">{app.alias}</p>
                </div>
              )}
              {app.category && (
                <div>
                  <Label className="text-xs text-muted-foreground">Category</Label>
                  <p className="text-sm mt-1">{app.category}</p>
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground">MVP Scope</Label>
                <p className="text-sm mt-1">{app.mvpScope}</p>
              </div>
              {app.nonGoals && (
                <div>
                  <Label className="text-xs text-muted-foreground">Non-Goals</Label>
                  <p className="text-sm mt-1">{app.nonGoals}</p>
                </div>
              )}
              {app.riskNotes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Risk Notes</Label>
                  <p className="text-sm mt-1">{app.riskNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agent Reviews */}
          {app.agentReviewComplete ? (
            <div className="space-y-4">
              {/* Product Spec Review */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Product Specifier Review
                  </CardTitle>
                  <CardDescription>{app.productSpecReview?.summary}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {app.productSpecReview?.flags.length ? (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Flags</Label>
                      {app.productSpecReview.flags.map(flag => renderFlag(flag, 'productSpecReview'))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No flags raised</p>
                  )}
                  {app.productSpecReview?.recommendations.length ? (
                    <div>
                      <Label className="text-xs text-muted-foreground">Recommendations</Label>
                      <ul className="mt-1 space-y-1">
                        {app.productSpecReview.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-primary">•</span> {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {/* Risk & Integrity Review */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Risk & Integrity Review
                  </CardTitle>
                  <CardDescription>{app.riskIntegrityReview?.summary}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {app.riskIntegrityReview?.flags.length ? (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Flags</Label>
                      {app.riskIntegrityReview.flags.map(flag => renderFlag(flag, 'riskIntegrityReview'))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No risks identified</p>
                  )}
                  {app.riskIntegrityReview?.recommendations.length ? (
                    <div>
                      <Label className="text-xs text-muted-foreground">Recommendations</Label>
                      <ul className="mt-1 space-y-1">
                        {app.riskIntegrityReview.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-primary">•</span> {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Agent Review
                </CardTitle>
                <CardDescription>Run AI agent review to analyze this app</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => onRunAgentReview(app.id)}>
                  <Bot className="h-4 w-4 mr-2" />
                  Run Agent Review
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Repair Prompt for Yellow Apps */}
          <RepairPromptCard app={app} />
          
          {/* Vercel/PWA Prompt */}
          <VercelPWAPromptCard app={app} />
          
          {/* Vercel/PWA Readiness Checklist */}
          <VercelReadinessChecklistCard 
            app={app} 
            onUpdateChecklist={onUpdateVercelReadiness || (() => {})}
          />
          {/* IP & Ownership */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                IP & Ownership
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Owner Entity</span>
                <span className="text-sm font-medium">{app.ownerEntity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Ownership Confirmed</span>
                {app.ownerConfirmed ? (
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Yes
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-warning/10 text-warning">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    No
                  </Badge>
                )}
              </div>
              {app.repoUrl ? (
                <div>
                  <Label className="text-xs text-muted-foreground">Repository</Label>
                  <p className="text-sm mt-1 truncate">{app.repoUrl}</p>
                </div>
              ) : null}

              {!app.ownerConfirmed && (
                <>
                  {showOwnershipForm ? (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="repoUrl">Repository URL</Label>
                        <Input
                          id="repoUrl"
                          value={repoUrl}
                          onChange={(e) => setRepoUrl(e.target.value)}
                          placeholder="https://github.com/..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleConfirmOwnership} disabled={!repoUrl}>
                          Confirm
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowOwnershipForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setShowOwnershipForm(true)} className="w-full">
                      Confirm Ownership
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Founder Decision */}
          {app.status !== 'killed' && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Founder Decision</CardTitle>
                <CardDescription>
                  {app.founderDecision 
                    ? `Decision: ${app.founderDecision.toUpperCase()}`
                    : 'Make a governance decision'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {app.founderDecisionNotes && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Decision Notes</Label>
                    <p className="text-sm mt-1">{app.founderDecisionNotes}</p>
                  </div>
                )}

                {!app.founderDecision && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="decisionNotes">Notes (optional)</Label>
                      <Textarea
                        id="decisionNotes"
                        value={decisionNotes}
                        onChange={(e) => setDecisionNotes(e.target.value)}
                        placeholder="Add decision context..."
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => onMakeDecision(app.id, 'approve', decisionNotes)}
                        disabled={!app.ownerConfirmed || !app.repoUrl}
                        className="bg-primary"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onMakeDecision(app.id, 'pause', decisionNotes)}
                      >
                        <PauseCircle className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => onMakeDecision(app.id, 'kill', decisionNotes)}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Kill
                      </Button>
                    </div>
                    {(!app.ownerConfirmed || !app.repoUrl) && (
                      <p className="text-xs text-muted-foreground">
                        Confirm ownership and add repo URL to approve
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Status Summary */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Status Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Agent Review</span>
                {app.agentReviewComplete ? (
                  <CheckCircle className="h-4 w-4 text-primary" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Ownership Confirmed</span>
                {app.ownerConfirmed ? (
                  <CheckCircle className="h-4 w-4 text-primary" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Founder Decision</span>
                {app.founderDecision ? (
                  <CheckCircle className="h-4 w-4 text-primary" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Can Proceed to Build</span>
                {canProceedToBuild ? (
                  <CheckCircle className="h-4 w-4 text-primary" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}