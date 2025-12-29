import { Idea } from '@/types/karma';
import { IdeaCard } from './IdeaCard';
import { Lightbulb } from 'lucide-react';

interface IdeaListProps {
  ideas: Idea[];
  onIdeaClick?: (idea: Idea) => void;
}

export function IdeaList({ ideas, onIdeaClick }: IdeaListProps) {
  if (ideas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Lightbulb className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No ideas yet</h3>
        <p className="text-muted-foreground max-w-sm">
          Start by capturing your first idea. Use the "New Idea" button to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ideas.map((idea) => (
        <IdeaCard 
          key={idea.id} 
          idea={idea} 
          onClick={() => onIdeaClick?.(idea)}
        />
      ))}
    </div>
  );
}
