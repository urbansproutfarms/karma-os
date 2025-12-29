import { Contributor } from '@/types/karma';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { User, Mail, Shield, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface ContributorCardProps {
  contributor: Contributor;
  onClick?: () => void;
}

const roleLabels = {
  product_ops: 'Product/Ops',
  technical: 'Technical',
  design_ux: 'Design/UX',
};

const engagementLabels = {
  contract: 'Contract',
  trial: 'Trial',
  unpaid: 'Unpaid',
};

const statusConfig = {
  not_sent: { icon: Clock, label: 'Not Sent', className: 'text-muted-foreground' },
  sent: { icon: Clock, label: 'Pending', className: 'text-warning' },
  signed: { icon: CheckCircle, label: 'Signed', className: 'text-success' },
  revoked: { icon: XCircle, label: 'Revoked', className: 'text-destructive' },
  expired: { icon: AlertCircle, label: 'Expired', className: 'text-destructive' },
};

const accessConfig = {
  none: { label: 'No Access', className: 'bg-muted text-muted-foreground' },
  limited: { label: 'Limited', className: 'bg-warning/10 text-warning' },
  active: { label: 'Active', className: 'bg-success/10 text-success' },
  revoked: { label: 'Revoked', className: 'bg-destructive/10 text-destructive' },
};

export function ContributorCard({ contributor, onClick }: ContributorCardProps) {
  const ndaStatus = statusConfig[contributor.ndaStatus];
  const ipStatus = statusConfig[contributor.ipAssignmentStatus];
  const access = accessConfig[contributor.accessLevel];
  const NdaIcon = ndaStatus.icon;
  const IpIcon = ipStatus.icon;

  const isCompliant = contributor.ndaStatus === 'signed' && contributor.ipAssignmentStatus === 'signed';

  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-md transition-karma",
        !isCompliant && "border-warning/30"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{contributor.legalName}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                {contributor.email}
              </div>
            </div>
          </div>
          <Badge className={access.className}>{access.label}</Badge>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline">{roleLabels[contributor.roleType]}</Badge>
          <Badge variant="secondary">{engagementLabels[contributor.engagementType]}</Badge>
        </div>

        <div className="space-y-2 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">NDA</span>
            </div>
            <div className={cn("flex items-center gap-1", ndaStatus.className)}>
              <NdaIcon className="h-4 w-4" />
              {ndaStatus.label}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">IP Assignment</span>
            </div>
            <div className={cn("flex items-center gap-1", ipStatus.className)}>
              <IpIcon className="h-4 w-4" />
              {ipStatus.label}
            </div>
          </div>
        </div>

        {!isCompliant && (
          <div className="mt-3 p-2 bg-warning/10 rounded-md flex items-center gap-2 text-sm text-warning">
            <AlertCircle className="h-4 w-4" />
            Cannot be assigned tasks until agreements are signed
          </div>
        )}
      </CardContent>
    </Card>
  );
}
