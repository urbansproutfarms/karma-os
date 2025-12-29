import { useState, useEffect, useCallback } from 'react';
import { Idea, IdeaStatus } from '@/types/karma';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/lib/storage';

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStorageItem<Idea[]>(STORAGE_KEYS.IDEAS);
    setIdeas(stored || []);
    setIsLoading(false);
  }, []);

  const saveIdeas = useCallback((newIdeas: Idea[]) => {
    setIdeas(newIdeas);
    setStorageItem(STORAGE_KEYS.IDEAS, newIdeas);
  }, []);

  const addIdea = useCallback((idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newIdea: Idea = {
      ...idea,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveIdeas([...ideas, newIdea]);
    return newIdea;
  }, [ideas, saveIdeas]);

  const updateIdea = useCallback((id: string, updates: Partial<Idea>) => {
    const updatedIdeas = ideas.map((idea) =>
      idea.id === id
        ? { ...idea, ...updates, updatedAt: new Date().toISOString() }
        : idea
    );
    saveIdeas(updatedIdeas);
  }, [ideas, saveIdeas]);

  const updateIdeaStatus = useCallback((id: string, status: IdeaStatus) => {
    updateIdea(id, { status });
  }, [updateIdea]);

  const deleteIdea = useCallback((id: string) => {
    saveIdeas(ideas.filter((idea) => idea.id !== id));
  }, [ideas, saveIdeas]);

  const getIdeaById = useCallback((id: string) => {
    return ideas.find((idea) => idea.id === id);
  }, [ideas]);

  return {
    ideas,
    isLoading,
    addIdea,
    updateIdea,
    updateIdeaStatus,
    deleteIdea,
    getIdeaById,
  };
}
