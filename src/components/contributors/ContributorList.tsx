import { Contributor } from '@/types/karma';
import { ContributorCard } from './ContributorCard';
import { Button } from '@/components/ui/button';
import { UserPlus, Users } from 'lucide-react';

interface ContributorListProps {
  contributors: Contributor[];
  onContributorClick: (contributor: Contributor) => void;
  onAddContributor: () => void;
}

export function ContributorList({ contributors, onContributorClick, onAddContributor }: ContributorListProps) {
  const activeContributors = contributors.filter(c => c.workflowStage !== 'archived');
  const archivedContributors = contributors.filter(c => c.workflowStage === 'archived');

  if (contributors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No contributors yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Start by onboarding your first contributor. All contributors must sign NDA and IP Assignment before work begins.
        </p>
        <Button onClick={onAddContributor} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Onboard Contributor
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {activeContributors.length} active contributor{activeContributors.length !== 1 ? 's' : ''}
        </div>
        <Button onClick={onAddContributor} size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Onboard Contributor
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activeContributors.map((contributor) => (
          <ContributorCard
            key={contributor.id}
            contributor={contributor}
            onClick={() => onContributorClick(contributor)}
          />
        ))}
      </div>

      {archivedContributors.length > 0 && (
        <div className="pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Archived ({archivedContributors.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-60">
            {archivedContributors.map((contributor) => (
              <ContributorCard
                key={contributor.id}
                contributor={contributor}
                onClick={() => onContributorClick(contributor)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
