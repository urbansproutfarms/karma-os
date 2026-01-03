import { useState, useEffect, useCallback, useMemo } from 'react';
import { Command, CommandTarget, CommandType, CommandStatus, AppIntake } from '@/types/karma';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/lib/storage';

// Command generation templates
const COMMAND_TEMPLATES: Record<CommandType, Record<CommandTarget, (app: AppIntake, blockers: string[]) => { title: string; objective: string; prompt: string }>> = {
  repair: {
    lovable: (app, blockers) => ({
      title: `Fix ${app.name} Blockers`,
      objective: `Resolve runtime errors and launch blockers in ${app.name}.`,
      prompt: `You are working on "${app.name}"${app.repoUrl ? ` (repo: ${app.repoUrl})` : ''}.

OBJECTIVE: Fix launch blockers only. No redesign. No new features.

CONSTRAINTS:
• Minimal changes only
• Do not touch assets unless broken
• Do not change app intent or purpose
• Preserve existing UI/UX

KNOWN BLOCKERS:
${blockers.length > 0 ? blockers.map(b => `• ${b}`).join('\n') : '• Check for runtime errors\n• Verify all routes load correctly\n• Confirm data persistence works'}

SUCCESS CRITERIA:
□ App loads without console errors
□ All navigation routes function
□ No broken images or assets
□ Forms submit correctly
□ Data persists as expected`
    }),
    github: (app, blockers) => ({
      title: `Fix ${app.name} Blockers`,
      objective: `Resolve runtime errors and launch blockers in ${app.name}.`,
      prompt: `Repository: ${app.repoUrl || '[REPO URL REQUIRED]'}
Project: ${app.name}

OBJECTIVE: Fix launch blockers only. No redesign. No new features.

CONSTRAINTS:
• Minimal changes only
• Do not touch assets unless broken
• Do not change app intent or purpose
• Preserve existing UI/UX

KNOWN BLOCKERS:
${blockers.length > 0 ? blockers.map(b => `• ${b}`).join('\n') : '• Check for runtime errors\n• Verify build succeeds\n• Confirm all tests pass'}

SUCCESS CRITERIA:
□ Build completes without errors
□ All tests pass
□ No TypeScript errors
□ Linting passes
□ App runs locally without issues`
    }),
    rork: (app, blockers) => ({
      title: `Fix ${app.name} Blockers`,
      objective: `Resolve runtime errors and launch blockers in ${app.name}.`,
      prompt: `Project: ${app.name}
${app.repoUrl ? `Repository: ${app.repoUrl}` : ''}

OBJECTIVE: Fix mobile app launch blockers only. No redesign. No new features.

CONSTRAINTS:
• Minimal changes only
• Do not touch assets
• Preserve existing navigation
• Do not add new screens

KNOWN BLOCKERS:
${blockers.length > 0 ? blockers.map(b => `• ${b}`).join('\n') : '• Check for runtime crashes\n• Verify navigation works\n• Confirm state management functions'}

SUCCESS CRITERIA:
□ App launches without crash
□ All screens accessible
□ No console errors
□ State persists correctly`
    }),
    vercel: (app, blockers) => ({
      title: `Fix ${app.name} Build`,
      objective: `Resolve Vercel deployment issues for ${app.name}.`,
      prompt: `Project: ${app.name}
${app.repoUrl ? `Repository: ${app.repoUrl}` : ''}

OBJECTIVE: Fix Vercel build/deployment issues only.

CHECK:
• Build command correct
• Output directory configured
• Environment variables set
• No build-time errors

SUCCESS CRITERIA:
□ Vercel build succeeds
□ Preview deployment works
□ No 500 errors on load`
    }),
  },
  pwa: {
    lovable: (app) => ({
      title: `PWA Setup: ${app.name}`,
      objective: `Make ${app.name} installable as a Progressive Web App.`,
      prompt: `You are working on "${app.name}"${app.repoUrl ? ` (repo: ${app.repoUrl})` : ''}.

OBJECTIVE: Add PWA support for installability.

REQUIREMENTS:
• Add/update manifest.json with correct app name, icons, theme
• Register service worker for offline support
• Add appropriate meta tags for mobile
• Ensure icons exist at required sizes (192x192, 512x512)

CONSTRAINTS:
• Do not redesign the UI
• Do not add new features
• Do not change app logic
• Minimal changes only

SUCCESS CRITERIA:
□ manifest.json present and valid
□ Service worker registered
□ App installable on mobile/desktop
□ Icons display correctly
□ No console errors on load`
    }),
    github: (app) => ({
      title: `PWA Setup: ${app.name}`,
      objective: `Make ${app.name} installable as a Progressive Web App.`,
      prompt: `Repository: ${app.repoUrl || '[REPO URL REQUIRED]'}
Project: ${app.name}

OBJECTIVE: Add PWA support for installability.

FILES TO CREATE/UPDATE:
• public/manifest.json
• public/sw.js (service worker)
• Update index.html with manifest link and meta tags
• Add icons to public/ directory

MANIFEST REQUIREMENTS:
{
  "name": "${app.name}",
  "short_name": "${app.name.split(' ')[0]}",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [...]
}

SUCCESS CRITERIA:
□ manifest.json valid (use PWA validator)
□ Service worker caches app shell
□ Lighthouse PWA audit passes
□ App installable from browser`
    }),
    rork: (app) => ({
      title: `PWA/Installability: ${app.name}`,
      objective: `Verify ${app.name} is ready for app store submission.`,
      prompt: `Project: ${app.name}

OBJECTIVE: Prepare for Expo/app store submission.

CHECK:
• app.json configured correctly
• Icons and splash screens present
• Bundle identifier set
• Version numbers correct

SUCCESS CRITERIA:
□ expo build succeeds
□ App runs on device/simulator
□ No asset errors`
    }),
    vercel: (app) => ({
      title: `PWA Headers: ${app.name}`,
      objective: `Configure Vercel for PWA serving.`,
      prompt: `Project: ${app.name}
${app.repoUrl ? `Repository: ${app.repoUrl}` : ''}

OBJECTIVE: Configure vercel.json for PWA.

ADD TO vercel.json:
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
    },
    {
      "source": "/manifest.json",
      "headers": [{ "key": "Content-Type", "value": "application/manifest+json" }]
    }
  ]
}

SUCCESS CRITERIA:
□ Service worker served correctly
□ Manifest accessible
□ PWA installable from production URL`
    }),
  },
  deploy: {
    lovable: (app) => ({
      title: `Publish ${app.name}`,
      objective: `Deploy ${app.name} to production via Lovable.`,
      prompt: `Project: ${app.name}

OBJECTIVE: Publish to production.

PRE-FLIGHT CHECKS:
□ No console errors
□ All features working
□ PWA manifest valid
□ Assets loading correctly

DEPLOY STEPS:
1. Click "Publish" in Lovable
2. Verify preview build
3. Confirm production URL works
4. Test on mobile device

SUCCESS CRITERIA:
□ Production URL accessible
□ No 404/500 errors
□ App installable as PWA`
    }),
    github: (app) => ({
      title: `Deploy ${app.name}`,
      objective: `Trigger deployment for ${app.name}.`,
      prompt: `Repository: ${app.repoUrl || '[REPO URL REQUIRED]'}
Project: ${app.name}

OBJECTIVE: Deploy via CI/CD.

STEPS:
1. Ensure main branch is clean
2. Push to trigger deployment
3. Monitor build logs
4. Verify production URL

SUCCESS CRITERIA:
□ CI/CD pipeline green
□ Production deployment successful
□ No rollback needed`
    }),
    rork: (app) => ({
      title: `Build ${app.name}`,
      objective: `Create production build for ${app.name}.`,
      prompt: `Project: ${app.name}

OBJECTIVE: Create production build.

STEPS:
1. Run expo build
2. Download build artifact
3. Test on device
4. Submit to app store (if applicable)

SUCCESS CRITERIA:
□ Build succeeds
□ App runs on device
□ No crashes on launch`
    }),
    vercel: (app) => ({
      title: `Deploy ${app.name} to Vercel`,
      objective: `Deploy ${app.name} to Vercel production.`,
      prompt: `Project: ${app.name}
${app.repoUrl ? `Repository: ${app.repoUrl}` : ''}

OBJECTIVE: Deploy to Vercel production.

STEPS:
1. Connect repo to Vercel (if not already)
2. Configure build settings
3. Set environment variables
4. Deploy to production

SUCCESS CRITERIA:
□ Build succeeds
□ Production URL works
□ No errors in function logs`
    }),
  },
  verify: {
    lovable: (app) => ({
      title: `Verify ${app.name}`,
      objective: `Run verification checks on ${app.name}.`,
      prompt: `Project: ${app.name}

OBJECTIVE: Verify app is launch-ready.

CHECKLIST:
□ App loads without errors
□ All navigation works
□ Forms function correctly
□ PWA installable
□ Mobile responsive
□ No broken images/assets
□ Data persists correctly
□ No console errors

Report any issues found.`
    }),
    github: (app) => ({
      title: `Verify ${app.name} Repo`,
      objective: `Verify repository health for ${app.name}.`,
      prompt: `Repository: ${app.repoUrl || '[REPO URL REQUIRED]'}
Project: ${app.name}

OBJECTIVE: Verify repository is deployment-ready.

CHECKLIST:
□ Build succeeds locally
□ All tests pass
□ No TypeScript errors
□ Dependencies up to date
□ No security vulnerabilities
□ README accurate
□ License present

Report any issues found.`
    }),
    rork: (app) => ({
      title: `Verify ${app.name} Mobile`,
      objective: `Verify mobile app is release-ready.`,
      prompt: `Project: ${app.name}

OBJECTIVE: Verify mobile app is ready.

CHECKLIST:
□ App launches correctly
□ All screens accessible
□ Gestures work
□ No performance issues
□ Offline mode (if applicable)
□ Push notifications (if applicable)

Report any issues found.`
    }),
    vercel: (app) => ({
      title: `Verify ${app.name} Deployment`,
      objective: `Verify Vercel deployment for ${app.name}.`,
      prompt: `Project: ${app.name}
${app.repoUrl ? `Repository: ${app.repoUrl}` : ''}

OBJECTIVE: Verify Vercel deployment is healthy.

CHECKLIST:
□ Production URL works
□ All routes accessible
□ No 500 errors
□ Edge functions working (if any)
□ Environment variables set
□ Analytics configured (if any)

Report any issues found.`
    }),
  },
  sync: {
    lovable: (app) => ({
      title: `Sync ${app.name}`,
      objective: `Sync ${app.name} state with GitHub.`,
      prompt: `Project: ${app.name}
${app.repoUrl ? `Repository: ${app.repoUrl}` : ''}

OBJECTIVE: Ensure Lovable and GitHub are in sync.

STEPS:
1. Check GitHub for pending changes
2. Pull latest if needed
3. Verify no conflicts
4. Confirm sync status

SUCCESS CRITERIA:
□ No uncommitted changes
□ Branches aligned
□ Build succeeds`
    }),
    github: (app) => ({
      title: `Sync ${app.name} Repo`,
      objective: `Sync repository with upstream.`,
      prompt: `Repository: ${app.repoUrl || '[REPO URL REQUIRED]'}
Project: ${app.name}

OBJECTIVE: Sync branches and resolve any drift.

STEPS:
1. Fetch all remotes
2. Check for upstream changes
3. Merge/rebase as needed
4. Push to origin

SUCCESS CRITERIA:
□ All branches up to date
□ No merge conflicts
□ CI passing`
    }),
    rork: (app) => ({
      title: `Sync ${app.name}`,
      objective: `Sync Rork project state.`,
      prompt: `Project: ${app.name}

OBJECTIVE: Sync project state.

SUCCESS CRITERIA:
□ Project state saved
□ No pending changes lost`
    }),
    vercel: (app) => ({
      title: `Sync ${app.name} Vercel`,
      objective: `Sync Vercel with latest deployment.`,
      prompt: `Project: ${app.name}
${app.repoUrl ? `Repository: ${app.repoUrl}` : ''}

OBJECTIVE: Ensure Vercel is deploying latest.

STEPS:
1. Check deployment status
2. Trigger redeploy if stale
3. Verify production matches main

SUCCESS CRITERIA:
□ Latest commit deployed
□ No pending deployments
□ Production healthy`
    }),
  },
};

export function useCommands() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStorageItem<Command[]>(STORAGE_KEYS.COMMANDS);
    setCommands(stored || []);
    setIsLoading(false);
  }, []);

  const saveCommands = useCallback((updated: Command[]) => {
    setCommands(updated);
    setStorageItem(STORAGE_KEYS.COMMANDS, updated);
  }, []);

  const generateCommand = useCallback((
    app: AppIntake,
    target: CommandTarget,
    type: CommandType,
    blockers: string[] = []
  ): Command => {
    const template = COMMAND_TEMPLATES[type][target](app, blockers);
    
    const command: Command = {
      id: crypto.randomUUID(),
      appId: app.id,
      appName: app.name,
      target,
      type,
      title: template.title,
      objective: template.objective,
      generatedPrompt: template.prompt,
      createdAt: new Date().toISOString(),
      status: 'draft',
    };

    saveCommands([command, ...commands]);
    return command;
  }, [commands, saveCommands]);

  const updateCommandStatus = useCallback((id: string, status: CommandStatus, notes?: string) => {
    const updated = commands.map(c => 
      c.id === id ? { ...c, status, notes: notes ?? c.notes } : c
    );
    saveCommands(updated);
  }, [commands, saveCommands]);

  const deleteCommand = useCallback((id: string) => {
    saveCommands(commands.filter(c => c.id !== id));
  }, [commands, saveCommands]);

  const getCommandsForApp = useCallback((appId: string): Command[] => {
    return commands.filter(c => c.appId === appId);
  }, [commands]);

  const getRecentCommands = useCallback((limit: number = 20): Command[] => {
    return commands.slice(0, limit);
  }, [commands]);

  // Suggest next command based on app state
  const suggestNextCommand = useCallback((app: AppIntake): { type: CommandType; reason: string } | null => {
    // Check PWA readiness first
    const pwa = app.vercelReadiness;
    if (!pwa?.pwaManifestPresent || !pwa?.serviceWorkerRegistered) {
      return { type: 'pwa', reason: 'PWA checklist incomplete' };
    }

    // Check for errors/blockers
    const hasUnackedFlags = 
      (app.productSpecReview?.flags.some(f => !f.acknowledged) ?? false) ||
      (app.riskIntegrityReview?.flags.some(f => !f.acknowledged) ?? false);
    
    if (hasUnackedFlags || app.trafficLight === 'yellow' || app.trafficLight === 'red') {
      return { type: 'repair', reason: 'Unresolved blockers or warnings' };
    }

    // Check if ready for verification
    if (!pwa?.errorFreeLoad) {
      return { type: 'verify', reason: 'Verification needed' };
    }

    // Ready for deploy
    if (pwa?.readyForVercelDeployment && app.trafficLight === 'green') {
      return { type: 'deploy', reason: 'All checks passed - ready to deploy' };
    }

    return null;
  }, []);

  return {
    commands,
    isLoading,
    generateCommand,
    updateCommandStatus,
    deleteCommand,
    getCommandsForApp,
    getRecentCommands,
    suggestNextCommand,
  };
}
