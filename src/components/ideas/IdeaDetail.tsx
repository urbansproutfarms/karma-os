import { Idea, IdeaStatus } from '@/types/karma';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Edit2, Trash2, ArrowRight } from 'lucide-react';

interface IdeaDetailProps {
  idea: Idea;
  onBack: () => void;
  onStatusChange: (status: IdeaStatus) => void;
  onDelete: () => void;
}

const statusConfig: Record<IdeaStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  review: { label: 'In Review', className: 'bg-info/10 text-info' },
  build: { label: 'Building', className: 'bg-success/10 text-success' },
  pause: { label: 'Paused', className: 'bg-warning/10 text-warning' },
  kill: { label: 'Killed', className: 'bg-destructive/10 text-destructive' },
};

const statusFlow: IdeaStatus[] = ['draft', 'review', 'build', 'pause', 'kill'];

export function IdeaDetail({ idea, onBack, onStatusChange, onDelete }: IdeaDetailProps) {
  const status = statusConfig[idea.status];
  const currentStatusIndex = statusFlow.indexOf(idea.status);

  const sections = [
    { label: 'Problem', value: idea.problem },
    { label: 'Target User', value: idea.targetUser },
    { label: 'Why It Matters', value: idea.whyItMatters },
    { label: 'MVP Scope', value: idea.mvpScope },
    { label: 'Monetization', value: idea.monetization },
    { label: 'Ethical Risks', value: idea.ethicalRisks },
  ];

  return (
    <div className="max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="gap-2 -ml-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Ideas
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Title and Status */}
      <div className="mb-8">
        <div className="flex items-start gap-4 mb-2">
          <h1 className="text-3xl font-semibold text-foreground">{idea.title}</h1>
          <Badge variant="secondary" className={cn("shrink-0 mt-1", status.className)}>
            {status.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Created {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Status Actions */}
      <div className="mb-8 p-4 bg-card rounded-lg border">
        <p className="text-sm font-medium mb-3">Move to:</p>
        <div className="flex flex-wrap gap-2">
          {statusFlow.map((s, index) => (
            <Button
              key={s}
              variant={idea.status === s ? "default" : "outline"}
              size="sm"
              onClick={() => onStatusChange(s)}
              className={cn(
                idea.status === s && statusConfig[s].className
              )}
            >
              {statusConfig[s].label}
              {index > currentStatusIndex && idea.status !== s && (
                <ArrowRight className="h-3 w-3 ml-1" />
              )}
            </Button>
          ))}
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Content Sections */}
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.label}>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              {section.label}
            </h3>
            <p className="text-foreground whitespace-pre-wrap">{section.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
