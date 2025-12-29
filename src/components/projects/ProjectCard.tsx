import { Project, ProjectStatus } from '@/types/karma';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Github, MessageSquare } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-success/10 text-success' },
  paused: { label: 'Paused', className: 'bg-warning/10 text-warning' },
  completed: { label: 'Completed', className: 'bg-primary/10 text-primary' },
  archived: { label: 'Archived', className: 'bg-muted text-muted-foreground' },
};

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const status = statusConfig[project.status];

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-karma hover:shadow-md hover:border-primary/20",
        "group"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg font-medium group-hover:text-primary transition-colors">
            {project.title}
          </CardTitle>
          <Badge variant="secondary" className={cn("shrink-0", status.className)}>
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {project.description}
        </p>
        
        {/* Integration links */}
        <div className="flex items-center gap-3 mb-4">
          {project.notionUrl && (
            <a 
              href={project.notionUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          {project.githubUrl && (
            <a 
              href={project.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Github className="h-4 w-4" />
            </a>
          )}
          {project.slackChannel && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <MessageSquare className="h-3 w-3" />
              {project.slackChannel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            Started {formatDistanceToNow(new Date(project.startDate), { addSuffix: true })}
          </span>
          {project.teamMembers.length > 0 && (
            <span>{project.teamMembers.length} team members</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
