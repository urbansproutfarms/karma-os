// KarmaOS Core Types

export type UserRole = 'founder' | 'admin' | 'builder' | 'ops' | 'viewer';

export type IdeaStatus = 'draft' | 'review' | 'build' | 'pause' | 'kill';

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';

// Contributor Types
export type ContributorRoleType = 'product_ops' | 'technical' | 'design_ux';
export type EngagementType = 'contract' | 'trial' | 'unpaid';
export type AgreementStatus = 'not_sent' | 'sent' | 'signed' | 'revoked' | 'expired';
export type AccessLevel = 'none' | 'limited' | 'active' | 'revoked';
export type WorkflowStage = 'intake' | 'documents' | 'signing' | 'provisioning' | 'ready' | 'working' | 'exit' | 'archived';

// AI Agent Types
export type AIAgentType = 'systems_architect' | 'product_spec' | 'code_builder' | 'risk_integrity';

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
  specId?: string;
  title: string;
  description?: string;
  scope?: string;
  assignee?: string;
  ownerId?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  requiresCompliance: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Guardrail {
  id: string;
  rule: string;
  description: string;
  category: 'ethics' | 'process' | 'financial' | 'scope' | 'compliance' | 'access';
  isActive: boolean;
  isSystemRule: boolean;
}

// Contributor & Compliance Types
export interface Contributor {
  id: string;
  legalName: string;
  email: string;
  roleType: ContributorRoleType;
  engagementType: EngagementType;
  ndaStatus: AgreementStatus;
  ipAssignmentStatus: AgreementStatus;
  ndaSignedDate?: string;
  ipSignedDate?: string;
  agreementVersion: string;
  accessLevel: AccessLevel;
  workflowStage: WorkflowStage;
  portfolioUrl?: string;
  resumeUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  exitReason?: string;
}

export interface Agreement {
  id: string;
  contributorId: string;
  type: 'nda' | 'ip_assignment';
  version: string;
  status: AgreementStatus;
  sentAt?: string;
  signedAt?: string;
  revokedAt?: string;
  expiresAt?: string;
  documentUrl?: string;
  signatureData?: string;
}

export interface AIAgent {
  id: AIAgentType;
  name: string;
  description: string;
  allowedActions: string[];
  blockedActions: string[];
  requiresApproval: string[];
  isActive: boolean;
}

export interface AgentAction {
  id: string;
  agentId: AIAgentType;
  action: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  completedAt?: string;
}

export interface OnboardingChecklist {
  contributorId: string;
  intakeCompleted: boolean;
  documentsUploaded: boolean;
  ndaSigned: boolean;
  ipAssignmentSigned: boolean;
  accessProvisioned: boolean;
  readyToWork: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: 'idea' | 'project' | 'spec' | 'task' | 'contributor' | 'agreement' | 'agent_action';
  entityId: string;
  userId: string;
  timestamp: string;
  details?: Record<string, unknown>;
}
