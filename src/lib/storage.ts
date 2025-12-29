// Local storage utilities for KarmaOS
// This provides persistence until backend is connected

const STORAGE_KEYS = {
  IDEAS: 'karmaos_ideas',
  PROJECTS: 'karmaos_projects',
  SPECS: 'karmaos_specs',
  TASKS: 'karmaos_tasks',
  ACTIVITY: 'karmaos_activity',
  ACTIVITY_LOG: 'karmaos_activity_log',
  USER: 'karmaos_user',
  CONTRIBUTORS: 'karmaos_contributors',
  AGREEMENTS: 'karmaos_agreements',
  AGENT_ACTIONS: 'karmaos_agent_actions',
  GUARDRAILS: 'karmaos_guardrails',
} as const;

export function getStorageItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}

export { STORAGE_KEYS };
