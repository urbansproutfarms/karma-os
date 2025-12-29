import { useState, useEffect, useCallback } from 'react';
import { ActivityLog } from '@/types/karma';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/lib/storage';

export function useAuditLog() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStorageItem<ActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOG);
    setLogs(stored || []);
    setIsLoading(false);
  }, []);

  const saveLogs = useCallback((updated: ActivityLog[]) => {
    setLogs(updated);
    setStorageItem(STORAGE_KEYS.ACTIVITY_LOG, updated);
  }, []);

  const logActivity = useCallback((
    action: string,
    entityType: ActivityLog['entityType'],
    entityId: string,
    userId: string = 'founder',
    details?: Record<string, unknown>
  ) => {
    const newLog: ActivityLog = {
      id: crypto.randomUUID(),
      action,
      entityType,
      entityId,
      userId,
      timestamp: new Date().toISOString(),
      details,
    };
    saveLogs([newLog, ...logs]);
    return newLog;
  }, [logs, saveLogs]);

  const getEntityLogs = useCallback((entityType: string, entityId: string): ActivityLog[] => {
    return logs.filter(l => l.entityType === entityType && l.entityId === entityId);
  }, [logs]);

  const getRecentLogs = useCallback((count: number = 50): ActivityLog[] => {
    return logs.slice(0, count);
  }, [logs]);

  return {
    logs,
    isLoading,
    logActivity,
    getEntityLogs,
    getRecentLogs,
  };
}
