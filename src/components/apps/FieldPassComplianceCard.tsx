import { AppIntake, AppComplianceFlags, AppModulesPresent } from '@/types/karma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Shield, Package, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FieldPassComplianceCardProps {
  app: AppIntake;
}

const COMPLIANCE_FLAG_LABELS: Record<keyof AppComplianceFlags, string> = {
  noPayments: 'No payments / no compensation',
  noRankings: 'No rankings / no social rating',
  noGuarantees: 'No guarantee of access or advancement',
  safetyFirstOnboarding: 'Safety-first onboarding',
  noMedicalClaims: 'No medical claims',
  noFinancialClaims: 'No financial claims',
  noEmploymentClaims: 'No employment claims',
};

const MODULE_LABELS: Record<keyof AppModulesPresent, string> = {
  welcomeOrientation: 'Welcome / Orientation',
  onboardingWizard: 'Onboarding Wizard',
  volunteerDashboard: 'Volunteer Dashboard',
  opportunitiesList: 'Opportunities List + Eligibility Filtering',
  opportunityDetail: 'Opportunity Detail (Weather info, Check-In toggle)',
  profileCredentials: 'Profile / Credentials',
  hostDashboard: 'Host Dashboard (read-only)',
  readinessQuiz: 'Readiness Quiz (Pass / Needs Review)',
  monthlyArchive: 'Monthly Archive',
};

export function FieldPassComplianceCard({ app }: FieldPassComplianceCardProps) {
  // Only show for apps with compliance flags or modules
  if (!app.complianceFlags && !app.modulesPresent) {
    return null;
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Compliance & Modules
        </CardTitle>
        <CardDescription>
          {app.productType || 'Governance compliance status'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Compliance Flags */}
        {app.complianceFlags && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground font-medium">Compliance Flags (read-only)</Label>
            <div className="space-y-2">
              {(Object.keys(COMPLIANCE_FLAG_LABELS) as (keyof AppComplianceFlags)[]).map((key) => {
                const isActive = app.complianceFlags?.[key];
                return (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox 
                      checked={isActive} 
                      disabled 
                      className="cursor-default"
                    />
                    <span className={`text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {COMPLIANCE_FLAG_LABELS[key]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {app.complianceFlags && app.modulesPresent && <Separator />}

        {/* Modules Present */}
        {app.modulesPresent && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground font-medium">Modules Present (read-only)</Label>
            <div className="space-y-2">
              {(Object.keys(MODULE_LABELS) as (keyof AppModulesPresent)[]).map((key) => {
                const isActive = app.modulesPresent?.[key];
                return (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox 
                      checked={isActive} 
                      disabled 
                      className="cursor-default"
                    />
                    <span className={`text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {MODULE_LABELS[key]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Published URL link */}
        {app.publishedUrl && (
          <>
            <Separator />
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                asChild
              >
                <a href={app.publishedUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Open in New Tab
                </a>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
