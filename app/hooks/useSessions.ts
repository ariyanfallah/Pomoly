import { useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { SessionType } from '@/types';
import { useData } from '@/contexts/DataContext';

interface CreateSessionInput {
  projectId: string;
  type: SessionType;
  duration: number;
  startedAt?: Date | string | null;
  completedAt?: Date | string;
  isManual?: boolean;
  notes?: string | null;
}

export function useSessions() {
  const { sessions, addSession, removeSession } = useData();
  const { toast } = useToast();

  const orderedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }, [sessions]);

  const createSession = async (sessionData: CreateSessionInput) => {
    if (!sessionData.projectId) {
      toast({
        title: 'Project required',
        description: 'Select a project before saving a session.',
        variant: 'destructive',
      });
      return null;
    }

    const completedAt = sessionData.completedAt ? new Date(sessionData.completedAt) : new Date();
    const startedAt = sessionData.startedAt
      ? new Date(sessionData.startedAt)
      : new Date(completedAt.getTime() - sessionData.duration * 1000);

    return addSession({
      projectId: sessionData.projectId,
      type: sessionData.type,
      duration: sessionData.duration,
      completedAt,
      startedAt,
      isManual: sessionData.isManual ?? false,
      notes: sessionData.notes ?? null,
    });
  };

  const deleteSession = async (id: string) => {
    const removed = removeSession(id);
    if (!removed) {
      toast({
        title: 'Unable to delete session',
        description: 'We could not find that session to remove.',
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Session deleted',
      description: 'The manual session has been removed.',
    });
    return true;
  };

  return {
    sessions: orderedSessions,
    loading: false,
    createSession,
    deleteSession,
    refetch: () => undefined,
  };
}
