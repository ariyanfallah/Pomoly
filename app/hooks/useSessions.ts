import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SessionType } from '@/types';

export interface DatabaseSession {
  id: string;
  project_id: string;
  type: SessionType;
  duration: number;
  started_at: string;
  completed_at: string;
  is_manual: boolean;
  notes?: string;
  created_at: string;
  projects?: {
    name: string;
    color: string;
  };
}

export function useSessions() {
  const [sessions, setSessions] = useState<DatabaseSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          projects (
            name,
            color
          )
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load sessions.',
          variant: 'destructive',
        });
        return;
      }

      setSessions(data as DatabaseSession[] || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (sessionData: {
    project_id: string;
    type: SessionType;
    duration: number;
    started_at: string;
    completed_at: string;
    is_manual?: boolean;
    notes?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to create sessions.',
          variant: 'destructive',
        });
        return null;
      }

      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
          ...sessionData,
        })
        .select(`
          *,
          projects (
            name,
            color
          )
        `)
        .single();

      if (error) {
        console.error('Error creating session:', error);
        toast({
          title: 'Error',
          description: 'Failed to create session.',
          variant: 'destructive',
        });
        return null;
      }

      setSessions(prev => [data as DatabaseSession, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  };

  const deleteSession = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting session:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete session.',
          variant: 'destructive',
        });
        return false;
      }

      setSessions(prev => prev.filter(s => s.id !== id));
      toast({
        title: 'Session Deleted',
        description: 'Session has been deleted successfully.',
      });

      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return {
    sessions,
    loading,
    createSession,
    deleteSession,
    refetch: fetchSessions,
  };
}