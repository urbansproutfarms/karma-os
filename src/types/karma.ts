// KarmaOS Core Types

export type UserRole = 'founder' | 'admin' | 'builder' | 'ops' | 'viewer';

export type IdeaStatus = 'draft' | 'review' | 'build' | 'pause' | 'kill';

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';

// Contributor Types
export type ContributorRoleType = 'product_ops' | 'technical' | 'design_ux';
export type EngagementType = 'contract' | 'trial' | 'unpaid';
export type AgreementStatus = 'not_sent' | 'sent' | 'pending_signature' | 'signed' | 'revoked' | 'expired';
export type WorkflowStage = 'intake' | 'evaluation' | 'documents' | 'signing' | 'provisioning' | 'ready' | 'working' | 'exit' | 'archived';

// Evaluation Types
export type EvaluationDecision = 'pending' | 'approved' | 'conditional' | 'declined' | 'paused';
export type RubricCategory = 'skills_alignment' | 'communication' | 'availability' | 'portfolio_quality' | 'culture_fit' | 'risk_assessment';

// Scoring Tags
export type FitTag = 'fit:strong' | 'fit:conditional' | 'fit:weak';
export type RiskTag = 'risk:none' | 'risk:ip' | 'risk:scope' | 'risk:reliability' | 'risk:communication';
export type ReadinessTag = 'ready:sign' | 'ready:clarify' | 'ready:pause' | 'ready:decline';
export type ScoringTag = FitTag | RiskTag | ReadinessTag;

export const SCORING_TAGS = {
  fit: {
    'fit:strong': { label: 'Strong Fit', description: 'Excellent match for role requirements', color: 'success' },
    'fit:conditional': { label: 'Conditional Fit', description: 'Good potential with specific caveats', color: 'warning' },
    'fit:weak': { label: 'Weak Fit', description: 'Significant gaps in role alignment', color: 'destructive' },
  },
  risk: {
    'risk:none': { label: 'No Risk', description: 'No concerns identified', color: 'success' },
    'risk:ip': { label: 'IP Risk', description: 'Potential intellectual property concerns', color: 'destructive' },
    'risk:scope': { label: 'Scope Risk', description: 'May struggle with scope boundaries', color: 'warning' },
    'risk:reliability': { label: 'Reliability Risk', description: 'Availability or commitment concerns', color: 'warning' },
    'risk:communication': { label: 'Communication Risk', description: 'Response quality or clarity concerns', color: 'warning' },
  },
  readiness: {
    'ready:sign': { label: 'Ready to Sign', description: 'Proceed to agreement signing', color: 'success' },
    'ready:clarify': { label: 'Needs Clarification', description: 'Follow-up questions required', color: 'info' },
    'ready:pause': { label: 'Paused', description: 'Hold for future consideration', color: 'muted' },
    'ready:decline': { label: 'Decline', description: 'Do not proceed', color: 'destructive' },
  },
} as const;

export interface EvaluationTag {
  tag: ScoringTag;
  aiSuggested: boolean;
  confirmedByFounder: boolean;
  confirmedAt?: string;
  notes?: string;
}

export const RUBRIC_CATEGORIES: Record<RubricCategory, { label: string; description: string; weight: number }> = {
  skills_alignment: { label: 'Skills Alignment', description: 'Match between stated skills and role requirements', weight: 25 },
  communication: { label: 'Communication', description: 'Clarity, responsiveness, and professionalism in responses', weight: 20 },
  availability: { label: 'Availability', description: 'Alignment with project timelines and commitment level', weight: 15 },
  portfolio_quality: { label: 'Portfolio Quality', description: 'Quality and relevance of previous work samples', weight: 20 },
  culture_fit: { label: 'Culture Fit', description: 'Alignment with Clearpath values and working style', weight: 10 },
  risk_assessment: { label: 'Risk Assessment', description: 'Potential red flags or concerns identified', weight: 10 },
};

// Access Tier Types (0-3)
export type AccessTier = 0 | 1 | 2 | 3;
export const ACCESS_TIER_NAMES: Record<AccessTier, string> = {
  0: 'No Access',
  1: 'Limited Contributor',
  2: 'Scoped Technical',
  3: 'Ops / Coordination',
};

// AI Agent Types
export type AIAgentType = 'systems_architect' | 'product_spec' | 'code_builder' | 'risk_integrity';

// E-Signature Provider Types (abstracted)
export type ESignatureProvider = 'docusign' | 'dropbox_sign' | 'signwell' | 'other';
export type AgreementTemplateStatus = 'active' | 'deprecated' | 'draft';

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
  ndaTemplateId?: string;
  ipTemplateId?: string;
  agreementVersion: string;
  accessTier: AccessTier;
  workflowStage: WorkflowStage;
  portfolioUrl?: string;
  resumeUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  exitReason?: string;
}

// Agreement Template (Versioned Legal Documents)
export interface AgreementTemplate {
  id: string;
  type: 'nda' | 'ip_assignment' | 'combined';
  version: string;
  name: string;
  effectiveDate: string;
  status: AgreementTemplateStatus;
  applicableRoles: ContributorRoleType[];
  changeNotes: string;
  createdAt: string;
  updatedAt: string;
}

// Signed Agreement (E-Signature Record)
export interface Agreement {
  id: string;
  contributorId: string;
  templateId: string;
  type: 'nda' | 'ip_assignment';
  version: string;
  status: AgreementStatus;
  // E-Signature fields (provider-agnostic)
  externalDocumentId?: string;
  externalProvider?: ESignatureProvider;
  signerEmail?: string;
  signerName?: string;
  signerIpAddress?: string;
  sentAt?: string;
  viewedAt?: string;
  signedAt?: string;
  revokedAt?: string;
  expiresAt?: string;
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

// App Governance Types
export type AppOrigin = 'lovable' | 'rork' | 'google_ai_studio' | 'chat' | 'manual' | 'other';
export type AppStatus = 'unreviewed' | 'in_review' | 'approved' | 'paused' | 'killed';

// Vercel/PWA Readiness Checklist
export interface VercelReadinessChecklist {
  pwaManifestPresent: boolean;
  serviceWorkerRegistered: boolean;
  noFalseClaimsOrLegalAmbiguity: boolean;
  clearInformationalLanguage: boolean;
  errorFreeLoad: boolean;
  readyForVercelDeployment: boolean;
}

// App Lifecycle Type
export type AppLifecycle = 'external' | 'internal-only';

export interface AppIntake {
  id: string;
  name: string;
  alias?: string; // Alternative name (e.g., "Farmers Almanac" for "New Farmers Almanac")
  origin: AppOrigin;
  category?: string; // e.g., "Informational / Utility (Gardening/Farming)"
  description: string;
  intendedUser: string;
  mvpScope: string;
  nonGoals: string;
  riskNotes: string;
  status: AppStatus;
  isActive: boolean; // Only ONE app can be active at a time
  // Governance Classification
  isInternal?: boolean; // True = internal module, not a launchable app
  lifecycle?: AppLifecycle; // 'external' = launchable, 'internal-only' = not launchable
  // IP & Ownership
  ownerConfirmed: boolean;
  ownerEntity: string; // Default: "Clearpath Technologies LLC"
  repoUrl?: string;
  assetOwnershipConfirmed: boolean;
  // Agent Review
  agentReviewComplete: boolean;
  productSpecReview?: AppAgentReview;
  riskIntegrityReview?: AppAgentReview;
  // Founder Decision
  founderDecision?: 'approve' | 'pause' | 'kill';
  founderDecisionNotes?: string;
  founderDecisionAt?: string;
  founderDecisionBy?: string;
  // Launch Readiness
  trafficLight?: 'green' | 'yellow' | 'red';
  vercelReadiness?: VercelReadinessChecklist;
  // Metadata
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface AppAgentReview {
  agentId: AIAgentType;
  summary: string;
  flags: AppAgentFlag[];
  recommendations: string[];
  reviewedAt: string;
}

export interface AppAgentFlag {
  id: string;
  category: 'ip_conflict' | 'ethical_risk' | 'over_complexity' | 'scope_creep' | 'resource_constraint' | 'other';
  severity: 'low' | 'medium' | 'high';
  description: string;
  acknowledged: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: 'idea' | 'project' | 'spec' | 'task' | 'contributor' | 'agreement' | 'agent_action' | 'evaluation' | 'app' | 'command';
  entityId: string;
  userId: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

// Contributor Evaluation Types
export interface RubricScore {
  category: RubricCategory;
  score: number; // 1-5 scale
  notes?: string;
  aiSuggested?: boolean;
}

export interface RiskFlag {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  aiGenerated: boolean;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

export interface ContributorEvaluation {
  id: string;
  contributorId: string;
  roleAppliedFor: ContributorRoleType;
  questionnaireResponseId?: string;
  // Rubric scores
  scores: RubricScore[];
  overallScore: number; // Weighted average
  // Scoring Tags
  tags: EvaluationTag[];
  // AI-generated content
  aiSummary?: string;
  aiStrengths?: string[];
  aiConcerns?: string[];
  riskFlags: RiskFlag[];
  // Founder decision
  decision: EvaluationDecision;
  decisionNotes?: string;
  decisionTimestamp?: string;
  decisionBy?: string;
  // Conditional follow-up
  conditionalRequirements?: string;
  conditionalDeadline?: string;
  // Metadata
  isFinalized: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionnaireResponse {
  id: string;
  contributorId: string;
  responses: Record<string, string>;
  submittedAt: string;
}

// Command Center Types
export type CommandTarget = 'lovable' | 'github' | 'rork' | 'vercel';
export type CommandType = 'repair' | 'pwa' | 'deploy' | 'verify' | 'sync';
export type CommandStatus = 'draft' | 'copied' | 'completed' | 'skipped';

export interface Command {
  id: string;
  appId: string;
  appName: string;
  target: CommandTarget;
  type: CommandType;
  title: string;
  objective: string;
  generatedPrompt: string;
  createdAt: string;
  status: CommandStatus;
  notes?: string;
}
