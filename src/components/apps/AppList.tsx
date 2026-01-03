import { useState, useMemo } from 'react';
import { AppIntake, AppStatus, AppOrigin, VercelReadinessChecklist } from '@/types/karma';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppCard } from './AppCard';
import { AppIntakeForm } from './AppIntakeForm';
import { AppDetail } from './AppDetail';
import { QuickRegisterForm } from './QuickRegisterForm';
import { Plus, Package, Zap, ListPlus, Rocket } from 'lucide-react';

type TrafficLight = 'green' | 'yellow' | 'red';
type SortMode = 'default' | 'launch-sprint';

interface QuickRegisterEntry {
  name: string;
  source: AppOrigin;
  purpose: string;
  initialStatus: TrafficLight;
}

// Calculate blocker count for an app
function getBlockerCount(app: AppIntake): number {
  let blockers = 0;
  if (!app.repoUrl) blockers++;
  if (!app.ownerConfirmed) blockers++;
  if (!app.agentReviewComplete) blockers++;
  if (app.productSpecReview?.flags.some(f => !f.acknowledged && f.severity === 'high')) blockers++;
  if (app.riskIntegrityReview?.flags.some(f => !f.acknowledged && f.severity === 'high')) blockers++;
  const vercelComplete = app.vercelReadiness ? Object.values(app.vercelReadiness).filter(Boolean).length : 0;
  if (vercelComplete < 6) blockers += (6 - vercelComplete);
  return blockers;
}

// Check if fully launch-approved
function isFullyLaunchApproved(app: AppIntake): boolean {
  if (app.trafficLight !== 'green') return false;
  if (!app.vercelReadiness) return false;
  const allChecked = Object.values(app.vercelReadiness).every(Boolean);
  if (!allChecked) return false;
  const hasUnacknowledgedFlags = [
    ...(app.productSpecReview?.flags.filter(f => !f.acknowledged) || []),
    ...(app.riskIntegrityReview?.flags.filter(f => !f.acknowledged) || []),
  ].length > 0;
  return !hasUnacknowledgedFlags;
}

interface AppListProps {
  apps: AppIntake[];
  onCreateApp: (data: Parameters<typeof AppIntakeForm>[0]['onSubmit'] extends (d: infer D) => void ? D : never) => void;
  onQuickRegister?: (entries: QuickRegisterEntry[]) => void;
  onRunAgentReview: (appId: string) => void;
  onMakeDecision: (appId: string, decision: 'approve' | 'pause' | 'kill', notes?: string) => void;
  onSetActive: (appId: string) => void;
  onConfirmOwnership: (appId: string, repoUrl: string) => void;
  onAcknowledgeFlag: (appId: string, flagId: string, reviewType: 'productSpecReview' | 'riskIntegrityReview') => void;
  onUpdateVercelReadiness?: (appId: string, checklist: VercelReadinessChecklist) => void;
  canProceedToBuild: (appId: string) => boolean;
  getActiveApp: () => AppIntake | undefined;
  isLaunchApproved?: (appId: string) => boolean;
}

type ViewMode = 'list' | 'create' | 'detail' | 'quick-register';

export function AppList({
  apps,
  onCreateApp,
  onQuickRegister,
  onRunAgentReview,
  onMakeDecision,
  onSetActive,
  onConfirmOwnership,
  onAcknowledgeFlag,
  onUpdateVercelReadiness,
  canProceedToBuild,
  getActiveApp,
  isLaunchApproved,
}: AppListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AppStatus | 'all'>('all');
  const [sortMode, setSortMode] = useState<SortMode>('default');

  const activeApp = getActiveApp();
  const selectedApp = apps.find(a => a.id === selectedAppId);

  const handleCreate = (data: Parameters<typeof onCreateApp>[0]) => {
    onCreateApp(data);
    setViewMode('list');
  };

  const handleSelectApp = (app: AppIntake) => {
    setSelectedAppId(app.id);
    setViewMode('detail');
  };

  // Get filtered and sorted apps
  const getFilteredApps = useMemo(() => {
    let filtered = activeTab === 'all' ? apps : apps.filter(a => a.status === activeTab);
    
    if (sortMode === 'launch-sprint') {
      // Sort by launch readiness: 🚀 Launch-Approved → Green → Yellow (fewest blockers) → Red
      filtered = [...filtered].sort((a, b) => {
        const aLaunchApproved = isFullyLaunchApproved(a);
        const bLaunchApproved = isFullyLaunchApproved(b);
        
        // Launch-approved first
        if (aLaunchApproved && !bLaunchApproved) return -1;
        if (!aLaunchApproved && bLaunchApproved) return 1;
        
        // Then by traffic light
        const lightOrder = { green: 1, yellow: 2, red: 3, undefined: 4 };
        const aLight = lightOrder[a.trafficLight || 'undefined'];
        const bLight = lightOrder[b.trafficLight || 'undefined'];
        
        if (aLight !== bLight) return aLight - bLight;
        
        // Within same light, sort by fewest blockers
        return getBlockerCount(a) - getBlockerCount(b);
      });
    }
    
    return filtered;
  }, [apps, activeTab, sortMode]);

  const getTabCount = (status: AppStatus | 'all') => {
    if (status === 'all') return apps.length;
    return apps.filter(a => a.status === status).length;
  };

  if (viewMode === 'create') {
    return (
      <AppIntakeForm 
        onSubmit={handleCreate}
        onCancel={() => setViewMode('list')}
      />
    );
  }

  if (viewMode === 'quick-register') {
    return (
      <QuickRegisterForm
        onSubmit={(entries) => {
          if (onQuickRegister) {
            onQuickRegister(entries);
          }
          setViewMode('list');
        }}
        onCancel={() => setViewMode('list')}
      />
    );
  }

  if (viewMode === 'detail' && selectedApp) {
    return (
      <AppDetail
        app={selectedApp}
        onBack={() => setViewMode('list')}
        onRunAgentReview={onRunAgentReview}
        onMakeDecision={onMakeDecision}
        onSetActive={onSetActive}
        onConfirmOwnership={onConfirmOwnership}
        onAcknowledgeFlag={onAcknowledgeFlag}
        onUpdateVercelReadiness={onUpdateVercelReadiness}
        canProceedToBuild={canProceedToBuild(selectedApp.id)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">App Governance</h1>
            <p className="text-sm text-muted-foreground">
              Single source of truth for all Clearpath apps
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setViewMode('quick-register')}>
            <ListPlus className="h-4 w-4 mr-2" />
            Quick Register
          </Button>
          <Button onClick={() => setViewMode('create')}>
            <Plus className="h-4 w-4 mr-2" />
            New App Intake
          </Button>
        </div>
      </div>

      {/* Active App Banner */}
      {activeApp && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Active App: {activeApp.name}</p>
              <p className="text-sm text-muted-foreground">Only one app can be active at a time. All others are paused or pending.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleSelectApp(activeApp)}>
            View Details
          </Button>
        </div>
      )}

      {/* Sort + Tabs */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AppStatus | 'all')} className="flex-1">
          <TabsList>
            <TabsTrigger value="all" className="flex items-center gap-2">
              All <Badge variant="secondary">{getTabCount('all')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="unreviewed" className="flex items-center gap-2">
              Unreviewed <Badge variant="secondary">{getTabCount('unreviewed')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="in_review" className="flex items-center gap-2">
              In Review <Badge variant="secondary">{getTabCount('in_review')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              Approved <Badge variant="secondary">{getTabCount('approved')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="paused" className="flex items-center gap-2">
              Paused <Badge variant="secondary">{getTabCount('paused')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="killed" className="flex items-center gap-2">
              Killed <Badge variant="secondary">{getTabCount('killed')}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default Order</SelectItem>
            <SelectItem value="launch-sprint">
              <span className="flex items-center gap-2">
                <Rocket className="h-3 w-3" />
                Launch Sprint
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* App Grid */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AppStatus | 'all')}>
        <TabsContent value={activeTab} className="mt-0">
          {getFilteredApps.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-1">No apps found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {activeTab === 'all' 
                  ? 'Start by registering your first app for governance review.'
                  : `No apps with status "${activeTab.replace('_', ' ')}".`}
              </p>
              {activeTab === 'all' && (
                <Button onClick={() => setViewMode('create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  New App Intake
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredApps.map(app => (
                <AppCard 
                  key={app.id} 
                  app={app} 
                  onClick={() => handleSelectApp(app)}
                  isLaunchApproved={isLaunchApproved?.(app.id) ?? false}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}