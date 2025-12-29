import { AppIntake, AppStatus } from '@/types/karma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, CheckCircle, PauseCircle, XCircle, Zap } from 'lucide-react';

interface AppCardProps {
  app: AppIntake;
  onClick: () => void;
}

const STATUS_CONFIG: Record<AppStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Package }> = {
  unreviewed: { label: 'Unreviewed', variant: 'outline', icon: Package },
  in_review: { label: 'In Review', variant: 'secondary', icon: AlertTriangle },
  approved: { label: 'Approved', variant: 'default', icon: CheckCircle },
  paused: { label: 'Paused', variant: 'outline', icon: PauseCircle },
  killed: { label: 'Killed', variant: 'destructive', icon: XCircle },
};

export function AppCard({ app, onClick }: AppCardProps) {
  const statusConfig = STATUS_CONFIG[app.status];
  const StatusIcon = statusConfig.icon;

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
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {app.name}
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
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>User: {app.intendedUser}</span>
          {flagCount > 0 && (
            <span className={unacknowledgedFlags > 0 ? 'text-warning' : 'text-muted-foreground'}>
              {unacknowledgedFlags > 0 ? `${unacknowledgedFlags} unreviewed flag(s)` : `${flagCount} flag(s) reviewed`}
            </span>
          )}
        </div>
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