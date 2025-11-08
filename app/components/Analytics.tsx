import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Calendar,
  Clock,
  TrendingUp,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Trash2,
  PieChart as PieChartIcon,
} from 'lucide-react';
import type { TimerSession, Project } from '@/types';
import { AnalyticsStreakCard } from './AnalyticsStreakCard';
import { AnalyticsFilters } from './AnalyticsFilters';
import { DateRangePicker } from './DateRangePicker';
import { calculateAnalyticsData } from '@/utils/analyticsHelpers';
import type { DateRange } from 'react-day-picker';
import { endOfDay, isWithinInterval, startOfDay, startOfMonth, startOfWeek, endOfMonth, endOfWeek } from 'date-fns';
import { useData } from '@/contexts/DataContext';

type ViewPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';

const chartColors = ['#5EADD1', '#7BC96F', '#F7931E', '#E85D75', '#9B5DE5', '#F15BB5'];

export function Analytics() {
  const { projects, sessions, seedMockData, clearData } = useData();
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('weekly');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();

  const filteredSessions = useMemo(() => {
    if (viewPeriod === 'custom' && customDateRange?.from && customDateRange?.to) {
      return sessions.filter(session => {
        const sessionDate = new Date(session.completedAt);
        return isWithinInterval(sessionDate, {
          start: startOfDay(customDateRange.from!),
          end: endOfDay(customDateRange.to!),
        });
      });
    }
    return sessions;
  }, [sessions, viewPeriod, customDateRange]);

  const selectionFilteredSessions = useMemo(() => {
    if (!selectedProject) {
      return filteredSessions;
    }
    return filteredSessions.filter(session => session.projectId === selectedProject);
  }, [filteredSessions, selectedProject]);

  const analyticsData = useMemo(() => {
    return calculateAnalyticsData(filteredSessions, projects as Project[], viewPeriod, selectedProject);
  }, [filteredSessions, projects, viewPeriod, selectedProject]);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const projectBreakdown = useMemo(() => {
    const projectTotals = new Map<string, number>();

    selectionFilteredSessions
      .filter(session => session.type === 'focus')
      .forEach(session => {
        const minutes = session.duration / 60;
        projectTotals.set(session.projectId, (projectTotals.get(session.projectId) || 0) + minutes);
      });

    const totalMinutes = Array.from(projectTotals.values()).reduce((sum, minutes) => sum + minutes, 0);

    return Array.from(projectTotals.entries()).map(([projectId, minutes], index) => {
      const project = projects.find(p => p.id === projectId);
      const color = project?.color ?? chartColors[index % chartColors.length];
      return {
        name: project?.name ?? 'Unknown Project',
        value: Math.round(minutes),
        color,
        percentage: totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0,
      };
    });
  }, [projects, selectionFilteredSessions]);

  const focusSummary = useMemo(() => {
    const today = startOfDay(new Date());
    const weekRange = { start: startOfWeek(today), end: endOfWeek(today) };
    const monthRange = { start: startOfMonth(today), end: endOfMonth(today) };

    const minutesInRange = (range: { start: Date; end: Date }) =>
      selectionFilteredSessions
        .filter(session => session.type === 'focus' && isWithinInterval(new Date(session.completedAt), range))
        .reduce((sum, session) => sum + session.duration / 60, 0);

    const todayMinutes = selectionFilteredSessions
      .filter(session => session.type === 'focus' && isWithinInterval(new Date(session.completedAt), { start: today, end: endOfDay(today) }))
      .reduce((sum, session) => sum + session.duration / 60, 0);

    return {
      weekly: Math.round(minutesInRange(weekRange)),
      monthly: Math.round(minutesInRange(monthRange)),
      today: Math.round(todayMinutes),
    };
  }, [selectionFilteredSessions]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Analytics</h2>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <AnalyticsFilters
            projects={projects as Project[]}
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

          <div className="flex gap-2">
            <Button variant="outline" onClick={seedMockData} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Sample Data
            </Button>
            <Button variant="outline" onClick={clearData} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Clear Data
            </Button>
          </div>
        </div>
      </div>

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
                    <span
                      className={`text-xs font-medium ${
                        analyticsData.weekOverWeekChange > 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
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
              <p className="text-xs text-muted-foreground mt-1">Per focus session</p>
            </div>
          </div>
        </Card>

        <AnalyticsStreakCard sessions={selectionFilteredSessions as TimerSession[]} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Line type="monotone" dataKey="minutes" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              No data available for the selected range.
            </div>
          )}
        </Card>

        <Card className="p-6 shadow-soft border-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Project Breakdown</h3>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          {projectBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={projectBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                >
                  {projectBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} minutes`, name]}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              No focus sessions to display.
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6 shadow-soft border-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Weekly Focus Summary</h3>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">This Week</span>
            <span className="font-semibold">{focusSummary.weekly} minutes</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">This Month</span>
            <span className="font-semibold">{focusSummary.monthly} minutes</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Today</span>
            <span className="font-semibold">{focusSummary.today} minutes</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
