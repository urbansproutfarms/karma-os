import { EvaluationTag, ScoringTag, SCORING_TAGS, FitTag, RiskTag, ReadinessTag } from '@/types/karma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tag, 
  Bot, 
  CheckCircle2, 
  X,
  Plus,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ScoringTagsProps {
  tags: EvaluationTag[];
  isFinalized: boolean;
  onConfirmTag: (tag: ScoringTag) => void;
  onRemoveTag: (tag: ScoringTag) => void;
}

const tagColors: Record<string, string> = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  destructive: 'bg-destructive/10 text-destructive border-destructive/20',
  info: 'bg-info/10 text-info border-info/20',
  muted: 'bg-muted text-muted-foreground border-border',
};

function getTagConfig(tag: ScoringTag): { label: string; description: string; color: string } {
  if (tag.startsWith('fit:')) {
    return SCORING_TAGS.fit[tag as FitTag];
  } else if (tag.startsWith('risk:')) {
    return SCORING_TAGS.risk[tag as RiskTag];
  } else {
    return SCORING_TAGS.readiness[tag as ReadinessTag];
  }
}

function getTagCategory(tag: ScoringTag): 'fit' | 'risk' | 'readiness' {
  if (tag.startsWith('fit:')) return 'fit';
  if (tag.startsWith('risk:')) return 'risk';
  return 'readiness';
}

export function ScoringTags({ tags, isFinalized, onConfirmTag, onRemoveTag }: ScoringTagsProps) {
  const fitTags = tags.filter(t => t.tag.startsWith('fit:'));
  const riskTags = tags.filter(t => t.tag.startsWith('risk:'));
  const readinessTags = tags.filter(t => t.tag.startsWith('ready:'));

  const allUnconfirmedCount = tags.filter(t => !t.confirmedByFounder).length;
  const hasReadyToSign = tags.some(t => t.tag === 'ready:sign' && t.confirmedByFounder);

  const renderTagGroup = (title: string, groupTags: EvaluationTag[], availableTags: Record<string, { label: string; description: string; color: string }>) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
        {!isFinalized && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <Plus className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Add {title} Tag</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(availableTags).map(([tagKey, config]) => (
                <DropdownMenuItem 
                  key={tagKey}
                  onClick={() => onConfirmTag(tagKey as ScoringTag)}
                  disabled={groupTags.some(t => t.tag === tagKey)}
                >
                  <span className={cn("w-2 h-2 rounded-full mr-2", 
                    config.color === 'success' ? 'bg-success' :
                    config.color === 'warning' ? 'bg-warning' :
                    config.color === 'destructive' ? 'bg-destructive' :
                    config.color === 'info' ? 'bg-info' : 'bg-muted-foreground'
                  )} />
                  {config.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {groupTags.map(evalTag => {
          const config = getTagConfig(evalTag.tag);
          const colorClass = tagColors[config.color] || tagColors.muted;
          
          return (
            <div key={evalTag.tag} className="relative group">
              <Badge 
                variant="outline"
                className={cn(
                  "gap-1 pr-1 transition-all",
                  colorClass,
                  !evalTag.confirmedByFounder && "border-dashed opacity-70"
                )}
              >
                {evalTag.aiSuggested && !evalTag.confirmedByFounder && (
                  <Bot className="h-3 w-3" />
                )}
                {evalTag.confirmedByFounder && (
                  <CheckCircle2 className="h-3 w-3" />
                )}
                <span>{config.label}</span>
                
                {!isFinalized && !evalTag.confirmedByFounder && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 hover:bg-success/20"
                    onClick={() => onConfirmTag(evalTag.tag)}
                    title="Confirm tag"
                  >
                    <CheckCircle2 className="h-3 w-3 text-success" />
                  </Button>
                )}
                
                {!isFinalized && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-0.5 hover:bg-destructive/20"
                    onClick={() => onRemoveTag(evalTag.tag)}
                    title="Remove tag"
                  >
                    <X className="h-3 w-3 text-destructive" />
                  </Button>
                )}
              </Badge>
            </div>
          );
        })}
        {groupTags.length === 0 && (
          <span className="text-xs text-muted-foreground italic">No tags</span>
        )}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Tag className="h-4 w-4 text-primary" />
          Scoring Tags
        </CardTitle>
        <CardDescription>
          {allUnconfirmedCount > 0 
            ? `${allUnconfirmedCount} AI-suggested tags awaiting confirmation`
            : 'All tags confirmed by founder'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Workflow Gating Info */}
        {!hasReadyToSign && (
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs flex items-center gap-2">
            <Shield className="h-3 w-3 text-amber-500" />
            <span className="text-muted-foreground">
              <span className="font-medium text-amber-600 dark:text-amber-400">ready:sign</span> tag must be confirmed to proceed to agreements
            </span>
          </div>
        )}
        
        {hasReadyToSign && (
          <div className="p-2 bg-success/10 border border-success/20 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="h-3 w-3 text-success" />
            <span className="text-muted-foreground">
              Contributor can proceed to agreement signing
            </span>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {renderTagGroup('Fit', fitTags, SCORING_TAGS.fit)}
          {renderTagGroup('Risk', riskTags, SCORING_TAGS.risk)}
          {renderTagGroup('Readiness', readinessTags, SCORING_TAGS.readiness)}
        </div>

        {!isFinalized && allUnconfirmedCount > 0 && (
          <div className="flex gap-2 pt-2 border-t">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => tags.filter(t => !t.confirmedByFounder).forEach(t => onConfirmTag(t.tag))}
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Confirm All AI Tags
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
