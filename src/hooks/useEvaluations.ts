import { useState, useEffect, useCallback } from 'react';
import { 
  ContributorEvaluation, 
  QuestionnaireResponse, 
  RubricScore, 
  RiskFlag,
  EvaluationDecision,
  ContributorRoleType,
  RUBRIC_CATEGORIES,
  RubricCategory
} from '@/types/karma';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/lib/storage';

// Mock AI evaluation generator (would be replaced with actual AI call)
function generateMockAIEvaluation(
  responses: Record<string, string>,
  roleType: ContributorRoleType
): { 
  scores: RubricScore[]; 
  summary: string; 
  strengths: string[]; 
  concerns: string[];
  riskFlags: RiskFlag[];
} {
  const categories = Object.keys(RUBRIC_CATEGORIES) as RubricCategory[];
  
  // Generate pseudo-random but consistent scores based on response content
  const scores: RubricScore[] = categories.map(category => {
    const baseScore = 3 + Math.floor(Math.random() * 2); // 3-4 base
    const hasDetailedResponses = Object.values(responses).some(r => r.length > 100);
    const score = Math.min(5, hasDetailedResponses ? baseScore + 1 : baseScore);
    
    return {
      category,
      score,
      notes: `AI-assessed based on questionnaire responses`,
      aiSuggested: true,
    };
  });

  const riskFlags: RiskFlag[] = [];
  
  // Flag if availability seems limited
  if (responses.availability?.toLowerCase().includes('limited') || 
      responses.availability?.toLowerCase().includes('part-time')) {
    riskFlags.push({
      id: crypto.randomUUID(),
      category: 'Availability',
      severity: 'medium',
      description: 'Contributor indicated limited availability which may impact project timelines',
      aiGenerated: true,
      acknowledged: false,
    });
  }

  // Flag if no portfolio provided
  if (!responses.portfolio || responses.portfolio.trim() === '') {
    riskFlags.push({
      id: crypto.randomUUID(),
      category: 'Portfolio',
      severity: 'low',
      description: 'No portfolio or work samples were provided for review',
      aiGenerated: true,
      acknowledged: false,
    });
  }

  const roleLabels: Record<ContributorRoleType, string> = {
    product_ops: 'Product/Operations',
    technical: 'Technical',
    design_ux: 'Design/UX',
  };

  return {
    scores,
    summary: `Candidate appears to be a ${scores.filter(s => s.score >= 4).length >= 4 ? 'strong' : 'moderate'} fit for the ${roleLabels[roleType]} role. Questionnaire responses indicate ${Object.values(responses).some(r => r.length > 100) ? 'thoughtful engagement' : 'brief responses'}. Further founder review recommended.`,
    strengths: [
      'Completed intake questionnaire',
      responses.experience?.length > 50 ? 'Detailed experience description provided' : 'Experience information provided',
      'Expressed interest in Clearpath mission',
    ],
    concerns: riskFlags.length > 0 
      ? riskFlags.map(f => f.description)
      : ['No significant concerns identified - founder review recommended'],
    riskFlags,
  };
}

function calculateOverallScore(scores: RubricScore[]): number {
  if (scores.length === 0) return 0;
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const score of scores) {
    const categoryConfig = RUBRIC_CATEGORIES[score.category];
    if (categoryConfig) {
      weightedSum += score.score * categoryConfig.weight;
      totalWeight += categoryConfig.weight;
    }
  }
  
  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;
}

export function useEvaluations() {
  const [evaluations, setEvaluations] = useState<ContributorEvaluation[]>([]);
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedEvaluations = getStorageItem<ContributorEvaluation[]>(STORAGE_KEYS.EVALUATIONS);
    const storedQuestionnaires = getStorageItem<QuestionnaireResponse[]>(STORAGE_KEYS.QUESTIONNAIRES);
    setEvaluations(storedEvaluations || []);
    setQuestionnaires(storedQuestionnaires || []);
    setIsLoading(false);
  }, []);

  const saveEvaluations = useCallback((updated: ContributorEvaluation[]) => {
    setEvaluations(updated);
    setStorageItem(STORAGE_KEYS.EVALUATIONS, updated);
  }, []);

  const saveQuestionnaires = useCallback((updated: QuestionnaireResponse[]) => {
    setQuestionnaires(updated);
    setStorageItem(STORAGE_KEYS.QUESTIONNAIRES, updated);
  }, []);

  // Submit questionnaire and trigger AI evaluation
  const submitQuestionnaire = useCallback((
    contributorId: string,
    roleType: ContributorRoleType,
    responses: Record<string, string>
  ): ContributorEvaluation => {
    const now = new Date().toISOString();
    
    // Save questionnaire response
    const questionnaireResponse: QuestionnaireResponse = {
      id: crypto.randomUUID(),
      contributorId,
      responses,
      submittedAt: now,
    };
    saveQuestionnaires([...questionnaires, questionnaireResponse]);

    // Generate AI evaluation
    const aiResult = generateMockAIEvaluation(responses, roleType);
    const overallScore = calculateOverallScore(aiResult.scores);

    // Create evaluation
    const evaluation: ContributorEvaluation = {
      id: crypto.randomUUID(),
      contributorId,
      roleAppliedFor: roleType,
      questionnaireResponseId: questionnaireResponse.id,
      scores: aiResult.scores,
      overallScore,
      aiSummary: aiResult.summary,
      aiStrengths: aiResult.strengths,
      aiConcerns: aiResult.concerns,
      riskFlags: aiResult.riskFlags,
      decision: 'pending',
      isFinalized: false,
      createdAt: now,
      updatedAt: now,
    };

    saveEvaluations([...evaluations, evaluation]);
    return evaluation;
  }, [evaluations, questionnaires, saveEvaluations, saveQuestionnaires]);

  // Update individual score
  const updateScore = useCallback((evaluationId: string, category: RubricCategory, score: number, notes?: string) => {
    const updated = evaluations.map(e => {
      if (e.id !== evaluationId || e.isFinalized) return e;
      
      const newScores = e.scores.map(s => 
        s.category === category 
          ? { ...s, score, notes, aiSuggested: false }
          : s
      );
      
      return {
        ...e,
        scores: newScores,
        overallScore: calculateOverallScore(newScores),
        updatedAt: new Date().toISOString(),
      };
    });
    saveEvaluations(updated);
  }, [evaluations, saveEvaluations]);

  // Acknowledge risk flag
  const acknowledgeRiskFlag = useCallback((evaluationId: string, flagId: string) => {
    const updated = evaluations.map(e => {
      if (e.id !== evaluationId) return e;
      
      return {
        ...e,
        riskFlags: e.riskFlags.map(f => 
          f.id === flagId 
            ? { ...f, acknowledged: true, acknowledgedAt: new Date().toISOString() }
            : f
        ),
        updatedAt: new Date().toISOString(),
      };
    });
    saveEvaluations(updated);
  }, [evaluations, saveEvaluations]);

  // Make founder decision
  const makeDecision = useCallback((
    evaluationId: string,
    decision: EvaluationDecision,
    notes?: string,
    conditionalRequirements?: string,
    conditionalDeadline?: string
  ) => {
    const now = new Date().toISOString();
    
    const updated = evaluations.map(e => {
      if (e.id !== evaluationId) return e;
      
      return {
        ...e,
        decision,
        decisionNotes: notes,
        decisionTimestamp: now,
        decisionBy: 'founder',
        conditionalRequirements: decision === 'conditional' ? conditionalRequirements : undefined,
        conditionalDeadline: decision === 'conditional' ? conditionalDeadline : undefined,
        isFinalized: decision !== 'pending',
        updatedAt: now,
      };
    });
    saveEvaluations(updated);
  }, [evaluations, saveEvaluations]);

  // Get evaluation for a contributor
  const getContributorEvaluation = useCallback((contributorId: string): ContributorEvaluation | undefined => {
    return evaluations.find(e => e.contributorId === contributorId);
  }, [evaluations]);

  // Get questionnaire for a contributor
  const getContributorQuestionnaire = useCallback((contributorId: string): QuestionnaireResponse | undefined => {
    return questionnaires.find(q => q.contributorId === contributorId);
  }, [questionnaires]);

  // Check if contributor can proceed to agreements
  const canProceedToAgreements = useCallback((contributorId: string): boolean => {
    const evaluation = evaluations.find(e => e.contributorId === contributorId);
    return evaluation?.decision === 'approved';
  }, [evaluations]);

  // Get pending evaluations
  const getPendingEvaluations = useCallback((): ContributorEvaluation[] => {
    return evaluations.filter(e => e.decision === 'pending');
  }, [evaluations]);

  return {
    evaluations,
    questionnaires,
    isLoading,
    submitQuestionnaire,
    updateScore,
    acknowledgeRiskFlag,
    makeDecision,
    getContributorEvaluation,
    getContributorQuestionnaire,
    canProceedToAgreements,
    getPendingEvaluations,
  };
}
