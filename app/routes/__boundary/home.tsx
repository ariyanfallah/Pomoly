import { useState } from 'react';
import { Timer } from '@/components/Timer';
import { ProjectSelector } from '@/components/ProjectSelector';
import { Analytics } from '@/components/Analytics';
import { Sessions } from '@/components/Sessions';
import { Settings } from '@/components/Settings';
import { TimerCompleteModal } from '@/components/TimerCompleteModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Timer as TimerIcon, BarChart3, Settings as SettingsIcon, History } from 'lucide-react';
import { useTimer } from '@/hooks/useTimer';

const Index = () => {
  const [activeTab, setActiveTab] = useState('timer');
  const {
    timerState,
    startTimer,
    pauseTimer,
    resetTimer,
    switchSession,
    setCurrentProject,
    showCompleteModal,
    nextSessionType,
    closeCompleteModal,
    startNextSession,
  } = useTimer();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                P
              </div>
              <h1 className="text-xl font-semibold">Pomodoro Focus</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Settings />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-lg grid-cols-3 rounded-2xl h-12 p-1 bg-secondary shadow-soft">
              <TabsTrigger 
                value="timer" 
                className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-soft transition-smooth"
              >
                <TimerIcon className="h-4 w-4 mr-2" />
                Timer
              </TabsTrigger>
              <TabsTrigger 
                value="sessions"
                className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-soft transition-smooth"
              >
                <History className="h-4 w-4 mr-2" />
                Sessions
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-soft transition-smooth"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="timer" className="space-y-8 fade-in">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-light text-foreground">
                Stay focused, stay productive
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Use the Pomodoro Technique to break your work into focused intervals, 
                separated by short breaks. Track your progress across different projects.
              </p>
            </div>

            <Timer
              timeLeft={timerState.timeLeft}
              sessionType={timerState.sessionType}
              isRunning={timerState.isRunning}
              onStart={startTimer}
              onPause={pauseTimer}
              onReset={resetTimer}
              onSwitchSession={switchSession}
            />

            <div className="max-w-lg mx-auto">
              <ProjectSelector
                currentProjectId={timerState.currentProjectId}
                onProjectChange={setCurrentProject}
              />
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="fade-in">
            <Sessions />
          </TabsContent>

          <TabsContent value="analytics" className="fade-in">
            <Analytics />
          </TabsContent>
        </Tabs>
      </main>

      {/* Timer Complete Modal */}
      <TimerCompleteModal
        isOpen={showCompleteModal}
        onClose={closeCompleteModal}
        sessionType={timerState.sessionType}
        nextSessionType={nextSessionType}
        onStartNext={startNextSession}
        completedFocusCount={timerState.completedFocusCount}
      />
    </div>
  );
};

export default Index;
