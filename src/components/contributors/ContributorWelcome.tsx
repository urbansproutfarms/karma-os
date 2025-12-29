import { Card, CardContent } from '@/components/ui/card';
import { Handshake, Shield, FileCheck, Clock, AlertCircle } from 'lucide-react';

export function ContributorWelcome() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent mb-6">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Handshake className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Welcome to Clearpath</h3>
              <p className="text-sm text-muted-foreground">
                We're glad you're here. Before we begin working together, here's what you need to know.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <FileCheck className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Sign Before You Start</p>
                  <p className="text-xs text-muted-foreground">NDA and IP Assignment are required before any work begins.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Work Belongs to Clearpath</p>
                  <p className="text-xs text-muted-foreground">Everything you create here is owned by the company.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Access is Temporary</p>
                  <p className="text-xs text-muted-foreground">Your access can be revoked at any time upon exit.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Stay Within Scope</p>
                  <p className="text-xs text-muted-foreground">Only work on assigned tasks. No unapproved changes.</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground border-t border-border pt-3">
              Questions? Reach out to the founder directly. We value clarity, integrity, and calm collaboration.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
