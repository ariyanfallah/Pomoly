import { useState, useRef, useCallback, useEffect } from 'react';
import type { TimerState, SessionType, TimerSession } from '@/types';
import { useLocalStorage } from './useLocalStorage';
import { defaultTimerSettings, useTimerSettings } from './useTimerSettings';

export function useTimer(initialProjectId: string | null = null) {
  const [sessions, setSessions] = useLocalStorage<TimerSession[]>('pomodoroSessions', []);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [nextSessionType, setNextSessionType] = useState<SessionType>('focus');
  const [timerState, setTimerState] = useState<TimerState>({
    timeLeft: defaultTimerSettings.focusDuration * 60,
    sessionType: 'focus',
    isRunning: false,
    currentProjectId: initialProjectId,
    completedFocusCount: 0,
  });
  const activeProjectId = timerState.currentProjectId ?? null;
  const { settings } = useTimerSettings({ projectId: activeProjectId });

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

  useEffect(() => {
    setTimerState(prev => {
      if (prev.isRunning) {
        return prev;
      }

      let nextTimeLeft = prev.timeLeft;
      switch (prev.sessionType) {
        case 'focus':
          nextTimeLeft = settings.focusDuration * 60;
          break;
        case 'shortBreak':
          nextTimeLeft = settings.shortBreakDuration * 60;
          break;
        case 'longBreak':
          nextTimeLeft = settings.longBreakDuration * 60;
          break;
      }

      return { ...prev, timeLeft: nextTimeLeft };
    });
  }, [settings.focusDuration, settings.shortBreakDuration, settings.longBreakDuration]);

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
            setSessions((prevSessions: TimerSession[]) => [...prevSessions, newSession]);
          }

          const newCompletedCount = prev.sessionType === 'focus' 
            ? prev.completedFocusCount + 1 
            : prev.completedFocusCount;

          // Determine next session type
          let nextSession: SessionType = 'focus';
          if (prev.sessionType === 'focus') {
            nextSession = newCompletedCount % settings.longBreakInterval === 0 
              ? 'longBreak' 
              : 'shortBreak';
          }

          // Show completion modal and store next session
          setNextSessionType(nextSession);
          setShowCompleteModal(true);

          return {
            ...prev,
            timeLeft: 0,
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

  const closeCompleteModal = useCallback(() => {
    setShowCompleteModal(false);
  }, []);

  const startNextSession = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      timeLeft: getSessionDuration(nextSessionType),
      sessionType: nextSessionType,
      isRunning: true,
    }));
    setShowCompleteModal(false);
    
    // Start the timer for the next session
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = window.setInterval(() => {
      setTimerState(prev => {
        if (prev.timeLeft <= 1) {
          // Session completed - same logic as before
          if (prev.sessionType === 'focus' && prev.currentProjectId) {
            const newSession = {
              id: Date.now().toString(),
              projectId: prev.currentProjectId,
              type: prev.sessionType,
              duration: getSessionDuration(prev.sessionType),
              completedAt: new Date(),
            };
            setSessions((prevSessions: TimerSession[]) => [...prevSessions, newSession]);
          }

          const newCompletedCount = prev.sessionType === 'focus' 
            ? prev.completedFocusCount + 1 
            : prev.completedFocusCount;

          let nextSession: SessionType = 'focus';
          if (prev.sessionType === 'focus') {
            nextSession = newCompletedCount % settings.longBreakInterval === 0 
              ? 'longBreak' 
              : 'shortBreak';
          }

          setNextSessionType(nextSession);
          setShowCompleteModal(true);

          return {
            ...prev,
            timeLeft: 0,
            isRunning: false,
            completedFocusCount: newCompletedCount,
          };
        }

        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  }, [nextSessionType, getSessionDuration, setSessions, settings.longBreakInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setTimerState(prev => {
      if (prev.currentProjectId === initialProjectId) return prev;
      return { ...prev, currentProjectId: initialProjectId };
    });
  }, [initialProjectId]);

  return {
    timerState,
    startTimer,
    pauseTimer,
    resetTimer,
    switchSession,
    setCurrentProject,
    settings,
    showCompleteModal,
    nextSessionType,
    closeCompleteModal,
    startNextSession,
  };
}
