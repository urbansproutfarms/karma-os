import { useState } from 'react';
import { Command, AppIntake, CommandTarget, CommandType } from '@/types/karma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Sparkles, CheckCircle2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CommandCardProps {
  selectedApp: AppIntake | null;
  selectedTarget: CommandTarget;
  selectedType: CommandType;
  currentCommand: Command | null;
  onGenerate: () => void;
  onMarkCompleted: () => void;
  onLogResult: (notes: string) => void;
}

const TARGET_LABELS: Record<CommandTarget, string> = {
  lovable: 'Lovable',
  github: 'GitHub / Claude Code',
  rork: 'Rork',
  vercel: 'Vercel',
};

const TYPE_LABELS: Record<CommandType, string> = {
  repair: 'Repair',
  pwa: 'PWA',
  deploy: 'Deploy',
  verify: 'Verify',
  sync: 'Sync',
};

export function CommandCard({
  selectedApp,
  selectedTarget,
  selectedType,
  currentCommand,
  onGenerate,
  onMarkCompleted,
  onLogResult,
}: CommandCardProps) {
  const [copied, setCopied] = useState(false);
  const [resultNotes, setResultNotes] = useState('');
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!currentCommand) return;
    
    try {
      await navigator.clipboard.writeText(currentCommand.generatedPrompt);
      setCopied(true);
      toast({ title: 'Command copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const handleLogResult = () => {
    onLogResult(resultNotes);
    setResultNotes('');
  };

  if (!selectedApp) {
    return (
      <Card className="flex-1">
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          Select an app to generate commands
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Generated Command
          </CardTitle>
          {currentCommand && (
            <Badge variant={currentCommand.status === 'completed' ? 'default' : 'secondary'}>
              {currentCommand.status}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Command Info */}
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline">{TARGET_LABELS[selectedTarget]}</Badge>
          <Badge variant="outline">{TYPE_LABELS[selectedType]}</Badge>
          <span className="text-muted-foreground">→</span>
          <span className="font-medium">{selectedApp.name}</span>
        </div>

        {/* Generate Button */}
        {!currentCommand && (
          <Button onClick={onGenerate} className="w-full gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Command
          </Button>
        )}

        {/* Command Display */}
        {currentCommand && (
          <>
            <div className="space-y-2">
              <div className="font-medium">{currentCommand.title}</div>
              <div className="text-sm text-muted-foreground">{currentCommand.objective}</div>
            </div>

            {/* Prompt Text Area */}
            <div className="relative">
              <Textarea
                value={currentCommand.generatedPrompt}
                readOnly
                className="min-h-[280px] font-mono text-xs resize-none"
              />
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 gap-1"
                onClick={handleCopy}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={onGenerate} variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Regenerate
              </Button>
              {currentCommand.status !== 'completed' && (
                <Button onClick={onMarkCompleted} variant="default" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Completed
                </Button>
              )}
            </div>

            {/* Result Notes */}
            <div className="pt-4 border-t space-y-2">
              <label className="text-sm font-medium">Log Result (optional)</label>
              <Textarea
                value={resultNotes}
                onChange={(e) => setResultNotes(e.target.value)}
                placeholder="Notes about what happened when you ran this command..."
                className="min-h-[80px]"
              />
              <Button 
                onClick={handleLogResult} 
                variant="outline" 
                size="sm"
                disabled={!resultNotes.trim()}
              >
                Save Notes
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
