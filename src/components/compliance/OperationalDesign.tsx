import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  Users, 
  Bot, 
  FileText, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Scale,
  UserCheck,
  FolderKanban,
  ClipboardList,
  Eye,
  ThumbsUp,
  Key,
  FileSignature,
  Activity
} from "lucide-react";

const OperationalDesign = () => {
  return (
    <ScrollArea className="h-[calc(100vh-120px)]">
      <div className="space-y-8 pr-4">
        {/* Header */}
        <div className="text-center space-y-2 pb-4 border-b border-border">
          <Badge variant="outline" className="mb-2">v1.0</Badge>
          <h1 className="text-3xl font-bold text-foreground">KarmaOS — Wyoming LLC Operational Design</h1>
          <p className="text-muted-foreground">Clearpath Technologies LLC (Wyoming) • Internal Operating System</p>
          <p className="text-sm text-muted-foreground italic">
            This document defines the enforceable operational blueprint for Clearpath Technologies.
          </p>
        </div>

        {/* Governing Authority */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Building2 className="h-5 w-5" />
              Governing Authority
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Legal Entity:</span>
                <span className="font-medium">Clearpath Technologies LLC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jurisdiction:</span>
                <span className="font-medium">State of Wyoming, USA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Governing Law:</span>
                <span className="font-medium">Wyoming Revised Statutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Operating Mode:</span>
                <span className="font-medium">Solo-Founder Operated</span>
              </div>
            </div>
            <Separator />
            <p className="text-muted-foreground">
              All intellectual property, code, designs, specifications, and work product created within or for 
              Clearpath Technologies belongs exclusively to Clearpath Technologies LLC (Wyoming). No contributor 
              relationship implies employment, partnership, or equity interest.
            </p>
          </CardContent>
        </Card>

        {/* Part 1: Core Objects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-primary" />
              Part 1 — Core KarmaOS Objects
            </CardTitle>
            <CardDescription>System entities with Wyoming LLC ownership context</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <ObjectCard 
                icon={<Shield className="h-4 w-4" />}
                title="Founder"
                description="Sole authority over all decisions, approvals, and system access. Cannot be overridden by AI or contributors."
                ownership="Ultimate authority"
              />
              <ObjectCard 
                icon={<Bot className="h-4 w-4" />}
                title="AI Agents"
                description="Assistive tools that execute defined actions. Never autonomous. All outputs require founder review."
                ownership="Owned by Clearpath"
              />
              <ObjectCard 
                icon={<Users className="h-4 w-4" />}
                title="Contributors"
                description="Independent contractors bound by NDA & IP Assignment. No employment or partnership implied."
                ownership="Work-for-hire basis"
              />
              <ObjectCard 
                icon={<UserCheck className="h-4 w-4" />}
                title="Roles"
                description="Product/Ops, Technical, Design/UX. Defines scope of access and task eligibility."
                ownership="Assigned by Founder"
              />
              <ObjectCard 
                icon={<FolderKanban className="h-4 w-4" />}
                title="Projects"
                description="Active work initiatives derived from approved ideas. All project IP owned by Clearpath."
                ownership="Clearpath property"
              />
              <ObjectCard 
                icon={<FileText className="h-4 w-4" />}
                title="Specs"
                description="PRDs and build plans that define scope. No work outside spec without approval."
                ownership="Clearpath IP"
              />
              <ObjectCard 
                icon={<ClipboardList className="h-4 w-4" />}
                title="Tasks"
                description="Discrete units of work. Must reference spec, scope, and owner. Assigned only to signed contributors."
                ownership="Scoped by Founder"
              />
              <ObjectCard 
                icon={<Eye className="h-4 w-4" />}
                title="Reviews"
                description="AI and founder evaluation of submitted work against spec requirements."
                ownership="Quality gate"
              />
              <ObjectCard 
                icon={<ThumbsUp className="h-4 w-4" />}
                title="Approvals"
                description="Founder-only checkpoints. AI may recommend but never approve."
                ownership="Founder exclusive"
              />
              <ObjectCard 
                icon={<Key className="h-4 w-4" />}
                title="Access Levels"
                description="Tier 0-3 system. Assigned after agreement signature. Revocable instantly."
                ownership="Controlled access"
              />
              <ObjectCard 
                icon={<FileSignature className="h-4 w-4" />}
                title="Legal Agreements"
                description="Wyoming NDA & IP Assignment. Version-tracked. E-signature with audit trail."
                ownership="Wyoming law governs"
              />
              <ObjectCard 
                icon={<Activity className="h-4 w-4" />}
                title="Audit Logs"
                description="Immutable record of all system actions. Timestamped. Non-deletable."
                ownership="Compliance record"
              />
            </div>
          </CardContent>
        </Card>

        {/* Part 2: Legal Compliance */}
        <Card className="border-amber-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-amber-500" />
              Part 2 — Legal Compliance Module (Wyoming)
            </CardTitle>
            <CardDescription>Mandatory agreement enforcement under Wyoming law</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">Required Agreement</h4>
              <p className="text-sm font-medium">Clearpath Technologies LLC (Wyoming) — Contributor NDA & IP Assignment</p>
              <p className="text-xs text-muted-foreground mt-1">Governing Law: Wyoming Revised Statutes • Venue: Wyoming Courts</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Agreement Version Tracking</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Each agreement version is numbered and dated
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Contributors bound to version they signed
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  New contributors must sign latest active version
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Founder can require re-signing on major updates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Old versions archived for audit purposes
                </li>
              </ul>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Hard Rules (Non-Negotiable)
              </h4>
              <div className="grid gap-2">
                <RuleCard rule="No task assignment before signature confirmation" />
                <RuleCard rule="No repository or system access before signature" />
                <RuleCard rule="Access revocation must be instant and logged" />
                <RuleCard rule="Signature status must be auditable at all times" />
                <RuleCard rule="All IP created is owned by Clearpath Technologies LLC" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Part 3: AI Agent Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Part 3 — AI Agent Operation Flows
            </CardTitle>
            <CardDescription>Constrained AI assistance with founder oversight</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <AgentCard 
                name="Systems Architect Agent"
                allowed={["Analyze system architecture", "Generate technical documentation", "Review code structure", "Suggest improvements"]}
                blocked={["Deploy code", "Grant access", "Modify production"]}
              />
              <AgentCard 
                name="Product Spec Agent"
                allowed={["Draft PRDs", "Generate user stories", "Create scope documents", "Analyze requirements"]}
                blocked={["Approve specs", "Assign tasks", "Change scope"]}
              />
              <AgentCard 
                name="Code Builder Agent"
                allowed={["Generate code", "Review submissions", "Suggest fixes", "Document changes"]}
                blocked={["Publish code", "Merge to main", "Access production"]}
              />
              <AgentCard 
                name="Risk & Integrity Agent"
                allowed={["Flag compliance issues", "Review agreements", "Audit access", "Generate reports"]}
                blocked={["Approve agreements", "Grant access", "Make legal decisions"]}
              />
            </div>

            <Separator />

            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <h4 className="font-semibold text-destructive mb-2">AI Agents Must NEVER:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Grant system or repository access</li>
                <li>• Approve legal agreements or signatures</li>
                <li>• Publish or deploy code to production</li>
                <li>• Make final business or legal decisions</li>
                <li>• Override founder authority</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Part 4: Contributor Onboarding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Part 4 — Contributor Onboarding (Wyoming-Safe)
            </CardTitle>
            <CardDescription>Remote onboarding with Wyoming legal compliance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <WorkflowStep 
                step={1}
                title="Intake Questionnaire"
                description="Collect basic information, skills, availability, and engagement preferences"
                logged={true}
              />
              <WorkflowStep 
                step={2}
                title="Resume / Portfolio Upload"
                description="Secure document upload for founder review"
                logged={true}
              />
              <WorkflowStep 
                step={3}
                title="AI Role-Fit Analysis"
                description="AI reviews qualifications and suggests role alignment (founder decides)"
                logged={true}
              />
              <WorkflowStep 
                step={4}
                title="Agreement Signing"
                description="Wyoming NDA & IP Assignment via e-signature (DocuSign, Dropbox Sign, etc.)"
                logged={true}
                critical={true}
              />
              <WorkflowStep 
                step={5}
                title="Access Provisioning"
                description="Assign access tier (1-3) based on role. Create accounts. Document permissions."
                logged={true}
              />
              <WorkflowStep 
                step={6}
                title="Ready to Work Gate"
                description="Founder confirms contributor is fully onboarded and eligible for task assignment"
                logged={true}
                approval={true}
              />
            </div>

            <div className="mt-4 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              All steps are logged, reversible, and require founder approval to proceed.
            </div>
          </CardContent>
        </Card>

        {/* Part 5: Work Execution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Part 5 — Work Execution & Review
            </CardTitle>
            <CardDescription>Scoped work with AI review and founder approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <ExecutionRule 
                title="Tasks Must Reference Approved Specs"
                description="No task can be created without linking to a founder-approved specification"
              />
              <ExecutionRule 
                title="AI Reviews Against Scope"
                description="Code Builder Agent reviews submissions for spec compliance before founder review"
              />
              <ExecutionRule 
                title="Founder Approves or Rejects"
                description="All work requires explicit founder approval before merge or deployment"
              />
              <ExecutionRule 
                title="No Scope Expansion"
                description="Any work outside defined spec scope must be approved before execution"
              />
              <ExecutionRule 
                title="Full Audit Trail"
                description="Every action, submission, review, and approval is logged with timestamp"
              />
            </div>
          </CardContent>
        </Card>

        {/* Part 6: Exit & Revocation */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-destructive" />
              Part 6 — Exit & Access Revocation
            </CardTitle>
            <CardDescription>Clean disengagement with IP protection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <WorkflowStep 
                step={1}
                title="Trigger Disengagement"
                description="Founder or contributor initiates exit process"
                logged={true}
              />
              <WorkflowStep 
                step={2}
                title="AI Documentation"
                description="Risk Agent documents reason, outstanding work, and handoff notes"
                logged={true}
              />
              <WorkflowStep 
                step={3}
                title="Immediate Access Revocation"
                description="All system access revoked instantly. Access tier set to 0."
                logged={true}
                critical={true}
              />
              <WorkflowStep 
                step={4}
                title="IP Retention Confirmation"
                description="Verify all work product transferred. Confirm IP assignment terms."
                logged={true}
              />
              <WorkflowStep 
                step={5}
                title="Archive Contributor Record"
                description="Move to archived status. Retain for audit purposes. Non-deletable."
                logged={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Critical Constraints */}
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Critical Constraints
            </CardTitle>
            <CardDescription>Non-negotiable system requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              <ConstraintItem text="Clearpath Technologies LLC (Wyoming) owns all IP" />
              <ConstraintItem text="AI assists but never decides autonomously" />
              <ConstraintItem text="Contributors never gain implicit authority" />
              <ConstraintItem text="System must work for solo-founder operation" />
              <ConstraintItem text="No work without signed agreements" />
              <ConstraintItem text="All actions logged and auditable" />
              <ConstraintItem text="Founder authority explicit at every checkpoint" />
              <ConstraintItem text="Wyoming law governs all agreements" />
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pb-8">
          <p>KarmaOS Operational Design v1.0 • Clearpath Technologies LLC (Wyoming)</p>
          <p className="mt-1">This document is for internal operational use only and does not constitute legal advice.</p>
        </div>
      </div>
    </ScrollArea>
  );
};

// Sub-components
const ObjectCard = ({ icon, title, description, ownership }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  ownership: string;
}) => (
  <div className="border rounded-lg p-3 space-y-2">
    <div className="flex items-center gap-2">
      <div className="text-primary">{icon}</div>
      <h4 className="font-medium text-sm">{title}</h4>
    </div>
    <p className="text-xs text-muted-foreground">{description}</p>
    <Badge variant="outline" className="text-xs">{ownership}</Badge>
  </div>
);

const RuleCard = ({ rule }: { rule: string }) => (
  <div className="flex items-center gap-2 text-sm bg-destructive/5 border border-destructive/10 rounded px-3 py-2">
    <Lock className="h-3 w-3 text-destructive flex-shrink-0" />
    <span>{rule}</span>
  </div>
);

const AgentCard = ({ name, allowed, blocked }: { 
  name: string; 
  allowed: string[]; 
  blocked: string[];
}) => (
  <div className="border rounded-lg p-4 space-y-3">
    <h4 className="font-medium flex items-center gap-2">
      <Bot className="h-4 w-4 text-primary" />
      {name}
    </h4>
    <div className="space-y-2">
      <div>
        <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Allowed:</p>
        <ul className="text-xs text-muted-foreground space-y-0.5">
          {allowed.map((a, i) => (
            <li key={i} className="flex items-center gap-1">
              <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />
              {a}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs font-medium text-destructive mb-1">Blocked:</p>
        <ul className="text-xs text-muted-foreground space-y-0.5">
          {blocked.map((b, i) => (
            <li key={i} className="flex items-center gap-1">
              <AlertTriangle className="h-2.5 w-2.5 text-destructive" />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

const WorkflowStep = ({ step, title, description, logged, critical, approval }: {
  step: number;
  title: string;
  description: string;
  logged?: boolean;
  critical?: boolean;
  approval?: boolean;
}) => (
  <div className={`flex gap-4 ${critical ? 'bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 -mx-3' : ''}`}>
    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
      critical ? 'bg-amber-500 text-white' : approval ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
    }`}>
      {step}
    </div>
    <div className="space-y-1">
      <h4 className="font-medium text-sm">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="flex gap-2">
        {logged && <Badge variant="outline" className="text-xs">Logged</Badge>}
        {critical && <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-600">Critical</Badge>}
        {approval && <Badge variant="secondary" className="text-xs">Founder Approval</Badge>}
      </div>
    </div>
  </div>
);

const ExecutionRule = ({ title, description }: { title: string; description: string }) => (
  <div className="border rounded-lg p-3">
    <h4 className="font-medium text-sm">{title}</h4>
    <p className="text-xs text-muted-foreground mt-1">{description}</p>
  </div>
);

const ConstraintItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2 text-sm">
    <Shield className="h-3 w-3 text-primary flex-shrink-0" />
    <span>{text}</span>
  </div>
);

export default OperationalDesign;
