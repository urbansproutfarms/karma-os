import { useState, useEffect, useCallback } from 'react';
import { AIAgent, AgentAction, AIAgentType } from '@/types/karma';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/lib/storage';

const defaultAgents: AIAgent[] = [
  {
    id: 'systems_architect',
    name: 'Systems Architect Agent',
    description: 'Designs system architecture, data models, and technical infrastructure.',
    allowedActions: [
      'Generate architecture diagrams',
      'Propose data models',
      'Review technical specs',
      'Suggest integrations',
      'Identify technical risks',
    ],
    blockedActions: [
      'Grant access to systems',
      'Approve agreements',
      'Deploy to production',
      'Modify security settings',
      'Delete data',
    ],
    requiresApproval: [
      'Architecture changes',
      'New integrations',
      'Database schema changes',
    ],
    isActive: true,
  },
  {
    id: 'product_spec',
    name: 'Product Spec Agent',
    description: 'Generates PRDs, user stories, and product specifications from ideas.',
    allowedActions: [
      'Generate PRD documents',
      'Create user stories',
      'Define MVP scope',
      'Identify non-goals',
      'Create 30-day build plans',
    ],
    blockedActions: [
      'Approve specs for development',
      'Assign tasks to contributors',
      'Make final product decisions',
      'Publish to external systems',
    ],
    requiresApproval: [
      'PRD finalization',
      'Scope changes',
      'Timeline commitments',
    ],
    isActive: true,
  },
  {
    id: 'code_builder',
    name: 'Code Builder Agent',
    description: 'Implements features based on approved specs and reviews code quality.',
    allowedActions: [
      'Generate code from specs',
      'Review code quality',
      'Suggest improvements',
      'Create tests',
      'Document code',
    ],
    blockedActions: [
      'Publish code to production',
      'Merge to main branch',
      'Modify security configurations',
      'Access production data',
      'Create API keys',
    ],
    requiresApproval: [
      'Code merges',
      'Architecture deviations',
      'New dependencies',
    ],
    isActive: true,
  },
  {
    id: 'risk_integrity',
    name: 'Risk & Integrity Agent',
    description: 'Evaluates ethical risks, compliance issues, and maintains integrity checks.',
    allowedActions: [
      'Evaluate ethical risks',
      'Check compliance status',
      'Flag potential issues',
      'Generate risk reports',
      'Review contributor status',
    ],
    blockedActions: [
      'Override guardrails',
      'Approve exceptions',
      'Grant access',
      'Modify compliance requirements',
      'Archive audit logs',
    ],
    requiresApproval: [
      'Risk mitigation plans',
      'Exception requests',
      'Policy recommendations',
    ],
    isActive: true,
  },
];

export function useAgents() {
  const [agents] = useState<AIAgent[]>(defaultAgents);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStorageItem<AgentAction[]>(STORAGE_KEYS.AGENT_ACTIONS);
    setActions(stored || []);
    setIsLoading(false);
  }, []);

  const saveActions = useCallback((updated: AgentAction[]) => {
    setActions(updated);
    setStorageItem(STORAGE_KEYS.AGENT_ACTIONS, updated);
  }, []);

  const requestAction = useCallback((
    agentId: AIAgentType,
    action: string,
    input?: Record<string, unknown>
  ): AgentAction => {
    const agent = agents.find(a => a.id === agentId);
    const requiresApproval = agent?.requiresApproval.some(r => 
      action.toLowerCase().includes(r.toLowerCase())
    ) ?? false;

    const newAction: AgentAction = {
      id: crypto.randomUUID(),
      agentId,
      action,
      input,
      status: requiresApproval ? 'pending' : 'completed',
      requiresApproval,
      createdAt: new Date().toISOString(),
      completedAt: requiresApproval ? undefined : new Date().toISOString(),
    };

    saveActions([...actions, newAction]);
    return newAction;
  }, [agents, actions, saveActions]);

  const approveAction = useCallback((actionId: string, approvedBy: string) => {
    const now = new Date().toISOString();
    const updated = actions.map(a => 
      a.id === actionId ? { 
        ...a, 
        status: 'approved' as const,
        approvedBy,
        approvedAt: now,
        completedAt: now,
      } : a
    );
    saveActions(updated);
  }, [actions, saveActions]);

  const rejectAction = useCallback((actionId: string) => {
    const updated = actions.map(a => 
      a.id === actionId ? { ...a, status: 'rejected' as const } : a
    );
    saveActions(updated);
  }, [actions, saveActions]);

  const getPendingActions = useCallback((): AgentAction[] => {
    return actions.filter(a => a.status === 'pending');
  }, [actions]);

  const getAgentActions = useCallback((agentId: AIAgentType): AgentAction[] => {
    return actions.filter(a => a.agentId === agentId);
  }, [actions]);

  return {
    agents,
    actions,
    isLoading,
    requestAction,
    approveAction,
    rejectAction,
    getPendingActions,
    getAgentActions,
  };
}
