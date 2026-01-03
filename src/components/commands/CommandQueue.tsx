import { Command, AppIntake, CommandType } from '@/types/karma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Rocket, Lightbulb, CheckCircle2, Copy, SkipForward } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommandQueueProps {
  commands: Command[];
  apps: AppIntake[];
  suggestNextCommand: (app: AppIntake) => { type: CommandType; reason: string } | null;
  onSelectSuggestion: (appId: string, type: CommandType) => void;
}

const STATUS_STYLES: Record<Command['status'], { variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: React.ReactNode }> = {
  draft: { variant: 'outline', icon: <Clock className="h-3 w-3" /> },
  copied: { variant: 'secondary', icon: <Copy className="h-3 w-3" /> },
  completed: { variant: 'default', icon: <CheckCircle2 className="h-3 w-3" /> },
  skipped: { variant: 'destructive', icon: <SkipForward className="h-3 w-3" /> },
};

const TYPE_LABELS: Record<CommandType, string> = {
  repair: 'Repair',
  pwa: 'PWA',
  deploy: 'Deploy',
  verify: 'Verify',
  sync: 'Sync',
};

export function CommandQueue({ commands, apps, suggestNextCommand, onSelectSuggestion }: CommandQueueProps) {
  // Get apps sorted by launch readiness
  const sortedApps = [...apps].sort((a, b) => {
    const order = { green: 0, yellow: 1, red: 2 };
    return (order[a.trafficLight || 'red'] || 2) - (order[b.trafficLight || 'red'] || 2);
  });

  // Generate suggestions for closest-to-launch apps
  const suggestions = sortedApps
    .filter(app => app.trafficLight !== 'red')
    .map(app => {
      const suggestion = suggestNextCommand(app);
      return suggestion ? { app, ...suggestion } : null;
    })
    .filter(Boolean)
    .slice(0, 5);

  // Group commands by app
  const commandsByApp = commands.reduce((acc, cmd) => {
    if (!acc[cmd.appId]) acc[cmd.appId] = [];
    acc[cmd.appId].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  return (
    <Card className="h-fit">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Command Queue</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="suggestions" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="suggestions" className="text-xs">
              <Rocket className="h-3 w-3 mr-1" />
              Closest to Launch
            </TabsTrigger>
            <TabsTrigger value="recent" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Recent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="mt-3">
            <ScrollArea className="h-[400px] pr-2">
              {suggestions.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No apps ready for launch commands
                </div>
              ) : (
                <div className="space-y-2">
                  {suggestions.map((s) => s && (
                    <div 
                      key={s.app.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span 
                            className={`w-2 h-2 rounded-full ${
                              s.app.trafficLight === 'green' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                          />
                          <span className="font-medium text-sm">{s.app.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {TYPE_LABELS[s.type]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        <Lightbulb className="h-3 w-3 inline mr-1" />
                        {s.reason}
                      </p>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="w-full text-xs"
                        onClick={() => onSelectSuggestion(s.app.id, s.type)}
                      >
                        Generate Command
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="recent" className="mt-3">
            <ScrollArea className="h-[400px] pr-2">
              {commands.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No commands generated yet
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(commandsByApp).map(([appId, cmds]) => {
                    const app = apps.find(a => a.id === appId);
                    return (
                      <div key={appId} className="space-y-1">
                        <div className="text-xs font-medium text-muted-foreground px-1">
                          {app?.name || 'Unknown App'}
                        </div>
                        {cmds.slice(0, 3).map(cmd => {
                          const style = STATUS_STYLES[cmd.status];
                          return (
                            <div 
                              key={cmd.id}
                              className="p-2 border rounded text-xs hover:bg-muted/50"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium truncate flex-1">{cmd.title}</span>
                                <Badge variant={style.variant} className="text-xs ml-2 gap-1">
                                  {style.icon}
                                  {cmd.status}
                                </Badge>
                              </div>
                              <div className="text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(cmd.createdAt), { addSuffix: true })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
