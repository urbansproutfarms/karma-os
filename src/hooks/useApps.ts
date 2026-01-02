import { useState, useEffect, useCallback } from 'react';
import { AppIntake, AppStatus, AppOrigin, AppAgentReview, AppAgentFlag, AIAgentType } from '@/types/karma';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/lib/storage';
import { useAuditLog } from './useAuditLog';

export function useApps() {
  const [apps, setApps] = useState<AppIntake[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { logActivity } = useAuditLog();

  useEffect(() => {
    const stored = getStorageItem<AppIntake[]>(STORAGE_KEYS.APPS);
    setApps(stored || []);
    setIsLoading(false);
  }, []);

  const saveApps = useCallback((updated: AppIntake[]) => {
    setApps(updated);
    setStorageItem(STORAGE_KEYS.APPS, updated);
  }, []);

  // Create new app intake
  const createApp = useCallback((data: {
    name: string;
    origin: AppOrigin;
    description: string;
    intendedUser: string;
    mvpScope: string;
    nonGoals: string;
    riskNotes: string;
  }): AppIntake => {
    const newApp: AppIntake = {
      id: crypto.randomUUID(),
      ...data,
      status: 'unreviewed',
      isActive: false,
      ownerConfirmed: false,
      ownerEntity: 'Clearpath Technologies LLC',
      assetOwnershipConfirmed: false,
      agentReviewComplete: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveApps([newApp, ...apps]);
    logActivity('app_created', 'app', newApp.id, 'founder', { name: data.name, origin: data.origin });
    return newApp;
  }, [apps, saveApps, logActivity]);

  // Quick register multiple apps with minimal fields
  const quickRegister = useCallback((entries: {
    name: string;
    source: AppOrigin;
    purpose: string;
    initialStatus: 'green' | 'yellow' | 'red';
  }[]): AppIntake[] => {
    const newApps: AppIntake[] = entries.map(entry => ({
      id: crypto.randomUUID(),
      name: entry.name,
      origin: entry.source,
      description: entry.purpose,
      intendedUser: '',
      mvpScope: '',
      nonGoals: '',
      riskNotes: '',
      status: 'unreviewed' as AppStatus,
      isActive: false,
      ownerConfirmed: false,
      ownerEntity: 'Clearpath Technologies LLC',
      assetOwnershipConfirmed: false,
      agentReviewComplete: false,
      trafficLight: entry.initialStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    
    saveApps([...newApps, ...apps]);
    newApps.forEach(app => {
      logActivity('app_quick_registered', 'app', app.id, 'founder', { 
        name: app.name, 
        origin: app.origin,
        trafficLight: (app as any).trafficLight 
      });
    });
    return newApps;
  }, [apps, saveApps, logActivity]);

  // Update app
  const updateApp = useCallback((id: string, updates: Partial<AppIntake>) => {
    const updated = apps.map(app => 
      app.id === id 
        ? { ...app, ...updates, updatedAt: new Date().toISOString() }
        : app
    );
    saveApps(updated);
    logActivity('app_updated', 'app', id, 'founder', updates);
  }, [apps, saveApps, logActivity]);

  // Generate mock agent review (simulates AI review)
  const generateAgentReview = useCallback((appId: string, agentId: AIAgentType): AppAgentReview => {
    const app = apps.find(a => a.id === appId);
    if (!app) throw new Error('App not found');

    const flags: AppAgentFlag[] = [];
    const recommendations: string[] = [];

    if (agentId === 'product_spec') {
      // Product Specifier Agent review
      if (!app.mvpScope || app.mvpScope.length < 50) {
        flags.push({
          id: crypto.randomUUID(),
          category: 'scope_creep',
          severity: 'medium',
          description: 'MVP scope is not clearly defined. Consider adding specific deliverables.',
          acknowledged: false,
        });
      }
      if (!app.nonGoals || app.nonGoals.length < 20) {
        flags.push({
          id: crypto.randomUUID(),
          category: 'scope_creep',
          severity: 'low',
          description: 'Non-goals section is sparse. Explicit non-goals prevent scope creep.',
          acknowledged: false,
        });
      }
      recommendations.push('Define 3-5 specific MVP deliverables');
      recommendations.push('Add timeline estimates for each deliverable');
    } else if (agentId === 'risk_integrity') {
      // Risk & Integrity Agent review
      if (app.origin === 'other' || app.origin === 'chat') {
        flags.push({
          id: crypto.randomUUID(),
          category: 'ip_conflict',
          severity: 'medium',
          description: 'Origin source unclear. Verify no external IP dependencies.',
          acknowledged: false,
        });
      }
      if (app.riskNotes && app.riskNotes.toLowerCase().includes('user data')) {
        flags.push({
          id: crypto.randomUUID(),
          category: 'ethical_risk',
          severity: 'high',
          description: 'User data handling mentioned. Ensure privacy compliance.',
          acknowledged: false,
        });
      }
      if (app.description.length > 500) {
        flags.push({
          id: crypto.randomUUID(),
          category: 'over_complexity',
          severity: 'low',
          description: 'Description is lengthy. Consider simplifying scope for MVP.',
          acknowledged: false,
        });
      }
      recommendations.push('Confirm all code is original or properly licensed');
      recommendations.push('Document any third-party dependencies');
    }

    const review: AppAgentReview = {
      agentId,
      summary: agentId === 'product_spec' 
        ? `Product specification review for "${app.name}". ${flags.length === 0 ? 'No major concerns.' : `${flags.length} item(s) flagged for attention.`}`
        : `Risk & integrity assessment for "${app.name}". ${flags.length === 0 ? 'No risks identified.' : `${flags.length} potential risk(s) identified.`}`,
      flags,
      recommendations,
      reviewedAt: new Date().toISOString(),
    };

    return review;
  }, [apps]);

  // Run agent review pass
  const runAgentReview = useCallback((appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    const productSpecReview = generateAgentReview(appId, 'product_spec');
    const riskIntegrityReview = generateAgentReview(appId, 'risk_integrity');

    updateApp(appId, {
      status: 'in_review',
      productSpecReview,
      riskIntegrityReview,
      agentReviewComplete: true,
    });

    logActivity('agent_review_completed', 'app', appId, 'founder', {
      productFlags: productSpecReview.flags.length,
      riskFlags: riskIntegrityReview.flags.length,
    });
  }, [apps, generateAgentReview, updateApp, logActivity]);

  // Founder decision
  const makeFounderDecision = useCallback((
    appId: string, 
    decision: 'approve' | 'pause' | 'kill',
    notes?: string
  ) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    // If approving, check ownership requirements
    if (decision === 'approve') {
      if (!app.ownerConfirmed || !app.assetOwnershipConfirmed) {
        throw new Error('Cannot approve: IP & ownership must be confirmed first');
      }
      if (!app.repoUrl) {
        throw new Error('Cannot approve: Repository URL is required');
      }
    }

    let newStatus: AppStatus;
    let isActive = app.isActive;

    switch (decision) {
      case 'approve':
        newStatus = 'approved';
        break;
      case 'pause':
        newStatus = 'paused';
        isActive = false;
        break;
      case 'kill':
        newStatus = 'killed';
        isActive = false;
        break;
    }

    updateApp(appId, {
      status: newStatus,
      isActive,
      founderDecision: decision,
      founderDecisionNotes: notes,
      founderDecisionAt: new Date().toISOString(),
      founderDecisionBy: 'founder',
      archivedAt: decision === 'kill' ? new Date().toISOString() : undefined,
    });

    logActivity(`app_${decision}d`, 'app', appId, 'founder', { notes });
  }, [apps, updateApp, logActivity]);

  // Set active app (only one can be active)
  const setActiveApp = useCallback((appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    if (app.status !== 'approved') {
      throw new Error('Only approved apps can be set as active');
    }

    // Deactivate all other apps, activate this one
    const updated = apps.map(a => ({
      ...a,
      isActive: a.id === appId,
      updatedAt: a.id === appId || a.isActive ? new Date().toISOString() : a.updatedAt,
    }));
    saveApps(updated);
    logActivity('app_activated', 'app', appId, 'founder');
  }, [apps, saveApps, logActivity]);

  // Confirm ownership
  const confirmOwnership = useCallback((appId: string, repoUrl: string) => {
    updateApp(appId, {
      ownerConfirmed: true,
      assetOwnershipConfirmed: true,
      repoUrl,
    });
    logActivity('ownership_confirmed', 'app', appId, 'founder', { repoUrl });
  }, [updateApp, logActivity]);

  // Acknowledge flag
  const acknowledgeFlag = useCallback((appId: string, flagId: string, reviewType: 'productSpecReview' | 'riskIntegrityReview') => {
    const app = apps.find(a => a.id === appId);
    if (!app || !app[reviewType]) return;

    const review = app[reviewType]!;
    const updatedFlags = review.flags.map(f => 
      f.id === flagId ? { ...f, acknowledged: true } : f
    );

    updateApp(appId, {
      [reviewType]: { ...review, flags: updatedFlags },
    });
  }, [apps, updateApp]);

  // Get apps by status
  const getAppsByStatus = useCallback((status: AppStatus): AppIntake[] => {
    return apps.filter(a => a.status === status);
  }, [apps]);

  // Get active app
  const getActiveApp = useCallback((): AppIntake | undefined => {
    return apps.find(a => a.isActive);
  }, [apps]);

  // Check if can proceed to build
  const canProceedToBuild = useCallback((appId: string): boolean => {
    const app = apps.find(a => a.id === appId);
    if (!app) return false;
    return app.status === 'approved' && app.isActive && app.ownerConfirmed && app.assetOwnershipConfirmed;
  }, [apps]);

  // Check if any blocking flags exist
  const hasUnacknowledgedFlags = useCallback((appId: string): boolean => {
    const app = apps.find(a => a.id === appId);
    if (!app) return false;
    
    const productFlags = app.productSpecReview?.flags.filter(f => !f.acknowledged) || [];
    const riskFlags = app.riskIntegrityReview?.flags.filter(f => !f.acknowledged) || [];
    
    return productFlags.length > 0 || riskFlags.length > 0;
  }, [apps]);

  return {
    apps,
    isLoading,
    createApp,
    quickRegister,
    updateApp,
    runAgentReview,
    makeFounderDecision,
    setActiveApp,
    confirmOwnership,
    acknowledgeFlag,
    getAppsByStatus,
    getActiveApp,
    canProceedToBuild,
    hasUnacknowledgedFlags,
  };
}