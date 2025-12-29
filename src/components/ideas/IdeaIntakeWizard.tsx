import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface IdeaFormData {
  title: string;
  problem: string;
  targetUser: string;
  whyItMatters: string;
  mvpScope: string;
  monetization: string;
  ethicalRisks: string;
}

interface IdeaIntakeWizardProps {
  onSubmit: (data: IdeaFormData) => void;
  onCancel: () => void;
}

const steps = [
  {
    id: 'title',
    field: 'title' as keyof IdeaFormData,
    question: "What should we call this idea?",
    placeholder: "Give it a memorable name...",
    type: 'input',
  },
  {
    id: 'problem',
    field: 'problem' as keyof IdeaFormData,
    question: "What problem does this solve?",
    placeholder: "Describe the pain point or gap you've identified...",
    type: 'textarea',
  },
  {
    id: 'targetUser',
    field: 'targetUser' as keyof IdeaFormData,
    question: "Who is this for?",
    placeholder: "Describe the target user or customer...",
    type: 'textarea',
  },
  {
    id: 'whyItMatters',
    field: 'whyItMatters' as keyof IdeaFormData,
    question: "Why does this matter now?",
    placeholder: "What makes this urgent or important...",
    type: 'textarea',
  },
  {
    id: 'mvpScope',
    field: 'mvpScope' as keyof IdeaFormData,
    question: "What's the MVP scope?",
    placeholder: "What can we build in 30-60 days...",
    type: 'textarea',
  },
  {
    id: 'monetization',
    field: 'monetization' as keyof IdeaFormData,
    question: "How might this make money?",
    placeholder: "Describe the monetization hypothesis...",
    type: 'textarea',
  },
  {
    id: 'ethicalRisks',
    field: 'ethicalRisks' as keyof IdeaFormData,
    question: "What are the ethical risks?",
    placeholder: "Consider potential harms, privacy concerns, or misuse...",
    type: 'textarea',
  },
];

export function IdeaIntakeWizard({ onSubmit, onCancel }: IdeaIntakeWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<IdeaFormData>({
    title: '',
    problem: '',
    targetUser: '',
    whyItMatters: '',
    mvpScope: '',
    monetization: '',
    ethicalRisks: '',
  });

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const currentValue = formData[step.field];
  const canProceed = currentValue.trim().length > 0;

  const handleNext = () => {
    if (isLastStep) {
      onSubmit(formData);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (isFirstStep) {
      onCancel();
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey && canProceed) {
      handleNext();
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(((currentStep + 1) / steps.length) * 100)}%
          </span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex gap-1 mb-8">
        {steps.map((s, index) => (
          <div
            key={s.id}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              index <= currentStep ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Question */}
      <h2 className="text-2xl font-semibold text-foreground mb-6">
        {step.question}
      </h2>

      {/* Input */}
      <div className="mb-8">
        {step.type === 'input' ? (
          <Input
            value={currentValue}
            onChange={(e) => setFormData({ ...formData, [step.field]: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder={step.placeholder}
            className="text-lg py-6"
            autoFocus
          />
        ) : (
          <Textarea
            value={currentValue}
            onChange={(e) => setFormData({ ...formData, [step.field]: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder={step.placeholder}
            className="min-h-[160px] text-base resize-none"
            autoFocus
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {isFirstStep ? 'Cancel' : 'Back'}
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:block">
            {isLastStep ? 'Submit' : 'Press'} <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Cmd + Enter</kbd>
          </span>
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="gap-2"
          >
            {isLastStep ? (
              <>
                <Check className="h-4 w-4" />
                Submit Idea
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
