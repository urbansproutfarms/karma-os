import { Project } from '@/types/karma';
import { ProjectCard } from './ProjectCard';
import { FolderKanban } from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
}

export function ProjectList({ projects, onProjectClick }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FolderKanban className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No projects yet</h3>
        <p className="text-muted-foreground max-w-sm">
          Projects are created from approved ideas. Start by creating and reviewing ideas.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project} 
          onClick={() => onProjectClick?.(project)}
        />
      ))}
    </div>
  );
}
