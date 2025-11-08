import type { TimerSession, Project, SessionType } from '@/types';

const projectColors = [
  'hsl(220, 85%, 57%)', // Blue
  'hsl(142, 71%, 45%)', // Green
  'hsl(262, 83%, 58%)', // Purple
  'hsl(346, 87%, 43%)', // Red
  'hsl(31, 81%, 56%)',  // Orange
  'hsl(280, 100%, 70%)', // Pink
];

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Math.random().toString(36).slice(2, 10)}`;
};

export function generateMockProjects(): Project[] {
  const projectNames = [
    'Website Redesign',
    'Mobile App Development',
    'Content Writing',
    'Data Analysis',
    'Learning TypeScript',
    'Client Project Alpha'
  ];

  return projectNames.map((name, index) => ({
    id: `project_${index + 1}`,
    name,
    color: projectColors[index % projectColors.length],
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  }));
}

export function generateMockSessions(projects: Project[]): TimerSession[] {
  const sessions: TimerSession[] = [];
  const now = new Date();
  const sessionTypes: SessionType[] = ['focus', 'shortBreak', 'longBreak'];

  for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    if (Math.random() < 0.3) continue;

    const sessionsToday = Math.floor(Math.random() * 6) + 1;

    for (let i = 0; i < sessionsToday; i++) {
      const sessionType = sessionTypes[Math.floor(Math.random() * sessionTypes.length)];
      let duration: number;

      switch (sessionType) {
        case 'focus':
          duration = (20 + Math.floor(Math.random() * 15)) * 60;
          break;
        case 'shortBreak':
          duration = (3 + Math.floor(Math.random() * 4)) * 60;
          break;
        case 'longBreak':
          duration = (12 + Math.floor(Math.random() * 8)) * 60;
          break;
        default:
          duration = 25 * 60;
      }

      const sessionTime = new Date(date);
      sessionTime.setHours(
        8 + Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 60),
        Math.floor(Math.random() * 60)
      );

      const completedAt = new Date(sessionTime);
      const startedAt = new Date(completedAt.getTime() - duration * 1000);

      sessions.push({
        id: createId(),
        projectId: projects[Math.floor(Math.random() * projects.length)].id,
        type: sessionType,
        duration,
        completedAt,
        startedAt,
        isManual: false,
        notes: null,
      });
    }
  }

  return sessions.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
}

export function createMockData(): { projects: Project[]; sessions: TimerSession[] } {
  const projects = generateMockProjects();
  const sessions = generateMockSessions(projects);
  return { projects, sessions };
}
