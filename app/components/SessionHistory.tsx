import { type TimerSession, type Project } from '@/types';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SessionHistoryProps {
  sessions: TimerSession[];
  projects: Project[];
}

export function SessionHistory({ sessions, projects }: SessionHistoryProps) {
  const recentSessions = sessions
    .filter(session => session.type === 'focus')
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 5);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const getProjectColor = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.color || 'hsl(var(--primary))';
  };

  if (recentSessions.length === 0) {
    return (
      <Card className="p-6 shadow-soft border-0">
        <h3 className="font-semibold mb-4">Recent Sessions</h3>
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Clock className="h-12 w-12 mb-3 opacity-50" />
          <p>No sessions yet</p>
          <p className="text-sm">Complete your first focus session</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-soft border-0">
      <h3 className="font-semibold mb-4">Recent Sessions</h3>
      <div className="space-y-3">
        {recentSessions.map((session) => (
          <div 
            key={session.id} 
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-smooth group"
          >
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: getProjectColor(session.projectId) }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">
                  {formatTime(Math.round(session.duration / 60))} Focus
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground truncate">
                  {getProjectName(session.projectId)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(session.completedAt), { addSuffix: true })}
              </p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-smooth">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}