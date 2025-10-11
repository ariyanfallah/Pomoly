import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ManualSessionEntry } from '@/components/ManualSessionEntry';
import { Clock, Target, Coffee, Calendar, Trash2, Edit3 } from 'lucide-react';
import { format, parseISO, startOfDay } from 'date-fns';
import { useSessions, type DatabaseSession } from '@/hooks/useSessions';
import { useProjects } from '@/hooks/useProjects';
import type { SessionType } from '@/types';
import { cn } from '@/lib/utils';

export function Sessions() {
  const { sessions, loading, deleteSession, refetch } = useSessions();
  const { projects, loading: projectsLoading } = useProjects();

  const getSessionIcon = (type: SessionType) => {
    switch (type) {
      case 'focus':
        return Target;
      case 'shortBreak':
      case 'longBreak':
        return Coffee;
      default:
        return Clock;
    }
  };

  const getSessionColor = (type: SessionType) => {
    switch (type) {
      case 'focus':
        return 'text-emerald-600 bg-emerald-100 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800';
      case 'shortBreak':
        return 'text-blue-600 bg-blue-100 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800';
      case 'longBreak':
        return 'text-purple-600 bg-purple-100 border-purple-200 dark:text-purple-400 dark:bg-purple-950 dark:border-purple-800';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-800';
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatSessionType = (type: SessionType): string => {
    switch (type) {
      case 'focus':
        return 'Focus Session';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Session';
    }
  };

  // Group sessions by date
  const groupedSessions = sessions.reduce((groups, session) => {
    const date = startOfDay(parseISO(session.completed_at));
    const dateKey = date.toISOString();
    
    if (!groups[dateKey]) {
      groups[dateKey] = {
        date,
        sessions: [],
      };
    }
    
    groups[dateKey].sessions.push(session);
    return groups;
  }, {} as Record<string, { date: Date; sessions: DatabaseSession[] }>);

  const sortedGroups = Object.values(groupedSessions).sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  );

  if (loading || projectsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Session History</h2>
            <p className="text-muted-foreground">Track your completed work sessions</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Session History</h2>
            <p className="text-muted-foreground">Track your completed work sessions</p>
          </div>
          {projects.length > 0 && (
            <ManualSessionEntry 
              projects={projects} 
              onSessionAdded={refetch}
            />
          )}
        </div>
        
        <Card className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No sessions yet</h3>
          <p className="text-muted-foreground mb-4">
            Start a timer session or add a manual entry to see your work history.
          </p>
          {projects.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Create a project first to start tracking sessions.
            </p>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Session History</h2>
          <p className="text-muted-foreground">Track your completed work sessions</p>
        </div>
        {projects.length > 0 && (
          <ManualSessionEntry 
            projects={projects} 
            onSessionAdded={refetch}
          />
        )}
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-6 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-border to-transparent"></div>
        
        <div className="space-y-8">
          {sortedGroups.map((group, groupIndex) => (
            <div key={group.date.toISOString()} className="relative">
              {/* Date node */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative z-10 w-16 h-16 rounded-full bg-card border-2 border-primary/20 flex items-center justify-center shadow-soft animate-fade-in">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    {format(group.date, 'EEEE, MMMM d')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {group.sessions.length} session{group.sessions.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Session cards */}
              <div className="ml-20 space-y-3">
                {group.sessions.map((session, sessionIndex) => {
                  const SessionIcon = getSessionIcon(session.type);
                  const project = projects.find(p => p.id === session.project_id) || session.projects;
                  
                  return (
                    <Card 
                      key={session.id}
                      className={cn(
                        "p-4 shadow-soft border-l-4 hover:shadow-md transition-shadow animate-fade-in hover-scale",
                        session.type === 'focus' 
                          ? 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' 
                          : session.type === 'shortBreak'
                          ? 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                          : 'border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20'
                      )}
                      style={{ 
                        animationDelay: `${(groupIndex * 100) + (sessionIndex * 50)}ms` 
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            getSessionColor(session.type)
                          )}>
                            <SessionIcon className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className={getSessionColor(session.type)}>
                                {formatSessionType(session.type)}
                              </Badge>
                              {session.is_manual && (
                                <Badge variant="secondary" className="text-xs">
                                  <Edit3 className="h-3 w-3 mr-1" />
                                  Manual
                                </Badge>
                              )}
                            </div>
                            
                            {project && (
                              <div className="flex items-center gap-2 mb-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: project.color }}
                                />
                                <span className="text-sm font-medium text-foreground">
                                  {project.name}
                                </span>
                              </div>
                            )}
                            
                            <div className="text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatDuration(session.duration)}</span>
                                <span className="mx-2">•</span>
                                <span>
                                  {format(parseISO(session.started_at), 'h:mm a')} - {format(parseISO(session.completed_at), 'h:mm a')}
                                </span>
                              </div>
                            </div>
                            
                            {session.notes && (
                              <p className="text-sm text-muted-foreground mt-2 italic">
                                "{session.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {session.is_manual && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSession(session.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}