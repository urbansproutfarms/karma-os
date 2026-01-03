import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Cpu, FilePlus, Search, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SystemBuilderOSPage() {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Create System',
      description: 'Define a new system architecture or module',
      icon: FilePlus,
    },
    {
      title: 'Audit System',
      description: 'Review compliance, structure, and dependencies',
      icon: Search,
    },
    {
      title: 'Generate Prompt',
      description: 'Create a repair or build prompt from context',
      icon: MessageSquare,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Cpu className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">SystemBuilderOS</h1>
              <p className="text-sm text-muted-foreground">
                Internal system orchestration and governance toolkit
              </p>
            </div>
          </div>
        </div>

        {/* Info */}
        <Card className="mb-6 border-border/50">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              This is SystemBuilderOS inside KarmaOS. Use the tools below to create, audit, or generate prompts for system components.
            </p>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.title}
                className="cursor-pointer hover:border-primary/50 transition-colors border-border/50"
              >
                <CardHeader>
                  <div className="p-2 rounded-lg bg-primary/10 w-fit mb-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
