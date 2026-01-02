import { AppIntake } from '@/types/karma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gauge, Package, CheckCircle, AlertTriangle, XCircle, Rocket } from 'lucide-react';

interface LaunchDashboardProps {
  apps: AppIntake[];
  onAppClick: (app: AppIntake) => void;
}

const TRAFFIC_LIGHT_CONFIG = {
  green: { color: 'bg-emerald-500', textColor: 'text-emerald-600', label: 'Green', bgLight: 'bg-emerald-500/10' },
  yellow: { color: 'bg-amber-500', textColor: 'text-amber-600', label: 'Yellow', bgLight: 'bg-amber-500/10' },
  red: { color: 'bg-red-500', textColor: 'text-red-600', label: 'Red', bgLight: 'bg-red-500/10' },
};

function isReadyToLaunch(app: AppIntake): boolean {
  return (
    app.status === 'approved' &&
    app.ownerConfirmed &&
    app.assetOwnershipConfirmed &&
    app.trafficLight === 'green' &&
    !!app.repoUrl
  );
}

export function LaunchDashboard({ apps, onAppClick }: LaunchDashboardProps) {
  const greenApps = apps.filter(a => a.trafficLight === 'green');
  const yellowApps = apps.filter(a => a.trafficLight === 'yellow');
  const redApps = apps.filter(a => a.trafficLight === 'red');
  const unclassifiedApps = apps.filter(a => !a.trafficLight);
  const readyToLaunchApps = apps.filter(isReadyToLaunch);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Gauge className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Launch Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Internal ClearPath + KarmaOS launch readiness view
          </p>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-emerald-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-full ${TRAFFIC_LIGHT_CONFIG.green.bgLight}`}>
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{greenApps.length}</p>
              <p className="text-xs text-muted-foreground">Green</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-full ${TRAFFIC_LIGHT_CONFIG.yellow.bgLight}`}>
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{yellowApps.length}</p>
              <p className="text-xs text-muted-foreground">Yellow</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-full ${TRAFFIC_LIGHT_CONFIG.red.bgLight}`}>
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{redApps.length}</p>
              <p className="text-xs text-muted-foreground">Red</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-muted">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{unclassifiedApps.length}</p>
              <p className="text-xs text-muted-foreground">Unclassified</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{readyToLaunchApps.length}</p>
              <p className="text-xs text-muted-foreground">Ready to Launch</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ready to Launch Section */}
      {readyToLaunchApps.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-xl">🚀</span>
              Ready to Launch
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {readyToLaunchApps.map(app => (
                <div 
                  key={app.id}
                  className="p-3 rounded-lg bg-background border border-primary/20 cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => onAppClick(app)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🚀</span>
                      <span className="font-medium">{app.name}</span>
                    </div>
                    <Badge variant="default" className="text-xs">Launch Ready</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Apps by Traffic Light */}
      <div className="space-y-6">
        {/* Green Apps */}
        {greenApps.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-emerald-600 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Green ({greenApps.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {greenApps.map(app => (
                <AppRow key={app.id} app={app} onClick={() => onAppClick(app)} />
              ))}
            </div>
          </div>
        )}

        {/* Yellow Apps */}
        {yellowApps.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-amber-600 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Yellow ({yellowApps.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {yellowApps.map(app => (
                <AppRow key={app.id} app={app} onClick={() => onAppClick(app)} />
              ))}
            </div>
          </div>
        )}

        {/* Red Apps */}
        {redApps.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-red-600 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Red ({redApps.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {redApps.map(app => (
                <AppRow key={app.id} app={app} onClick={() => onAppClick(app)} />
              ))}
            </div>
          </div>
        )}

        {/* Unclassified Apps */}
        {unclassifiedApps.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
              Unclassified ({unclassifiedApps.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {unclassifiedApps.map(app => (
                <AppRow key={app.id} app={app} onClick={() => onAppClick(app)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {apps.length === 0 && (
        <div className="text-center py-12">
          <Gauge className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-medium mb-1">No apps registered</h3>
          <p className="text-sm text-muted-foreground">
            Register apps in App Governance to see launch readiness.
          </p>
        </div>
      )}
    </div>
  );
}

function AppRow({ app, onClick }: { app: AppIntake; onClick: () => void }) {
  const trafficConfig = app.trafficLight ? TRAFFIC_LIGHT_CONFIG[app.trafficLight] : null;
  const ready = isReadyToLaunch(app);

  return (
    <div 
      className="p-3 rounded-lg bg-card border cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {trafficConfig && (
            <span className={`w-2 h-2 rounded-full ${trafficConfig.color}`} />
          )}
          <span className="font-medium text-sm">{app.name}</span>
          {ready && <span className="text-sm">🚀</span>}
        </div>
        <Badge variant="outline" className="text-xs capitalize">
          {app.status.replace('_', ' ')}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
        {app.description || 'No description'}
      </p>
    </div>
  );
}
