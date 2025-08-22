import { TimerSession, Project, SessionType } from '@/types';

const projectColors = [
  'hsl(220, 85%, 57%)', // Blue
  'hsl(142, 71%, 45%)', // Green  
  'hsl(262, 83%, 58%)', // Purple
  'hsl(346, 87%, 43%)', // Red
  'hsl(31, 81%, 56%)',  // Orange
  'hsl(280, 100%, 70%)', // Pink
];

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
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Within last 30 days
  }));
}

export function generateMockSessions(projects: Project[]): TimerSession[] {
  const sessions: TimerSession[] = [];
  const now = new Date();
  const sessionTypes: SessionType[] = ['focus', 'shortBreak', 'longBreak'];
  
  // Generate sessions for the last 30 days
  for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    
    // Skip some days randomly to make it realistic
    if (Math.random() < 0.3) continue;
    
    // Generate 1-6 sessions per day
    const sessionsToday = Math.floor(Math.random() * 6) + 1;
    
    for (let i = 0; i < sessionsToday; i++) {
      const sessionType = sessionTypes[Math.floor(Math.random() * sessionTypes.length)];
      let duration: number;
      
      // Set realistic durations based on session type
      switch (sessionType) {
        case 'focus':
          duration = (20 + Math.floor(Math.random() * 15)) * 60; // 20-35 minutes
          break;
        case 'shortBreak':
          duration = (3 + Math.floor(Math.random() * 4)) * 60; // 3-7 minutes
          break;
        case 'longBreak':
          duration = (12 + Math.floor(Math.random() * 8)) * 60; // 12-20 minutes
          break;
        default:
          duration = 25 * 60; // Default 25 minutes
      }
      
      // Set time of day for the session
      const sessionTime = new Date(date);
      sessionTime.setHours(
        8 + Math.floor(Math.random() * 12), // Between 8 AM and 8 PM
        Math.floor(Math.random() * 60),
        Math.floor(Math.random() * 60)
      );
      
      sessions.push({
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId: projects[Math.floor(Math.random() * projects.length)].id,
        type: sessionType,
        duration,
        completedAt: sessionTime,
      });
    }
  }
  
  // Sort sessions by completion date (newest first)
  return sessions.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
}

export function seedMockData(): void {
  const projects = generateMockProjects();
  const sessions = generateMockSessions(projects);
  
  localStorage.setItem('pomodoroProjects', JSON.stringify(projects));
  localStorage.setItem('pomodoroSessions', JSON.stringify(sessions));
  
  console.log(`Seeded ${projects.length} projects and ${sessions.length} sessions`);
}

export function clearMockData(): void {
  localStorage.removeItem('pomodoroProjects');
  localStorage.removeItem('pomodoroSessions');
  console.log('Cleared all mock data');
}