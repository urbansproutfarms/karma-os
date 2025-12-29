import { useState } from 'react';
import { AppLayout, PageHeader } from '@/components/layout';
import { IdeaIntakeWizard, IdeaList, IdeaDetail } from '@/components/ideas';
import { ProjectList } from '@/components/projects';
import { GuardrailsPanel } from '@/components/guardrails';
import { ContributorList, ContributorDetail, OnboardingWizard, ContributorWelcome } from '@/components/contributors';
import { AgentsPanel } from '@/components/agents';
import { AgreementRegistry, AccessTiersPanel, MVPChecklist, OperationalDesign, AuditLog } from '@/components/compliance';
import { EvaluationList, EvaluationDetail } from '@/components/evaluations';
import { useIdeas } from '@/hooks/useIdeas';
import { useProjects } from '@/hooks/useProjects';
import { useContributors } from '@/hooks/useContributors';
import { useAgents } from '@/hooks/useAgents';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useEvaluations } from '@/hooks/useEvaluations';
import { Idea, Contributor, AccessTier, ContributorEvaluation } from '@/types/karma';
import { useToast } from '@/hooks/use-toast';

type View = 'ideas' | 'projects' | 'specs' | 'tasks' | 'team' | 'agents' | 'agreements' | 'tiers' | 'guardrails' | 'mvp' | 'design' | 'integrations' | 'audit' | 'evaluations';
type IdeaView = 'list' | 'wizard' | 'detail';
type TeamView = 'list' | 'onboarding' | 'detail';
type EvaluationView = 'list' | 'detail';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('ideas');
  const [ideaView, setIdeaView] = useState<IdeaView>('list');
  const [teamView, setTeamView] = useState<TeamView>('list');
  const [evalView, setEvalView] = useState<EvaluationView>('list');
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [selectedContributor, setSelectedContributor] = useState<Contributor | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<ContributorEvaluation | null>(null);
  
  const { ideas, addIdea, updateIdeaStatus, deleteIdea } = useIdeas();
  const { projects } = useProjects();
  const { contributors, addContributor, sendAgreements, signAgreement, provisionAccess, revokeAccess, archiveContributor, getContributorAgreements } = useContributors();
  const { agents, getPendingActions, approveAction, rejectAction } = useAgents();
  const { logs, logActivity } = useAuditLog();
  const { evaluations, updateScore, acknowledgeRiskFlag, makeDecision, getContributorQuestionnaire } = useEvaluations();
  const { toast } = useToast();

  const handleNewIdea = () => {
    setCurrentView('ideas');
    setIdeaView('wizard');
  };

  const handleIdeaSubmit = (data: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'createdBy'>) => {
    addIdea({ ...data, status: 'draft', createdBy: 'current-user' });
    setIdeaView('list');
    toast({ title: 'Idea captured', description: 'Your idea has been saved as a draft.' });
  };

  const handleIdeaClick = (idea: Idea) => {
    setSelectedIdea(idea);
    setIdeaView('detail');
  };

  const handleContributorSubmit = (data: Parameters<typeof addContributor>[0]) => {
    addContributor(data);
    setTeamView('list');
    toast({ title: 'Contributor onboarded', description: 'Send agreements to complete onboarding.' });
  };

  const renderContent = () => {
    if (currentView === 'ideas') {
      if (ideaView === 'wizard') {
        return <IdeaIntakeWizard onSubmit={handleIdeaSubmit} onCancel={() => setIdeaView('list')} />;
      }
      if (ideaView === 'detail' && selectedIdea) {
        return (
          <IdeaDetail
            idea={selectedIdea}
            onBack={() => { setIdeaView('list'); setSelectedIdea(null); }}
            onStatusChange={(status) => { updateIdeaStatus(selectedIdea.id, status); setSelectedIdea({ ...selectedIdea, status }); }}
            onDelete={() => { deleteIdea(selectedIdea.id); setIdeaView('list'); setSelectedIdea(null); toast({ title: 'Idea deleted' }); }}
          />
        );
      }
      return (
        <>
          <PageHeader title="Ideas" description="Capture and evaluate new ideas" />
          <IdeaList ideas={ideas} onIdeaClick={handleIdeaClick} />
        </>
      );
    }

    if (currentView === 'projects') {
      return (
        <>
          <PageHeader title="Projects" description="Active projects and their status" />
          <ProjectList projects={projects} />
        </>
      );
    }

    if (currentView === 'team') {
      if (teamView === 'onboarding') {
        return <OnboardingWizard onSubmit={handleContributorSubmit} onCancel={() => setTeamView('list')} />;
      }
      if (teamView === 'detail' && selectedContributor) {
        const agreements = getContributorAgreements(selectedContributor.id);
        const refreshedContributor = contributors.find(c => c.id === selectedContributor.id) || selectedContributor;
        return (
          <ContributorDetail
            contributor={refreshedContributor}
            agreements={agreements}
            onBack={() => { setTeamView('list'); setSelectedContributor(null); }}
            onSendAgreements={() => { sendAgreements(refreshedContributor.id); toast({ title: 'Agreements sent' }); }}
            onSignAgreement={(id) => { signAgreement(id); toast({ title: 'Agreement signed' }); }}
            onProvisionAccess={() => { provisionAccess(refreshedContributor.id); toast({ title: 'Access provisioned' }); }}
            onRevokeAccess={(reason) => { revokeAccess(refreshedContributor.id, reason); toast({ title: 'Access revoked' }); }}
            onArchive={() => { archiveContributor(refreshedContributor.id); setTeamView('list'); toast({ title: 'Contributor archived' }); }}
          />
        );
      }
      return (
        <>
          <PageHeader title="Contributors" description="Manage contributor compliance and access" />
          <ContributorWelcome />
          <ContributorList 
            contributors={contributors} 
            onContributorClick={(c) => { setSelectedContributor(c); setTeamView('detail'); }}
            onAddContributor={() => setTeamView('onboarding')}
          />
        </>
      );
    }

    if (currentView === 'agents') {
      return (
        <>
          <PageHeader title="AI Agents" description="Monitor and approve AI agent actions" />
          <AgentsPanel 
            agents={agents} 
            pendingActions={getPendingActions()}
            onApprove={(id) => { approveAction(id, 'founder'); toast({ title: 'Action approved' }); }}
            onReject={(id) => { rejectAction(id); toast({ title: 'Action rejected' }); }}
          />
        </>
      );
    }

    if (currentView === 'guardrails') {
      return (
        <>
          <PageHeader title="Guardrails" description="Ethical principles and compliance rules" />
          <GuardrailsPanel />
        </>
      );
    }

    if (currentView === 'agreements') {
      return (
        <>
          <PageHeader title="Agreement Registry" description="Legal agreement templates and versions" />
          <AgreementRegistry />
        </>
      );
    }

    if (currentView === 'design') {
      return <OperationalDesign />;
    }

    if (currentView === 'audit') {
      return (
        <>
          <PageHeader title="Audit Log" description="Immutable record of all system actions" />
          <AuditLog logs={logs} />
        </>
      );
    }

    if (currentView === 'evaluations') {
      if (evalView === 'detail' && selectedEvaluation) {
        const questionnaire = getContributorQuestionnaire(selectedEvaluation.contributorId);
        const refreshedEval = evaluations.find(e => e.id === selectedEvaluation.id) || selectedEvaluation;
        return (
          <EvaluationDetail
            evaluation={refreshedEval}
            questionnaireResponses={questionnaire?.responses}
            onBack={() => { setEvalView('list'); setSelectedEvaluation(null); }}
            onUpdateScore={(cat, score, notes) => { updateScore(refreshedEval.id, cat, score, notes); }}
            onAcknowledgeFlag={(flagId) => { acknowledgeRiskFlag(refreshedEval.id, flagId); }}
            onMakeDecision={(decision, notes, cond, deadline) => { 
              makeDecision(refreshedEval.id, decision, notes, cond, deadline); 
              toast({ title: `Evaluation ${decision}` }); 
            }}
          />
        );
      }
      return (
        <>
          <PageHeader title="Evaluations" description="AI-assisted contributor evaluation rubric" />
          <EvaluationList 
            evaluations={evaluations} 
            contributors={contributors}
            onEvaluationClick={(e) => { setSelectedEvaluation(e); setEvalView('detail'); }}
          />
        </>
      );
    }

    return (
      <PageHeader title={currentView.charAt(0).toUpperCase() + currentView.slice(1)} description="Coming soon" />
    );
  };

  return (
    <AppLayout currentView={currentView} onViewChange={(v) => { setCurrentView(v as View); setIdeaView('list'); setTeamView('list'); setEvalView('list'); }} onNewIdea={handleNewIdea}>
      {renderContent()}
    </AppLayout>
  );
};

export default Index;
