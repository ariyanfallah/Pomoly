import { Card } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { TimerSession } from '@/types';

interface AnalyticsStreakCardProps {
  sessions: TimerSession[];
}

export function AnalyticsStreakCard({ sessions }: AnalyticsStreakCardProps) {
  const calculateStreak = () => {
    const focusSessions = sessions
      .filter(session => session.type === 'focus')
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    if (focusSessions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const session of focusSessions) {
      const sessionDate = new Date(session.completedAt);
      sessionDate.setHours(0, 0, 0, 0);

      const daysDifference = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDifference === streak) {
        streak++;
        currentDate = new Date(sessionDate);
      } else if (daysDifference > streak) {
        break;
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak();
  const getStreakMessage = () => {
    if (currentStreak === 0) return "Start your streak today!";
    if (currentStreak === 1) return "Great start!";
    if (currentStreak < 7) return "Building momentum!";
    if (currentStreak < 30) return "Excellent consistency!";
    return "Incredible dedication!";
  };

  return (
    <Card className="p-6 shadow-soft border-0 group hover:shadow-luxury transition-luxury">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl transition-smooth ${
          currentStreak > 0 
            ? 'bg-gradient-to-br from-orange-100 to-red-100' 
            : 'bg-muted'
        }`}>
          <Flame className={`h-5 w-5 transition-smooth ${
            currentStreak > 0 
              ? 'text-orange-500 group-hover:scale-110' 
              : 'text-muted-foreground'
          }`} />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Focus Streak</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold">{currentStreak}</p>
            <span className="text-sm text-muted-foreground">
              {currentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{getStreakMessage()}</p>
        </div>
      </div>
    </Card>
  );
}