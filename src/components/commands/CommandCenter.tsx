import { useState, useCallback } from 'react';
import { AppIntake, Command, CommandTarget, CommandType } from '@/types/karma';
import { PageHeader } from '@/components/layout';
import { CommandSelectors } from './CommandSelectors';
import { CommandCard } from './CommandCard';
import { CommandQueue } from './CommandQueue';
import { useCommands } from '@/hooks/useCommands';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/use-toast';

interface CommandCenterProps {
  apps: AppIntake[];
}

export function CommandCenter({ apps }: CommandCenterProps) {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<CommandTarget>('lovable');
  const [selectedType, setSelectedType] = useState<CommandType>('repair');
  const [minimalChanges] = useState(true); // Locked ON
  const [doNotTouchAssets, setDoNotTouchAssets] = useState(true);
  const [currentCommand, setCurrentCommand] = useState<Command | null>(null);

  const { commands, generateCommand, updateCommandStatus, suggestNextCommand } = useCommands();
  const { logActivity } = useAuditLog();
  const { toast } = useToast();

  const selectedApp = apps.find(a => a.id === selectedAppId) || null;

  // Get blockers from app flags
  const getBlockers = useCallback((app: AppIntake): string[] => {
    const blockers: string[] = [];
    
    app.productSpecReview?.flags.forEach(f => {
      if (!f.acknowledged) blockers.push(f.description);
    });
    app.riskIntegrityReview?.flags.forEach(f => {
      if (!f.acknowledged) blockers.push(f.description);
    });
    
    // Add PWA blockers
    const pwa = app.vercelReadiness;
    if (pwa) {
      if (!pwa.pwaManifestPresent) blockers.push('PWA manifest not present');
      if (!pwa.serviceWorkerRegistered) blockers.push('Service worker not registered');
      if (!pwa.errorFreeLoad) blockers.push('App has runtime errors');
    }

    return blockers;
  }, []);

  const handleGenerate = useCallback(() => {
    if (!selectedApp) return;

    const blockers = getBlockers(selectedApp);
    const command = generateCommand(selectedApp, selectedTarget, selectedType, blockers);
    setCurrentCommand(command);

    // Log to audit
    logActivity(
      'command_generated',
      'command',
      command.id,
      'founder',
      {
        appName: selectedApp.name,
        target: selectedTarget,
        type: selectedType,
        promptPreview: command.generatedPrompt.substring(0, 100) + '...',
      }
    );

    toast({ title: 'Command generated' });
  }, [selectedApp, selectedTarget, selectedType, generateCommand, getBlockers, logActivity, toast]);

  const handleMarkCompleted = useCallback(() => {
    if (!currentCommand) return;

    updateCommandStatus(currentCommand.id, 'completed');
    setCurrentCommand({ ...currentCommand, status: 'completed' });

    logActivity(
      'command_completed',
      'command',
      currentCommand.id,
      'founder',
      { appName: currentCommand.appName, type: currentCommand.type }
    );

    toast({ title: 'Command marked as completed' });
  }, [currentCommand, updateCommandStatus, logActivity, toast]);

  const handleLogResult = useCallback((notes: string) => {
    if (!currentCommand) return;

    updateCommandStatus(currentCommand.id, currentCommand.status, notes);

    logActivity(
      'command_result_logged',
      'command',
      currentCommand.id,
      'founder',
      { notes }
    );

    toast({ title: 'Result notes saved' });
  }, [currentCommand, updateCommandStatus, logActivity, toast]);

  const handleSelectSuggestion = useCallback((appId: string, type: CommandType) => {
    setSelectedAppId(appId);
    setSelectedType(type);
    setCurrentCommand(null);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Command Center" 
        description="Generate copy-paste commands for Lovable, GitHub, Rork, and Vercel. KarmaOS generates—you execute."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Selectors */}
        <div className="lg:col-span-3">
          <CommandSelectors
            apps={apps}
            selectedAppId={selectedAppId}
            selectedTarget={selectedTarget}
            selectedType={selectedType}
            minimalChanges={minimalChanges}
            doNotTouchAssets={doNotTouchAssets}
            onAppChange={setSelectedAppId}
            onTargetChange={setSelectedTarget}
            onTypeChange={setSelectedType}
            onMinimalChangesChange={() => {}} // Locked
            onDoNotTouchAssetsChange={setDoNotTouchAssets}
          />
        </div>

        {/* Main Panel: Generated Command */}
        <div className="lg:col-span-6">
          <CommandCard
            selectedApp={selectedApp}
            selectedTarget={selectedTarget}
            selectedType={selectedType}
            currentCommand={currentCommand}
            onGenerate={handleGenerate}
            onMarkCompleted={handleMarkCompleted}
            onLogResult={handleLogResult}
          />
        </div>

        {/* Right Panel: Queue */}
        <div className="lg:col-span-3">
          <CommandQueue
            commands={commands}
            apps={apps}
            suggestNextCommand={suggestNextCommand}
            onSelectSuggestion={handleSelectSuggestion}
          />
        </div>
      </div>
    </div>
  );
}
