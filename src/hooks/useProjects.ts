import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/types/karma';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/lib/storage';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStorageItem<Project[]>(STORAGE_KEYS.PROJECTS);
    setProjects(stored || []);
    setIsLoading(false);
  }, []);

  const saveProjects = useCallback((newProjects: Project[]) => {
    setProjects(newProjects);
    setStorageItem(STORAGE_KEYS.PROJECTS, newProjects);
  }, []);

  const addProject = useCallback((project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveProjects([...projects, newProject]);
    return newProject;
  }, [projects, saveProjects]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    const updatedProjects = projects.map((project) =>
      project.id === id
        ? { ...project, ...updates, updatedAt: new Date().toISOString() }
        : project
    );
    saveProjects(updatedProjects);
  }, [projects, saveProjects]);

  const deleteProject = useCallback((id: string) => {
    saveProjects(projects.filter((project) => project.id !== id));
  }, [projects, saveProjects]);

  const getProjectById = useCallback((id: string) => {
    return projects.find((project) => project.id === id);
  }, [projects]);

  return {
    projects,
    isLoading,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
  };
}
