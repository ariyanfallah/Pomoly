import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
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

type SettingsUpdateDetail = {
  projectId: string;
  userId: string;
  settings: TimerSettings;
};

const SETTINGS_EVENT = 'timer-settings-updated';
const settingsEventTarget = typeof window !== 'undefined' ? new EventTarget() : null;

export function useTimerSettings({ projectId }: UseTimerSettingsOptions) {
  const [settings, setSettings] = useState<TimerSettings>(defaultTimerSettings);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (cancelled) return;

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
          setAuthReady(true);
        }
      }
    };

    loadUser();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const resolvedProjectId = useMemo(() => (projectId ? projectId : null), [projectId]);
  const isAuthenticated = authReady && Boolean(user);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    if (!isAuthenticated || !resolvedProjectId) {
      if (!resolvedProjectId) {
        setSettings(defaultTimerSettings);
      }
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('project_settings')
          .select('focus_duration, short_break_duration, long_break_duration, long_break_interval')
          .eq('user_id', user!.id)
          .eq('project_id', resolvedProjectId)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error('Error fetching project settings:', error);
          toast({
            title: 'Unable to load settings',
            description: 'Using default timer values for now.',
            variant: 'destructive',
          });
          setSettings(defaultTimerSettings);
          return;
        }

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
      } catch (error) {
        console.error('Error loading project settings:', error);
        if (!cancelled) {
          toast({
            title: 'Unable to load settings',
            description: 'Using default timer values for now.',
            variant: 'destructive',
          });
          setSettings(defaultTimerSettings);
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
  }, [authReady, isAuthenticated, resolvedProjectId, toast, user?.id]);

  useEffect(() => {
    if (!settingsEventTarget || !user || !resolvedProjectId) {
      return;
    }

    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<SettingsUpdateDetail>;
      if (
        customEvent.detail.userId === user.id &&
        customEvent.detail.projectId === resolvedProjectId
      ) {
        setSettings(customEvent.detail.settings);
      }
    };

    settingsEventTarget.addEventListener(SETTINGS_EVENT, handleUpdate);
    return () => {
      settingsEventTarget.removeEventListener(SETTINGS_EVENT, handleUpdate);
    };
  }, [resolvedProjectId, user]);

  const saveSettings = useCallback(async (nextSettings: TimerSettings) => {
    if (!authReady || !user) {
      toast({
        title: 'Sign in required',
        description: 'Log in and select a project to save custom timer settings.',
        variant: 'destructive',
      });
      return false;
    }

    if (!resolvedProjectId) {
      toast({
        title: 'Select a project',
        description: 'Choose a project before saving timer settings.',
        variant: 'destructive',
      });
      return false;
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
      if (settingsEventTarget) {
        settingsEventTarget.dispatchEvent(new CustomEvent<SettingsUpdateDetail>(SETTINGS_EVENT, {
          detail: {
            projectId: resolvedProjectId,
            userId: user.id,
            settings: nextSettings,
          },
        }));
      }

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
  }, [authReady, resolvedProjectId, toast, user]);

  return {
    settings,
    loading,
    saveSettings,
    setSettings,
    defaultSettings: defaultTimerSettings,
    isAuthenticated,
    projectId: resolvedProjectId,
    authReady,
  };
}
