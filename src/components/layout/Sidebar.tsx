import { 
  Lightbulb, 
  FolderKanban, 
  FileText, 
  CheckSquare, 
  Users, 
  Link2, 
  Settings, 
  Shield,
  Plus,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onNewIdea: () => void;
}

const navigation = [
  { id: 'ideas', label: 'Ideas', icon: Lightbulb },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'specs', label: 'Specs', icon: FileText },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'integrations', label: 'Integrations', icon: Link2 },
  { id: 'guardrails', label: 'Guardrails', icon: Shield },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ currentView, onViewChange, onNewIdea }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleNavClick = (viewId: string) => {
    onViewChange(viewId);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-card border border-border shadow-sm"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-200 ease-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <span className="text-lg font-semibold text-sidebar-foreground tracking-tight">
            KarmaOS
          </span>
        </div>

        {/* New Idea Button */}
        <div className="p-4">
          <Button
            onClick={onNewIdea}
            className="w-full justify-start gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Idea
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-karma",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground">
            Clearpath Technologies
          </p>
        </div>
      </aside>
    </>
  );
}
