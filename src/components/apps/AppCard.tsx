import { AppIntake, AppStatus, VercelReadinessChecklist, DATA_LAYER_LABELS, AppLifecycle } from '@/types/karma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, CheckCircle, PauseCircle, XCircle, Zap, Database, Globe, Lock, Github, ExternalLink } from 'lucide-react';

interface AppCardProps {
  app: AppIntake;
  onClick: () => void;
  isLaunchApproved?: boolean;
}

const STATUS_CONFIG: Record<AppStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Package }> = {
  unreviewed: { label: 'Unreviewed', variant: 'outline', icon: Package },
  in_review: { label: 'In Review', variant: 'secondary', icon: AlertTriangle },
  approved: { label: 'Approved', variant: 'default', icon: CheckCircle },
  paused: { label: 'Paused', variant: 'outline', icon: PauseCircle },
  killed: { label: 'Killed', variant: 'destructive', icon: XCircle },
};

const TRAFFIC_LIGHT_CONFIG = {
  green: { color: 'bg-emerald-500', label: 'Green' },
  yellow: { color: 'bg-amber-500', label: 'Yellow' },
  red: { color: 'bg-red-500', label: 'Red' },
};

function getVercelChecklistScore(checklist?: VercelReadinessChecklist): { complete: number; total: number } {
  if (!checklist) return { complete: 0, total: 6 };
  const values = Object.values(checklist);
  return { complete: values.filter(Boolean).length, total: values.length };
}

export function AppCard({ app, onClick, isLaunchApproved = false }: AppCardProps) {
  const statusConfig = STATUS_CONFIG[app.status];
  const StatusIcon = statusConfig.icon;
  const trafficConfig = app.trafficLight ? TRAFFIC_LIGHT_CONFIG[app.trafficLight] : null;
  const vercelScore = getVercelChecklistScore(app.vercelReadiness);

  const flagCount = (app.productSpecReview?.flags.length || 0) + (app.riskIntegrityReview?.flags.length || 0);
  const unacknowledgedFlags = [
    ...(app.productSpecReview?.flags.filter(f => !f.acknowledged) || []),
    ...(app.riskIntegrityReview?.flags.filter(f => !f.acknowledged) || []),
  ].length;

  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-colors border-border/50"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 relative">
              <Package className="h-4 w-4 text-primary" />
              {/* Traffic Light Indicator */}
              {trafficConfig && (
                <span 
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${trafficConfig.color}`}
                  title={trafficConfig.label}
                />
              )}
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {app.displayName || app.name}
                {(app.isInternal || app.lifecycle === 'internal-only') && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Internal
                  </Badge>
                )}
                {app.source === 'github' && (
                  <Badge variant="outline" className="text-xs">
                    <Github className="h-3 w-3 mr-1" />
                    GitHub
                  </Badge>
                )}
                {isLaunchApproved && (
                  <span title="Launch Approved" className="text-lg">🚀</span>
                )}
                {app.isActive && (
                  <Badge variant="default" className="text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground capitalize">{app.origin.replace('_', ' ')}</p>
            </div>
          </div>
          <Badge variant={statusConfig.variant} className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {app.description}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          {/* Lifecycle */}
          <span className="flex items-center gap-1">
            {app.lifecycle === 'internal-only' ? (
              <Lock className="h-3 w-3" />
            ) : (
              <Globe className="h-3 w-3" />
            )}
            {app.lifecycle === 'internal-only' ? 'Internal' : 'External'}
          </span>
          {app.intendedUser && <span>User: {app.intendedUser}</span>}
          <span className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            {DATA_LAYER_LABELS[app.dataLayer || 'none_local']}
          </span>
          <span className={vercelScore.complete === vercelScore.total ? 'text-primary' : 'text-muted-foreground'}>
            Vercel: {vercelScore.complete}/{vercelScore.total}
          </span>
          {flagCount > 0 && (
            <span className={unacknowledgedFlags > 0 ? 'text-warning' : 'text-muted-foreground'}>
              {unacknowledgedFlags > 0 ? `${unacknowledgedFlags} unreviewed flag(s)` : `${flagCount} flag(s) reviewed`}
            </span>
          )}
        </div>
        {/* Repo Link */}
        {app.repoUrl && (
          <div className="mt-2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                window.open(app.repoUrl, '_blank', 'noopener,noreferrer');
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open Repo
            </Button>
          </div>
        )}
        {!app.ownerConfirmed && app.status !== 'unreviewed' && (
          <div className="mt-2 flex items-center gap-1 text-xs text-warning">
            <AlertTriangle className="h-3 w-3" />
            Ownership not confirmed
          </div>
        )}
      </CardContent>
    </Card>
  );
}