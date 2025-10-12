import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorage } from './useLocalStorage';
import { useAuth } from '@/contexts/AuthContext';
import type { TimerSettings } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const defaultTimerSettings: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
};

interface UseTimerSettingsOptions {
  projectId: string | null;
}

export function useTimerSettings({ projectId }: UseTimerSettingsOptions) {
  const { user: initialUser } = useAuth();
  const [localSettings, setLocalSettings] = useLocalStorage<TimerSettings>('pomodoroSettings', defaultTimerSettings);
  const [settings, setSettings] = useState<TimerSettings>(localSettings);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (cancelled) {
          return;
        }

        if (error) {
          console.error('Error verifying Supabase user:', error);
          setUser(null);
        } else {
          setUser(data.user ?? null);
        }
      } catch (error) {
        console.error('Error verifying Supabase user:', error);
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setAuthChecked(true);
        }
      }
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(async () => {
      if (cancelled) return;
      try {
        const { data } = await supabase.auth.getUser();
        if (!cancelled) {
          setUser(data.user ?? null);
        }
      } finally {
        if (!cancelled) {
          setAuthChecked(true);
        }
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  const isAuthenticated = authChecked && Boolean(user);

  const resolvedProjectId = useMemo(() => (projectId ? projectId : null), [projectId]);

  useEffect(() => {
    if (!authChecked) {
      return;
    }
    if (!isAuthenticated || !resolvedProjectId) {
      setSettings(localSettings);
      return;
    }

    let cancelled = false;

    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('project_settings')
          .select('focus_duration, short_break_duration, long_break_duration, long_break_interval')
          .eq('user_id', user!.id)
          .eq('project_id', resolvedProjectId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching project settings:', error);
          toast({
            title: 'Unable to load settings',
            description: 'Falling back to your local preferences.',
            variant: 'destructive',
          });
          if (!cancelled) {
            setSettings(localSettings);
          }
          return;
        }

        if (!cancelled) {
          if (data) {
            setSettings({
              focusDuration: data.focus_duration ?? defaultTimerSettings.focusDuration,
              shortBreakDuration: data.short_break_duration ?? defaultTimerSettings.shortBreakDuration,
              longBreakDuration: data.long_break_duration ?? defaultTimerSettings.longBreakDuration,
              longBreakInterval: data.long_break_interval ?? defaultTimerSettings.longBreakInterval,
            });
          } else {
            setSettings(defaultTimerSettings);
          }
        }
      } catch (error) {
        console.error('Error loading project settings:', error);
        if (!cancelled) {
          setSettings(localSettings);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      cancelled = true;
    };
  }, [authChecked, isAuthenticated, resolvedProjectId, user?.id, localSettings, toast, user]);

  useEffect(() => {
    if (!authChecked) {
      return;
    }
    if (!isAuthenticated || !resolvedProjectId) {
      setSettings(localSettings);
    }
  }, [authChecked, isAuthenticated, resolvedProjectId, localSettings]);

  const saveSettings = useCallback(async (nextSettings: TimerSettings) => {
    if (!authChecked || !isAuthenticated || !resolvedProjectId || !user) {
      setLocalSettings(nextSettings);
      setSettings(nextSettings);
      return true;
    }

    try {
      const { error } = await supabase
        .from('project_settings')
        .upsert({
          user_id: user.id,
          project_id: resolvedProjectId,
          focus_duration: nextSettings.focusDuration,
          short_break_duration: nextSettings.shortBreakDuration,
          long_break_duration: nextSettings.longBreakDuration,
          long_break_interval: nextSettings.longBreakInterval,
        }, {
          onConflict: 'user_id,project_id',
        });

      if (error) {
        console.error('Error saving project settings:', error);
        toast({
          title: 'Unable to save settings',
          description: 'Please try again in a moment.',
          variant: 'destructive',
        });
        return false;
      }

      setSettings(nextSettings);
      return true;
    } catch (error) {
      console.error('Error saving project settings:', error);
      toast({
        title: 'Unable to save settings',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
      return false;
    }
  }, [authChecked, isAuthenticated, resolvedProjectId, user, setLocalSettings, toast]);

  return {
    settings,
    loading,
      saveSettings,
      setSettings,
      defaultSettings: defaultTimerSettings,
      isAuthenticated,
      projectId: resolvedProjectId,
      authReady: authChecked,
    };
}
