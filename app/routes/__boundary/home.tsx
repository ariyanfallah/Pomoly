import { useState, useEffect, useCallback } from 'react';
import { Timer } from '@/components/Timer';
import { ProjectSelector } from '@/components/ProjectSelector';
import { Analytics } from '@/components/Analytics';
import { Sessions } from '@/components/Sessions';
import { Settings } from '@/components/Settings';
import { TimerCompleteModal } from '@/components/TimerCompleteModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Timer as TimerIcon, BarChart3, History } from 'lucide-react';
import { useTimer } from '@/hooks/useTimer';
import { useSearchParams, useLoaderData, type LoaderFunctionArgs } from 'react-router';

import { type MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Pomolos" },
    { name: "description", content: "Sessions that ship" },
  ];
};

/* eslint-disable-next-line react-refresh/only-export-components */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  return {
    projectId: url.searchParams.get('projectId'),
  };
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('timer');
  const [searchParams, setSearchParams] = useSearchParams();
  const { projectId: initialProjectId } = useLoaderData<typeof loader>();
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
  } = useTimer(initialProjectId);

  useEffect(() => {
    const projectIdFromQuery = searchParams.get('projectId');
    if (projectIdFromQuery !== timerState.currentProjectId) {
      setCurrentProject(projectIdFromQuery);
    }
    if (!projectIdFromQuery && timerState.currentProjectId) {
      setCurrentProject(null);
    }
  }, [searchParams, setCurrentProject, timerState.currentProjectId]);

  const handleProjectChange = useCallback((projectId: string | null) => {
    setCurrentProject(projectId);

    const nextParams = new URLSearchParams(searchParams);
    const currentQueryValue = searchParams.get('projectId');

    if (projectId) {
      if (currentQueryValue !== projectId) {
        nextParams.set('projectId', projectId);
        setSearchParams(nextParams, { replace: true });
      }
      return;
    }

    if (currentQueryValue) {
      nextParams.delete('projectId');
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setCurrentProject, setSearchParams]);

  return (
    <div className="min-h-screen bg-background">

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
                onProjectChange={handleProjectChange}
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
