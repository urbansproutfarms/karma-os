import { useState, useEffect, useCallback } from 'react';
import { Contributor, Agreement, AgreementStatus, AccessLevel, WorkflowStage } from '@/types/karma';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/lib/storage';

export function useContributors() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStorageItem<Contributor[]>(STORAGE_KEYS.CONTRIBUTORS);
    const storedAgreements = getStorageItem<Agreement[]>(STORAGE_KEYS.AGREEMENTS);
    setContributors(stored || []);
    setAgreements(storedAgreements || []);
    setIsLoading(false);
  }, []);

  const saveContributors = useCallback((updated: Contributor[]) => {
    setContributors(updated);
    setStorageItem(STORAGE_KEYS.CONTRIBUTORS, updated);
  }, []);

  const saveAgreements = useCallback((updated: Agreement[]) => {
    setAgreements(updated);
    setStorageItem(STORAGE_KEYS.AGREEMENTS, updated);
  }, []);

  const addContributor = useCallback((data: Omit<Contributor, 'id' | 'createdAt' | 'updatedAt' | 'accessLevel' | 'workflowStage' | 'ndaStatus' | 'ipAssignmentStatus' | 'agreementVersion'>) => {
    const newContributor: Contributor = {
      ...data,
      id: crypto.randomUUID(),
      ndaStatus: 'not_sent',
      ipAssignmentStatus: 'not_sent',
      agreementVersion: '1.0',
      accessLevel: 'none',
      workflowStage: 'intake',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveContributors([...contributors, newContributor]);
    return newContributor;
  }, [contributors, saveContributors]);

  const updateContributor = useCallback((id: string, updates: Partial<Contributor>) => {
    const updated = contributors.map(c => 
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    );
    saveContributors(updated);
  }, [contributors, saveContributors]);

  const sendAgreements = useCallback((contributorId: string) => {
    const now = new Date().toISOString();
    
    // Create NDA agreement
    const nda: Agreement = {
      id: crypto.randomUUID(),
      contributorId,
      type: 'nda',
      version: '1.0',
      status: 'sent',
      sentAt: now,
    };
    
    // Create IP Assignment agreement
    const ipAssignment: Agreement = {
      id: crypto.randomUUID(),
      contributorId,
      type: 'ip_assignment',
      version: '1.0',
      status: 'sent',
      sentAt: now,
    };
    
    saveAgreements([...agreements, nda, ipAssignment]);
    
    updateContributor(contributorId, {
      ndaStatus: 'sent',
      ipAssignmentStatus: 'sent',
      workflowStage: 'signing',
    });
  }, [agreements, saveAgreements, updateContributor]);

  const signAgreement = useCallback((agreementId: string) => {
    const now = new Date().toISOString();
    const agreement = agreements.find(a => a.id === agreementId);
    if (!agreement) return;

    const updatedAgreements = agreements.map(a => 
      a.id === agreementId ? { ...a, status: 'signed' as AgreementStatus, signedAt: now } : a
    );
    saveAgreements(updatedAgreements);

    // Check if all agreements are signed for this contributor
    const contributorAgreements = updatedAgreements.filter(a => a.contributorId === agreement.contributorId);
    const allSigned = contributorAgreements.every(a => a.status === 'signed');

    const updates: Partial<Contributor> = {};
    if (agreement.type === 'nda') {
      updates.ndaStatus = 'signed';
      updates.ndaSignedDate = now;
    } else {
      updates.ipAssignmentStatus = 'signed';
      updates.ipSignedDate = now;
    }

    if (allSigned) {
      updates.accessLevel = 'limited';
      updates.workflowStage = 'provisioning';
    }

    updateContributor(agreement.contributorId, updates);
  }, [agreements, saveAgreements, updateContributor]);

  const provisionAccess = useCallback((contributorId: string) => {
    updateContributor(contributorId, {
      accessLevel: 'active',
      workflowStage: 'ready',
    });
  }, [updateContributor]);

  const revokeAccess = useCallback((contributorId: string, reason: string) => {
    const now = new Date().toISOString();
    
    // Revoke all agreements
    const updatedAgreements = agreements.map(a => 
      a.contributorId === contributorId ? { ...a, status: 'revoked' as AgreementStatus, revokedAt: now } : a
    );
    saveAgreements(updatedAgreements);
    
    updateContributor(contributorId, {
      ndaStatus: 'revoked',
      ipAssignmentStatus: 'revoked',
      accessLevel: 'revoked',
      workflowStage: 'exit',
      exitReason: reason,
    });
  }, [agreements, saveAgreements, updateContributor]);

  const archiveContributor = useCallback((contributorId: string) => {
    updateContributor(contributorId, {
      workflowStage: 'archived',
      archivedAt: new Date().toISOString(),
    });
  }, [updateContributor]);

  const canAssignTasks = useCallback((contributorId: string): boolean => {
    const contributor = contributors.find(c => c.id === contributorId);
    if (!contributor) return false;
    return contributor.ndaStatus === 'signed' && 
           contributor.ipAssignmentStatus === 'signed' &&
           contributor.accessLevel === 'active';
  }, [contributors]);

  const getContributorAgreements = useCallback((contributorId: string): Agreement[] => {
    return agreements.filter(a => a.contributorId === contributorId);
  }, [agreements]);

  return {
    contributors,
    agreements,
    isLoading,
    addContributor,
    updateContributor,
    sendAgreements,
    signAgreement,
    provisionAccess,
    revokeAccess,
    archiveContributor,
    canAssignTasks,
    getContributorAgreements,
  };
}
