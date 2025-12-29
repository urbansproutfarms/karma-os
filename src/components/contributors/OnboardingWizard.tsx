import { useState } from 'react';
import { Contributor, ContributorRoleType, EngagementType } from '@/types/karma';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, User, Briefcase, FileText, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingWizardProps {
  onSubmit: (data: Omit<Contributor, 'id' | 'createdAt' | 'updatedAt' | 'accessLevel' | 'workflowStage' | 'ndaStatus' | 'ipAssignmentStatus' | 'agreementVersion'>) => void;
  onCancel: () => void;
}

type Step = 'info' | 'role' | 'documents' | 'review';

const steps: { id: Step; label: string; icon: typeof User }[] = [
  { id: 'info', label: 'Basic Info', icon: User },
  { id: 'role', label: 'Role & Engagement', icon: Briefcase },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'review', label: 'Review', icon: CheckCircle },
];

export function OnboardingWizard({ onSubmit, onCancel }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [formData, setFormData] = useState({
    legalName: '',
    email: '',
    roleType: '' as ContributorRoleType | '',
    engagementType: '' as EngagementType | '',
    portfolioUrl: '',
    resumeUrl: '',
    notes: '',
  });

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'info':
        return formData.legalName && formData.email;
      case 'role':
        return formData.roleType && formData.engagementType;
      case 'documents':
        return true; // Optional step
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handleSubmit = () => {
    if (!formData.roleType || !formData.engagementType) return;
    onSubmit({
      legalName: formData.legalName,
      email: formData.email,
      roleType: formData.roleType,
      engagementType: formData.engagementType,
      portfolioUrl: formData.portfolioUrl || undefined,
      resumeUrl: formData.resumeUrl || undefined,
      notes: formData.notes || undefined,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = index < currentStepIndex;

          return (
            <div key={step.id} className="flex items-center">
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md",
                isActive && "bg-primary/10 text-primary",
                isCompleted && "text-success",
                !isActive && !isCompleted && "text-muted-foreground"
              )}>
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-8 h-px mx-2",
                  isCompleted ? "bg-success" : "bg-border"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 'info' && 'Contributor Information'}
            {currentStep === 'role' && 'Role & Engagement'}
            {currentStep === 'documents' && 'Supporting Documents'}
            {currentStep === 'review' && 'Review & Submit'}
          </CardTitle>
          <CardDescription>
            {currentStep === 'info' && 'Enter the legal name and contact details'}
            {currentStep === 'role' && 'Define the contributor role and engagement type'}
            {currentStep === 'documents' && 'Optional: Add portfolio or resume links'}
            {currentStep === 'review' && 'Review all information before onboarding'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStep === 'info' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="legalName">Legal Name *</Label>
                <Input
                  id="legalName"
                  value={formData.legalName}
                  onChange={(e) => updateField('legalName', e.target.value)}
                  placeholder="Full legal name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
            </>
          )}

          {currentStep === 'role' && (
            <>
              <div className="space-y-2">
                <Label>Role Type *</Label>
                <Select value={formData.roleType} onValueChange={(v) => updateField('roleType', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product_ops">Product/Ops</SelectItem>
                    <SelectItem value="technical">Technical Implementer</SelectItem>
                    <SelectItem value="design_ux">Design/UX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Engagement Type *</Label>
                <Select value={formData.engagementType} onValueChange={(v) => updateField('engagementType', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select engagement type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {currentStep === 'documents' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                <Input
                  id="portfolioUrl"
                  type="url"
                  value={formData.portfolioUrl}
                  onChange={(e) => updateField('portfolioUrl', e.target.value)}
                  placeholder="https://portfolio.example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resumeUrl">Resume URL</Label>
                <Input
                  id="resumeUrl"
                  type="url"
                  value={formData.resumeUrl}
                  onChange={(e) => updateField('resumeUrl', e.target.value)}
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Any additional notes..."
                />
              </div>
            </>
          )}

          {currentStep === 'review' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-accent rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Legal Name</p>
                  <p className="font-medium">{formData.legalName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{formData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role Type</p>
                  <p className="font-medium capitalize">{formData.roleType.replace('_', '/')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Engagement</p>
                  <p className="font-medium capitalize">{formData.engagementType}</p>
                </div>
              </div>
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg text-sm">
                <p className="font-medium text-warning mb-1">Next Steps</p>
                <p className="text-muted-foreground">
                  After onboarding, you will need to send NDA and IP Assignment agreements for signature before this contributor can be assigned any tasks.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={currentStepIndex === 0 ? onCancel : prevStep}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStepIndex === 0 ? 'Cancel' : 'Back'}
        </Button>
        {currentStep === 'review' ? (
          <Button onClick={handleSubmit}>
            Complete Onboarding
          </Button>
        ) : (
          <Button onClick={nextStep} disabled={!canProceed()}>
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
