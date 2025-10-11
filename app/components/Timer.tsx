import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import type { SessionType } from '@/types';

interface TimerProps {
  timeLeft: number;
  sessionType: SessionType;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSwitchSession: (type: SessionType) => void;
}

export function Timer({
  timeLeft,
  sessionType,
  isRunning,
  onStart,
  onPause,
  onReset,
  onSwitchSession,
}: TimerProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionLabel = (type: SessionType): string => {
    switch (type) {
      case 'focus':
        return 'Focus Time';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Focus Time';
    }
  };

  const getSessionDescription = (type: SessionType): string => {
    switch (type) {
      case 'focus':
        return 'Time to concentrate and get things done';
      case 'shortBreak':
        return 'Take a quick break and recharge';
      case 'longBreak':
        return 'Enjoy a longer break, you\'ve earned it';
      default:
        return 'Time to focus';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Session Type Selector */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-2xl bg-secondary p-1.5 shadow-soft">
          {(['focus', 'shortBreak', 'longBreak'] as SessionType[]).map((type) => (
            <button
              key={type}
              onClick={() => onSwitchSession(type)}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-smooth ${
                sessionType === type
                  ? 'bg-card text-foreground shadow-soft'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {type === 'focus' && 'Focus'}
              {type === 'shortBreak' && 'Short Break'}
              {type === 'longBreak' && 'Long Break'}
            </button>
          ))}
        </div>
      </div>

      {/* Timer Display */}
      <Card className="text-center p-12 shadow-timer border-0 gradient-calm">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-medium text-muted-foreground fade-in">
              {getSessionLabel(sessionType)}
            </h2>
            <p className="text-sm text-muted-foreground/80">
              {getSessionDescription(sessionType)}
            </p>
          </div>
          
          <div className="timer-display text-foreground font-light tracking-tight fade-in">
            {formatTime(timeLeft)}
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="outline"
              size="icon"
              onClick={onReset}
              className="rounded-full"
              disabled={timeLeft === 0}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>

            <Button
              variant="timer"
              size="timer"
              onClick={isRunning ? onPause : onStart}
              className="rounded-full"
            >
              {isRunning ? (
                <>
                  <Pause className="h-5 w-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Start
                </>
              )}
            </Button>

            <div className="w-11" /> {/* Spacer for symmetry */}
          </div>
        </div>
      </Card>
    </div>
  );
}