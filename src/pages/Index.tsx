import { useState } from 'react';
import { AppLayout, PageHeader } from '@/components/layout';
import { IdeaIntakeWizard, IdeaList, IdeaDetail } from '@/components/ideas';
import { ProjectList } from '@/components/projects';
import { GuardrailsPanel } from '@/components/guardrails';
import { useIdeas } from '@/hooks/useIdeas';
import { useProjects } from '@/hooks/useProjects';
import { Idea } from '@/types/karma';
import { useToast } from '@/hooks/use-toast';

type View = 'ideas' | 'projects' | 'specs' | 'tasks' | 'team' | 'integrations' | 'guardrails' | 'settings';
type IdeaView = 'list' | 'wizard' | 'detail';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('ideas');
  const [ideaView, setIdeaView] = useState<IdeaView>('list');
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  
  const { ideas, addIdea, updateIdeaStatus, deleteIdea } = useIdeas();
  const { projects } = useProjects();
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

    if (currentView === 'guardrails') {
      return (
        <>
          <PageHeader title="Guardrails" description="Ethical principles and process rules" />
          <GuardrailsPanel />
        </>
      );
    }

    return (
      <PageHeader title={currentView.charAt(0).toUpperCase() + currentView.slice(1)} description="Coming soon" />
    );
  };

  return (
    <AppLayout currentView={currentView} onViewChange={(v) => { setCurrentView(v as View); setIdeaView('list'); }} onNewIdea={handleNewIdea}>
      {renderContent()}
    </AppLayout>
  );
};

export default Index;
