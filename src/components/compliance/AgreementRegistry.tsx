import { useState } from 'react';
import { AgreementTemplate, AgreementTemplateStatus, ContributorRoleType } from '@/types/karma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, Archive, Clock, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const defaultTemplates: AgreementTemplate[] = [
  {
    id: 'nda-v1',
    type: 'nda',
    version: '1.0',
    name: 'Standard NDA',
    effectiveDate: '2024-01-01',
    status: 'active',
    applicableRoles: ['product_ops', 'technical', 'design_ux'],
    changeNotes: 'Initial version. Standard mutual NDA for all contributors.',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ip-v1',
    type: 'ip_assignment',
    version: '1.0',
    name: 'IP Assignment Agreement',
    effectiveDate: '2024-01-01',
    status: 'active',
    applicableRoles: ['product_ops', 'technical', 'design_ux'],
    changeNotes: 'Initial version. Full IP assignment for all work product.',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const statusConfig: Record<AgreementTemplateStatus, { label: string; className: string; icon: typeof CheckCircle }> = {
  active: { label: 'Active', className: 'bg-success/10 text-success', icon: CheckCircle },
  deprecated: { label: 'Deprecated', className: 'bg-muted text-muted-foreground', icon: Archive },
  draft: { label: 'Draft', className: 'bg-warning/10 text-warning', icon: Clock },
};

const typeLabels = {
  nda: 'NDA',
  ip_assignment: 'IP Assignment',
  combined: 'Combined',
};

const roleLabels: Record<ContributorRoleType, string> = {
  product_ops: 'Product/Ops',
  technical: 'Technical',
  design_ux: 'Design/UX',
};

export function AgreementRegistry() {
  const [templates] = useState<AgreementTemplate[]>(defaultTemplates);

  const activeTemplates = templates.filter(t => t.status === 'active');
  const deprecatedTemplates = templates.filter(t => t.status === 'deprecated');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Agreement Registry</h3>
            <p className="text-sm text-muted-foreground">Versioned legal agreement templates</p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="gap-2" disabled>
          <Plus className="h-4 w-4" />
          New Version
        </Button>
      </div>

      {/* Versioning Rules */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Versioning Rules</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Contributors are bound to the version they signed</li>
            <li>• New contributors must sign the latest active version</li>
            <li>• Founder can require re-signing when agreements update</li>
            <li>• Old versions remain archived for audit purposes</li>
          </ul>
        </CardContent>
      </Card>

      {/* Active Templates */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Active Templates ({activeTemplates.length})</h4>
        <div className="space-y-3">
          {activeTemplates.map(template => {
            const status = statusConfig[template.status];
            const StatusIcon = status.icon;
            
            return (
              <Card key={template.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{template.name}</h3>
                        <Badge variant="outline">v{template.version}</Badge>
                        <Badge className={status.className}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{typeLabels[template.type]}</p>
                    </div>
                    <Badge variant="secondary">
                      Effective {new Date(template.effectiveDate).toLocaleDateString()}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Applicable Roles</p>
                      <div className="flex gap-1">
                        {template.applicableRoles.map(role => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {roleLabels[role]}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-accent rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">Change Notes</p>
                      <p className="text-sm">{template.changeNotes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Deprecated Templates */}
      {deprecatedTemplates.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Deprecated ({deprecatedTemplates.length})</h4>
          <div className="space-y-3 opacity-60">
            {deprecatedTemplates.map(template => (
              <Card key={template.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Archive className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{template.name}</span>
                    <Badge variant="outline">v{template.version}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
