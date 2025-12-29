import { useState } from 'react';
import { Contributor, Agreement, ACCESS_TIER_NAMES, AccessTier } from '@/types/karma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Shield, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  FileText,
  Unlock,
  Lock,
  Archive
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContributorDetailProps {
  contributor: Contributor;
  agreements: Agreement[];
  onBack: () => void;
  onSendAgreements: () => void;
  onSignAgreement: (agreementId: string) => void;
  onProvisionAccess: (tier?: AccessTier) => void;
  onRevokeAccess: (reason: string) => void;
  onArchive: () => void;
}

const stageLabels: Record<string, { label: string; description: string }> = {
  intake: { label: 'Intake', description: 'Collecting contributor information' },
  documents: { label: 'Documents', description: 'Awaiting document upload' },
  signing: { label: 'Signing', description: 'Awaiting agreement signatures' },
  provisioning: { label: 'Provisioning', description: 'Setting up access' },
  ready: { label: 'Ready to Work', description: 'Contributor is active' },
  working: { label: 'Working', description: 'Contributor is engaged' },
  exit: { label: 'Exiting', description: 'Processing offboarding' },
  archived: { label: 'Archived', description: 'Record archived' },
};

const tierDescriptions: Record<AccessTier, string> = {
  0: 'No systems, tasks, or IP exposure',
  1: 'View assigned specs, submit work, no repo access',
  2: 'Limited repo access, no admin or cross-project',
  3: 'Update statuses, prepare summaries, no approvals',
};

export function ContributorDetail({
  contributor,
  agreements,
  onBack,
  onSendAgreements,
  onSignAgreement,
  onProvisionAccess,
  onRevokeAccess,
  onArchive,
}: ContributorDetailProps) {
  const [revokeReason, setRevokeReason] = useState('');
  const [showRevokeForm, setShowRevokeForm] = useState(false);
  const [selectedTier, setSelectedTier] = useState<AccessTier>(1);

  const ndaAgreement = agreements.find(a => a.type === 'nda');
  const ipAgreement = agreements.find(a => a.type === 'ip_assignment');
  const canSendAgreements = contributor.ndaStatus === 'not_sent';
  const canProvision = contributor.ndaStatus === 'signed' && 
                       contributor.ipAssignmentStatus === 'signed' && 
                       contributor.accessTier === 0;
  const canRevoke = contributor.accessTier > 0;
  const canArchive = contributor.workflowStage === 'exit';

  const stage = stageLabels[contributor.workflowStage];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{contributor.legalName}</h2>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {contributor.email}
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge className={cn(
                contributor.accessTier === 0 && 'bg-muted text-muted-foreground',
                contributor.accessTier === 1 && 'bg-warning/10 text-warning',
                contributor.accessTier === 2 && 'bg-info/10 text-info',
                contributor.accessTier === 3 && 'bg-success/10 text-success'
              )}>
                Tier {contributor.accessTier}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">{ACCESS_TIER_NAMES[contributor.accessTier]}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Tier Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Access Tier Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-accent rounded-lg">
            <p className="font-medium">Tier {contributor.accessTier}: {ACCESS_TIER_NAMES[contributor.accessTier]}</p>
            <p className="text-sm text-muted-foreground">{tierDescriptions[contributor.accessTier]}</p>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Stage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workflow Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">{stage.label}</p>
              <p className="text-sm text-muted-foreground">{stage.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agreements - Wyoming Jurisdiction */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Legal Agreements</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Governed by Wyoming Revised Statutes • Clearpath Technologies LLC
            </p>
          </div>
          {canSendAgreements && (
            <Button size="sm" onClick={onSendAgreements} className="gap-2">
              <Send className="h-4 w-4" />
              Send Agreements
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Compliance Warning */}
          {contributor.ndaStatus !== 'signed' || contributor.ipAssignmentStatus !== 'signed' ? (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-600 dark:text-amber-400">Agreements Required</p>
                <p className="text-muted-foreground">No task assignment, repo access, or work submission permitted until both NDA and IP Assignment are signed.</p>
              </div>
            </div>
          ) : null}
          {/* NDA */}
          <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Non-Disclosure Agreement (NDA)</p>
                <p className="text-sm text-muted-foreground">Version {contributor.agreementVersion}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {contributor.ndaStatus === 'signed' ? (
                <Badge className="bg-success/10 text-success gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Signed {contributor.ndaSignedDate && new Date(contributor.ndaSignedDate).toLocaleDateString()}
                </Badge>
              ) : contributor.ndaStatus === 'sent' ? (
                <>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Pending
                  </Badge>
                  {ndaAgreement && (
                    <Button size="sm" variant="outline" onClick={() => onSignAgreement(ndaAgreement.id)}>
                      Simulate Sign
                    </Button>
                  )}
                </>
              ) : contributor.ndaStatus === 'revoked' ? (
                <Badge className="bg-destructive/10 text-destructive gap-1">
                  <XCircle className="h-3 w-3" />
                  Revoked
                </Badge>
              ) : (
                <Badge variant="secondary">Not Sent</Badge>
              )}
            </div>
          </div>

          {/* IP Assignment */}
          <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">IP Assignment Agreement</p>
                <p className="text-sm text-muted-foreground">Version {contributor.agreementVersion}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {contributor.ipAssignmentStatus === 'signed' ? (
                <Badge className="bg-success/10 text-success gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Signed {contributor.ipSignedDate && new Date(contributor.ipSignedDate).toLocaleDateString()}
                </Badge>
              ) : contributor.ipAssignmentStatus === 'sent' ? (
                <>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Pending
                  </Badge>
                  {ipAgreement && (
                    <Button size="sm" variant="outline" onClick={() => onSignAgreement(ipAgreement.id)}>
                      Simulate Sign
                    </Button>
                  )}
                </>
              ) : contributor.ipAssignmentStatus === 'revoked' ? (
                <Badge className="bg-destructive/10 text-destructive gap-1">
                  <XCircle className="h-3 w-3" />
                  Revoked
                </Badge>
              ) : (
                <Badge variant="secondary">Not Sent</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {canProvision && (
            <div className="space-y-3 p-4 bg-accent rounded-lg">
              <p className="font-medium">Provision Access</p>
              <Select value={String(selectedTier)} onValueChange={(v) => setSelectedTier(Number(v) as AccessTier)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Tier 1 - Limited Contributor</SelectItem>
                  <SelectItem value="2">Tier 2 - Scoped Technical</SelectItem>
                  <SelectItem value="3">Tier 3 - Ops / Coordination</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => onProvisionAccess(selectedTier)} className="w-full gap-2">
                <Unlock className="h-4 w-4" />
                Provision Tier {selectedTier} Access
              </Button>
            </div>
          )}

          {canRevoke && !showRevokeForm && (
            <Button 
              variant="destructive" 
              onClick={() => setShowRevokeForm(true)} 
              className="w-full gap-2"
            >
              <Lock className="h-4 w-4" />
              Revoke Access
            </Button>
          )}

          {showRevokeForm && (
            <div className="space-y-3 p-4 bg-destructive/5 rounded-lg border border-destructive/20">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Revoke All Access</span>
              </div>
              <Textarea
                placeholder="Reason for revocation..."
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    onRevokeAccess(revokeReason);
                    setShowRevokeForm(false);
                  }}
                  disabled={!revokeReason}
                >
                  Confirm Revocation
                </Button>
                <Button variant="outline" onClick={() => setShowRevokeForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {canArchive && (
            <Button variant="secondary" onClick={onArchive} className="w-full gap-2">
              <Archive className="h-4 w-4" />
              Archive Contributor
            </Button>
          )}

          {contributor.exitReason && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">Exit Reason</p>
              <p className="text-foreground">{contributor.exitReason}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
