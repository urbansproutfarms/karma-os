import { Idea, IdeaStatus } from '@/types/karma';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface IdeaCardProps {
  idea: Idea;
  onClick?: () => void;
}

const statusConfig: Record<IdeaStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  review: { label: 'In Review', className: 'bg-info/10 text-info' },
  build: { label: 'Building', className: 'bg-success/10 text-success' },
  pause: { label: 'Paused', className: 'bg-warning/10 text-warning' },
  kill: { label: 'Killed', className: 'bg-destructive/10 text-destructive' },
};

export function IdeaCard({ idea, onClick }: IdeaCardProps) {
  const status = statusConfig[idea.status];

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
            {idea.title}
          </CardTitle>
          <Badge variant="secondary" className={cn("shrink-0", status.className)}>
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {idea.problem}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            Created {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
