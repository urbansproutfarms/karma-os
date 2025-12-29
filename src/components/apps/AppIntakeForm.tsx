import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppOrigin } from '@/types/karma';
import { Package, ArrowRight } from 'lucide-react';

interface AppIntakeFormProps {
  onSubmit: (data: {
    name: string;
    origin: AppOrigin;
    description: string;
    intendedUser: string;
    mvpScope: string;
    nonGoals: string;
    riskNotes: string;
  }) => void;
  onCancel: () => void;
}

const ORIGIN_OPTIONS: { value: AppOrigin; label: string }[] = [
  { value: 'lovable', label: 'Lovable' },
  { value: 'rork', label: 'Rork' },
  { value: 'google_ai_studio', label: 'Google AI Studio' },
  { value: 'chat', label: 'Chat/Prompt' },
  { value: 'manual', label: 'Manual Development' },
  { value: 'other', label: 'Other' },
];

export function AppIntakeForm({ onSubmit, onCancel }: AppIntakeFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    origin: '' as AppOrigin,
    description: '',
    intendedUser: '',
    mvpScope: '',
    nonGoals: '',
    riskNotes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.origin || !formData.description) return;
    onSubmit(formData);
  };

  const isValid = formData.name && formData.origin && formData.description && formData.intendedUser && formData.mvpScope;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>New App Intake</CardTitle>
            <CardDescription>Register a new app for governance review</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">App Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., KarmaOS"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="origin">Origin *</Label>
              <Select
                value={formData.origin}
                onValueChange={(value: AppOrigin) => setFormData(prev => ({ ...prev, origin: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select origin..." />
                </SelectTrigger>
                <SelectContent>
                  {ORIGIN_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What does this app do? What problem does it solve?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="intendedUser">Intended User *</Label>
            <Input
              id="intendedUser"
              value={formData.intendedUser}
              onChange={(e) => setFormData(prev => ({ ...prev, intendedUser: e.target.value }))}
              placeholder="e.g., Solo founders, Internal ops team"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mvpScope">MVP Scope *</Label>
            <Textarea
              id="mvpScope"
              value={formData.mvpScope}
              onChange={(e) => setFormData(prev => ({ ...prev, mvpScope: e.target.value }))}
              placeholder="Define the minimum viable scope. What must be in v1?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nonGoals">Explicit Non-Goals</Label>
            <Textarea
              id="nonGoals"
              value={formData.nonGoals}
              onChange={(e) => setFormData(prev => ({ ...prev, nonGoals: e.target.value }))}
              placeholder="What is explicitly OUT of scope for this app?"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="riskNotes">Risk Notes</Label>
            <Textarea
              id="riskNotes"
              value={formData.riskNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, riskNotes: e.target.value }))}
              placeholder="Any known risks, dependencies, or concerns?"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid}>
              Submit for Review
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}