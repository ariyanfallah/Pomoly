import { useState } from 'react';
import { Settings as SettingsIcon, Clock, Coffee, Moon ,RotateCcwSquare  } from 'lucide-react';
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
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { CounterButtons } from '@/components/ui/counterButtons';

const defaultSettings: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
};

export function Settings() {
  const [settings, setSettings] = useLocalStorage<TimerSettings>('pomodoroSettings', defaultSettings);
  const [isOpen, setIsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState<TimerSettings>(settings);

  const handleSave = () => {
    setSettings(tempSettings);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempSettings(settings);
    setIsOpen(false);
  };

  const handleReset = () => {
    setTempSettings(defaultSettings);
  };

  const updateSetting = (key: keyof TimerSettings, value: number | "") => {
    setTempSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} >
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#318167] scrollbar-track-[#F6F3DD]">
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
                  <CounterButtons onDecrement={() => {
                    updateSetting('focusDuration', tempSettings.focusDuration > 1 ? tempSettings.focusDuration - 1 : 1);
                  }} onIncrement={() => {
                    updateSetting('focusDuration', tempSettings.focusDuration + 1);
                  }}>
                    <Input
                      id="focus"
                      type="number"
                      min="1"
                      max="90"
                      value={tempSettings.focusDuration}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateSetting('focusDuration', v === '' ? '' : parseInt(v));
                      }}
                      className="h-full w-full p-0 border-none text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] "
                    />
                  </CounterButtons>
                  <span className="text-sm text-muted-foreground">minutes</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Short Break Duration */}
          <Card className="p-4 border-0 bg-accent-light/20">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-accent-light">
                <Coffee className="h-5 w-5 text-muted-foreground" />
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
                  <CounterButtons onDecrement={() => {
                    updateSetting('shortBreakDuration', tempSettings.shortBreakDuration > 1 ? tempSettings.shortBreakDuration - 1 : 1);
                  }} onIncrement={() => {
                    updateSetting('shortBreakDuration', tempSettings.shortBreakDuration + 1 );
                  }}>
                    
                    <Input
                      id="shortBreak"
                      type="number"
                      min="1"
                      max="90"
                      value={tempSettings.shortBreakDuration}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateSetting('shortBreakDuration', v === '' ? '' : parseInt(v));
                      }}
                      className="h-full w-full p-0 border-none text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    />
                  </CounterButtons>
                  <span className="text-sm text-muted-foreground">minutes</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Long Break Duration */}
          <Card className="p-4 border-0 bg-accent-light/20">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg  bg-accent-light">
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
                  <CounterButtons onDecrement={() => {
                    updateSetting('longBreakDuration', tempSettings.longBreakDuration > 5 ? tempSettings.longBreakDuration - 1 : 5);
                  }} onIncrement={() => {
                    updateSetting('longBreakDuration', tempSettings.longBreakDuration + 1);
                  }}>
                    <Input
                    id="longBreak"
                    type="number"
                    min="5"
                    max="60"
                  value={tempSettings.longBreakDuration}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateSetting('longBreakDuration', v === '' ? '' : parseInt(v));
                  }}
                  className="h-full w-full p-0 border-none text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                   
                  />

                  </CounterButtons>
                  <span className="text-sm text-muted-foreground">minutes</span>
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-0 bg-accent-light/20">
          {/* Long Break Interval */}
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg  bg-accent-light">
              <RotateCcwSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <Label htmlFor="interval" className="text-base font-medium">
                  Long Break Interval
                </Label>
                <p className="text-sm text-muted-foreground">
                  Take a long break after every{' '}
                </p>
              </div>
              <div className="flex items-center gap-3">
              <CounterButtons onDecrement={() => {
                updateSetting('longBreakInterval',tempSettings.longBreakInterval > 2 ? tempSettings.longBreakInterval  - 1 : 2 );
              }} onIncrement={() => {
                updateSetting('longBreakInterval', tempSettings.longBreakInterval < 8 ? tempSettings.longBreakInterval + 1 : 8);
              }}>
              <Input
                id="interval"
                type="number"
                min="2"
                max="8"
                value={tempSettings.longBreakInterval}
                onChange={(e) => {
                  const v = e.target.value;
                  updateSetting('longBreakInterval', v === '' ? '' : parseInt(v));
                }}
                className=" p-0 border-none text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                 
              />
              
              </CounterButtons>
              <span className="text-sm text-muted-foreground">focus sessions</span>
              </div>
            </div>
          </div>
          </Card>
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
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}