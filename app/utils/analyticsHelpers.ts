import type { TimerSession, Project } from '@/types';

export interface AnalyticsData {
  chartData: Array<{ date: string; minutes: number; sessions: number }>;
  projectChartData: Array<{ name: string; minutes: number; color: string; percentage: number }>;
  totalMinutes: number;
  totalSessions: number;
  averageSessionLength: number;
  bestFocusDay: string;
  weekOverWeekChange: number;
  streakDays: number;
}

export function calculateAnalyticsData(
  sessions: TimerSession[], 
  projects: Project[], 
  viewPeriod: 'daily' | 'weekly' | 'monthly' | 'custom',
  selectedProject?: string | null
): AnalyticsData {
  const now = new Date();
  const startDate = new Date();
  const previousStartDate = new Date();
  
  // Calculate date ranges
  switch (viewPeriod) {
    case 'daily':
      startDate.setDate(now.getDate() - 6); // Last 7 days
      previousStartDate.setDate(now.getDate() - 13); // Previous 7 days
      break;
    case 'weekly':
      startDate.setDate(now.getDate() - 27); // Last 4 weeks
      previousStartDate.setDate(now.getDate() - 55); // Previous 4 weeks
      break;
    case 'monthly':
      startDate.setMonth(now.getMonth() - 5); // Last 6 months
      previousStartDate.setMonth(now.getMonth() - 11); // Previous 6 months
      break;
    case 'custom':
      // For custom range, we'll use last 30 days as default comparison
      startDate.setDate(now.getDate() - 30);
      previousStartDate.setDate(now.getDate() - 60);
      break;
  }

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    const sessionDate = new Date(session.completedAt);
    const matchesProject = !selectedProject || session.projectId === selectedProject;
    return sessionDate >= startDate && session.type === 'focus' && matchesProject;
  });

  const previousPeriodSessions = sessions.filter(session => {
    const sessionDate = new Date(session.completedAt);
    const matchesProject = !selectedProject || session.projectId === selectedProject;
    return sessionDate >= previousStartDate && sessionDate < startDate && session.type === 'focus' && matchesProject;
  });

  // Group sessions by time period
  const groupedData: { [key: string]: { minutes: number; sessions: number } } = {};
  const dayOfWeekData: { [key: string]: number } = {};
  
  filteredSessions.forEach(session => {
    const date = new Date(session.completedAt);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const sessionMinutes = session.duration / 60;
    
    let key: string;
    
    switch (viewPeriod) {
      case 'daily':
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        break;
      case 'weekly':
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        break;
      case 'monthly':
        key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        break;
      case 'custom':
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        break;
      default:
        key = date.toDateString();
    }
    
    groupedData[key] = groupedData[key] || { minutes: 0, sessions: 0 };
    groupedData[key].minutes += sessionMinutes;
    groupedData[key].sessions += 1;
    
    dayOfWeekData[dayOfWeek] = (dayOfWeekData[dayOfWeek] || 0) + sessionMinutes;
  });

  // Convert to chart format
  const chartData = Object.entries(groupedData).map(([date, data]) => ({
    date,
    minutes: Math.round(data.minutes),
    sessions: data.sessions,
  }));

  // Project breakdown
  const projectData: { [key: string]: number } = {};
  filteredSessions.forEach(session => {
    const project = projects.find(p => p.id === session.projectId);
    const projectName = project?.name || 'Unknown Project';
    projectData[projectName] = (projectData[projectName] || 0) + (session.duration / 60);
  });

  const totalProjectMinutes = Object.values(projectData).reduce((sum, minutes) => sum + minutes, 0);
  const projectChartData = Object.entries(projectData).map(([name, minutes]) => ({
    name,
    minutes: Math.round(minutes),
    color: projects.find(p => p.name === name)?.color || 'hsl(var(--primary))',
    percentage: totalProjectMinutes > 0 ? Math.round((minutes / totalProjectMinutes) * 100) : 0,
  }));

  // Calculate totals and metrics
  const totalMinutes = filteredSessions.reduce((sum, session) => sum + (session.duration / 60), 0);
  const totalSessions = filteredSessions.length;
  const averageSessionLength = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
  
  // Find best focus day
  const bestFocusDay = Object.entries(dayOfWeekData).reduce(
    (best, [day, minutes]) => minutes > best.minutes ? { day, minutes } : best,
    { day: 'None', minutes: 0 }
  ).day;

  // Calculate week-over-week change
  const currentPeriodMinutes = totalMinutes;
  const previousPeriodMinutes = previousPeriodSessions.reduce((sum, session) => sum + (session.duration / 60), 0);
  const weekOverWeekChange = previousPeriodMinutes > 0 
    ? Math.round(((currentPeriodMinutes - previousPeriodMinutes) / previousPeriodMinutes) * 100)
    : 0;

  return {
    chartData,
    projectChartData,
    totalMinutes: Math.round(totalMinutes),
    totalSessions,
    averageSessionLength,
    bestFocusDay,
    weekOverWeekChange,
    streakDays: 0, // Will be calculated by StreakCard component
  };
}