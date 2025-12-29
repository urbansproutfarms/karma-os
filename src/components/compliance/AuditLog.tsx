import { ActivityLog } from '@/types/karma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  User, 
  FileText, 
  Bot, 
  FolderKanban, 
  Shield,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AuditLogProps {
  logs: ActivityLog[];
}

const entityIcons: Record<string, React.ReactNode> = {
  contributor: <User className="h-4 w-4" />,
  agreement: <FileText className="h-4 w-4" />,
  agent_action: <Bot className="h-4 w-4" />,
  project: <FolderKanban className="h-4 w-4" />,
  idea: <Shield className="h-4 w-4" />,
  spec: <FileText className="h-4 w-4" />,
  task: <Activity className="h-4 w-4" />,
};

const actionColors: Record<string, string> = {
  created: 'bg-success/10 text-success',
  updated: 'bg-info/10 text-info',
  signed: 'bg-success/10 text-success',
  sent: 'bg-warning/10 text-warning',
  revoked: 'bg-destructive/10 text-destructive',
  archived: 'bg-muted text-muted-foreground',
  provisioned: 'bg-primary/10 text-primary',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
};

export function AuditLog({ logs }: AuditLogProps) {
  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No activity recorded yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Actions will be logged here for audit purposes
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-5 w-5 text-primary" />
          Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    {entityIcons[log.entityType] || <Activity className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{log.action}</span>
                      <Badge variant="outline" className="text-xs">
                        {log.entityType}
                      </Badge>
                      {getActionBadge(log.action)}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</span>
                      <span>•</span>
                      <span>by {log.userId}</span>
                    </div>
                    {log.details && (
                      <div className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function getActionBadge(action: string): React.ReactNode {
  const lowerAction = action.toLowerCase();
  for (const [key, className] of Object.entries(actionColors)) {
    if (lowerAction.includes(key)) {
      return <Badge className={`text-xs ${className}`}>{key}</Badge>;
    }
  }
  return null;
}
