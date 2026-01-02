import { useState } from 'react';
import { AppIntake, VercelReadinessChecklist } from '@/types/karma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gauge, Package, CheckCircle, AlertTriangle, XCircle, Rocket, Cloud } from 'lucide-react';

interface LaunchDashboardProps {
  apps: AppIntake[];
  onAppClick: (app: AppIntake) => void;
  isLaunchApproved: (appId: string) => boolean;
}

const TRAFFIC_LIGHT_CONFIG = {
  green: { color: 'bg-emerald-500', textColor: 'text-emerald-600', label: 'Green', bgLight: 'bg-emerald-500/10' },
  yellow: { color: 'bg-amber-500', textColor: 'text-amber-600', label: 'Yellow', bgLight: 'bg-amber-500/10' },
  red: { color: 'bg-red-500', textColor: 'text-red-600', label: 'Red', bgLight: 'bg-red-500/10' },
};

function getVercelScore(checklist?: VercelReadinessChecklist): { complete: number; total: number; allComplete: boolean } {
  if (!checklist) return { complete: 0, total: 6, allComplete: false };
  const values = Object.values(checklist);
  const complete = values.filter(Boolean).length;
  return { complete, total: values.length, allComplete: complete === values.length };
}

export function LaunchDashboard({ apps, onAppClick, isLaunchApproved }: LaunchDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'launch-approved'>('all');
  
  const greenApps = apps.filter(a => a.trafficLight === 'green');
  const yellowApps = apps.filter(a => a.trafficLight === 'yellow');
  const redApps = apps.filter(a => a.trafficLight === 'red');
  const unclassifiedApps = apps.filter(a => !a.trafficLight);
  const launchApprovedApps = apps.filter(a => isLaunchApproved(a.id));
  
  const displayApps = filter === 'launch-approved' ? launchApprovedApps : apps;

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
        <Card 
          className={`border-primary/30 cursor-pointer transition-colors ${filter === 'launch-approved' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setFilter(filter === 'launch-approved' ? 'all' : 'launch-approved')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{launchApprovedApps.length}</p>
              <p className="text-xs text-muted-foreground">🚀 Launch-Approved</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filter indicator */}
      {filter === 'launch-approved' && (
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
          <Rocket className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Showing Launch-Approved apps only</span>
          <button 
            onClick={() => setFilter('all')}
            className="ml-auto text-xs text-primary hover:underline"
          >
            Show all
          </button>
        </div>
      )}

      {/* Launch-Approved Section */}
      {launchApprovedApps.length > 0 && filter === 'all' && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-xl">🚀</span>
              Launch-Approved ({launchApprovedApps.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {launchApprovedApps.map(app => (
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
                    <Badge variant="default" className="text-xs">Launch-Approved</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Cloud className="h-3 w-3" />
                    <span>Vercel Ready</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Apps by Traffic Light */}
      {filter === 'all' && (
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
                  <AppRow key={app.id} app={app} onClick={() => onAppClick(app)} isLaunchApproved={isLaunchApproved(app.id)} />
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
                  <AppRow key={app.id} app={app} onClick={() => onAppClick(app)} isLaunchApproved={false} />
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
                  <AppRow key={app.id} app={app} onClick={() => onAppClick(app)} isLaunchApproved={false} />
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
                  <AppRow key={app.id} app={app} onClick={() => onAppClick(app)} isLaunchApproved={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Launch-Approved Filter View */}
      {filter === 'launch-approved' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {launchApprovedApps.map(app => (
            <AppRow key={app.id} app={app} onClick={() => onAppClick(app)} isLaunchApproved={true} />
          ))}
          {launchApprovedApps.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Rocket className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-1">No Launch-Approved apps</h3>
              <p className="text-sm text-muted-foreground">
                Apps need Green status + complete Vercel checklist + no unresolved flags.
              </p>
            </div>
          )}
        </div>
      )}

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

function AppRow({ app, onClick, isLaunchApproved }: { app: AppIntake; onClick: () => void; isLaunchApproved: boolean }) {
  const trafficConfig = app.trafficLight ? TRAFFIC_LIGHT_CONFIG[app.trafficLight] : null;
  const vercelScore = getVercelScore(app.vercelReadiness);

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
          {isLaunchApproved && <span className="text-sm">🚀</span>}
        </div>
        <Badge variant="outline" className="text-xs capitalize">
          {app.status.replace('_', ' ')}
        </Badge>
      </div>
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-muted-foreground line-clamp-1 flex-1">
          {app.description || 'No description'}
        </p>
        <span className={`text-xs ml-2 ${vercelScore.allComplete ? 'text-primary' : 'text-muted-foreground'}`}>
          {vercelScore.complete}/{vercelScore.total}
        </span>
      </div>
    </div>
  );
}
