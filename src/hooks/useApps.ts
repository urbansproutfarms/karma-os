import { useState, useEffect, useCallback } from 'react';
import { AppIntake, AppStatus, AppOrigin, AppAgentReview, AppAgentFlag, AIAgentType, VercelReadinessChecklist, AppLifecycle, DataLayerType, AppSource, BuildPriority } from '@/types/karma';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/lib/storage';
import { useAuditLog } from './useAuditLog';

// Default Vercel readiness checklist
const DEFAULT_VERCEL_READINESS: VercelReadinessChecklist = {
  pwaManifestPresent: false,
  serviceWorkerRegistered: false,
  noFalseClaimsOrLegalAmbiguity: false,
  clearInformationalLanguage: false,
  errorFreeLoad: false,
  readyForVercelDeployment: false,
};

// Schema normalization - ensures all required fields exist with safe defaults
function normalizeApp(app: Partial<AppIntake>): AppIntake | null {
  // Must have at least id and name to be valid
  if (!app.id || !app.name) return null;
  
  return {
    id: app.id,
    name: app.name,
    displayName: app.displayName,
    alias: app.alias,
    origin: app.origin || 'other',
    source: app.source,
    category: app.category,
    productType: app.productType,
    description: app.description || '',
    intendedUser: app.intendedUser || '',
    mvpScope: app.mvpScope || '',
    nonGoals: app.nonGoals || '',
    riskNotes: app.riskNotes || '',
    status: app.status || 'unreviewed',
    isActive: app.isActive ?? false,
    isInternal: app.isInternal ?? false,
    lifecycle: app.lifecycle || 'external',
    excludeFromLaunchMetrics: app.excludeFromLaunchMetrics ?? false,
    excludeFromPublicLists: app.excludeFromPublicLists ?? false,
    buildPriority: app.buildPriority,
    ownerConfirmed: app.ownerConfirmed ?? false,
    ownerEntity: app.ownerEntity || 'Clearpath Technologies LLC',
    repoUrl: app.repoUrl || '',
    publishedUrl: app.publishedUrl,
    assetOwnershipConfirmed: app.assetOwnershipConfirmed ?? false,
    complianceFlags: app.complianceFlags,
    modulesPresent: app.modulesPresent,
    agentReviewComplete: app.agentReviewComplete ?? false,
    productSpecReview: app.productSpecReview,
    riskIntegrityReview: app.riskIntegrityReview,
    founderDecision: app.founderDecision,
    founderDecisionNotes: app.founderDecisionNotes || '',
    founderDecisionAt: app.founderDecisionAt,
    founderDecisionBy: app.founderDecisionBy,
    trafficLight: app.trafficLight,
    vercelReadiness: app.vercelReadiness || { ...DEFAULT_VERCEL_READINESS },
    dataLayer: app.dataLayer || 'none_local',
    createdAt: app.createdAt || new Date().toISOString(),
    updatedAt: app.updatedAt || new Date().toISOString(),
    archivedAt: app.archivedAt,
  };
}

// Canonical Grow OS metadata - single source of truth
const GROW_OS_CANONICAL = {
  description: 'Garden and plant-focused application providing informational tools, references, and AI-assisted features related to gardening and plants.',
  intendedUser: 'Gardeners, growers, and plant enthusiasts.',
  category: 'Informational / Utility (Gardening)',
  origin: 'other' as AppOrigin, // GitHub (migrated from Google AI Studio)
  repoUrl: 'https://github.com/urbansproutfarms/thegoodgarden',
};

// One-time migration to fix Grow OS metadata in stored data
function migrateGrowOsMetadata(apps: AppIntake[]): { apps: AppIntake[]; wasMigrated: boolean } {
  let wasMigrated = false;
  
  const migratedApps = apps.map(app => {
    // Match Grow OS by name
    if (app.name === 'Grow OS') {
      // Check if metadata is stale (contains "personal growth" or "reflection" patterns)
      const hasStaleDescription = 
        app.description.toLowerCase().includes('personal growth') ||
        app.description.toLowerCase().includes('reflection') ||
        app.description.toLowerCase().includes('self-improvement');
      
      const hasWrongCategory = 
        !app.category?.toLowerCase().includes('garden') &&
        !app.category?.toLowerCase().includes('plant');
      
      const needsMigration = hasStaleDescription || hasWrongCategory || !app.repoUrl;
      
      if (needsMigration) {
        wasMigrated = true;
        return {
          ...app,
          description: GROW_OS_CANONICAL.description,
          intendedUser: GROW_OS_CANONICAL.intendedUser,
          category: GROW_OS_CANONICAL.category,
          origin: GROW_OS_CANONICAL.origin,
          repoUrl: GROW_OS_CANONICAL.repoUrl,
          updatedAt: new Date().toISOString(),
        };
      }
    }
    return app;
  });
  
  return { apps: migratedApps, wasMigrated };
}

// Migration to classify ClearPath Launch Dashboard as internal module of KarmaOS
function migrateClearpathLaunchDashboard(apps: AppIntake[]): { apps: AppIntake[]; wasMigrated: boolean } {
  let wasMigrated = false;
  
  const migratedApps = apps.map(app => {
    // Mark ClearPath Launch Dashboard as internal
    if (app.name === 'ClearPath Launch Dashboard' && !app.isInternal) {
      wasMigrated = true;
      return {
        ...app,
        isInternal: true,
        lifecycle: 'internal-only' as AppLifecycle,
        description: 'Internal view for launch readiness within KarmaOS',
        updatedAt: new Date().toISOString(),
      };
    }
    // Mark KarmaOS as internal (it's the single internal application)
    if (app.name === 'KarmaOS' && !app.isInternal) {
      wasMigrated = true;
      return {
        ...app,
        isInternal: true,
        lifecycle: 'internal-only' as AppLifecycle,
        updatedAt: new Date().toISOString(),
      };
    }
    return app;
  });
  
  return { apps: migratedApps, wasMigrated };
}

// Migration to dedupe/normalize systembuilderOS variants
function migrateSystemBuilderOS(apps: AppIntake[]): { apps: AppIntake[]; wasMigrated: boolean } {
  let wasMigrated = false;
  const variantNames = ['System Builder OS', 'SystemBuilderOS', 'Builder OS', 'system builder os', 'systembuilderos'];
  
  const migratedApps = apps.map(app => {
    const lowerName = app.name.toLowerCase();
    // Check if this is a variant that needs normalization
    if (variantNames.map(v => v.toLowerCase()).includes(lowerName) && app.name !== 'systembuilderOS') {
      wasMigrated = true;
      return {
        ...app,
        name: 'systembuilderOS',
        displayName: 'System Builder OS',
        updatedAt: new Date().toISOString(),
      };
    }
    return app;
  });
  
  return { apps: migratedApps, wasMigrated };
}

// Ensure systembuilderOS exists in the apps list (inject if missing)
function ensureSystemBuilderOS(apps: AppIntake[]): { apps: AppIntake[]; wasAdded: boolean } {
  const exists = apps.some(app => app.name === 'systembuilderOS');
  if (exists) {
    return { apps, wasAdded: false };
  }
  
  // Create systembuilderOS entry
  const systemBuilderOS: AppIntake = {
    id: crypto.randomUUID(),
    name: 'systembuilderOS',
    displayName: 'System Builder OS',
    origin: 'other',
    source: 'github' as AppSource,
    category: 'Governance / Infrastructure',
    productType: 'System Builder / Orchestration',
    description: 'Internal system orchestration and build management platform sourced from GitHub.',
    intendedUser: 'Founder / Internal',
    mvpScope: 'Core orchestration, build pipeline management, repo sync',
    nonGoals: 'Not a public-facing product',
    riskNotes: 'Internal infrastructure only',
    status: 'unreviewed',
    isActive: false,
    isInternal: true,
    lifecycle: 'internal-only' as AppLifecycle,
    excludeFromLaunchMetrics: true,
    excludeFromPublicLists: true,
    buildPriority: 'first' as BuildPriority,
    ownerConfirmed: false,
    ownerEntity: 'Clearpath Technologies LLC',
    repoUrl: '', // Placeholder - user should paste GitHub URL
    assetOwnershipConfirmed: false,
    agentReviewComplete: false,
    trafficLight: 'yellow',
    dataLayer: 'none_local' as DataLayerType,
    vercelReadiness: { ...DEFAULT_VERCEL_READINESS },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  return { apps: [systemBuilderOS, ...apps], wasAdded: true };
}

// Initial seed data for Clearpath apps
const SEED_APPS: Omit<AppIntake, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'KarmaOS', origin: 'lovable', description: 'Internal founder operating system for governance, compliance, and launch control', intendedUser: 'Founder', mvpScope: '', nonGoals: '', riskNotes: '', status: 'unreviewed', isActive: false, isInternal: true, lifecycle: 'internal-only', ownerConfirmed: false, ownerEntity: 'Clearpath Technologies LLC', assetOwnershipConfirmed: false, agentReviewComplete: false, trafficLight: 'green' },
  { name: 'ClearPath Launch Dashboard', origin: 'lovable', description: 'Internal view for launch readiness within KarmaOS', intendedUser: 'Founder', mvpScope: '', nonGoals: '', riskNotes: '', status: 'unreviewed', isActive: false, isInternal: true, lifecycle: 'internal-only', ownerConfirmed: false, ownerEntity: 'Clearpath Technologies LLC', assetOwnershipConfirmed: false, agentReviewComplete: false, trafficLight: 'green' },
  { 
    name: 'systembuilderOS',
    displayName: 'System Builder OS',
    origin: 'other',
    source: 'github' as AppSource,
    category: 'Governance / Infrastructure',
    productType: 'System Builder / Orchestration',
    description: 'Internal system orchestration and build management platform sourced from GitHub.',
    intendedUser: 'Founder / Internal',
    mvpScope: 'Core orchestration, build pipeline management, repo sync',
    nonGoals: 'Not a public-facing product',
    riskNotes: 'Internal infrastructure only',
    status: 'unreviewed',
    isActive: false,
    isInternal: true,
    lifecycle: 'internal-only' as AppLifecycle,
    excludeFromLaunchMetrics: true,
    excludeFromPublicLists: true,
    buildPriority: 'first' as BuildPriority,
    ownerConfirmed: false,
    ownerEntity: 'Clearpath Technologies LLC',
    repoUrl: '', // Placeholder - user should paste GitHub URL
    assetOwnershipConfirmed: false,
    agentReviewComplete: false,
    trafficLight: 'yellow',
    dataLayer: 'none_local' as DataLayerType,
  },
  { 
    name: 'FieldPass Ready', 
    origin: 'lovable', 
    category: 'Volunteer Readiness / Trust & Access',
    productType: 'Volunteer Readiness / Trust & Access (non-employment)',
    description: 'A neutral, skill-based volunteer readiness platform that helps hosts accept volunteers with less burden.', 
    intendedUser: 'Volunteers and volunteer hosts', 
    mvpScope: 'Welcome/Orientation, Onboarding Wizard, Volunteer Dashboard, Opportunities List, Eligibility Filtering, Readiness Quiz', 
    nonGoals: 'No payments/compensation, no rankings/social rating, no guarantee of access or advancement', 
    riskNotes: 'Ensure no employment claims; maintain safety-first messaging; no medical/financial/employment claims', 
    status: 'unreviewed', 
    isActive: false, 
    isInternal: false,
    lifecycle: 'external',
    ownerConfirmed: false, 
    ownerEntity: 'ClearPath Technologies', 
    assetOwnershipConfirmed: false, 
    agentReviewComplete: false, 
    trafficLight: 'yellow',
    dataLayer: 'none_local',
    complianceFlags: {
      noPayments: true,
      noRankings: true,
      noGuarantees: true,
      safetyFirstOnboarding: true,
      noMedicalClaims: true,
      noFinancialClaims: true,
      noEmploymentClaims: true,
    },
    modulesPresent: {
      welcomeOrientation: true,
      onboardingWizard: true,
      volunteerDashboard: true,
      opportunitiesList: true,
      opportunityDetail: true,
      profileCredentials: true,
      hostDashboard: true,
      readinessQuiz: true,
      monthlyArchive: true,
    },
  },
  { name: 'Plant Air IQ', origin: 'other', description: 'Provides informational plant references related to indoor air quality', intendedUser: 'Consumers', mvpScope: '', nonGoals: '', riskNotes: '', status: 'unreviewed', isActive: false, ownerConfirmed: false, ownerEntity: 'Clearpath Technologies LLC', assetOwnershipConfirmed: false, agentReviewComplete: false, trafficLight: 'yellow' },
  { name: 'Plant Lens', origin: 'rork', description: 'Image-based plant identification and reference tool', intendedUser: 'Consumers', mvpScope: '', nonGoals: '', riskNotes: '', status: 'unreviewed', isActive: false, ownerConfirmed: false, ownerEntity: 'Clearpath Technologies LLC', assetOwnershipConfirmed: false, agentReviewComplete: false, trafficLight: 'yellow' },
  { name: 'Grow OS', origin: 'other', category: 'Informational / Utility (Gardening)', description: 'Garden and plant-focused application providing informational tools, references, and AI-assisted features related to gardening and plants.', intendedUser: 'Gardeners, growers, and plant enthusiasts.', mvpScope: '', nonGoals: '', riskNotes: '', status: 'unreviewed', isActive: false, ownerConfirmed: false, ownerEntity: 'Clearpath Technologies LLC', assetOwnershipConfirmed: false, agentReviewComplete: false, trafficLight: 'green', repoUrl: 'https://github.com/urbansproutfarms/thegoodgarden' },
  { name: 'Forward OS', origin: 'lovable', description: 'Future-oriented planning and reflection tool', intendedUser: 'Individuals', mvpScope: '', nonGoals: '', riskNotes: '', status: 'unreviewed', isActive: false, ownerConfirmed: false, ownerEntity: 'Clearpath Technologies LLC', assetOwnershipConfirmed: false, agentReviewComplete: false, trafficLight: 'green' },
  { name: 'Unlock OS', origin: 'lovable', description: 'Self-guided reflection tool focused on unlocking personal insights', intendedUser: 'Individuals', mvpScope: '', nonGoals: '', riskNotes: '', status: 'unreviewed', isActive: false, ownerConfirmed: false, ownerEntity: 'Clearpath Technologies LLC', assetOwnershipConfirmed: false, agentReviewComplete: false, trafficLight: 'green' },
  { name: 'Conscious Co-Pilot', origin: 'other', description: 'AI-assisted reflection and orientation companion', intendedUser: 'Individuals', mvpScope: '', nonGoals: '', riskNotes: '', status: 'unreviewed', isActive: false, ownerConfirmed: false, ownerEntity: 'Clearpath Technologies LLC', assetOwnershipConfirmed: false, agentReviewComplete: false, trafficLight: 'yellow' },
  { name: 'The Annual Compass App', origin: 'lovable', description: 'End-of-year reflection and review application', intendedUser: 'Individuals', mvpScope: '', nonGoals: '', riskNotes: '', status: 'unreviewed', isActive: false, ownerConfirmed: false, ownerEntity: 'Clearpath Technologies LLC', assetOwnershipConfirmed: false, agentReviewComplete: false, trafficLight: 'green' },
  { name: 'Earned App', origin: 'lovable', description: 'Tracks earned progress and completion of self-directed work', intendedUser: 'Individuals', mvpScope: '', nonGoals: '', riskNotes: '', status: 'unreviewed', isActive: false, ownerConfirmed: false, ownerEntity: 'Clearpath Technologies LLC', assetOwnershipConfirmed: false, agentReviewComplete: false, trafficLight: 'yellow' },
  { name: 'FarmCoin Network (Concept)', origin: 'lovable', description: 'Concept-stage network for coordinating contributions and rewards in farming communities', intendedUser: 'Farming communities', mvpScope: '', nonGoals: '', riskNotes: '', status: 'unreviewed', isActive: false, ownerConfirmed: false, ownerEntity: 'Clearpath Technologies LLC', assetOwnershipConfirmed: false, agentReviewComplete: false, trafficLight: 'red' },
  { name: 'Local Harvest (Garden to Plate)', origin: 'lovable', description: 'Informational app connecting local growers with consumers', intendedUser: 'Growers and consumers', mvpScope: '', nonGoals: '', riskNotes: '', status: 'unreviewed', isActive: false, ownerConfirmed: false, ownerEntity: 'Clearpath Technologies LLC', assetOwnershipConfirmed: false, agentReviewComplete: false, trafficLight: 'yellow' },
  { name: 'GrowCode Adventures', origin: 'lovable', description: 'Educational content platform for youth and families', intendedUser: 'Youth and families', mvpScope: '', nonGoals: '', riskNotes: '', status: 'unreviewed', isActive: false, ownerConfirmed: false, ownerEntity: 'Clearpath Technologies LLC', assetOwnershipConfirmed: false, agentReviewComplete: false, trafficLight: 'yellow' },
  { name: 'New Farmers Almanac', alias: 'Farmers Almanac', origin: 'other', category: 'Informational / Utility (Gardening/Farming)', description: 'Informational seasonal reference and gardening/farming guidance app.', intendedUser: 'Gardeners and growers.', mvpScope: 'Seasonal planting calendar, weather references, traditional farming wisdom', nonGoals: 'No e-commerce, no paid subscriptions, no medical/legal advice', riskNotes: 'Verify all seasonal data is region-appropriate; ensure no prescriptive health claims', status: 'unreviewed', isActive: false, ownerConfirmed: false, ownerEntity: 'Clearpath Technologies LLC', assetOwnershipConfirmed: false, agentReviewComplete: false, trafficLight: 'yellow', repoUrl: 'https://github.com/urbansproutfarms/thegoodgarden' },
];

// Create seeded apps with IDs and timestamps
function createSeededApps(): AppIntake[] {
  return SEED_APPS.map(app => ({
    ...app,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    repoUrl: app.repoUrl || '',
    vercelReadiness: { ...DEFAULT_VERCEL_READINESS },
  }));
}

export function useApps() {
  const [apps, setApps] = useState<AppIntake[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataWasReset, setDataWasReset] = useState(false);
  const { logActivity } = useAuditLog();

  useEffect(() => {
    let wasReset = false;
    let loadedApps: AppIntake[] = [];

    try {
      const stored = getStorageItem<unknown>(STORAGE_KEYS.APPS);
      
      if (stored && Array.isArray(stored) && stored.length > 0) {
        // Normalize each app - filter out any that fail normalization
        const normalized = stored
          .map((app: unknown) => normalizeApp(app as Partial<AppIntake>))
          .filter((app): app is AppIntake => app !== null);
        
      if (normalized.length > 0) {
          // Run Grow OS migration on existing data
          const { apps: growOsMigrated, wasMigrated: growOsWasMigrated } = migrateGrowOsMetadata(normalized);
          
          // Run ClearPath Launch Dashboard migration
          const { apps: clearpathMigrated, wasMigrated: clearpathWasMigrated } = migrateClearpathLaunchDashboard(growOsMigrated);
          
          // Run systembuilderOS dedupe migration
          const { apps: systemBuilderMigrated, wasMigrated: systemBuilderWasMigrated } = migrateSystemBuilderOS(clearpathMigrated);
          
          // Ensure systembuilderOS exists (inject if missing)
          const { apps: withSystemBuilder, wasAdded: systemBuilderWasAdded } = ensureSystemBuilderOS(systemBuilderMigrated);
          loadedApps = withSystemBuilder;
          
          // If Grow OS migration occurred, log it
          if (growOsWasMigrated) {
            const growOs = loadedApps.find(a => a.name === 'Grow OS');
            if (growOs) {
              setTimeout(() => {
                logActivity(
                  'Corrected Grow OS dashboard metadata (garden app)',
                  'app',
                  growOs.id,
                  'system',
                  {
                    description: GROW_OS_CANONICAL.description,
                    intendedUser: GROW_OS_CANONICAL.intendedUser,
                    category: GROW_OS_CANONICAL.category,
                    repoUrl: GROW_OS_CANONICAL.repoUrl,
                  }
                );
              }, 0);
            }
          }
          
          // If ClearPath Launch Dashboard or KarmaOS migration occurred, log it
          if (clearpathWasMigrated) {
            setTimeout(() => {
              logActivity(
                'Governance cleanup: products vs internal + lifecycle tagging',
                'app',
                'system',
                'system',
                {
                  action: 'Marked KarmaOS and ClearPath Launch Dashboard as internal',
                  productsOnly: true,
                  lifecycleTagging: true,
                }
              );
            }, 0);
          }
          
          // If systembuilderOS migration occurred, log it
          if (systemBuilderWasMigrated) {
            setTimeout(() => {
              logActivity(
                'Normalized System Builder OS → systembuilderOS',
                'app',
                'system',
                'system',
                {
                  action: 'Dedupe/normalize systembuilderOS variants',
                  canonical: 'systembuilderOS',
                }
              );
            }, 0);
          }
          
          // If systembuilderOS was added, log it
          if (systemBuilderWasAdded) {
            const systemBuilder = loadedApps.find(a => a.name === 'systembuilderOS');
            if (systemBuilder) {
              setTimeout(() => {
                logActivity(
                  'Added systembuilderOS as managed internal project',
                  'app',
                  systemBuilder.id,
                  'system',
                  {
                    source: 'github',
                    lifecycle: 'internal-only',
                    excludeFromLaunchMetrics: true,
                    buildPriority: 'first',
                  }
                );
              }, 0);
            }
          }
          
          // Save normalized/migrated data back to storage
          setStorageItem(STORAGE_KEYS.APPS, loadedApps);
        }
      } else {
        // No data - seed initial apps
        loadedApps = createSeededApps();
        setStorageItem(STORAGE_KEYS.APPS, loadedApps);
        
        // Log New Farmers Almanac registration
        const farmersAlmanac = loadedApps.find(a => a.name === 'New Farmers Almanac');
        if (farmersAlmanac) {
          logActivity(
            'New Farmers Almanac project registration + repo linking',
            'app',
            farmersAlmanac.id,
            'system',
            {
              repoUrl: farmersAlmanac.repoUrl,
              origin: 'GitHub (migrated from Google AI Studio)',
              category: farmersAlmanac.category,
              alias: farmersAlmanac.alias,
            }
          );
        }
      }
    } catch (error) {
      // JSON parse failed or other error - reset to defaults
      console.error('Failed to load apps from storage, resetting to defaults:', error);
      wasReset = true;
      loadedApps = createSeededApps();
      setStorageItem(STORAGE_KEYS.APPS, loadedApps);
    }

    setApps(loadedApps);
    setDataWasReset(wasReset);
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

  // Update Vercel readiness checklist
  const updateVercelReadiness = useCallback((appId: string, checklist: VercelReadinessChecklist) => {
    updateApp(appId, { vercelReadiness: checklist });
    logActivity('vercel_readiness_updated', 'app', appId, 'founder', { updated: true });
  }, [updateApp, logActivity]);

  // Check if app is launch-approved (green + all Vercel checklist + no unacknowledged flags + not internal)
  const isLaunchApproved = useCallback((appId: string): boolean => {
    const app = apps.find(a => a.id === appId);
    if (!app) return false;
    
    // Internal modules are never launch-eligible
    if (app.isInternal || app.lifecycle === 'internal-only') return false;
    
    const isGreen = app.trafficLight === 'green';
    const checklist = app.vercelReadiness;
    const allChecklistComplete = checklist && Object.values(checklist).every(Boolean);
    const noUnackedFlags = !hasUnacknowledgedFlags(appId);
    
    return isGreen && allChecklistComplete && noUnackedFlags;
  }, [apps, hasUnacknowledgedFlags]);

  // Get all launch-approved apps (excludes internal modules)
  const getLaunchApprovedApps = useCallback((): AppIntake[] => {
    return apps.filter(a => !a.isInternal && a.lifecycle !== 'internal-only' && isLaunchApproved(a.id));
  }, [apps, isLaunchApproved]);

  // Get launchable apps only (excludes internal modules)
  const getLaunchableApps = useCallback((): AppIntake[] => {
    return apps.filter(a => !a.isInternal && a.lifecycle !== 'internal-only');
  }, [apps]);

  // Update data layer for an app
  const updateDataLayer = useCallback((appId: string, dataLayer: DataLayerType) => {
    const updated = apps.map(app =>
      app.id === appId
        ? { ...app, dataLayer, updatedAt: new Date().toISOString() }
        : app
    );
    saveApps(updated);
    logActivity('app_data_layer_updated', 'app', appId, 'founder', { dataLayer });
  }, [apps, saveApps, logActivity]);

  // Update lifecycle for an app
  const updateLifecycle = useCallback((appId: string, lifecycle: AppLifecycle) => {
    const isInternal = lifecycle === 'internal-only';
    const updated = apps.map(app =>
      app.id === appId
        ? { ...app, lifecycle, isInternal, updatedAt: new Date().toISOString() }
        : app
    );
    saveApps(updated);
    logActivity('app_lifecycle_updated', 'app', appId, 'founder', { lifecycle, isInternal });
  }, [apps, saveApps, logActivity]);

  // Get external apps only (for Projects list - products only)
  const getExternalApps = useCallback((): AppIntake[] => {
    return apps.filter(a => !a.isInternal && a.lifecycle !== 'internal-only');
  }, [apps]);

  return {
    apps,
    isLoading,
    dataWasReset,
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
    updateVercelReadiness,
    updateDataLayer,
    updateLifecycle,
    isLaunchApproved,
    getLaunchApprovedApps,
    getLaunchableApps,
    getExternalApps,
  };
}