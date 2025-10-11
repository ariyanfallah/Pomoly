import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip, Legend } from 'recharts';
import { Calendar, Clock, TrendingUp, Target, TrendingDown, Activity, ArrowUpRight, ArrowDownRight, Sparkles, Trash2, PieChart as PieChartIcon } from 'lucide-react';
import type { TimerSession, Project } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AnalyticsStreakCard } from './AnalyticsStreakCard';
import { AnalyticsFilters } from './AnalyticsFilters';
import { DateRangePicker } from './DateRangePicker';
import { calculateAnalyticsData } from '@/utils/analyticsHelpers';
import { seedMockData, clearMockData } from '@/utils/mockData';
import type { DateRange } from "react-day-picker";
import { isWithinInterval, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

type ViewPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';

export function Analytics() {
  const [sessions, setSessions] = useLocalStorage<TimerSession[]>('pomodoroSessions', []);
  const [projects, setProjects] = useLocalStorage<Project[]>('pomodoroProjects', []);
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('weekly');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
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

  const handleSeedMockData = () => {
    seedMockData();
    // Force refresh by updating state
    const newProjects = JSON.parse(localStorage.getItem('pomodoroProjects') || '[]');
    const newSessions = JSON.parse(localStorage.getItem('pomodoroSessions') || '[]');
    setProjects(newProjects);
    setSessions(newSessions);
  };

  const handleClearData = () => {
    clearMockData();
    setProjects([]);
    setSessions([]);
  };

  const getFilteredSessions = () => {
    if (viewPeriod === 'custom' && customDateRange?.from && customDateRange?.to) {
      return sessions.filter(session => {
        const sessionDate = new Date(session.completedAt);
        return isWithinInterval(sessionDate, {
          start: startOfDay(customDateRange.from!),
          end: endOfDay(customDateRange.to!)
        });
      });
    }
    return sessions;
  };

  const analyticsData = useMemo(() => {
    const filteredSessions = getFilteredSessions();
    return calculateAnalyticsData(filteredSessions, projects, viewPeriod, selectedProject);
  }, [sessions, projects, viewPeriod, selectedProject, customDateRange]);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Analytics</h2>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 shadow-soft border-0 group hover:shadow-luxury transition-luxury">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary-light transition-smooth group-hover:scale-105">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Focus Time</p>
              <p className="text-2xl font-semibold">{formatTime(analyticsData.totalMinutes)}</p>
              <div className="flex items-center gap-1 mt-1">
                {analyticsData.weekOverWeekChange !== 0 && (
                  <>
                    {analyticsData.weekOverWeekChange > 0 ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${
                      analyticsData.weekOverWeekChange > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {Math.abs(analyticsData.weekOverWeekChange)}% vs last period
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-soft border-0 group hover:shadow-luxury transition-luxury">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-accent-light transition-smooth group-hover:scale-105">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sessions Completed</p>
              <p className="text-2xl font-semibold">{analyticsData.totalSessions}</p>
              {analyticsData.bestFocusDay !== 'None' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Best day: {analyticsData.bestFocusDay}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-soft border-0 group hover:shadow-luxury transition-luxury">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 transition-smooth group-hover:scale-105">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Session</p>
              <p className="text-2xl font-semibold">{formatTime(analyticsData.averageSessionLength)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Per focus session
              </p>
            </div>
          </div>
        </Card>

        <AnalyticsStreakCard sessions={sessions} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Time Trend Chart */}
        <Card className="xl:col-span-2 p-6 shadow-soft border-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Focus Time Trends</h3>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          {analyticsData.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={analyticsData.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line 
                  type="monotone"
                  dataKey="minutes" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No focus sessions recorded yet</p>
                <p className="text-sm">Start a timer to see your trends</p>
              </div>
            </div>
          )}
        </Card>

        {/* Enhanced Project Distribution */}
        <Card className="p-6 shadow-soft border-0 group hover:shadow-luxury transition-luxury">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Project Distribution</h3>
            <PieChartIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-smooth" />
          </div>
          {analyticsData.projectChartData.length > 0 ? (
            <div className="space-y-6">
              <div className="relative">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={analyticsData.projectChartData}
                      dataKey="minutes"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      strokeWidth={2}
                      stroke="hsl(var(--card))"
                    >
                      {analyticsData.projectChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          className="hover:opacity-90 cursor-pointer transition-all hover:scale-105"
                          style={{
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: 'var(--shadow-soft)',
                        padding: '12px'
                      }}
                      formatter={(value: number, name: string) => [
                        `${formatTime(value)} (${((value / analyticsData.totalMinutes) * 100).toFixed(1)}%)`,
                        name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {analyticsData.projectChartData.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Projects
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 max-h-40 overflow-y-auto scrollbar-thin">
                {analyticsData.projectChartData.map((project, index) => (
                  <div key={project.name} className="group/item">
                    <div className="flex items-center justify-between hover:bg-muted/50 p-3 rounded-lg transition-smooth cursor-pointer">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative">
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0 transition-transform group-hover/item:scale-110"
                            style={{ backgroundColor: project.color }}
                          />
                          <div 
                            className="absolute inset-0 w-4 h-4 rounded-full animate-pulse opacity-30"
                            style={{ backgroundColor: project.color }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate group-hover/item:text-primary transition-smooth">
                              {project.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-700 ease-out"
                                style={{ 
                                  backgroundColor: project.color,
                                  width: `${project.percentage}%`
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <div className="text-sm font-semibold text-foreground">
                          {formatTime(project.minutes)}
                        </div>
                        <div className="text-xs font-medium text-muted-foreground">
                          {project.percentage}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full border-4 border-muted mx-auto" />
                  <PieChartIcon className="h-6 w-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50" />
                </div>
                <p className="font-medium">No project data available</p>
                <p className="text-sm mt-1">Complete focus sessions to see distribution</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Additional Insights */}
      <Card className="p-6 shadow-soft border-0">
        <h3 className="font-semibold mb-4">Quick Insights</h3>
        <div className="space-y-4">
          {analyticsData.totalSessions > 0 && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Best focus day</span>
                <span className="text-sm font-medium">{analyticsData.bestFocusDay}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg per session</span>
                <span className="text-sm font-medium">{formatTime(analyticsData.averageSessionLength)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Period change</span>
                <div className="flex items-center gap-1">
                  {analyticsData.weekOverWeekChange > 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                  ) : analyticsData.weekOverWeekChange < 0 ? (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  ) : null}
                  <span className={`text-sm font-medium ${
                    analyticsData.weekOverWeekChange > 0 ? 'text-green-500' : 
                    analyticsData.weekOverWeekChange < 0 ? 'text-red-500' : 'text-muted-foreground'
                  }`}>
                    {analyticsData.weekOverWeekChange === 0 ? 'No change' : `${analyticsData.weekOverWeekChange > 0 ? '+' : ''}${analyticsData.weekOverWeekChange}%`}
                  </span>
                </div>
              </div>
            </>
          )}
          
          {analyticsData.totalSessions === 0 && (
            <div className="text-center py-4">
              <Clock className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">Mock data automatically loaded</p>
            </div>
          )}

          {analyticsData.totalSessions > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <Button 
                onClick={handleClearData}
                variant="outline" 
                size="sm"
                className="w-full gap-2 text-xs"
              >
                <Trash2 className="h-3 w-3" />
                Clear All Data
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}