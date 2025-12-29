// KarmaOS Core Types

export type UserRole = 'founder' | 'admin' | 'builder' | 'ops' | 'viewer';

export type IdeaStatus = 'draft' | 'review' | 'build' | 'pause' | 'kill';

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Idea {
  id: string;
  title: string;
  problem: string;
  targetUser: string;
  whyItMatters: string;
  mvpScope: string;
  monetization: string;
  ethicalRisks: string;
  status: IdeaStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Project {
  id: string;
  ideaId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  targetDate?: string;
  teamMembers: string[];
  notionUrl?: string;
  githubUrl?: string;
  slackChannel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Spec {
  id: string;
  projectId: string;
  title: string;
  prd: string;
  mvpScope: string;
  nonGoals: string;
  userStories: string[];
  risksChecklist: string[];
  buildPlan: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  assignee?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Guardrail {
  id: string;
  rule: string;
  description: string;
  category: 'ethics' | 'process' | 'financial' | 'scope';
  isActive: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: 'idea' | 'project' | 'spec' | 'task';
  entityId: string;
  userId: string;
  timestamp: string;
  details?: Record<string, unknown>;
}
