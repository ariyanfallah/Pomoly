import { useEffect, useMemo, useState } from 'react';
import { Settings as SettingsIcon, Clock, Coffee, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import type { TimerSettings } from '@/types';
import { useSearchParams } from 'react-router';
import { useTimerSettings } from '@/hooks/useTimerSettings';
import { useToast } from '@/hooks/use-toast';

export function Settings() {
  const [searchParams] = useSearchParams();
  const projectIdFromUrl = useMemo(() => searchParams.get('projectId'), [searchParams]);
  const { settings, saveSettings, defaultSettings, isAuthenticated, projectId, authReady } = useTimerSettings({
    projectId: projectIdFromUrl,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState<TimerSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    if (!authReady) {
      toast({
        title: 'Verifying your account',
        description: 'Please wait a moment and try saving again.',
      });
      return;
    }

    if (isAuthenticated && !projectId) {
      toast({
        title: 'Select a project',
        description: 'Choose a project before saving project-specific settings.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const success = await saveSettings(tempSettings);
      if (!success) return;

      toast({
        title: 'Settings saved',
        description: isAuthenticated
          ? 'Project timer settings updated.'
          : 'Timer settings updated.',
      });

      setIsOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTempSettings(settings);
    setIsOpen(false);
  };

  const handleReset = () => {
    setTempSettings(defaultSettings);
  };

  const updateSetting = (key: keyof TimerSettings, value: number) => {
    setTempSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Timer Settings
          </DialogTitle>
          <DialogDescription>
            Customize your Pomodoro timer durations and intervals.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Focus Duration */}
          <Card className="p-4 border-0 bg-primary-light/20">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary-light">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <Label htmlFor="focus" className="text-base font-medium">
                    Focus Duration
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    How long should your focus sessions last?
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    id="focus"
                    type="number"
                    min="1"
                    max="90"
                    value={tempSettings.focusDuration}
                    onChange={(e) => updateSetting('focusDuration', parseInt(e.target.value) || 25)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">minutes</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Short Break Duration */}
          <Card className="p-4 border-0 bg-accent-light/20">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-accent-light">
                <Coffee className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <Label htmlFor="shortBreak" className="text-base font-medium">
                    Short Break Duration
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Quick break between focus sessions
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    id="shortBreak"
                    type="number"
                    min="1"
                    max="30"
                    value={tempSettings.shortBreakDuration}
                    onChange={(e) => updateSetting('shortBreakDuration', parseInt(e.target.value) || 5)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">minutes</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Long Break Duration */}
          <Card className="p-4 border-0 bg-muted/50">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-muted">
                <Moon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <Label htmlFor="longBreak" className="text-base font-medium">
                    Long Break Duration
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Extended break after multiple focus sessions
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    id="longBreak"
                    type="number"
                    min="5"
                    max="60"
                    value={tempSettings.longBreakDuration}
                    onChange={(e) => updateSetting('longBreakDuration', parseInt(e.target.value) || 15)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">minutes</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Long Break Interval */}
          <div className="space-y-3">
            <Label htmlFor="interval" className="text-base font-medium">
              Long Break Interval
            </Label>
            <p className="text-sm text-muted-foreground">
              Take a long break after every{' '}
              <Input
                id="interval"
                type="number"
                min="2"
                max="8"
                value={tempSettings.longBreakInterval}
                onChange={(e) => updateSetting('longBreakInterval', parseInt(e.target.value) || 4)}
                className="inline-flex w-16 h-8 mx-1"
              />
              focus sessions
            </p>
          </div>

          {/* Current Settings Preview */}
          <Card className="p-4 bg-secondary/50 border-0">
            <h4 className="font-medium mb-3">Current Schedule</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Focus sessions:</span>
                <span className="font-medium">{tempSettings.focusDuration} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Short breaks:</span>
                <span className="font-medium">{tempSettings.shortBreakDuration} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Long breaks:</span>
                <span className="font-medium">{tempSettings.longBreakDuration} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Long break every:</span>
                <span className="font-medium">{tempSettings.longBreakInterval} sessions</span>
              </div>
            </div>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !authReady}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
