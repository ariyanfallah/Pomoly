import { useState, useRef, useCallback, useEffect } from 'react';
import type { TimerState, SessionType } from '@/types';
import { useTimerSettings, defaultTimerSettings } from './useTimerSettings';
import { useData } from '@/contexts/DataContext';

export function useTimer(initialProjectId: string | null = null) {
  const { addSession } = useData();
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

  const handleSessionComplete = useCallback((state: TimerState) => {
    if (state.sessionType === 'focus' && state.currentProjectId) {
      const duration = getSessionDuration(state.sessionType);
      const completedAt = new Date();
      const startedAt = new Date(completedAt.getTime() - duration * 1000);
      addSession({
        projectId: state.currentProjectId,
        type: state.sessionType,
        duration,
        completedAt,
        startedAt,
        isManual: false,
        notes: null,
      });
    }

    const newCompletedCount = state.sessionType === 'focus'
      ? state.completedFocusCount + 1
      : state.completedFocusCount;

    let nextSession: SessionType = 'focus';
    if (state.sessionType === 'focus') {
      nextSession = newCompletedCount % settings.longBreakInterval === 0
        ? 'longBreak'
        : 'shortBreak';
    }

    setNextSessionType(nextSession);
    setShowCompleteModal(true);

    return newCompletedCount;
  }, [addSession, getSessionDuration, settings.longBreakInterval]);

  const startTimer = useCallback(() => {
    if (intervalRef.current) return;

    setTimerState(prev => ({ ...prev, isRunning: true }));

    intervalRef.current = window.setInterval(() => {
      setTimerState(prev => {
        if (prev.timeLeft <= 1) {
          const completedCount = handleSessionComplete(prev);
          return {
            ...prev,
            timeLeft: 0,
            isRunning: false,
            completedFocusCount: completedCount,
          };
        }

        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  }, [handleSessionComplete]);

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

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      setTimerState(prev => {
        if (prev.timeLeft <= 1) {
          const completedCount = handleSessionComplete(prev);
          return {
            ...prev,
            timeLeft: 0,
            isRunning: false,
            completedFocusCount: completedCount,
          };
        }

        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  }, [getSessionDuration, handleSessionComplete, nextSessionType]);

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
