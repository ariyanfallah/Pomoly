import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Coffee, Target, Timer } from 'lucide-react';
import { SessionType } from '@/types';

interface TimerCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionType: SessionType;
  nextSessionType: SessionType;
  onStartNext: () => void;
  completedFocusCount?: number;
}

export function TimerCompleteModal({
  isOpen,
  onClose,
  sessionType,
  nextSessionType,
  onStartNext,
  completedFocusCount = 0,
}: TimerCompleteModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const getSessionInfo = (type: SessionType) => {
    switch (type) {
      case 'focus':
        return {
          icon: Target,
          title: 'Focus Session Complete!',
          message: 'Great work! You\'ve completed another focus session.',
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-500/10',
        };
      case 'shortBreak':
        return {
          icon: Coffee,
          title: 'Break Time Over!',
          message: 'Hope you feel refreshed and ready to focus.',
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
        };
      case 'longBreak':
        return {
          icon: Coffee,
          title: 'Long Break Complete!',
          message: 'You\'ve earned this rest. Ready for the next session?',
          color: 'text-purple-500',
          bgColor: 'bg-purple-500/10',
        };
    }
  };

  const getNextSessionInfo = (type: SessionType) => {
    switch (type) {
      case 'focus':
        return { label: 'Start Focus Session', icon: Target };
      case 'shortBreak':
        return { label: 'Take Short Break', icon: Coffee };
      case 'longBreak':
        return { label: 'Take Long Break', icon: Coffee };
    }
  };

  const currentSession = getSessionInfo(sessionType);
  const nextSession = getNextSessionInfo(nextSessionType);
  const CurrentIcon = currentSession.icon;
  const NextIcon = nextSession.icon;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md border-0 bg-card/95 backdrop-blur-sm shadow-2xl">
        <div className="text-center space-y-6 p-6">
          {/* Confetti Effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random()}s`,
                  }}
                >
                  ✨
                </div>
              ))}
            </div>
          )}

          {/* Success Icon */}
          <div className="relative">
            <div className={`mx-auto w-20 h-20 rounded-full ${currentSession.bgColor} flex items-center justify-center animate-scale-in`}>
              <CurrentIcon className={`h-10 w-10 ${currentSession.color}`} />
            </div>
            <div className="absolute -top-2 -right-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 animate-bounce" />
            </div>
          </div>

          {/* Title and Message */}
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-semibold text-foreground">
              {currentSession.title}
            </DialogTitle>
            <p className="text-muted-foreground">
              {currentSession.message}
            </p>
          </div>

          {/* Progress Stats */}
          {sessionType === 'focus' && (
            <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Timer className="h-4 w-4" />
                <span>Focus Sessions Completed Today</span>
              </div>
              <div className="text-3xl font-bold text-foreground">
                {completedFocusCount}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onStartNext}
              className="w-full gap-2 h-12 text-base font-medium"
              size="lg"
            >
              <NextIcon className="h-5 w-5" />
              {nextSession.label}
            </Button>
            
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Close
            </Button>
          </div>

          {/* Motivational Quote */}
          <div className="text-xs text-muted-foreground/70 italic">
            {sessionType === 'focus' && '"The secret of getting ahead is getting started."'}
            {sessionType === 'shortBreak' && '"Rest when you\'re weary. Refresh and renew yourself."'}
            {sessionType === 'longBreak' && '"Take time to make your soul happy."'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}