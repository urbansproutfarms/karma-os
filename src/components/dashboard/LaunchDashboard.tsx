import { useState } from 'react';
import { AppIntake, VercelReadinessChecklist } from '@/types/karma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Gauge, Package, CheckCircle, AlertTriangle, XCircle, Rocket, RefreshCw } from 'lucide-react';

interface LaunchDashboardProps {
  apps: AppIntake[];
  onAppClick: (app: AppIntake) => void;
  isLaunchApproved: (appId: string) => boolean;
  dataWasReset?: boolean;
}

const TRAFFIC_LIGHT_CONFIG = {
  green: { color: 'bg-emerald-500', textColor: 'text-emerald-600', label: 'Green', bgLight: 'bg-emerald-50 dark:bg-emerald-950/30', borderColor: 'border-emerald-200 dark:border-emerald-800/50' },
  yellow: { color: 'bg-amber-500', textColor: 'text-amber-600', label: 'Yellow', bgLight: 'bg-amber-50 dark:bg-amber-950/30', borderColor: 'border-amber-200 dark:border-amber-800/50' },
  red: { color: 'bg-red-500', textColor: 'text-red-600', label: 'Red', bgLight: 'bg-red-50 dark:bg-red-950/30', borderColor: 'border-red-200 dark:border-red-800/50' },
};

function getVercelScore(checklist?: VercelReadinessChecklist): { complete: number; total: number; allComplete: boolean } {
  if (!checklist) return { complete: 0, total: 6, allComplete: false };
  const values = Object.values(checklist);
  const complete = values.filter(Boolean).length;
  return { complete, total: values.length, allComplete: complete === values.length };
}

export function LaunchDashboard({ apps, onAppClick, isLaunchApproved, dataWasReset }: LaunchDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'launch-approved'>('all');
  
  const greenApps = apps.filter(a => a.trafficLight === 'green');
  const yellowApps = apps.filter(a => a.trafficLight === 'yellow');
  const redApps = apps.filter(a => a.trafficLight === 'red');
  const unclassifiedApps = apps.filter(a => !a.trafficLight);
  const launchApprovedApps = apps.filter(a => isLaunchApproved(a.id));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Data Reset Notice */}
      {dataWasReset && (
        <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <RefreshCw className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            App data was recovered from defaults due to storage issues. Your previous customizations may need to be re-entered.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
            <Gauge className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Launch Dashboard</h1>
            <p className="text-muted-foreground mt-0.5">
              Internal ClearPath + KarmaOS launch readiness view
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
          count={greenApps.length}
          label="Green"
          bgClass="bg-emerald-50 dark:bg-emerald-950/20"
          borderClass="border-emerald-200 dark:border-emerald-800/40"
          iconBgClass="bg-emerald-100 dark:bg-emerald-900/50"
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
          count={yellowApps.length}
          label="Yellow"
          bgClass="bg-amber-50 dark:bg-amber-950/20"
          borderClass="border-amber-200 dark:border-amber-800/40"
          iconBgClass="bg-amber-100 dark:bg-amber-900/50"
        />
        <StatCard
          icon={<XCircle className="h-5 w-5 text-red-600" />}
          count={redApps.length}
          label="Red"
          bgClass="bg-red-50 dark:bg-red-950/20"
          borderClass="border-red-200 dark:border-red-800/40"
          iconBgClass="bg-red-100 dark:bg-red-900/50"
        />
        <StatCard
          icon={<Package className="h-5 w-5 text-muted-foreground" />}
          count={unclassifiedApps.length}
          label="Unclassified"
          bgClass="bg-muted/30"
          borderClass="border-border"
          iconBgClass="bg-muted"
        />
      </div>

      {/* Launch-Approved Stat */}
      <Card 
        className={`cursor-pointer transition-all duration-200 border-2 ${
          filter === 'launch-approved' 
            ? 'border-primary bg-primary/5 shadow-md' 
            : 'border-primary/20 hover:border-primary/40 hover:bg-primary/5'
        }`}
        onClick={() => setFilter(filter === 'launch-approved' ? 'all' : 'launch-approved')}
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight">{launchApprovedApps.length}</p>
                <p className="text-sm text-muted-foreground font-medium">🚀 Launch-Approved</p>
              </div>
            </div>
            {filter === 'launch-approved' && (
              <Badge variant="default" className="px-3 py-1">Filtered</Badge>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Filter indicator */}
      {filter === 'launch-approved' && (
        <div className="flex items-center gap-3 px-5 py-3 bg-primary/5 border border-primary/20 rounded-xl">
          <Rocket className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Showing Launch-Approved apps only</span>
          <button 
            onClick={() => setFilter('all')}
            className="ml-auto text-sm text-primary hover:underline font-medium"
          >
            Show all
          </button>
        </div>
      )}

      {/* Launch-Approved Section */}
      {launchApprovedApps.length > 0 && filter === 'all' && (
        <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 font-semibold">
              <span className="text-xl">🚀</span>
              Launch-Approved
              <Badge variant="secondary" className="ml-2 font-normal">{launchApprovedApps.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {launchApprovedApps.map(app => (
                <div 
                  key={app.id}
                  className="group p-4 rounded-xl bg-background border border-primary/20 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all duration-200"
                  onClick={() => onAppClick(app)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🚀</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sm block truncate">{app.name}</span>
                      <span className="text-xs text-primary/70">Ready to deploy</span>
                    </div>
                    <Badge variant="default" className="text-xs shrink-0">Approved</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Apps by Traffic Light */}
      {filter === 'all' && (
        <div className="space-y-8">
          {/* Green Apps */}
          {greenApps.length > 0 && (
            <AppSection
              color="green"
              apps={greenApps}
              onAppClick={onAppClick}
              isLaunchApproved={isLaunchApproved}
            />
          )}

          {/* Yellow Apps */}
          {yellowApps.length > 0 && (
            <AppSection
              color="yellow"
              apps={yellowApps}
              onAppClick={onAppClick}
              isLaunchApproved={isLaunchApproved}
            />
          )}

          {/* Red Apps */}
          {redApps.length > 0 && (
            <AppSection
              color="red"
              apps={redApps}
              onAppClick={onAppClick}
              isLaunchApproved={isLaunchApproved}
            />
          )}

          {/* Unclassified Apps */}
          {unclassifiedApps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40" />
                <h2 className="text-sm font-semibold text-muted-foreground">
                  Unclassified
                </h2>
                <Badge variant="outline" className="text-xs font-normal">{unclassifiedApps.length}</Badge>
              </div>
              <div className="space-y-2">
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
        <div className="space-y-2">
          {launchApprovedApps.map(app => (
            <AppRow key={app.id} app={app} onClick={() => onAppClick(app)} isLaunchApproved={true} />
          ))}
          {launchApprovedApps.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 mb-4">
                <Rocket className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No Launch-Approved apps</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Apps need Green status + complete Vercel checklist + no unresolved flags.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {apps.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 mb-4">
            <Gauge className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No apps registered</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Register apps in App Governance to see launch readiness.
          </p>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  icon, 
  count, 
  label, 
  bgClass, 
  borderClass, 
  iconBgClass 
}: { 
  icon: React.ReactNode; 
  count: number; 
  label: string; 
  bgClass: string; 
  borderClass: string; 
  iconBgClass: string;
}) {
  return (
    <Card className={`${bgClass} ${borderClass} border shadow-sm`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${iconBgClass}`}>
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">{count}</p>
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// App Section Component
function AppSection({ 
  color, 
  apps, 
  onAppClick, 
  isLaunchApproved 
}: { 
  color: 'green' | 'yellow' | 'red'; 
  apps: AppIntake[]; 
  onAppClick: (app: AppIntake) => void;
  isLaunchApproved: (appId: string) => boolean;
}) {
  const config = TRAFFIC_LIGHT_CONFIG[color];
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
        <h2 className={`text-sm font-semibold ${config.textColor}`}>
          {config.label}
        </h2>
        <Badge variant="outline" className="text-xs font-normal">{apps.length}</Badge>
      </div>
      <div className="space-y-2">
        {apps.map(app => (
          <AppRow 
            key={app.id} 
            app={app} 
            onClick={() => onAppClick(app)} 
            isLaunchApproved={isLaunchApproved(app.id)} 
          />
        ))}
      </div>
    </div>
  );
}

// App Row Component
function AppRow({ app, onClick, isLaunchApproved }: { app: AppIntake; onClick: () => void; isLaunchApproved: boolean }) {
  const trafficConfig = app.trafficLight ? TRAFFIC_LIGHT_CONFIG[app.trafficLight] : null;
  const vercelScore = getVercelScore(app.vercelReadiness);

  return (
    <div 
      className="group flex items-center gap-4 p-4 rounded-xl bg-card border border-border/60 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all duration-200"
      onClick={onClick}
    >
      {/* Status Indicator */}
      <div className="flex items-center gap-3 shrink-0">
        {trafficConfig ? (
          <span className={`w-2.5 h-2.5 rounded-full ${trafficConfig.color}`} />
        ) : (
          <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
        )}
      </div>
      
      {/* App Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{app.name}</span>
          {isLaunchApproved && <span className="text-sm">🚀</span>}
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {app.description || 'No description'}
        </p>
      </div>
      
      {/* Right Side: Status + Checklist */}
      <div className="flex items-center gap-3 shrink-0">
        <Badge variant="outline" className="text-xs capitalize font-normal">
          {app.status.replace('_', ' ')}
        </Badge>
        <span className={`text-xs font-medium tabular-nums ${vercelScore.allComplete ? 'text-primary' : 'text-muted-foreground'}`}>
          {vercelScore.complete}/{vercelScore.total}
        </span>
      </div>
    </div>
  );
}
