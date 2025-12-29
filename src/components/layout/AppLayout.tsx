import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  onNewIdea: () => void;
}

export function AppLayout({ children, currentView, onViewChange, onNewIdea }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar 
        currentView={currentView} 
        onViewChange={onViewChange}
        onNewIdea={onNewIdea}
      />
      <main className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <div className="flex-1 p-6 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
