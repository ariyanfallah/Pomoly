import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { Project, TimerSession, TimerSettings } from '@/types';
import { createMockData } from '@/utils/mockData';
import { defaultTimerSettings } from '@/configs/timerSettings.config';

interface SessionInput extends Omit<TimerSession, 'id'> {
  id?: string;
}

interface DataContextValue {
  projects: Project[];
  addProject: (name: string, color: string) => Project;
  updateProject: (id: string, updates: Partial<Pick<Project, 'name' | 'color'>>) => Project | null;
  deleteProject: (id: string) => boolean;
  sessions: TimerSession[];
  addSession: (session: SessionInput) => TimerSession;
  removeSession: (id: string) => boolean;
  getTimerSettings: (projectId: string | null) => TimerSettings;
  setTimerSettings: (projectId: string | null, settings: TimerSettings) => void;
  resetTimerSettings: (projectId: string | null) => void;
  seedMockData: () => void;
  clearData: () => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

const GLOBAL_SETTINGS_KEY = '__global__';

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Math.random().toString(36).slice(2, 10)}`;
};

const ensureDate = (value: Date | string | null | undefined) => {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const initialDataRef = useRef(createMockData());
  const [projects, setProjects] = useState<Project[]>(initialDataRef.current.projects);
  const [sessions, setSessions] = useState<TimerSession[]>(initialDataRef.current.sessions);
  const [settingsByProject, setSettingsByProject] = useState<Record<string, TimerSettings>>({});

  const addProject = useCallback((name: string, color: string) => {
    const newProject: Project = {
      id: createId(),
      name,
      color,
      createdAt: new Date(),
    };
    setProjects(prev => [...prev, newProject]);
    return newProject;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Pick<Project, 'name' | 'color'>>) => {
    let updatedProject: Project | null = null;
    setProjects(prev => prev.map(project => {
      if (project.id !== id) return project;
      updatedProject = { ...project, ...updates };
      return updatedProject;
    }));
    return updatedProject;
  }, []);

  const deleteProject = useCallback((id: string) => {
    const exists = projects.some(project => project.id === id);
    if (!exists) {
      return false;
    }
    setProjects(prev => prev.filter(project => project.id !== id));
    setSessions(prev => prev.filter(session => session.projectId !== id));
    setSettingsByProject(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    return true;
  }, [projects]);

  const addSession = useCallback((session: SessionInput) => {
    const normalized: TimerSession = {
      id: session.id ?? createId(),
      projectId: session.projectId,
      type: session.type,
      duration: session.duration,
      completedAt: ensureDate(session.completedAt) ?? new Date(),
      startedAt: ensureDate(session.startedAt),
      isManual: session.isManual ?? false,
      notes: session.notes ?? null,
    };

    setSessions(prev => {
      const next = [normalized, ...prev];
      return next.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    });

    return normalized;
  }, []);

  const removeSession = useCallback((id: string) => {
    const exists = sessions.some(session => session.id === id);
    if (!exists) {
      return false;
    }
    setSessions(prev => prev.filter(session => session.id !== id));
    return true;
  }, [sessions]);

  const getTimerSettings = useCallback((projectId: string | null) => {
    const key = projectId ?? GLOBAL_SETTINGS_KEY;
    const stored = settingsByProject[key];
    return stored ? { ...stored } : { ...defaultTimerSettings };
  }, [settingsByProject]);

  const setTimerSettings = useCallback((projectId: string | null, settings: TimerSettings) => {
    const key = projectId ?? GLOBAL_SETTINGS_KEY;
    setSettingsByProject(prev => ({ ...prev, [key]: { ...settings } }));
  }, []);

  const resetTimerSettings = useCallback((projectId: string | null) => {
    const key = projectId ?? GLOBAL_SETTINGS_KEY;
    setSettingsByProject(prev => {
      if (!(key in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const seedMockData = useCallback(() => {
    const data = createMockData();
    setProjects(data.projects);
    setSessions(data.sessions);
  }, []);

  const clearData = useCallback(() => {
    setProjects([]);
    setSessions([]);
    setSettingsByProject({});
  }, []);

  const value = useMemo<DataContextValue>(() => ({
    projects,
    addProject,
    updateProject,
    deleteProject,
    sessions,
    addSession,
    removeSession,
    getTimerSettings,
    setTimerSettings,
    resetTimerSettings,
    seedMockData,
    clearData,
  }), [
    projects,
    sessions,
    addProject,
    updateProject,
    deleteProject,
    addSession,
    removeSession,
    getTimerSettings,
    setTimerSettings,
    resetTimerSettings,
    seedMockData,
    clearData,
  ]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
