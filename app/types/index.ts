export interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface TimerSession {
  id: string;
  projectId: string;
  type: SessionType;
  duration: number; // in seconds
  completedAt: Date;
}

export type SessionType = 'focus' | 'shortBreak' | 'longBreak';

export interface TimerSettings {
  focusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // after how many focus sessions
}

export interface TimerState {
  timeLeft: number; // in seconds
  sessionType: SessionType;
  isRunning: boolean;
  currentProjectId: string | null;
  completedFocusCount: number;
}