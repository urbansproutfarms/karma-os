import { AIAgent, AgentAction } from '@/types/karma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bot, CheckCircle, XCircle, Clock, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentsPanelProps {
  agents: AIAgent[];
  pendingActions: AgentAction[];
  onApprove: (actionId: string) => void;
  onReject: (actionId: string) => void;
}

const agentIcons: Record<string, string> = {
  systems_architect: '🏗️',
  product_spec: '📋',
  code_builder: '💻',
  risk_integrity: '🛡️',
};

export function AgentsPanel({ agents, pendingActions, onApprove, onReject }: AgentsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      {pendingActions.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              Pending Approvals ({pendingActions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingActions.map(action => (
              <div key={action.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <div>
                  <p className="font-medium">{action.action}</p>
                  <p className="text-sm text-muted-foreground">From: {action.agentId.replace('_', ' ')}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onReject(action.id)}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={() => onApprove(action.id)}>
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Agents Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {agents.map(agent => (
          <Card key={agent.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="text-2xl">{agentIcons[agent.id]}</div>
                <div>
                  <CardTitle className="text-base">{agent.name}</CardTitle>
                  <CardDescription className="text-xs">{agent.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Allowed Actions</p>
                <div className="flex flex-wrap gap-1">
                  {agent.allowedActions.slice(0, 3).map(action => (
                    <Badge key={action} variant="secondary" className="text-xs">{action}</Badge>
                  ))}
                  {agent.allowedActions.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{agent.allowedActions.length - 3}</Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-destructive mb-2">Blocked Actions</p>
                <div className="flex flex-wrap gap-1">
                  {agent.blockedActions.slice(0, 2).map(action => (
                    <Badge key={action} variant="outline" className="text-xs text-destructive border-destructive/30">{action}</Badge>
                  ))}
                  {agent.blockedActions.length > 2 && (
                    <Badge variant="outline" className="text-xs">+{agent.blockedActions.length - 2}</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Non-Negotiable Rules */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            AI Agent Guardrails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><XCircle className="h-4 w-4 text-destructive" /> Agents may never grant access</li>
            <li className="flex items-center gap-2"><XCircle className="h-4 w-4 text-destructive" /> Agents may never approve agreements</li>
            <li className="flex items-center gap-2"><XCircle className="h-4 w-4 text-destructive" /> Agents may never publish code</li>
            <li className="flex items-center gap-2"><XCircle className="h-4 w-4 text-destructive" /> Agents may never make final decisions</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
