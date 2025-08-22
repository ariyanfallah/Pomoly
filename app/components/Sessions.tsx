import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, History, Filter, TrendingUp, ArrowRight, Zap } from 'lucide-react';
import { TimerSession, Project } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AnalyticsFilters } from './AnalyticsFilters';
import { DateRangePicker } from './DateRangePicker';
import { format, isToday, isYesterday, isThisWeek, isWithinInterval, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { DateRange } from "react-day-picker";
import { seedMockData } from '@/utils/mockData';

type ViewPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';

export function Sessions() {
  const [sessions, setSessions] = useLocalStorage<TimerSession[]>('pomodoroSessions', []);
  const [projects, setProjects] = useLocalStorage<Project[]>('pomodoroProjects', []);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('weekly');
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();

  // Auto-load mock data if no sessions exist
  useEffect(() => {
    if (sessions.length === 0 && projects.length === 0) {
      seedMockData();
      const newProjects = JSON.parse(localStorage.getItem('pomodoroProjects') || '[]');
      const newSessions = JSON.parse(localStorage.getItem('pomodoroSessions') || '[]');
      setProjects(newProjects);
      setSessions(newSessions);
    }
  }, [sessions.length, projects.length, setProjects, setSessions]);

  const getDateRange = (): { start: Date; end: Date } => {
    const now = new Date();
    
    switch (viewPeriod) {
      case 'daily':
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        };
      case 'weekly':
        return {
          start: startOfWeek(now),
          end: endOfWeek(now)
        };
      case 'monthly':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      case 'custom':
        if (customDateRange?.from && customDateRange?.to) {
          return {
            start: startOfDay(customDateRange.from),
            end: endOfDay(customDateRange.to)
          };
        }
        // Fallback to last 30 days if no custom range selected
        return {
          start: startOfDay(subDays(now, 30)),
          end: endOfDay(now)
        };
      default:
        return {
          start: startOfWeek(now),
          end: endOfWeek(now)
        };
    }
  };

  const filteredSessions = useMemo(() => {
    let filtered = sessions.filter(session => session.type === 'focus');
    
    // Filter by project
    if (selectedProject) {
      filtered = filtered.filter(session => session.projectId === selectedProject);
    }
    
    // Filter by date range
    const { start, end } = getDateRange();
    filtered = filtered.filter(session => {
      const sessionDate = new Date(session.completedAt);
      return isWithinInterval(sessionDate, { start, end });
    });
    
    return filtered.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }, [sessions, selectedProject, viewPeriod, customDateRange]);

  const getProjectName = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const getProjectColor = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    return project?.color || 'hsl(var(--muted))';
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatSessionDate = (date: Date): string => {
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE, h:mm a');
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  const groupedSessions = useMemo(() => {
    const groups: { [key: string]: TimerSession[] } = {};
    
    filteredSessions.forEach(session => {
      const date = new Date(session.completedAt);
      let key: string;
      
      if (isToday(date)) {
        key = 'Today';
      } else if (isYesterday(date)) {
        key = 'Yesterday';
      } else if (isThisWeek(date)) {
        key = format(date, 'EEEE');
      } else {
        key = format(date, 'MMM d, yyyy');
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(session);
    });
    
    return groups;
  }, [filteredSessions]);

  const totalFocusTime = filteredSessions.reduce((total, session) => total + Math.floor(session.duration / 60), 0);
  const totalSessions = filteredSessions.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-100 to-blue-100">
            <History className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Focus Sessions</h2>
            <p className="text-sm text-muted-foreground">Track your productivity journey</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <AnalyticsFilters 
            projects={projects}
            selectedProject={selectedProject}
            onProjectChange={setSelectedProject}
          />
          
          <div className="flex rounded-xl bg-secondary p-1">
            {(['daily', 'weekly', 'monthly', 'custom'] as ViewPeriod[]).map((period) => (
              <Button
                key={period}
                variant={viewPeriod === period ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewPeriod(period)}
                className="capitalize transition-smooth"
              >
                {period}
              </Button>
            ))}
          </div>
          
          {viewPeriod === 'custom' && (
            <DateRangePicker
              dateRange={customDateRange}
              onDateRangeChange={setCustomDateRange}
            />
          )}
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 shadow-soft border-0 bg-gradient-to-br from-card to-primary-light/30 group hover:shadow-luxury transition-luxury">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary text-primary-foreground transition-smooth group-hover:scale-105 group-hover:rotate-3">
              <Clock className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Total Focus Time</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {formatTime(totalFocusTime)}
              </p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {selectedProject ? getProjectName(selectedProject) : 'All Projects'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-soft border-0 bg-gradient-to-br from-card to-accent-light/30 group hover:shadow-luxury transition-luxury">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-accent text-accent-foreground transition-smooth group-hover:scale-105 group-hover:rotate-3">
              <Zap className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Sessions Completed</p>
              <p className="text-2xl font-bold">{totalSessions}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {viewPeriod === 'custom' && customDateRange?.from && customDateRange?.to ? 
                  `${format(customDateRange.from, 'MMM d')} - ${format(customDateRange.to, 'MMM d')}` :
                  `This ${viewPeriod.replace('ly', '')}`
                }
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-soft border-0 bg-gradient-to-br from-card to-blue-100/30 group hover:shadow-luxury transition-luxury">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-600 text-white transition-smooth group-hover:scale-105 group-hover:rotate-3">
              <Filter className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Average Session</p>
              <p className="text-2xl font-bold">
                {totalSessions > 0 ? formatTime(Math.floor(totalFocusTime / totalSessions)) : '0m'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Per session</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Sessions List */}
      <Card className="shadow-soft border-0 overflow-hidden">
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <History className="h-4 w-4" />
                Session Timeline
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedProject ? `Sessions for ${getProjectName(selectedProject)}` : 'All focus sessions'} 
                {viewPeriod === 'custom' && customDateRange?.from && customDateRange?.to && 
                  ` from ${format(customDateRange.from, 'MMM d')} to ${format(customDateRange.to, 'MMM d')}`
                }
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-muted-foreground">
                {totalSessions} sessions
              </div>
              <div className="text-xs text-muted-foreground">
                {formatTime(totalFocusTime)} total
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-h-[500px] overflow-y-auto">
          {Object.keys(groupedSessions).length > 0 ? (
            Object.entries(groupedSessions).map(([dateGroup, sessionGroup]) => (
              <div key={dateGroup} className="border-b border-border/50 last:border-0">
                <div className="p-4 bg-gradient-to-r from-muted/20 to-muted/10 sticky top-0 z-10 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      {dateGroup}
                    </h4>
                    <div className="text-sm text-muted-foreground bg-card px-2 py-1 rounded-md">
                      {sessionGroup.length} session{sessionGroup.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-border/30">
                  {sessionGroup.map((session, index) => (
                    <div key={session.id} className="group/session p-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Project indicator with animation */}
                          <div className="relative">
                            <div 
                              className="w-5 h-5 rounded-full flex-shrink-0 transition-all duration-300 group-hover/session:scale-110 shadow-sm"
                              style={{ 
                                backgroundColor: getProjectColor(session.projectId),
                                boxShadow: `0 0 0 2px ${getProjectColor(session.projectId)}20`
                              }}
                            />
                            <div 
                              className="absolute inset-0 w-5 h-5 rounded-full animate-ping opacity-20"
                              style={{ backgroundColor: getProjectColor(session.projectId) }}
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-semibold truncate group-hover/session:text-primary transition-colors">
                                {getProjectName(session.projectId)}
                              </span>
                              <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                <Clock className="h-3 w-3" />
                                {formatTime(Math.floor(session.duration / 60))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatSessionDate(new Date(session.completedAt))}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm font-mono text-muted-foreground group-hover/session:text-foreground transition-colors">
                            <ArrowRight className="h-3 w-3" />
                            {format(new Date(session.completedAt), 'h:mm a')}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Session #{sessionGroup.length - index}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="p-16 text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mx-auto flex items-center justify-center">
                  <History className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-accent-foreground">0</span>
                </div>
              </div>
              <p className="font-medium text-muted-foreground mb-2">
                {selectedProject ? 'No sessions for this project' : 'No focus sessions yet'}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedProject ? 'Try selecting a different project or start a new session' : 'Start your first focus session to see it here'}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}