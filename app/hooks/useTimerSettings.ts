import { useCallback, useEffect, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { defaultTimerSettings } from '@/configs/timerSettings.config';
import type { TimerSettings } from '@/types';

interface UseTimerSettingsOptions {
  projectId: string | null;
}

export { defaultTimerSettings } from '@/configs/timerSettings.config';

export function useTimerSettings({ projectId }: UseTimerSettingsOptions) {
  const { getTimerSettings, setTimerSettings } = useData();
  const [settings, setSettings] = useState<TimerSettings>(() => getTimerSettings(projectId));

  useEffect(() => {
    setSettings(getTimerSettings(projectId));
  }, [getTimerSettings, projectId]);

  const saveSettings = useCallback(async (nextSettings: TimerSettings) => {
    setSettings(nextSettings);
    setTimerSettings(projectId, nextSettings);
    return true;
  }, [projectId, setTimerSettings]);

  return {
    settings,
    loading: false,
    saveSettings,
    setSettings,
    defaultSettings: defaultTimerSettings,
  };
}
