import { useState, useRef, useCallback, useEffect } from 'react';
import { TimerState, SessionType, TimerSettings } from '@/types';
import { useLocalStorage } from './useLocalStorage';

const defaultSettings: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
};

export function useTimer() {
  const [settings] = useLocalStorage<TimerSettings>('pomodoroSettings', defaultSettings);
  const [sessions, setSessions] = useLocalStorage('pomodoroSessions', []);
  
  const [timerState, setTimerState] = useState<TimerState>({
    timeLeft: settings.focusDuration * 60,
    sessionType: 'focus',
    isRunning: false,
    currentProjectId: null,
    completedFocusCount: 0,
  });

  const intervalRef = useRef<number | null>(null);

  const getSessionDuration = useCallback((type: SessionType): number => {
    switch (type) {
      case 'focus':
        return settings.focusDuration * 60;
      case 'shortBreak':
        return settings.shortBreakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
      default:
        return settings.focusDuration * 60;
    }
  }, [settings]);

  const startTimer = useCallback(() => {
    if (intervalRef.current) return;

    setTimerState(prev => ({ ...prev, isRunning: true }));
    
    intervalRef.current = window.setInterval(() => {
      setTimerState(prev => {
        if (prev.timeLeft <= 1) {
          // Session completed
          if (prev.sessionType === 'focus' && prev.currentProjectId) {
            const newSession = {
              id: Date.now().toString(),
              projectId: prev.currentProjectId,
              type: prev.sessionType,
              duration: getSessionDuration(prev.sessionType),
              completedAt: new Date(),
            };
            setSessions((prevSessions: any[]) => [...prevSessions, newSession]);
          }

          const newCompletedCount = prev.sessionType === 'focus' 
            ? prev.completedFocusCount + 1 
            : prev.completedFocusCount;

          // Determine next session type
          let nextSessionType: SessionType = 'focus';
          if (prev.sessionType === 'focus') {
            nextSessionType = newCompletedCount % settings.longBreakInterval === 0 
              ? 'longBreak' 
              : 'shortBreak';
          }

          return {
            ...prev,
            timeLeft: getSessionDuration(nextSessionType),
            sessionType: nextSessionType,
            isRunning: false,
            completedFocusCount: newCompletedCount,
          };
        }

        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  }, [getSessionDuration, setSessions, settings.longBreakInterval]);

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const resetTimer = useCallback(() => {
    pauseTimer();
    setTimerState(prev => ({
      ...prev,
      timeLeft: getSessionDuration(prev.sessionType),
      isRunning: false,
    }));
  }, [pauseTimer, getSessionDuration]);

  const switchSession = useCallback((sessionType: SessionType) => {
    pauseTimer();
    setTimerState(prev => ({
      ...prev,
      timeLeft: getSessionDuration(sessionType),
      sessionType,
      isRunning: false,
    }));
  }, [pauseTimer, getSessionDuration]);

  const setCurrentProject = useCallback((projectId: string | null) => {
    setTimerState(prev => ({ ...prev, currentProjectId: projectId }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    timerState,
    startTimer,
    pauseTimer,
    resetTimer,
    switchSession,
    setCurrentProject,
    settings,
  };
}